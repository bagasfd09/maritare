// Shared handler for DOKU SNAP payment notifications.
//
// SNAP dictates the path DOKU calls on the merchant domain (VA payments land on
// /v1.1/transfer-va/payment), unlike the non-SNAP webhook which can live
// anywhere. The logic is factored out here so mounting it at another spec path
// — QRIS, or a future channel — is a two-line route file rather than a copy.
//
// Contract with DOKU: answer HTTP 200 once the notification is accounted for or
// it gets retried, so an unknown or already-settled invoice still returns 200.
// Only a failed signature returns 401.
//
// Both payload shapes are handled here:
//   VA   -> { trxId, virtualAccountNo, paidAmount: { value } }
//   QRIS -> { originalPartnerReferenceNo, amount: { value }, latestTransactionStatus }

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { readPath, verifySnapNotification } from "@/lib/payment/doku-snap";
import { logAudit } from "@/server/audit";
import { applyPaidEntitlements } from "@/server/entitlements";

/** SNAP responses are HTTP status (3) + service code (2) + case code (2). */
function snapOk(): Response {
  return Response.json({ responseCode: "2002500", responseMessage: "Successful" });
}

export async function handleSnapNotification(request: Request): Promise<Response> {
  // Read the body ONCE as text — the signature covers these exact bytes.
  const rawBody = await request.text();

  // DOKU signs the path it was configured with. Defaults to the path actually
  // hit, with an env override for when a proxy rewrites it before we see it.
  // `||`, not `??`: a blank override would sign an empty path and 401 every
  // single notification — a silent, total payment failure.
  const path = process.env.DOKU_SNAP_NOTIFICATION_PATH || new URL(request.url).pathname;

  const verified = verifySnapNotification({
    method: "POST",
    path,
    rawBody,
    timestamp: request.headers.get("X-TIMESTAMP"),
    signature: request.headers.get("X-SIGNATURE"),
    authorization: request.headers.get("Authorization"),
  });
  if (!verified) {
    console.error(`doku snap webhook: signature verification failed for path ${path}`);
    return new Response("invalid signature", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error("doku snap webhook: body is not valid JSON");
    return new Response("bad request", { status: 400 });
  }

  // VA notifications carry trxId; QRIS carries originalPartnerReferenceNo. Both
  // are our invoice number, which is why it is the join key everywhere.
  const invoiceNo =
    asString(readPath(payload, ["trxId"])) ??
    asString(readPath(payload, ["originalPartnerReferenceNo"]));
  const virtualAccountNo = asString(readPath(payload, ["virtualAccountNo"]));

  const notifiedAmount = Number(
    asString(readPath(payload, ["paidAmount", "value"])) ??
      asString(readPath(payload, ["amount", "value"])) ??
      "",
  );

  // A VA notification is only ever sent on successful payment. QRIS reports a
  // status code where "00" is success; anything else is not a settlement.
  const qrisStatus = asString(readPath(payload, ["latestTransactionStatus"]));
  if (qrisStatus && qrisStatus !== "00") {
    console.info(`doku snap webhook: ${invoiceNo ?? "?"} status ${qrisStatus} — no state change`);
    return snapOk();
  }

  if (!invoiceNo && !virtualAccountNo) {
    console.error("doku snap webhook: no invoice reference in payload");
    return new Response("bad request", { status: 400 });
  }

  // Prefer the invoice number; fall back to the VA number we stored when the
  // instrument was issued, since customerNo must be numeric and cannot be it.
  const order = invoiceNo
    ? await db.query.orders.findFirst({
        columns: ORDER_COLUMNS,
        where: eq(orders.invoiceNo, invoiceNo),
      })
    : await db.query.orders.findFirst({
        columns: ORDER_COLUMNS,
        where: sql`${orders.paymentDetail}->>'virtualAccountNo' = ${virtualAccountNo}`,
      });

  if (!order) {
    // The order row always exists before the instrument is issued, so this is a
    // stray or foreign reference. Ack it — retrying will never help.
    console.error(`doku snap webhook: unknown order for ${invoiceNo ?? virtualAccountNo}`);
    return snapOk();
  }

  // Defence in depth: our stored amount is authoritative, never the payload.
  if (Number.isFinite(notifiedAmount) && Math.round(notifiedAmount) !== order.amount) {
    console.error(
      `doku snap webhook: amount mismatch on ${order.invoiceNo} — notified ${notifiedAmount}, expected ${order.amount}`,
    );
    return snapOk();
  }

  const now = new Date();
  const channel = asString(readPath(payload, ["additionalInfo", "channel"])) ?? "SNAP";

  // Idempotency lives in the WHERE clause: only a still-pending order moves, so
  // a retried notification is a no-op instead of a double settle.
  const [settled] = await db
    .update(orders)
    .set({ status: "paid", paidAt: now, method: `DOKU · ${channel}`, updatedAt: now })
    .where(and(eq(orders.id, order.id), eq(orders.status, "pending")))
    .returning({ id: orders.id });

  if (!settled) {
    console.info(`doku snap webhook: ${order.invoiceNo} already settled (${order.status}) — ignored`);
    return snapOk();
  }

  try {
    await applyPaidEntitlements({
      weddingId: order.weddingId,
      packageId: order.packageId,
      promoId: order.promoId,
      now,
    });
  } catch (error) {
    // Already settled, so a retry short-circuits on the status guard and never
    // re-runs this. Needs manual repair — log loudly.
    console.error(
      `doku snap webhook: PAID BUT ENTITLEMENTS NOT APPLIED for ${order.invoiceNo} — set weddings.packageId manually`,
      error,
    );
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/billing");

  await logAudit({
    action: "order.status",
    targetType: "order",
    targetId: order.id,
    summary: `DOKU SNAP: pesanan ${order.invoiceNo} lunas via ${channel}`,
  });

  return snapOk();
}

const ORDER_COLUMNS = {
  id: true,
  invoiceNo: true,
  amount: true,
  status: true,
  weddingId: true,
  packageId: true,
  promoId: true,
} as const;

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

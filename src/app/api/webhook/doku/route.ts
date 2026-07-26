// DOKU HTTP notification — the only path that settles an order.
//
// Register this URL in DOKU Back Office as the Notification URL; the path is a
// SIGNED component (DOKU_NOTIFICATION_TARGET), so it must match there
// character-for-character or every signature check fails.
//
// Contract with DOKU: respond 2xx once the notification is accounted for, or it
// is retried. So an unknown/already-settled invoice still answers 200 — only a
// failed signature answers 401. Nothing here trusts the payload beyond the
// invoice number: the amount is cross-checked against the order we wrote at
// checkout, and the status is the only field allowed to move money.
//
// Docs: https://developers.doku.com/get-started-with-doku-api/signature-component/non-snap/signature-component-from-request-header

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { verifyDokuNotification } from "@/lib/payment/doku";
import { logAudit } from "@/server/audit";
import { applyPaidEntitlements } from "@/server/entitlements";

/** DOKU transaction.status → our order status. Anything else is informational. */
const STATUS_MAP: Record<string, "paid" | "failed"> = {
  SUCCESS: "paid",
  FAILED: "failed",
  EXPIRED: "failed",
};

export async function POST(request: Request): Promise<Response> {
  // Read the body ONCE as text: the digest must cover the exact bytes DOKU
  // signed. Re-serializing a parsed object would change them.
  const rawBody = await request.text();

  const verified = verifyDokuNotification({
    rawBody,
    clientId: request.headers.get("Client-Id"),
    requestId: request.headers.get("Request-Id"),
    timestamp: request.headers.get("Request-Timestamp"),
    signature: request.headers.get("Signature"),
  });
  if (!verified) {
    console.error("doku webhook: signature verification failed");
    return new Response("invalid signature", { status: 401 });
  }

  let payload: DokuNotification;
  try {
    payload = JSON.parse(rawBody) as DokuNotification;
  } catch {
    console.error("doku webhook: body is not valid JSON");
    return new Response("bad request", { status: 400 });
  }

  const invoiceNo = payload.order?.invoice_number;
  const dokuStatus = payload.transaction?.status;
  if (!invoiceNo || !dokuStatus) {
    console.error("doku webhook: missing invoice_number or transaction.status");
    return new Response("bad request", { status: 400 });
  }

  const next = STATUS_MAP[dokuStatus];
  if (!next) {
    // PENDING and friends: acknowledge, change nothing.
    console.info(`doku webhook: ${invoiceNo} status ${dokuStatus} — no state change`);
    return Response.json({ received: true });
  }

  const order = await db.query.orders.findFirst({
    columns: { id: true, amount: true, status: true, weddingId: true, packageId: true, promoId: true },
    where: eq(orders.invoiceNo, invoiceNo),
  });
  if (!order) {
    // The order row is always written before the gateway call, so this means a
    // stray/foreign invoice. Ack it — retrying will never help.
    console.error(`doku webhook: unknown invoice ${invoiceNo}`);
    return Response.json({ received: true });
  }

  // Defence in depth: the amount is authoritative from OUR row, never the
  // payload. A mismatch means the notification doesn't describe this order.
  // (DOKU returns amount as a number here but a string elsewhere — coerce.)
  const notifiedAmount = Number(payload.order?.amount);
  if (next === "paid" && Number.isFinite(notifiedAmount) && notifiedAmount !== order.amount) {
    console.error(
      `doku webhook: amount mismatch on ${invoiceNo} — notified ${notifiedAmount}, expected ${order.amount}`,
    );
    return Response.json({ received: true });
  }

  const now = new Date();
  const channel = payload.channel?.id ?? payload.service?.id ?? "Checkout";

  // Idempotency lives in the WHERE clause: only a still-pending order moves, so
  // a retried notification is a no-op instead of a double settle.
  const [settled] = await db
    .update(orders)
    .set({
      status: next,
      paidAt: next === "paid" ? now : null,
      method: `DOKU · ${channel}`,
      updatedAt: now,
    })
    .where(and(eq(orders.invoiceNo, invoiceNo), eq(orders.status, "pending")))
    .returning({ id: orders.id });

  if (!settled) {
    console.info(`doku webhook: ${invoiceNo} already settled (${order.status}) — ignored`);
    return Response.json({ received: true });
  }

  if (next === "paid") {
    try {
      await applyPaidEntitlements({
        weddingId: order.weddingId,
        packageId: order.packageId,
        promoId: order.promoId,
        now,
      });
    } catch (error) {
      // The order is already settled, so a retry would short-circuit on the
      // status guard and never re-run this. Needs manual repair — log loudly.
      console.error(
        `doku webhook: PAID BUT ENTITLEMENTS NOT APPLIED for ${invoiceNo} — set weddings.packageId manually`,
        error,
      );
    }
  }

  // The sidebar package pill and the invoice list are rendered per-request, but
  // bust the cached dashboard shell so a returning customer sees the new state.
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/billing");

  await logAudit({
    action: "order.status",
    targetType: "order",
    targetId: order.id,
    summary: `DOKU ${dokuStatus}: pesanan ${invoiceNo} jadi ${next}`,
  });

  return Response.json({ received: true });
}

/** Only the fields we actually read; DOKU sends considerably more. */
type DokuNotification = {
  order?: { invoice_number?: string; amount?: number | string };
  transaction?: { status?: string };
  channel?: { id?: string };
  service?: { id?: string };
};

"use server";

// Admin Server Action for orders: manually settle a transaction's status.
//
// Hard rules (AGENTS.md): admin-gated via the session role (never a client
// claim); all input validated with Zod at the boundary; we never trust a
// client-supplied id beyond shape-validating it — the gate + the `where`
// clause scope the mutation. User-facing copy is Bahasa; logs are English.

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { logAudit } from "@/server/audit";
import { applyPaidEntitlements } from "@/server/entitlements";

export type OrderActionResult = { ok: true } | { ok: false; error: string };

/** Resolve the session user id only when they are an admin; else null. */
async function requireAdminId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session.user.id;
}

// "pending" is deliberately excluded: this action only moves an order FORWARD
// into a settled state (manual confirmation / rejection / refund).
const setOrderStatusSchema = z.object({
  id: z.uuid(),
  status: z.enum(["paid", "failed", "refunded"]),
});

export type AdminSetOrderStatusInput = z.input<typeof setOrderStatusSchema>;

export async function adminSetOrderStatus(
  input: AdminSetOrderStatusInput,
): Promise<OrderActionResult> {
  const parsed = setOrderStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data tidak valid. Periksa lagi isianmu." };
  }
  const { id, status } = parsed.data;

  const adminId = await requireAdminId();
  if (!adminId) {
    return { ok: false, error: "Akses ditolak." };
  }

  try {
    const now = new Date();
    // Only a not-yet-paid order may be settled to "paid": the guard makes the
    // transition win-once, so entitlements below can't be granted twice (and a
    // promo can't be redeemed twice) by a double click.
    const [row] = await db
      .update(orders)
      .set({ status, paidAt: status === "paid" ? now : null, updatedAt: now })
      .where(
        status === "paid" ? and(eq(orders.id, id), ne(orders.status, "paid")) : eq(orders.id, id),
      )
      .returning({
        id: orders.id,
        weddingId: orders.weddingId,
        packageId: orders.packageId,
        promoId: orders.promoId,
      });
    if (!row) {
      return { ok: false, error: "Pesanan tidak ditemukan atau sudah lunas." };
    }

    // Manual settlement grants exactly what a DOKU payment grants — otherwise a
    // bank-transfer customer ends up paid but on no package. Same helper the
    // webhook uses, so the two paths can't drift.
    if (status === "paid") {
      try {
        await applyPaidEntitlements({
          weddingId: row.weddingId,
          packageId: row.packageId,
          promoId: row.promoId,
          now,
        });
      } catch (error) {
        console.error(
          `adminSetOrderStatus: PAID BUT ENTITLEMENTS NOT APPLIED for order ${id} — set weddings.packageId manually`,
          error,
        );
      }
      revalidatePath("/dashboard", "layout");
      revalidatePath("/dashboard/billing");
    }
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    await logAudit({
      action: "order.status",
      targetType: "order",
      targetId: id,
      summary: `Set status pesanan ke ${status}`,
    });
    return { ok: true };
  } catch (error) {
    console.error("adminSetOrderStatus failed", error);
    return { ok: false, error: "Gagal menyimpan. Coba lagi." };
  }
}

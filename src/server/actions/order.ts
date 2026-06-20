"use server";

// Admin Server Action for orders: manually settle a transaction's status.
//
// Hard rules (AGENTS.md): admin-gated via the session role (never a client
// claim); all input validated with Zod at the boundary; we never trust a
// client-supplied id beyond shape-validating it — the gate + the `where`
// clause scope the mutation. User-facing copy is Bahasa; logs are English.

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { logAudit } from "@/server/audit";

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
    const [row] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning({ id: orders.id });
    if (!row) {
      return { ok: false, error: "Pesanan tidak ditemukan." };
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

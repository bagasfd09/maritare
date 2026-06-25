"use server";

// Admin Server Actions for the users (customers) table.
//
// Hard rules (AGENTS.md): admin-gated via the session role (never a client
// claim); all input validated with Zod at the boundary; client-supplied ids are
// never trusted. The update is scoped to role='customer' so an admin account can
// never be deactivated through this path. User-facing copy is Bahasa; logs are
// English.

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { logAudit } from "@/server/audit";

export type AdminUserActionResult = { ok: true } | { ok: false; error: string };

/** Resolve the session user id only when they are an admin; else null. */
async function requireAdminId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session.user.id;
}

// ─────────────────────────────────────────────────────────────────
// Deactivate / reactivate a customer account (soft-delete via deletedAt)
// ─────────────────────────────────────────────────────────────────
//
// ponytail: "Nonaktifkan" = soft-delete (set deletedAt); "Aktifkan kembali"
// clears it. The schema has no separate suspend flag, so deactivate IS the
// suspend. It does not touch the user's weddings/orders or active sessions —
// add that cascade (or a distinct `suspendedAt` column) if real suspension
// semantics are needed later.

const setActiveSchema = z.object({ id: z.uuid(), active: z.boolean() });

export type AdminSetUserActiveInput = z.input<typeof setActiveSchema>;

export async function adminSetUserActive(
  input: AdminSetUserActiveInput,
): Promise<AdminUserActionResult> {
  const parsed = setActiveSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data tidak valid. Coba lagi." };
  }
  const { id, active } = parsed.data;

  const adminId = await requireAdminId();
  if (!adminId) {
    return { ok: false, error: "Akses ditolak." };
  }

  try {
    const [row] = await db
      .update(users)
      .set({ deletedAt: active ? null : new Date(), updatedAt: new Date() })
      // Scope to customers only — admins are managed under Tim admin, never here.
      .where(and(eq(users.id, id), eq(users.role, "customer")))
      .returning({ id: users.id });
    if (!row) {
      return { ok: false, error: "Pengguna tidak ditemukan." };
    }
    revalidatePath("/admin/users");
    revalidatePath("/admin"); // overview signups KPI reflects the change too
    await logAudit({
      action: active ? "user.reactivate" : "user.deactivate",
      targetType: "user",
      targetId: id,
      summary: active ? `Aktifkan kembali pengguna ${id}` : `Nonaktifkan pengguna ${id}`,
    });
    return { ok: true };
  } catch (error) {
    console.error("adminSetUserActive failed", error);
    return { ok: false, error: "Gagal menyimpan. Coba lagi." };
  }
}

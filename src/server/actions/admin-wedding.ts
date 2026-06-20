"use server";

// Admin Server Actions for the weddings master table (set status + soft-delete).
//
// Hard rules (AGENTS.md): admin-gated via the session role (never a client
// claim); all input validated with Zod at the boundary; client-supplied ids are
// never trusted (we re-resolve the admin from the session). User-facing copy is
// Bahasa; logs/comments are English.

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { weddings } from "@/lib/db/schema";
import { logAudit } from "@/server/audit";

export type AdminWeddingActionResult = { ok: true } | { ok: false; error: string };

/** Resolve the session user id only when they are an admin; else null. */
async function requireAdminId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session.user.id;
}

function revalidateWeddings(): void {
  revalidatePath("/admin/weddings");
  revalidatePath("/admin"); // overview KPIs + recent panels reflect the change too
}

// ─────────────────────────────────────────────────────────────────
// Set wedding status (and unpublish when it leaves "live")
// ─────────────────────────────────────────────────────────────────

const setStatusSchema = z.object({
  id: z.uuid(),
  status: z.enum(["draft", "pending", "live", "expired"]),
});

export type AdminSetWeddingStatusInput = z.input<typeof setStatusSchema>;

export async function adminSetWeddingStatus(
  input: AdminSetWeddingStatusInput,
): Promise<AdminWeddingActionResult> {
  const parsed = setStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data tidak valid. Coba lagi." };
  }
  const { id, status } = parsed.data;

  const adminId = await requireAdminId();
  if (!adminId) {
    return { ok: false, error: "Akses ditolak." };
  }

  // Leaving "live" means the page is no longer published — clear publishedAt so
  // the public route can never serve an unpublished invitation.
  const patch: Partial<typeof weddings.$inferInsert> = {
    status,
    updatedAt: new Date(),
  };
  if (status !== "live") {
    patch.publishedAt = null;
  }

  try {
    const [row] = await db
      .update(weddings)
      .set(patch)
      .where(and(eq(weddings.id, id), isNull(weddings.deletedAt)))
      .returning({ id: weddings.id });
    if (!row) {
      return { ok: false, error: "Undangan tidak ditemukan." };
    }
    revalidateWeddings();
    await logAudit({
      action: "wedding.status",
      targetType: "wedding",
      targetId: id,
      summary: `Set status undangan ke ${status}`,
    });
    return { ok: true };
  } catch (error) {
    console.error("adminSetWeddingStatus failed", error);
    return { ok: false, error: "Gagal menyimpan. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// Soft-delete a wedding
// ─────────────────────────────────────────────────────────────────

const deleteSchema = z.object({ id: z.uuid() });

export type AdminDeleteWeddingInput = z.input<typeof deleteSchema>;

export async function adminDeleteWedding(
  input: AdminDeleteWeddingInput,
): Promise<AdminWeddingActionResult> {
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data tidak valid. Coba lagi." };
  }
  const { id } = parsed.data;

  const adminId = await requireAdminId();
  if (!adminId) {
    return { ok: false, error: "Akses ditolak." };
  }

  try {
    const [row] = await db
      .update(weddings)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(weddings.id, id), isNull(weddings.deletedAt)))
      .returning({ id: weddings.id });
    if (!row) {
      return { ok: false, error: "Undangan tidak ditemukan." };
    }
    revalidateWeddings();
    await logAudit({
      action: "wedding.delete",
      targetType: "wedding",
      targetId: id,
      summary: `Hapus undangan ${id}`,
    });
    return { ok: true };
  } catch (error) {
    console.error("adminDeleteWedding failed", error);
    return { ok: false, error: "Gagal menghapus. Coba lagi." };
  }
}

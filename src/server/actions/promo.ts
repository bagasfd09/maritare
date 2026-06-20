"use server";

// Server Actions for the admin Paket & Promo screen (promo code management).
//
// Hard rules (AGENTS.md): never trust a client-supplied id without verifying the
// session; all external input is validated with Zod at the boundary; DB errors
// are wrapped so internals never leak. User-facing copy is in Bahasa Indonesia
// (informal); logs/comments are in English.
//
// Authorization: every action resolves the session and rejects non-admins with
// `{ ok: false, error: "Akses ditolak." }` before touching the database.

import { revalidatePath } from "next/cache";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { promos } from "@/lib/db/schema";
import { logAudit } from "@/server/audit";

export type PromoActionResult = { ok: true } | { ok: false; error: string };

// The admin promos page to refresh after a mutation.
const ADMIN_PROMOS_PATH = "/admin/packages";

/** Resolve the session and require admin role. Returns `null` for non-admins. */
async function requireAdminId(): Promise<string | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || user.role !== "admin") {
    return null;
  }
  return user.id;
}

// ─────────────────────────────────────────────────────────────────
// createPromo
// ─────────────────────────────────────────────────────────────────

// `discountValue` is validated against `discountType` (percent must be 1–100)
// via a superRefine after the base parse. `validUntil` is an ISO date string or
// null; `quota` is a positive int or null (null = unlimited).
const createPromoSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Kode promo minimal 3 karakter.")
      .max(40, "Kode promo maksimal 40 karakter.")
      .transform((c) => c.toUpperCase()),
    discountType: z.enum(["percent", "fixed"]),
    discountValue: z
      .number()
      .int("Nilai diskon harus bilangan bulat.")
      .positive("Nilai diskon harus lebih dari 0."),
    scope: z.string().trim().max(120).optional().or(z.literal("")),
    quota: z
      .number()
      .int("Kuota harus bilangan bulat.")
      .positive("Kuota harus lebih dari 0.")
      .nullable(),
    validUntil: z.iso
      .datetime({ offset: true, message: "Tanggal berakhir tidak valid." })
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === "percent" && data.discountValue > 100) {
      ctx.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "Diskon persen harus antara 1–100.",
      });
    }
  });

export type CreatePromoInput = {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  scope?: string;
  quota: number | null;
  validUntil: string | null;
};

/**
 * Create a promo. The code is uppercased and must be unique among non-deleted
 * promos (duplicates are rejected with a Bahasa message). Inserted as active.
 */
export async function createPromo(input: CreatePromoInput): Promise<PromoActionResult> {
  const adminId = await requireAdminId();
  if (!adminId) {
    return { ok: false, error: "Akses ditolak." };
  }

  const parsed = createPromoSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first || "Data promo tidak valid. Periksa lagi." };
  }
  const { code, discountType, discountValue, scope, quota, validUntil } = parsed.data;

  try {
    // Reject duplicates against non-deleted promos (the column is globally
    // unique, but a soft-deleted row should not block re-creating a code).
    const existing = await db.query.promos.findFirst({
      columns: { id: true },
      where: and(eq(promos.code, code), isNull(promos.deletedAt)),
    });
    if (existing) {
      return { ok: false, error: "Kode promo ini sudah dipakai. Coba kode lain." };
    }

    const [created] = await db
      .insert(promos)
      .values({
        code,
        discountType,
        discountValue,
        scope: scope ? scope : null,
        quota,
        validUntil: validUntil ? new Date(validUntil) : null,
        active: true,
      })
      .returning({ id: promos.id });

    revalidatePath(ADMIN_PROMOS_PATH);
    await logAudit({
      action: "promo.create",
      targetType: "promo",
      targetId: created?.id,
      summary: `Buat promo ${code}`,
    });
    return { ok: true };
  } catch (error) {
    console.error("createPromo failed", error);
    return { ok: false, error: "Gagal membuat promo. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// togglePromo
// ─────────────────────────────────────────────────────────────────

const togglePromoSchema = z.object({
  id: z.uuid("ID promo tidak valid."),
  active: z.boolean(),
});

export type TogglePromoInput = { id: string; active: boolean };

/** Flip a promo's manual on/off flag. Verifies the row exists (non-deleted). */
export async function togglePromo(input: TogglePromoInput): Promise<PromoActionResult> {
  const adminId = await requireAdminId();
  if (!adminId) {
    return { ok: false, error: "Akses ditolak." };
  }

  const parsed = togglePromoSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data promo tidak valid." };
  }
  const { id, active } = parsed.data;

  try {
    const result = await db
      .update(promos)
      .set({ active, updatedAt: new Date() })
      .where(and(eq(promos.id, id), isNull(promos.deletedAt)))
      .returning({ id: promos.id });

    if (result.length === 0) {
      return { ok: false, error: "Promo tidak ditemukan." };
    }

    revalidatePath(ADMIN_PROMOS_PATH);
    await logAudit({
      action: "promo.toggle",
      targetType: "promo",
      targetId: id,
      summary: `${active ? "Aktifkan" : "Nonaktifkan"} promo`,
    });
    return { ok: true };
  } catch (error) {
    console.error("togglePromo failed", error);
    return { ok: false, error: "Gagal memperbarui promo. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// deletePromo
// ─────────────────────────────────────────────────────────────────

const deletePromoSchema = z.object({
  id: z.uuid("ID promo tidak valid."),
});

export type DeletePromoInput = { id: string };

/** Soft-delete a promo (set deletedAt). Verifies the row exists (non-deleted). */
export async function deletePromo(input: DeletePromoInput): Promise<PromoActionResult> {
  const adminId = await requireAdminId();
  if (!adminId) {
    return { ok: false, error: "Akses ditolak." };
  }

  const parsed = deletePromoSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data promo tidak valid." };
  }
  const { id } = parsed.data;

  try {
    const result = await db
      .update(promos)
      .set({ deletedAt: sql`now()`, updatedAt: new Date() })
      .where(and(eq(promos.id, id), isNull(promos.deletedAt)))
      .returning({ id: promos.id });

    if (result.length === 0) {
      return { ok: false, error: "Promo tidak ditemukan." };
    }

    revalidatePath(ADMIN_PROMOS_PATH);
    await logAudit({
      action: "promo.delete",
      targetType: "promo",
      targetId: id,
      summary: `Hapus promo ${id}`,
    });
    return { ok: true };
  } catch (error) {
    console.error("deletePromo failed", error);
    return { ok: false, error: "Gagal menghapus promo. Coba lagi." };
  }
}

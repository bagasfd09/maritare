"use server";

// Server Actions for the admin Paket & Promo screen (pricing package management).
//
// Hard rules (AGENTS.md): never trust a client-supplied id without verifying the
// session; all external input is validated with Zod at the boundary; DB errors
// are wrapped so internals never leak. User-facing copy is in Bahasa Indonesia
// (informal); logs/comments are in English.
//
// Authorization: every action resolves the session and rejects non-admins with
// `{ ok: false, error: "Akses ditolak." }` before touching the database.
//
// Money is stored as integer rupiah (no decimals) per project convention.
// `guestLimit`/`photoLimit` are nullable — null means "unlimited".

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { packages } from "@/lib/db/schema";
import { logAudit } from "@/server/audit";

export type PackageActionResult = { ok: true } | { ok: false; error: string };

/** Resolve the session and require admin role. Returns `null` for non-admins. */
async function requireAdminId(): Promise<string | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || user.role !== "admin") {
    return null;
  }
  return user.id;
}

/**
 * Revalidate everywhere packages are read: the admin screen and the landing
 * page (the marketing pricing section reads packages from the same table).
 */
function revalidatePackages(): void {
  revalidatePath("/admin/packages");
  revalidatePath("/");
}

// Shared editable-field validators (slug is create-only; ids are uuids).
const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug paket minimal 2 karakter.")
  .max(40, "Slug paket maksimal 40 karakter.")
  .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung.")
  .transform((s) => s.toLowerCase());

const nameSchema = z
  .string()
  .trim()
  .min(1, "Nama paket wajib diisi.")
  .max(80, "Nama paket maksimal 80 karakter.");

const priceSchema = z
  .number()
  .int("Harga harus bilangan bulat.")
  .positive("Harga harus lebih dari 0.");

const durationSchema = z
  .number()
  .int("Durasi harus bilangan bulat.")
  .positive("Durasi (hari) harus lebih dari 0.");

// Positive int or null (null = unlimited).
const limitSchema = z
  .number()
  .int("Batas harus bilangan bulat.")
  .positive("Batas harus lebih dari 0, atau kosongkan untuk unlimited.")
  .nullable();

const taglineSchema = z.string().trim().max(120, "Tagline maksimal 120 karakter.").optional();

const perksSchema = z.array(z.string().trim().min(1).max(120)).max(20, "Maksimal 20 perk.");

// ─────────────────────────────────────────────────────────────────
// adminCreatePackage
// ─────────────────────────────────────────────────────────────────

const createPackageSchema = z.object({
  slug: slugSchema,
  name: nameSchema,
  price: priceSchema,
  durationDays: durationSchema,
  guestLimit: limitSchema,
  photoLimit: limitSchema,
  tagline: taglineSchema,
  perks: perksSchema,
  featured: z.boolean(),
  active: z.boolean(),
});

export type AdminCreatePackageInput = {
  slug: string;
  name: string;
  price: number;
  durationDays: number;
  guestLimit: number | null;
  photoLimit: number | null;
  tagline?: string;
  perks: string[];
  featured: boolean;
  active: boolean;
};

/**
 * Create a pricing package. The slug is lowercased and must be unique
 * (duplicates are rejected with a Bahasa message). New rows are appended to the
 * end of the catalog order.
 */
export async function adminCreatePackage(
  input: AdminCreatePackageInput,
): Promise<PackageActionResult> {
  const adminId = await requireAdminId();
  if (!adminId) {
    return { ok: false, error: "Akses ditolak." };
  }

  const parsed = createPackageSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first || "Data paket tidak valid. Periksa lagi." };
  }
  const { slug, name, price, durationDays, guestLimit, photoLimit, tagline, perks, featured, active } =
    parsed.data;

  try {
    // Reject duplicate slugs (the column is unique, but surface a friendly error
    // instead of a raw DB constraint failure).
    const existing = await db.query.packages.findFirst({
      columns: { id: true },
      where: eq(packages.slug, slug),
    });
    if (existing) {
      return { ok: false, error: "Slug paket ini sudah dipakai. Coba slug lain." };
    }

    // Append after the current highest sortOrder so new packages land last.
    const last = await db.query.packages.findFirst({
      columns: { sortOrder: true },
      orderBy: (p, { desc }) => [desc(p.sortOrder)],
    });
    const nextSortOrder = (last?.sortOrder ?? 0) + 1;

    const [created] = await db
      .insert(packages)
      .values({
        slug,
        name,
        price,
        durationDays,
        guestLimit,
        photoLimit,
        tagline: tagline ? tagline : null,
        perks,
        featured,
        active,
        sortOrder: nextSortOrder,
      })
      .returning({ id: packages.id });

    revalidatePackages();
    await logAudit({
      action: "package.create",
      targetType: "package",
      targetId: created?.id,
      summary: `Buat paket "${name}"`,
    });
    return { ok: true };
  } catch (error) {
    console.error("adminCreatePackage failed", error);
    return { ok: false, error: "Gagal membuat paket. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// adminUpdatePackage
// ─────────────────────────────────────────────────────────────────

// Slug is locked on edit (changing it would break existing references), so it is
// not part of the update payload — only the safely-editable fields are.
const updatePackageSchema = z.object({
  id: z.uuid("ID paket tidak valid."),
  name: nameSchema,
  price: priceSchema,
  durationDays: durationSchema,
  guestLimit: limitSchema,
  photoLimit: limitSchema,
  tagline: taglineSchema,
  perks: perksSchema,
  featured: z.boolean(),
  active: z.boolean(),
});

export type AdminUpdatePackageInput = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  guestLimit: number | null;
  photoLimit: number | null;
  tagline?: string;
  perks: string[];
  featured: boolean;
  active: boolean;
};

/** Update an existing package by its UUID. Verifies the row exists. */
export async function adminUpdatePackage(
  input: AdminUpdatePackageInput,
): Promise<PackageActionResult> {
  const adminId = await requireAdminId();
  if (!adminId) {
    return { ok: false, error: "Akses ditolak." };
  }

  const parsed = updatePackageSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first || "Data paket tidak valid. Periksa lagi." };
  }
  const { id, name, price, durationDays, guestLimit, photoLimit, tagline, perks, featured, active } =
    parsed.data;

  try {
    const result = await db
      .update(packages)
      .set({
        name,
        price,
        durationDays,
        guestLimit,
        photoLimit,
        tagline: tagline ? tagline : null,
        perks,
        featured,
        active,
        updatedAt: new Date(),
      })
      .where(eq(packages.id, id))
      .returning({ id: packages.id });

    if (result.length === 0) {
      return { ok: false, error: "Paket tidak ditemukan." };
    }

    revalidatePackages();
    await logAudit({
      action: "package.update",
      targetType: "package",
      targetId: id,
      summary: `Ubah paket "${name}"`,
    });
    return { ok: true };
  } catch (error) {
    console.error("adminUpdatePackage failed", error);
    return { ok: false, error: "Gagal menyimpan paket. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// adminTogglePackageActive
// ─────────────────────────────────────────────────────────────────

const toggleActiveSchema = z.object({
  id: z.uuid("ID paket tidak valid."),
  active: z.boolean(),
});

export type AdminTogglePackageActiveInput = { id: string; active: boolean };

/** Quick active/inactive toggle for a package. Verifies the row exists. */
export async function adminTogglePackageActive(
  input: AdminTogglePackageActiveInput,
): Promise<PackageActionResult> {
  const adminId = await requireAdminId();
  if (!adminId) {
    return { ok: false, error: "Akses ditolak." };
  }

  const parsed = toggleActiveSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data paket tidak valid." };
  }
  const { id, active } = parsed.data;

  try {
    const result = await db
      .update(packages)
      .set({ active, updatedAt: new Date() })
      .where(eq(packages.id, id))
      .returning({ id: packages.id });

    if (result.length === 0) {
      return { ok: false, error: "Paket tidak ditemukan." };
    }

    revalidatePackages();
    await logAudit({
      action: "package.toggleActive",
      targetType: "package",
      targetId: id,
      summary: `${active ? "Aktifkan" : "Nonaktifkan"} paket`,
    });
    return { ok: true };
  } catch (error) {
    console.error("adminTogglePackageActive failed", error);
    return { ok: false, error: "Gagal memperbarui paket. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// adminTogglePackageFeatured
// ─────────────────────────────────────────────────────────────────

const toggleFeaturedSchema = z.object({
  id: z.uuid("ID paket tidak valid."),
  featured: z.boolean(),
});

export type AdminTogglePackageFeaturedInput = { id: string; featured: boolean };

/**
 * Quick featured toggle for a package. When marking one featured, clear the flag
 * on every other package so only one tier is highlighted at a time.
 */
export async function adminTogglePackageFeatured(
  input: AdminTogglePackageFeaturedInput,
): Promise<PackageActionResult> {
  const adminId = await requireAdminId();
  if (!adminId) {
    return { ok: false, error: "Akses ditolak." };
  }

  const parsed = toggleFeaturedSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data paket tidak valid." };
  }
  const { id, featured } = parsed.data;

  try {
    const result = await db
      .update(packages)
      .set({ featured, updatedAt: new Date() })
      .where(eq(packages.id, id))
      .returning({ id: packages.id });

    if (result.length === 0) {
      return { ok: false, error: "Paket tidak ditemukan." };
    }

    // Single-featured invariant: clearing is fine, but when featuring a tier we
    // unset every other package so only one stays highlighted.
    if (featured) {
      await db
        .update(packages)
        .set({ featured: false, updatedAt: new Date() })
        .where(and(ne(packages.id, id), eq(packages.featured, true)));
    }

    revalidatePackages();
    await logAudit({
      action: "package.toggleFeatured",
      targetType: "package",
      targetId: id,
      summary: `${featured ? "Tandai" : "Lepas"} paket sebagai unggulan`,
    });
    return { ok: true };
  } catch (error) {
    console.error("adminTogglePackageFeatured failed", error);
    return { ok: false, error: "Gagal memperbarui paket. Coba lagi." };
  }
}

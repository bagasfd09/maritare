"use server";

// Admin Server Actions for the template library (edit metadata + set cover).
//
// Hard rules (AGENTS.md): admin-gated via the session role (never a client
// claim); all input validated with Zod; R2 cover bytes are uploaded by the
// browser via a presigned PUT (see /api/admin/templates/cover-sign) — we only
// store/verify the object key here. User-facing copy is Bahasa; logs English.

import { revalidatePath } from "next/cache";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { templates, users } from "@/lib/db/schema";
import { headObject } from "@/lib/r2";
import { logAudit } from "@/server/audit";

export type TemplateActionResult = { ok: true } | { ok: false; error: string };

/** Resolve the session user id only when they are an admin; else null. */
async function requireAdminId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session.user.id;
}

function revalidateTemplates(): void {
  revalidatePath("/admin/templates");
  revalidatePath("/dashboard/templates"); // customer catalog reflects edits too
}

// ─────────────────────────────────────────────────────────────────
// Edit template metadata
// ─────────────────────────────────────────────────────────────────

const updateTemplateSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1, "Nama template wajib diisi").max(80).optional(),
  style: z.string().trim().max(80).optional(),
  category: z.string().trim().max(40).optional(),
  status: z.enum(["draft", "published"]).optional(),
  featured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  // Exclusive targeting: empty array = public (stored as null).
  allowedUserIds: z.array(z.uuid()).max(200, "Maksimal 200 user.").optional(),
});

export type UpdateTemplateInput = z.input<typeof updateTemplateSchema>;

export async function updateTemplate(
  input: UpdateTemplateInput,
): Promise<TemplateActionResult> {
  const parsed = updateTemplateSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first || "Data tidak valid. Periksa lagi isianmu." };
  }
  const { id, ...fields } = parsed.data;

  const adminId = await requireAdminId();
  if (!adminId) {
    return { ok: false, error: "Akses ditolak." };
  }

  // Only set the fields that were actually provided.
  const patch: Partial<typeof templates.$inferInsert> = { updatedAt: new Date() };
  if (fields.name !== undefined) patch.name = fields.name;
  if (fields.style !== undefined) patch.style = fields.style || null;
  if (fields.category !== undefined) patch.category = fields.category || null;
  if (fields.status !== undefined) patch.status = fields.status;
  if (fields.featured !== undefined) patch.featured = fields.featured;
  if (fields.isNew !== undefined) patch.isNew = fields.isNew;
  if (fields.allowedUserIds !== undefined) {
    // Verify the users exist so a stale/forged id never becomes a dangling grant.
    if (fields.allowedUserIds.length > 0) {
      const found = await db
        .select({ id: users.id })
        .from(users)
        .where(inArray(users.id, fields.allowedUserIds));
      if (found.length !== fields.allowedUserIds.length) {
        return { ok: false, error: "Ada user yang tidak ditemukan. Muat ulang lalu coba lagi." };
      }
    }
    patch.allowedUserIds = fields.allowedUserIds.length > 0 ? fields.allowedUserIds : null;
  }

  try {
    const [row] = await db
      .update(templates)
      .set(patch)
      .where(and(eq(templates.id, id), isNull(templates.deletedAt)))
      .returning({ id: templates.id });
    if (!row) {
      return { ok: false, error: "Template tidak ditemukan." };
    }
    revalidateTemplates();
    await logAudit({
      action: "template.update",
      targetType: "template",
      targetId: id,
      summary: fields.name
        ? `Ubah template "${fields.name}"`
        : `Ubah template ${id}`,
    });
    return { ok: true };
  } catch (error) {
    console.error("updateTemplate failed", error);
    return { ok: false, error: "Gagal menyimpan. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// Set / clear the cover image (object already uploaded to R2)
// ─────────────────────────────────────────────────────────────────

const setCoverSchema = z.object({
  id: z.uuid(),
  // null clears the cover (revert to the baked-in static thumbnail).
  objectKey: z.string().min(1).max(300).nullable(),
});

export async function setTemplateCover(input: {
  id: string;
  objectKey: string | null;
}): Promise<TemplateActionResult> {
  const parsed = setCoverSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data tidak valid." };
  }
  const { id, objectKey } = parsed.data;

  const adminId = await requireAdminId();
  if (!adminId) {
    return { ok: false, error: "Akses ditolak." };
  }

  // Never trust a client-supplied key blindly: it must live under THIS template's
  // namespace, and the object must actually exist in R2.
  if (objectKey !== null) {
    if (!objectKey.startsWith(`templates/${id}/`)) {
      return { ok: false, error: "Berkas cover tidak valid." };
    }
    const exists = await headObject(objectKey).catch(() => false);
    if (!exists) {
      return { ok: false, error: "Upload cover belum selesai. Coba lagi." };
    }
  }

  try {
    const [row] = await db
      .update(templates)
      .set({ coverKey: objectKey, updatedAt: new Date() })
      .where(and(eq(templates.id, id), isNull(templates.deletedAt)))
      .returning({ id: templates.id });
    if (!row) {
      return { ok: false, error: "Template tidak ditemukan." };
    }
    revalidateTemplates();
    await logAudit({
      action: "template.cover",
      targetType: "template",
      targetId: id,
      summary: objectKey ? "Set cover template" : "Hapus cover template",
    });
    return { ok: true };
  } catch (error) {
    console.error("setTemplateCover failed", error);
    return { ok: false, error: "Gagal menyimpan cover. Coba lagi." };
  }
}

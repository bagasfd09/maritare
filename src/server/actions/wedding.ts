"use server";

// Server Actions for the wedding editor.
//
// Hard rules (AGENTS.md): never accept a client-supplied weddingId — ownership
// is derived from the session (via the shared resolver); all external input is
// validated with Zod at the boundary; DB errors are wrapped so internals never
// leak to the client. User-facing copy is in Bahasa Indonesia (informal).

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { photos, templates, weddings, type WeddingSections } from "@/lib/db/schema";
import {
  SECTION_DATA_SCHEMAS,
  SECTION_IDS,
  pasanganDataSchema,
} from "@/lib/invitation/sections";
import { deleteObject } from "@/lib/r2";
import { coupleSlug } from "@/lib/slug";
import { resolveEditorUserId } from "@/server/queries/wedding";

const saveWeddingSectionSchema = z.object({
  sectionId: z.enum(SECTION_IDS),
  title: z.string().max(120).optional(),
  body: z.string().max(600).optional(),
  done: z.boolean().optional(),
  // Section-specific payload; validated against SECTION_DATA_SCHEMAS[sectionId]
  // after the base parse (the shape depends on the discriminating sectionId).
  data: z.unknown().optional(),
});

export type SaveWeddingSectionInput = z.input<typeof saveWeddingSectionSchema>;

export type SaveWeddingSectionResult =
  | { ok: true; savedAt: string }
  | { ok: false; error: string };

/**
 * Save (merge) one editor section into the wedding's `sections` jsonb document.
 *
 * The weddingId is NEVER taken from the client: the target wedding is resolved
 * from the session exactly like `getMyWedding()` via the shared resolver. Only
 * the provided fields overwrite the section; the section's existing `data`
 * extras and all other sections are preserved.
 */
export async function saveWeddingSection(
  input: SaveWeddingSectionInput,
): Promise<SaveWeddingSectionResult> {
  // 1. Validate external input at the boundary.
  const parsed = saveWeddingSectionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data tidak valid. Periksa lagi isianmu." };
  }
  const { sectionId, title, body, done } = parsed.data;

  // Validate the section-specific payload against its own schema. The parsed
  // result (with trims/defaults applied) is what gets stored.
  let sectionData: Record<string, unknown> | undefined;
  if (parsed.data.data !== undefined) {
    const dataParsed = SECTION_DATA_SCHEMAS[sectionId].safeParse(parsed.data.data);
    if (!dataParsed.success) {
      return { ok: false, error: "Data tidak valid. Periksa lagi isianmu." };
    }
    sectionData = dataParsed.data as Record<string, unknown>;
  }

  // 2. Derive ownership from the session — same logic as getMyWedding().
  const userId = await resolveEditorUserId();
  if (!userId) {
    return { ok: false, error: "Kamu harus masuk dulu untuk menyimpan." };
  }

  try {
    // 3. Load the owned wedding (first non-deleted, by ownership).
    const wedding = await db.query.weddings.findFirst({
      columns: { id: true, sections: true },
      where: and(eq(weddings.userId, userId), isNull(weddings.deletedAt)),
      orderBy: (w, { asc }) => [asc(w.createdAt)],
    });

    if (!wedding) {
      return { ok: false, error: "Undangan tidak ditemukan." };
    }

    // 4. pasangan.photoId values are client-supplied references — verify they
    //    point at photos of THIS wedding before storing (never trust client ids).
    if (sectionData !== undefined && sectionId === "pasangan") {
      const pasangan = pasanganDataSchema.parse(sectionData);
      const photoIds = [pasangan.groom.photoId, pasangan.bride.photoId].filter(
        (id): id is string => id !== undefined,
      );
      if (photoIds.length > 0) {
        const owned = await db
          .select({ id: photos.id })
          .from(photos)
          .where(
            and(
              inArray(photos.id, photoIds),
              eq(photos.weddingId, wedding.id),
              isNull(photos.deletedAt),
            ),
          );
        if (owned.length !== new Set(photoIds).size) {
          return { ok: false, error: "Foto tidak ditemukan di galerimu." };
        }
      }
    }

    // 4b. musik.audioKey is a client-supplied R2 key — it must live under THIS
    //     wedding's own audio prefix, so a forged key can't point the presigned
    //     player at another wedding's object.
    if (sectionData !== undefined && sectionId === "musik") {
      const audioKey = (sectionData as { audioKey?: string }).audioKey;
      if (audioKey && !audioKey.startsWith(`weddings/${wedding.id}/audio/`)) {
        return { ok: false, error: "Audio tidak valid." };
      }
    }

    // 4c. hero.imageKey/videoKey are client-supplied R2 keys too — anchor each to
    //     its own subfolder under THIS wedding (like musik.audioKey) so a forged
    //     or swapped key (image in videoKey, audio key, another wedding) is rejected.
    if (sectionData !== undefined && sectionId === "hero") {
      const { imageKey, videoKey } = sectionData as { imageKey?: string; videoKey?: string };
      const okImage = !imageKey || imageKey.startsWith(`weddings/${wedding.id}/hero/`);
      const okVideo = !videoKey || videoKey.startsWith(`weddings/${wedding.id}/videos/`);
      if (!okImage || !okVideo) {
        return { ok: false, error: "Media hero tidak valid." };
      }
    }

    // 4d. bagikan.imageKey (the link-preview/OG image) is a client-supplied R2
    //     key — anchor it to this wedding's own "share" prefix, same as hero.
    if (sectionData !== undefined && sectionId === "bagikan") {
      const { imageKey } = sectionData as { imageKey?: string };
      if (imageKey && !imageKey.startsWith(`weddings/${wedding.id}/share/`)) {
        return { ok: false, error: "Gambar bagikan tidak valid." };
      }
    }

    // 4e. galeri.selectedPhotoIds are client-supplied photo references — keep
    //     only ids that point at THIS wedding's own (non-deleted) photos,
    //     silently dropping any stale/foreign id rather than rejecting the save.
    if (sectionData !== undefined && sectionId === "galeri") {
      const ids = (sectionData as { selectedPhotoIds?: string[] }).selectedPhotoIds ?? [];
      if (ids.length > 0) {
        const owned = await db
          .select({ id: photos.id })
          .from(photos)
          .where(
            and(
              inArray(photos.id, ids),
              eq(photos.weddingId, wedding.id),
              isNull(photos.deletedAt),
            ),
          );
        const ownedSet = new Set(owned.map((r) => r.id));
        (sectionData as { selectedPhotoIds: string[] }).selectedPhotoIds = ids.filter((id) =>
          ownedSet.has(id),
        );
      }
    }

    // 5. Merge: preserve other sections; `title`/`body`/`done` overwrite only
    //    when provided. A provided `data` replaces the section's data wholesale
    //    (forms always submit the complete object); omitted `data` preserves it.
    const current: WeddingSections = wedding.sections ?? {};
    const existing = current[sectionId] ?? {};

    const nextSection: WeddingSections[string] = {
      ...existing,
      ...(title !== undefined ? { title } : {}),
      ...(body !== undefined ? { body } : {}),
      ...(done !== undefined ? { done } : {}),
      ...(sectionData !== undefined ? { data: sectionData } : {}),
    };

    const nextSections: WeddingSections = {
      ...current,
      [sectionId]: nextSection,
    };

    const savedAt = new Date();

    await db
      .update(weddings)
      .set({ sections: nextSections, updatedAt: savedAt })
      .where(eq(weddings.id, wedding.id));

    // Music: when the uploaded background track is replaced or the source
    // switches away from upload, free the previous R2 object so deleted audio
    // doesn't keep consuming storage. Best-effort (the save already succeeded).
    if (sectionId === "musik" && sectionData !== undefined) {
      const oldKey = (existing as { data?: { audioKey?: string } }).data?.audioKey;
      const newKey = (sectionData as { audioKey?: string }).audioKey;
      if (oldKey && oldKey !== newKey) {
        try {
          await deleteObject(oldKey);
        } catch (error) {
          console.error("saveWeddingSection: stale audio not freed (orphaned)", oldKey, error);
        }
      }
    }

    // Hero: same as the music — free any previous hero image/video whose key
    // changed (replace, image↔video switch, or clear) so they don't orphan in R2.
    if (sectionId === "hero" && sectionData !== undefined) {
      const old = (existing as { data?: { imageKey?: string; videoKey?: string } }).data;
      const next = sectionData as { imageKey?: string; videoKey?: string };
      for (const oldKey of [old?.imageKey, old?.videoKey]) {
        if (oldKey && oldKey !== next.imageKey && oldKey !== next.videoKey) {
          try {
            await deleteObject(oldKey);
          } catch (error) {
            console.error("saveWeddingSection: stale hero asset not freed (orphaned)", oldKey, error);
          }
        }
      }
    }

    // Bagikan: free the previous share image when it's replaced or cleared, so a
    // swapped-out preview image doesn't orphan in R2 (best-effort, like hero).
    if (sectionId === "bagikan" && sectionData !== undefined) {
      const oldKey = (existing as { data?: { imageKey?: string } }).data?.imageKey;
      const newKey = (sectionData as { imageKey?: string }).imageKey;
      if (oldKey && oldKey !== newKey) {
        try {
          await deleteObject(oldKey);
        } catch (error) {
          console.error("saveWeddingSection: stale share image not freed (orphaned)", oldKey, error);
        }
      }
    }

    revalidatePath("/dashboard/editor");

    return { ok: true, savedAt: savedAt.toISOString() };
  } catch (error) {
    // Never leak internals to the client; log server-side in English.
    console.error("saveWeddingSection failed", error);
    return { ok: false, error: "Gagal menyimpan. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// Onboarding: create the first wedding for a brand-new signed-in user
// ─────────────────────────────────────────────────────────────────

const createWeddingSchema = z.object({
  groomName: z.string().trim().min(1, "Nama mempelai pria wajib diisi").max(80),
  brideName: z.string().trim().min(1, "Nama mempelai wanita wajib diisi").max(80),
  // <input type="date"> value ("YYYY-MM-DD") or empty when not set yet.
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid")
    .optional()
    .or(z.literal("")),
  templateSlug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(60),
});

export type CreateWeddingInput = z.input<typeof createWeddingSchema>;
export type CreateWeddingResult = { ok: false; error: string };

/** Find a globally-unique wedding slug from a base (the slug index is global). */
async function uniqueWeddingSlug(base: string): Promise<string> {
  for (let n = 0; n < 50; n++) {
    const candidate = n === 0 ? base : `${base}-${n + 1}`;
    const exists = await db.query.weddings.findFirst({
      columns: { id: true },
      where: eq(weddings.slug, candidate),
    });
    if (!exists) {
      return candidate;
    }
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

/**
 * Create the signed-in user's first wedding from the onboarding form, then send
 * them to the editor. Ownership is the session user (never client-supplied). If
 * the user already has a wedding this is a no-op that just routes to the editor
 * (so a double-submit can't create a second). On success this redirects and
 * never returns; it only returns on validation/DB errors.
 */
export async function createWedding(
  input: CreateWeddingInput,
): Promise<CreateWeddingResult> {
  const parsed = createWeddingSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first || "Data tidak valid. Periksa lagi isianmu." };
  }
  const { groomName, brideName, templateSlug } = parsed.data;
  const eventDate = parsed.data.eventDate ? parsed.data.eventDate : null;

  const userId = await resolveEditorUserId();
  if (!userId) {
    return { ok: false, error: "Kamu harus masuk dulu untuk membuat undangan." };
  }

  try {
    const existing = await db.query.weddings.findFirst({
      columns: { id: true },
      where: and(eq(weddings.userId, userId), isNull(weddings.deletedAt)),
    });

    if (!existing) {
      const template = await db.query.templates.findFirst({
        columns: { id: true },
        where: and(
          eq(templates.slug, templateSlug),
          eq(templates.status, "published"),
          isNull(templates.deletedAt),
        ),
      });
      if (!template) {
        return { ok: false, error: "Template tidak tersedia." };
      }

      const slug = await uniqueWeddingSlug(coupleSlug(groomName, brideName));

      await db.insert(weddings).values({
        userId,
        slug,
        groomName,
        brideName,
        eventDate,
        templateId: template.id,
        status: "draft",
      });
    }
  } catch (error) {
    console.error("createWedding failed", error);
    return { ok: false, error: "Gagal membuat undangan. Coba lagi." };
  }

  // Refresh the whole dashboard tree (sidebar chrome, etc.) then open the editor.
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/editor");
}

// ─────────────────────────────────────────────────────────────────
// Edit core wedding details (date / names / venue / city)
// ─────────────────────────────────────────────────────────────────

const saveWeddingDetailsSchema = z.object({
  groomName: z.string().trim().min(1, "Nama mempelai pria wajib diisi").max(80),
  brideName: z.string().trim().min(1, "Nama mempelai wanita wajib diisi").max(80),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid")
    .optional()
    .or(z.literal("")),
  venue: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
});

export type SaveWeddingDetailsInput = z.input<typeof saveWeddingDetailsSchema>;
export type SaveWeddingDetailsResult = { ok: true } | { ok: false; error: string };

/**
 * Update the owned wedding's core details (date, couple names, venue, city).
 * Ownership is derived from the session. These feed the countdown, dashboard
 * chrome, and the guestbook header, so revalidate the whole dashboard + kiosk.
 */
export async function saveWeddingDetails(
  input: SaveWeddingDetailsInput,
): Promise<SaveWeddingDetailsResult> {
  const parsed = saveWeddingDetailsSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first || "Data tidak valid. Periksa lagi isianmu." };
  }
  const { groomName, brideName } = parsed.data;
  const eventDate = parsed.data.eventDate ? parsed.data.eventDate : null;
  const venue = parsed.data.venue ? parsed.data.venue : null;
  const city = parsed.data.city ? parsed.data.city : null;

  const userId = await resolveEditorUserId();
  if (!userId) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  try {
    const [row] = await db
      .update(weddings)
      .set({ groomName, brideName, eventDate, venue, city, updatedAt: new Date() })
      .where(and(eq(weddings.userId, userId), isNull(weddings.deletedAt)))
      .returning({ id: weddings.id });
    if (!row) {
      return { ok: false, error: "Undangan tidak ditemukan." };
    }
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/editor");
    revalidatePath("/guestbook");
    return { ok: true };
  } catch (error) {
    console.error("saveWeddingDetails failed", error);
    return { ok: false, error: "Gagal menyimpan. Coba lagi." };
  }
}

const chooseTemplateSchema = z.object({
  templateSlug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(60),
});

export type ChooseTemplateResult = { ok: true } | { ok: false; error: string };

/**
 * Set the owned wedding's template. The wedding is resolved from the session
 * (never a client-supplied id); the template must be a published, non-deleted
 * catalog entry.
 */
export async function chooseTemplate(input: {
  templateSlug: string;
}): Promise<ChooseTemplateResult> {
  const parsed = chooseTemplateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Template tidak valid." };
  }

  const userId = await resolveEditorUserId();
  if (!userId) {
    return { ok: false, error: "Kamu harus masuk dulu untuk memasang template." };
  }

  try {
    const wedding = await db.query.weddings.findFirst({
      columns: { id: true },
      where: and(eq(weddings.userId, userId), isNull(weddings.deletedAt)),
      orderBy: (w, { asc }) => [asc(w.createdAt)],
    });
    if (!wedding) {
      return { ok: false, error: "Undangan tidak ditemukan." };
    }

    const template = await db.query.templates.findFirst({
      columns: { id: true },
      where: and(
        eq(templates.slug, parsed.data.templateSlug),
        eq(templates.status, "published"),
        isNull(templates.deletedAt),
      ),
    });
    if (!template) {
      return { ok: false, error: "Template tidak tersedia." };
    }

    await db
      .update(weddings)
      .set({ templateId: template.id, updatedAt: new Date() })
      .where(eq(weddings.id, wedding.id));

    revalidatePath("/dashboard/templates");
    revalidatePath("/dashboard/editor");

    return { ok: true };
  } catch (error) {
    console.error("chooseTemplate failed", error);
    return { ok: false, error: "Gagal memasang template. Coba lagi." };
  }
}

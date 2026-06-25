"use server";

// Server Actions for the wedding photo gallery.
//
// Hard rules (AGENTS.md): never accept a client-supplied weddingId — the target
// wedding is derived from the session (via the shared resolver), and an arbitrary
// objectKey is NEVER trusted (it must live under this wedding's own prefix). All
// external input is validated with Zod at the boundary. The object's existence in
// R2 is verified before we persist a row, so the DB never points at missing bytes.
// DB / R2 errors are wrapped so internals never leak; user-facing copy is in
// Bahasa Indonesia (informal). Bytes are never proxied through the server — the
// browser PUTs directly to R2 and only hands us back the objectKey.

import { revalidatePath } from "next/cache";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { packages, photos, weddings } from "@/lib/db/schema";
import { deleteObject, headObject } from "@/lib/r2";
import { resolveMemberWeddingId } from "@/server/queries/wedding";

const addPhotoSchema = z.object({
  objectKey: z.string().min(1),
  label: z.string().max(60).optional(),
});

const deletePhotoSchema = z.object({
  photoId: z.uuid(),
});

// `photoId: null` clears the cover (template falls back to its default hero).
const setCoverSchema = z.object({
  photoId: z.uuid().nullable(),
});

// `photoId: null` clears the closing photo (closing section falls back to cover).
const setClosingSchema = z.object({
  photoId: z.uuid().nullable(),
});

export type AddPhotoInput = z.input<typeof addPhotoSchema>;
export type DeletePhotoInput = z.input<typeof deletePhotoSchema>;
export type SetCoverInput = z.input<typeof setCoverSchema>;
export type SetClosingInput = z.input<typeof setClosingSchema>;

export type AddPhotoResult =
  | { ok: true; photoId: string }
  | { ok: false; error: string };

export type DeletePhotoResult =
  | { ok: true }
  | { ok: false; error: string };

export type SetCoverResult = { ok: true } | { ok: false; error: string };
export type SetClosingResult = { ok: true } | { ok: false; error: string };

/**
 * Resolve the wedding id owned by the session user — identical logic to the
 * upload sign route and the gallery query, so all photo paths derive ownership
 * the same way and never trust a client-supplied id. Returns `null` when there
 * is no resolvable user or no owned wedding.
 */
async function resolveOwnedWeddingId(): Promise<string | null> {
  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) {
    return null;
  }

  const wedding = await db.query.weddings.findFirst({
    columns: { id: true },
    where: and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)),
  });

  return wedding?.id ?? null;
}

/**
 * Register an already-uploaded R2 object as a gallery photo.
 *
 * The browser uploads bytes straight to R2 with a presigned URL, then calls this
 * action with the returned objectKey. We:
 *   1. validate the input at the boundary,
 *   2. resolve the owned wedding from the session (never the client),
 *   3. reject any objectKey not under this wedding's own `weddings/{id}/photos/`
 *      prefix (never trust an arbitrary key),
 *   4. confirm the object actually exists in R2 (HeadObject) before inserting,
 *   5. insert the row with sortOrder = current max + 1.
 */
export async function addPhoto(input: AddPhotoInput): Promise<AddPhotoResult> {
  // 1. Validate external input.
  const parsed = addPhotoSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data foto tidak valid. Coba lagi." };
  }
  const { objectKey, label } = parsed.data;

  // 2. Derive ownership from the session.
  const weddingId = await resolveOwnedWeddingId();
  if (!weddingId) {
    return { ok: false, error: "Kamu harus masuk dulu untuk menambah foto." };
  }

  // 3. Never trust an arbitrary key: it must live under this wedding's prefix.
  const expectedPrefix = `weddings/${weddingId}/photos/`;
  if (!objectKey.startsWith(expectedPrefix)) {
    return { ok: false, error: "Foto ini bukan milik undanganmu." };
  }

  try {
    // 4. Verify the object really exists in R2 before persisting a row that
    //    would otherwise point at missing bytes.
    const exists = await headObject(objectKey);
    if (!exists) {
      return { ok: false, error: "Foto belum selesai diunggah. Coba lagi." };
    }

    // 4b. Idempotency guard: the same objectKey must not register twice
    //     (review finding — repeated addPhoto calls would duplicate rows).
    const duplicate = await db.query.photos.findFirst({
      columns: { id: true },
      where: and(eq(photos.objectKey, objectKey), isNull(photos.deletedAt)),
    });
    if (duplicate) {
      return { ok: false, error: "Foto ini sudah ada di galeri." };
    }

    // 4c. Re-check the package quota at insert time — the sign-route check
    //     alone is a TOCTOU window when several presigned uploads are in
    //     flight (review finding). null photoLimit = unlimited.
    const [pkg] = await db
      .select({ photoLimit: packages.photoLimit })
      .from(weddings)
      .leftJoin(packages, eq(weddings.packageId, packages.id))
      .where(eq(weddings.id, weddingId));
    if (pkg?.photoLimit != null) {
      const [{ used }] = await db
        .select({ used: count() })
        .from(photos)
        .where(and(eq(photos.weddingId, weddingId), isNull(photos.deletedAt)));
      if (used >= pkg.photoLimit) {
        return { ok: false, error: "Kuota foto paketmu sudah penuh." };
      }
    }

    // 5. Append after the current highest sortOrder (among non-deleted photos).
    const [last] = await db
      .select({ sortOrder: photos.sortOrder })
      .from(photos)
      .where(and(eq(photos.weddingId, weddingId), isNull(photos.deletedAt)))
      .orderBy(desc(photos.sortOrder))
      .limit(1);

    const nextSortOrder = (last?.sortOrder ?? -1) + 1;

    const [inserted] = await db
      .insert(photos)
      .values({
        weddingId,
        objectKey,
        label: label ?? null,
        sortOrder: nextSortOrder,
      })
      .returning({ id: photos.id });

    if (!inserted) {
      return { ok: false, error: "Gagal menyimpan foto. Coba lagi." };
    }

    revalidatePath("/dashboard/gallery");

    return { ok: true, photoId: inserted.id };
  } catch (error) {
    // Never leak internals to the client; log server-side in English.
    console.error("addPhoto failed", error);
    return { ok: false, error: "Gagal menyimpan foto. Coba lagi." };
  }
}

/**
 * Set (or clear) the wedding's cover/hero photo. At most one photo is `isCover`
 * at a time. Passing `photoId: null` clears it (the template uses its default
 * hero). Ownership is enforced in the WHERE clause — a forged id matches nothing.
 */
export async function setCoverPhoto(input: SetCoverInput): Promise<SetCoverResult> {
  const parsed = setCoverSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Foto tidak valid." };
  }
  const { photoId } = parsed.data;

  const weddingId = await resolveOwnedWeddingId();
  if (!weddingId) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  try {
    // Clear any existing cover for this wedding first.
    await db
      .update(photos)
      .set({ isCover: false, updatedAt: new Date() })
      .where(and(eq(photos.weddingId, weddingId), eq(photos.isCover, true)));

    if (photoId) {
      const updated = await db
        .update(photos)
        .set({ isCover: true, updatedAt: new Date() })
        .where(
          and(
            eq(photos.id, photoId),
            eq(photos.weddingId, weddingId),
            isNull(photos.deletedAt),
          ),
        )
        .returning({ id: photos.id });
      if (updated.length === 0) {
        return { ok: false, error: "Foto tidak ditemukan." };
      }
    }

    revalidatePath("/dashboard/gallery");
    revalidatePath("/dashboard/editor");
    return { ok: true };
  } catch (error) {
    console.error("setCoverPhoto failed", error);
    return { ok: false, error: "Gagal mengatur foto hero. Coba lagi." };
  }
}

/**
 * Set (or clear) the wedding's closing photo — the dedicated image shown in the
 * closing/footnote section. At most one photo is `isClosing` at a time. Passing
 * `photoId: null` clears it (the closing section falls back to the cover photo).
 * Mirrors setCoverPhoto exactly; ownership is enforced in the WHERE clause so a
 * forged id matches nothing.
 */
export async function setClosingPhoto(input: SetClosingInput): Promise<SetClosingResult> {
  const parsed = setClosingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Foto tidak valid." };
  }
  const { photoId } = parsed.data;

  const weddingId = await resolveOwnedWeddingId();
  if (!weddingId) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  try {
    // Clear any existing closing photo for this wedding first.
    await db
      .update(photos)
      .set({ isClosing: false, updatedAt: new Date() })
      .where(and(eq(photos.weddingId, weddingId), eq(photos.isClosing, true)));

    if (photoId) {
      const updated = await db
        .update(photos)
        .set({ isClosing: true, updatedAt: new Date() })
        .where(
          and(
            eq(photos.id, photoId),
            eq(photos.weddingId, weddingId),
            isNull(photos.deletedAt),
          ),
        )
        .returning({ id: photos.id });
      if (updated.length === 0) {
        return { ok: false, error: "Foto tidak ditemukan." };
      }
    }

    revalidatePath("/dashboard/gallery");
    revalidatePath("/dashboard/editor");
    return { ok: true };
  } catch (error) {
    console.error("setClosingPhoto failed", error);
    return { ok: false, error: "Gagal mengatur foto penutup. Coba lagi." };
  }
}

/**
 * Soft-delete a gallery photo.
 *
 * Ownership is enforced in the WHERE clause: the photo is only updated when it
 * belongs to the session user's wedding, so a forged photoId from another
 * wedding matches nothing and changes nothing.
 */
export async function deletePhoto(input: DeletePhotoInput): Promise<DeletePhotoResult> {
  // 1. Validate external input.
  const parsed = deletePhotoSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Foto tidak valid." };
  }
  const { photoId } = parsed.data;

  // 2. Derive ownership from the session.
  const weddingId = await resolveOwnedWeddingId();
  if (!weddingId) {
    return { ok: false, error: "Kamu harus masuk dulu untuk menghapus foto." };
  }

  try {
    // 3. Soft-delete with ownership baked into the WHERE clause. Return the
    //    objectKey so we can free the bytes in R2 afterwards.
    const [deleted] = await db
      .update(photos)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(photos.id, photoId),
          eq(photos.weddingId, weddingId),
          isNull(photos.deletedAt),
        ),
      )
      .returning({ id: photos.id, objectKey: photos.objectKey });

    if (!deleted) {
      return { ok: false, error: "Foto tidak ditemukan." };
    }

    // 4. Free the R2 bytes so deleted photos don't keep consuming storage. The
    //    objectKey is unique per upload (addPhoto rejects duplicates), so no live
    //    photo shares it. Best-effort: the row is already soft-deleted (the
    //    source of truth), so a failed R2 delete must not fail the user action —
    //    we log the orphaned key instead.
    try {
      await deleteObject(deleted.objectKey);
    } catch (error) {
      console.error("deletePhoto: R2 object not deleted (orphaned)", deleted.objectKey, error);
    }

    revalidatePath("/dashboard/gallery");

    return { ok: true };
  } catch (error) {
    console.error("deletePhoto failed", error);
    return { ok: false, error: "Gagal menghapus foto. Coba lagi." };
  }
}

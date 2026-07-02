"use server";

// Server Actions for guest-group badge icons (the "Grup Tamu" menu).
//
// Hard rules (AGENTS.md): the wedding is derived from the session, never the
// client; an arbitrary objectKey is never trusted (must live under this
// wedding's own badges/ prefix); existence in R2 is verified before a row is
// persisted. Rows are pure config (group label → icon) and are hard-deleted.

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { guestGroups } from "@/lib/db/schema";
import { deleteObject, headObject } from "@/lib/r2";
import { resolveMemberWeddingId } from "@/server/queries/wedding";

// Group names match guests.group verbatim (free text, max 80 like the guest form).
const setIconSchema = z.object({
  name: z.string().trim().min(1).max(80),
  objectKey: z.string().min(1),
});
const removeIconSchema = z.object({
  name: z.string().trim().min(1).max(80),
});
const setStyleSchema = z.object({
  name: z.string().trim().min(1).max(80),
  style: z.enum(["name", "avatar"]),
});

export type SetGroupIconInput = z.input<typeof setIconSchema>;
export type RemoveGroupIconInput = z.input<typeof removeIconSchema>;
export type SetGroupIconStyleInput = z.input<typeof setStyleSchema>;
export type GroupIconResult = { ok: true } | { ok: false; error: string };

/** Attach (or replace) the badge icon for a guest-group label. */
export async function setGroupIcon(input: SetGroupIconInput): Promise<GroupIconResult> {
  const parsed = setIconSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data grup tidak valid. Coba lagi." };
  }
  const { name, objectKey } = parsed.data;

  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  // Never trust an arbitrary key: it must live under this wedding's prefix.
  if (!objectKey.startsWith(`weddings/${weddingId}/badges/`)) {
    return { ok: false, error: "Ikon ini bukan milik undanganmu." };
  }

  try {
    // The browser PUTs bytes straight to R2; confirm they actually landed.
    const exists = await headObject(objectKey);
    if (!exists) {
      return { ok: false, error: "Ikon belum selesai diunggah. Coba lagi." };
    }

    // Remember the icon being replaced so its bytes don't orphan in R2.
    const prev = await db.query.guestGroups.findFirst({
      columns: { iconKey: true },
      where: and(eq(guestGroups.weddingId, weddingId), eq(guestGroups.name, name)),
    });

    await db
      .insert(guestGroups)
      .values({ weddingId, name, iconKey: objectKey })
      .onConflictDoUpdate({
        target: [guestGroups.weddingId, guestGroups.name],
        set: { iconKey: objectKey, updatedAt: new Date() },
      });

    if (prev && prev.iconKey !== objectKey) {
      await deleteObject(prev.iconKey).catch(() => {}); // best-effort cleanup
    }

    revalidatePath("/dashboard/guests/groups");
    return { ok: true };
  } catch (error) {
    console.error("setGroupIcon failed", error);
    return { ok: false, error: "Gagal menyimpan ikon. Coba lagi ya." };
  }
}

/** Switch where a group's badge renders (beside the name / on the avatar). */
export async function setGroupIconStyle(
  input: SetGroupIconStyleInput,
): Promise<GroupIconResult> {
  const parsed = setStyleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data grup tidak valid. Coba lagi." };
  }
  const { name, style } = parsed.data;

  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  try {
    const updated = await db
      .update(guestGroups)
      .set({ iconStyle: style, updatedAt: new Date() })
      .where(and(eq(guestGroups.weddingId, weddingId), eq(guestGroups.name, name)))
      .returning({ id: guestGroups.id });
    if (updated.length === 0) {
      return { ok: false, error: "Pasang ikon grupnya dulu ya." };
    }

    revalidatePath("/dashboard/guests/groups");
    return { ok: true };
  } catch (error) {
    console.error("setGroupIconStyle failed", error);
    return { ok: false, error: "Gagal menyimpan gaya badge. Coba lagi ya." };
  }
}

/** Remove a group's badge icon (idempotent). */
export async function removeGroupIcon(
  input: RemoveGroupIconInput,
): Promise<GroupIconResult> {
  const parsed = removeIconSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data grup tidak valid. Coba lagi." };
  }
  const { name } = parsed.data;

  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  try {
    const row = await db.query.guestGroups.findFirst({
      columns: { id: true, iconKey: true },
      where: and(eq(guestGroups.weddingId, weddingId), eq(guestGroups.name, name)),
    });
    if (!row) {
      return { ok: true }; // already gone
    }

    await db.delete(guestGroups).where(eq(guestGroups.id, row.id));
    await deleteObject(row.iconKey).catch(() => {}); // best-effort cleanup

    revalidatePath("/dashboard/guests/groups");
    return { ok: true };
  } catch (error) {
    console.error("removeGroupIcon failed", error);
    return { ok: false, error: "Gagal menghapus ikon. Coba lagi ya." };
  }
}

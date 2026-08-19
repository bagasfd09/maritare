"use server";

// Server Actions for wedding co-ownership (the groom + bride sharing one
// undangan). A wedding has up to TWO equal owners, tracked in wedding_members.
//
// Flow: owner A creates the wedding (gets an invite code, see createWedding);
// owner B registers/logs in normally, then at onboarding enters the code to join
// as the 2nd owner. Both are equal — either can edit, publish, regenerate the
// code, or remove the other.
//
// Hard rules (AGENTS.md): ownership is derived from the session (never a
// client-supplied wedding id); Zod at the boundary; Bahasa errors, English logs.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { weddingMembers, weddings } from "@/lib/db/schema";
import { generateUniqueInviteCode } from "@/lib/guest-code";
import {
  resolveAssistWeddingId,
  resolveEditorUserId,
  resolveMemberWeddingId,
} from "@/server/queries/wedding";

const MAX_MEMBERS = 2; // a wedding has at most two owners (groom + bride)

export type JoinWeddingResult = { ok: true } | { ok: false; error: string };
export type RegenerateCodeResult =
  | { ok: true; code: string }
  | { ok: false; error: string };
export type RemovePartnerResult = { ok: true } | { ok: false; error: string };

// ─────────────────────────────────────────────────────────────────
// joinWeddingByCode — the 2nd owner joins an existing wedding by its code
// ─────────────────────────────────────────────────────────────────

const joinSchema = z.object({
  code: z.string().trim().min(1, "Masukkan kode undangan.").max(40),
});

/**
 * Join an existing wedding as its 2nd owner using the invite code. Refuses when
 * the user already belongs to a wedding (one wedding per user). The 2-owner cap
 * is enforced RACE-SAFELY: the join runs in a transaction that locks the wedding
 * row (SELECT … FOR UPDATE) before counting members and inserting, so two people
 * submitting the same code concurrently can never create a 3rd owner. On success
 * this redirects to the dashboard and never returns.
 */
export async function joinWeddingByCode(input: {
  code: string;
}): Promise<JoinWeddingResult> {
  const parsed = joinSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first || "Kode undangan tidak valid." };
  }

  // An admin in "bantu edit" must never become a member: their own membership
  // would then win resolveMemberWeddingId() forever and pollute the couple's
  // owner list. The UI can't reach this page in assist mode; this is the guard
  // for a direct action call.
  if (await resolveAssistWeddingId()) {
    return { ok: false, error: "Keluar dari mode bantu edit dulu." };
  }

  const userId = await resolveEditorUserId();
  if (!userId) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  // One wedding per user: already a member → nothing to join.
  const existingMembership = await db.query.weddingMembers.findFirst({
    columns: { id: true },
    where: eq(weddingMembers.userId, userId),
  });
  if (existingMembership) {
    return { ok: false, error: "Kamu sudah terhubung ke sebuah undangan." };
  }

  const wedding = await db.query.weddings.findFirst({
    columns: { id: true },
    where: and(eq(weddings.inviteCode, parsed.data.code), isNull(weddings.deletedAt)),
  });
  if (!wedding) {
    return { ok: false, error: "Kode undangan tidak ditemukan." };
  }

  let joined: boolean;
  try {
    joined = await db.transaction(async (tx) => {
      // Lock the wedding row so concurrent joins serialize → cap stays exact.
      await tx.execute(sql`select id from weddings where id = ${wedding.id} for update`);
      const members = await tx
        .select({ id: weddingMembers.id })
        .from(weddingMembers)
        .where(eq(weddingMembers.weddingId, wedding.id));
      if (members.length >= MAX_MEMBERS) {
        return false;
      }
      await tx.insert(weddingMembers).values({
        weddingId: wedding.id,
        userId,
        role: "owner",
      });
      return true;
    });
  } catch (error) {
    console.error("joinWeddingByCode failed", error);
    return { ok: false, error: "Gagal bergabung. Coba lagi." };
  }

  if (!joined) {
    return { ok: false, error: "Undangan ini sudah punya 2 pemilik." };
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

// ─────────────────────────────────────────────────────────────────
// regenerateInviteCode — owner rotates the wedding's invite code
// ─────────────────────────────────────────────────────────────────

/** Replace the wedding's invite code with a fresh one (invalidates the old). */
export async function regenerateInviteCode(): Promise<RegenerateCodeResult> {
  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  try {
    const code = await generateUniqueInviteCode();
    await db
      .update(weddings)
      .set({ inviteCode: code, updatedAt: new Date() })
      .where(and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)));
    revalidatePath("/dashboard/settings");
    return { ok: true, code };
  } catch (error) {
    console.error("regenerateInviteCode failed", error);
    return { ok: false, error: "Gagal membuat kode baru. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// removePartner — drop a member from the wedding (equal powers)
// ─────────────────────────────────────────────────────────────────

const removeSchema = z.object({ userId: z.uuid("ID tidak valid.") });

/**
 * Remove a member (the partner OR yourself) from the wedding. Either owner may
 * do this (equal powers). Guards the LAST owner so a wedding is never left with
 * nobody who can manage it. Membership rows are HARD-deleted, which frees a slot
 * (so the code can be reused for a new partner).
 */
export async function removePartner(input: {
  userId: string;
}): Promise<RemovePartnerResult> {
  const parsed = removeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data tidak valid." };
  }

  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  try {
    const members = await db
      .select({ userId: weddingMembers.userId })
      .from(weddingMembers)
      .where(eq(weddingMembers.weddingId, weddingId));

    if (members.length <= 1) {
      return { ok: false, error: "Owner terakhir tidak bisa dihapus." };
    }
    if (!members.some((m) => m.userId === parsed.data.userId)) {
      return { ok: false, error: "Member tidak ditemukan." };
    }

    await db
      .delete(weddingMembers)
      .where(
        and(
          eq(weddingMembers.weddingId, weddingId),
          eq(weddingMembers.userId, parsed.data.userId),
        ),
      );

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard", "layout");
    return { ok: true };
  } catch (error) {
    console.error("removePartner failed", error);
    return { ok: false, error: "Gagal menghapus partner. Coba lagi." };
  }
}

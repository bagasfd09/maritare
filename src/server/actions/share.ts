"use server";

// Server Actions for family "quick send" access tokens ("Akses Keluarga").
//
// Two audiences, mirroring petugas.ts:
//  - PUBLIC (family): loginShare(code) / logoutShare() — the token code is the
//    credential. First login arms the 1-hour window (expires_at); re-login is
//    allowed while it lives (kicks the previous device); after that the code is
//    dead until the owner regenerates it. markGuestInvitedViaShare() is the one
//    mutation the session may perform, scoped to the token's wedding + sides.
//  - OWNER (dashboard): create/revoke/regenerate — gated by the session.
//
// Hard rules: ownership from the session; token secrets server-side; Zod at the
// boundary; Bahasa errors, English logs.

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, inArray, isNull, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { guests, shareTokens, weddings } from "@/lib/db/schema";
import {
  deviceLabel,
  newGuestbookCode,
  newSessionNonce,
  normalizeLoginCode,
} from "@/lib/guestbook-session";
import { canonicalizeSide, isReservedSide } from "@/lib/guests-csv";
import { clearShareCookie, readShareNonce, setShareCookie } from "@/lib/share-session";
import { resolveShareSession } from "@/server/share-resolve";
import { resolveMemberWeddingId } from "@/server/queries/wedding";

export type ShareResult = { ok: true } | { ok: false; error: string };

// ponytail: hard cap instead of a package quota field — wire to packages if
// this ever becomes a paid differentiator.
const MAX_TOKENS_PER_WEDDING = 20;

// ─────────────────────────────────────────────────────────────────
// Family: login / logout (public — token code is the credential)
// ─────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  code: z.string().trim().min(4).max(40),
});

export async function loginShare(input: { code: string }): Promise<ShareResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Kode tidak valid." };
  }
  const code = normalizeLoginCode(parsed.data.code);

  try {
    const match = await db.query.shareTokens.findFirst({
      columns: { id: true, expiresAt: true },
      where: and(eq(shareTokens.code, code), isNull(shareTokens.deletedAt)),
    });

    if (!match) {
      return { ok: false, error: "Kode tidak ditemukan atau sudah dicabut." };
    }
    if (match.expiresAt && match.expiresAt.getTime() <= Date.now()) {
      return {
        ok: false,
        error: "Kode sudah kedaluwarsa. Minta kode baru ke pemilik undangan.",
      };
    }

    const nonce = newSessionNonce();
    const ua = (await headers()).get("user-agent") ?? "";
    // Conditional + atomic: re-assert code/deletedAt/expiry in the WHERE so a
    // concurrent owner regenerate/revoke can't be overwritten by this login
    // (the read above is only for the friendlier "kedaluwarsa" error), and arm
    // the 1-hour window in SQL so two first logins can't each start a clock.
    const updated = await db
      .update(shareTokens)
      .set({
        sessionNonce: nonce, // overwrites any prior device → kicks it
        expiresAt: sql`COALESCE(${shareTokens.expiresAt}, now() + interval '1 hour')`,
        lastSeenAt: new Date(),
        lastDevice: deviceLabel(ua),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(shareTokens.id, match.id),
          eq(shareTokens.code, code),
          isNull(shareTokens.deletedAt),
          or(isNull(shareTokens.expiresAt), gt(shareTokens.expiresAt, new Date())),
        ),
      )
      .returning({ id: shareTokens.id });
    if (updated.length === 0) {
      return { ok: false, error: "Kode tidak ditemukan atau sudah dicabut." };
    }

    await setShareCookie(nonce);
    return { ok: true };
  } catch (error) {
    console.error("loginShare failed", error);
    return { ok: false, error: "Gagal masuk. Coba lagi." };
  }
}

export async function logoutShare(): Promise<ShareResult> {
  try {
    const nonce = await readShareNonce();
    if (nonce) {
      await db
        .update(shareTokens)
        .set({ sessionNonce: null, updatedAt: new Date() })
        .where(and(eq(shareTokens.sessionNonce, nonce), isNull(shareTokens.deletedAt)));
    }
    await clearShareCookie();
    return { ok: true };
  } catch (error) {
    console.error("logoutShare failed", error);
    await clearShareCookie();
    return { ok: true };
  }
}

/** Form-friendly logout: ends the sending session, returns to login. */
export async function endShareSession(): Promise<void> {
  await logoutShare();
  redirect("/kirim/login");
}

/**
 * Mark a guest's invitation as sent — the only mutation a share session may
 * perform. Scoped to the token's wedding AND its allowed sides, so a forged
 * guest id outside the sender's scope matches nothing.
 */
export async function markGuestInvitedViaShare(input: {
  guestId: string;
}): Promise<ShareResult> {
  const parsed = z.object({ guestId: z.uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Data tidak valid." };

  const session = await resolveShareSession();
  if (!session) {
    return { ok: false, error: "Sesi sudah berakhir. Masuk lagi dengan kode baru." };
  }

  try {
    await db
      .update(guests)
      .set({ invitationStatus: "sent", updatedAt: new Date() })
      .where(
        and(
          eq(guests.id, parsed.data.guestId),
          eq(guests.weddingId, session.weddingId),
          inArray(guests.side, session.sides),
          isNull(guests.deletedAt),
        ),
      );
    return { ok: true };
  } catch (error) {
    console.error("markGuestInvitedViaShare failed", error);
    return { ok: false, error: "Gagal memperbarui status." };
  }
}

// ─────────────────────────────────────────────────────────────────
// Owner: manage tokens
// ─────────────────────────────────────────────────────────────────

/** Owner's wedding id, rejecting soft-deleted weddings (mirrors petugas.ts). */
async function resolveLiveWeddingId(): Promise<string | null> {
  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) return null;
  const [row] = await db
    .select({ id: weddings.id })
    .from(weddings)
    .where(and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)))
    .limit(1);
  return row?.id ?? null;
}

async function uniqueCode(): Promise<string> {
  // Same reasoning as the petugas generator: the column is UNIQUE including
  // soft-deleted rows, so check every row and fail loudly if exhausted.
  for (let i = 0; i < 24; i++) {
    const c = newGuestbookCode();
    const exists = await db.query.shareTokens.findFirst({
      columns: { id: true },
      where: eq(shareTokens.code, c),
    });
    if (!exists) return c;
  }
  throw new Error("uniqueCode: exhausted attempts generating a unique code");
}

const createSchema = z.object({
  label: z.string().trim().min(1, "Nama/label wajib diisi").max(40),
  sides: z
    .array(z.string().transform(canonicalizeSide))
    .min(1, "Pilih minimal satu sisi.")
    .max(10)
    .refine(
      (arr) => arr.every((s) => s.length > 0 && s.length <= 40 && !isReservedSide(s)),
      "Sisi tidak valid.",
    ),
});

export async function createShareToken(input: {
  label: string;
  sides: string[];
}): Promise<ShareResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first || "Data tidak valid." };
  }
  const weddingId = await resolveLiveWeddingId();
  if (!weddingId) return { ok: false, error: "Kamu harus masuk dulu." };

  try {
    const [{ used }] = await db
      .select({ used: sql<number>`count(*)::int` })
      .from(shareTokens)
      .where(and(eq(shareTokens.weddingId, weddingId), isNull(shareTokens.deletedAt)));

    if ((used ?? 0) >= MAX_TOKENS_PER_WEDDING) {
      return { ok: false, error: `Maksimal ${MAX_TOKENS_PER_WEDDING} akses keluarga.` };
    }

    await db.insert(shareTokens).values({
      weddingId,
      label: parsed.data.label,
      sides: [...new Set(parsed.data.sides)],
      code: await uniqueCode(),
    });
    revalidatePath("/dashboard/akses-keluarga");
    return { ok: true };
  } catch (error) {
    console.error("createShareToken failed", error);
    return { ok: false, error: "Gagal membuat akses. Coba lagi." };
  }
}

/** Owner-scoped lookup so a forged token id from another wedding matches nothing. */
function ownedTokenWhere(id: string, weddingId: string) {
  return and(
    eq(shareTokens.id, id),
    eq(shareTokens.weddingId, weddingId),
    isNull(shareTokens.deletedAt),
  );
}

export async function revokeShareToken(input: { id: string }): Promise<ShareResult> {
  const parsed = z.object({ id: z.uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Data tidak valid." };
  const weddingId = await resolveLiveWeddingId();
  if (!weddingId) return { ok: false, error: "Kamu harus masuk dulu." };
  try {
    await db
      .update(shareTokens)
      .set({ deletedAt: new Date(), sessionNonce: null, updatedAt: new Date() })
      .where(ownedTokenWhere(parsed.data.id, weddingId));
    revalidatePath("/dashboard/akses-keluarga");
    return { ok: true };
  } catch (error) {
    console.error("revokeShareToken failed", error);
    return { ok: false, error: "Gagal mencabut akses." };
  }
}

/** New code + fresh unused 1-hour window (also kicks any active device). */
export async function regenerateShareCode(input: { id: string }): Promise<ShareResult> {
  const parsed = z.object({ id: z.uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Data tidak valid." };
  const weddingId = await resolveLiveWeddingId();
  if (!weddingId) return { ok: false, error: "Kamu harus masuk dulu." };
  try {
    await db
      .update(shareTokens)
      .set({
        code: await uniqueCode(),
        expiresAt: null,
        sessionNonce: null,
        updatedAt: new Date(),
      })
      .where(ownedTokenWhere(parsed.data.id, weddingId));
    revalidatePath("/dashboard/akses-keluarga");
    return { ok: true };
  } catch (error) {
    console.error("regenerateShareCode failed", error);
    return { ok: false, error: "Gagal membuat ulang kode." };
  }
}

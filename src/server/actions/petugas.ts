"use server";

// Server Actions for "Petugas Resepsi" (reception/kiosk attendant) tokens.
//
// Two audiences:
//  - PUBLIC (attendant): loginPetugas(code) / logoutPetugas() — no dashboard
//    account; the token code is the credential. Single active device per token
//    via sessionNonce (a new login overwrites it → previous device is kicked).
//  - OWNER (dashboard): create/revoke/regenerate/force-logout — gated by the
//    session and quota'd by the wedding's package (packages.guestbookLimit).
//
// Hard rules: ownership from the session; token secrets server-side; Zod at the
// boundary; Bahasa errors, English logs.

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { guestbookTokens, packages, weddings } from "@/lib/db/schema";
import {
  clearKioskCookie,
  deviceLabel,
  newGuestbookCode,
  newSessionNonce,
  normalizeLoginCode,
  readKioskNonce,
  setKioskCookie,
} from "@/lib/guestbook-session";
import { resolveMemberWeddingId } from "@/server/queries/wedding";

export type PetugasResult = { ok: true } | { ok: false; error: string };

// ─────────────────────────────────────────────────────────────────
// Attendant: login / logout (public — token code is the credential)
// ─────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  // Codes are shown grouped ("K7P2-MQ9X"); accept with/without the dash/spaces.
  code: z.string().trim().min(4).max(40),
});

export async function loginPetugas(input: { code: string }): Promise<PetugasResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Kode tidak valid." };
  }
  const code = normalizeLoginCode(parsed.data.code);

  try {
    const match = await db.query.guestbookTokens.findFirst({
      columns: { id: true },
      where: and(eq(guestbookTokens.code, code), isNull(guestbookTokens.deletedAt)),
    });

    if (!match) {
      return { ok: false, error: "Kode tidak ditemukan atau sudah dicabut." };
    }

    const nonce = newSessionNonce();
    const ua = (await headers()).get("user-agent") ?? "";
    await db
      .update(guestbookTokens)
      .set({
        sessionNonce: nonce, // overwrites any prior device → kicks it
        lastSeenAt: new Date(),
        lastDevice: deviceLabel(ua),
        updatedAt: new Date(),
      })
      .where(eq(guestbookTokens.id, match.id));

    await setKioskCookie(nonce);
    return { ok: true };
  } catch (error) {
    console.error("loginPetugas failed", error);
    return { ok: false, error: "Gagal masuk. Coba lagi." };
  }
}

export async function logoutPetugas(): Promise<PetugasResult> {
  try {
    const nonce = await readKioskNonce();
    if (nonce) {
      await db
        .update(guestbookTokens)
        .set({ sessionNonce: null, updatedAt: new Date() })
        .where(
          and(
            eq(guestbookTokens.sessionNonce, nonce),
            isNull(guestbookTokens.deletedAt),
          ),
        );
    }
    await clearKioskCookie();
    return { ok: true };
  } catch (error) {
    console.error("logoutPetugas failed", error);
    await clearKioskCookie();
    return { ok: true };
  }
}

/** Form-friendly attendant logout: ends the kiosk session, returns to login. */
export async function endPetugasSession(): Promise<void> {
  await logoutPetugas();
  redirect("/guestbook/login");
}

// ─────────────────────────────────────────────────────────────────
// Owner: manage tokens (quota'd by the package)
// ─────────────────────────────────────────────────────────────────

async function resolveOwnerWedding(): Promise<{ id: string; limit: number } | null> {
  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) return null;
  const [row] = await db
    .select({ id: weddings.id, limit: packages.guestbookLimit })
    .from(weddings)
    .leftJoin(packages, eq(weddings.packageId, packages.id))
    .where(and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)))
    .limit(1);
  if (!row) return null;
  return { id: row.id, limit: row.limit ?? 1 };
}

async function uniqueCode(): Promise<string> {
  // The code column is UNIQUE (incl. soft-deleted rows), so check every row — not
  // just live ones — to avoid colliding with a revoked token's code. The 30^8 ≈
  // 6.5e11 space makes a collision astronomically unlikely; loop a few times and
  // fail loudly rather than emit a malformed code the login flow can't match.
  for (let i = 0; i < 24; i++) {
    const c = newGuestbookCode();
    const exists = await db.query.guestbookTokens.findFirst({
      columns: { id: true },
      where: eq(guestbookTokens.code, c),
    });
    if (!exists) return c;
  }
  throw new Error("uniqueCode: exhausted attempts generating a unique code");
}

export async function createPetugasToken(input: { label: string }): Promise<PetugasResult> {
  const parsed = z.object({ label: z.string().trim().min(1, "Nama/label wajib diisi").max(40) }).safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first || "Data tidak valid." };
  }

  const wedding = await resolveOwnerWedding();
  if (!wedding) return { ok: false, error: "Kamu harus masuk dulu." };

  try {
    const [{ used }] = await db
      .select({ used: sql<number>`count(*)::int` })
      .from(guestbookTokens)
      .where(and(eq(guestbookTokens.weddingId, wedding.id), isNull(guestbookTokens.deletedAt)));

    if ((used ?? 0) >= wedding.limit) {
      return {
        ok: false,
        error: `Kuota petugas penuh (${wedding.limit}). Upgrade paket untuk menambah.`,
      };
    }

    await db.insert(guestbookTokens).values({
      weddingId: wedding.id,
      label: parsed.data.label,
      code: await uniqueCode(),
    });
    revalidatePath("/dashboard/petugas");
    return { ok: true };
  } catch (error) {
    console.error("createPetugasToken failed", error);
    return { ok: false, error: "Gagal membuat token. Coba lagi." };
  }
}

/** Owner-scoped lookup so a forged token id from another wedding matches nothing. */
async function ownedTokenWhere(id: string, weddingId: string) {
  return and(eq(guestbookTokens.id, id), eq(guestbookTokens.weddingId, weddingId), isNull(guestbookTokens.deletedAt));
}

export async function revokePetugasToken(input: { id: string }): Promise<PetugasResult> {
  const parsed = z.object({ id: z.uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Data tidak valid." };
  const wedding = await resolveOwnerWedding();
  if (!wedding) return { ok: false, error: "Kamu harus masuk dulu." };
  try {
    await db
      .update(guestbookTokens)
      .set({ deletedAt: new Date(), sessionNonce: null, updatedAt: new Date() })
      .where(await ownedTokenWhere(parsed.data.id, wedding.id));
    revalidatePath("/dashboard/petugas");
    return { ok: true };
  } catch (error) {
    console.error("revokePetugasToken failed", error);
    return { ok: false, error: "Gagal mencabut token." };
  }
}

export async function regeneratePetugasCode(input: { id: string }): Promise<PetugasResult> {
  const parsed = z.object({ id: z.uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Data tidak valid." };
  const wedding = await resolveOwnerWedding();
  if (!wedding) return { ok: false, error: "Kamu harus masuk dulu." };
  try {
    await db
      .update(guestbookTokens)
      .set({ code: await uniqueCode(), sessionNonce: null, updatedAt: new Date() })
      .where(await ownedTokenWhere(parsed.data.id, wedding.id));
    revalidatePath("/dashboard/petugas");
    return { ok: true };
  } catch (error) {
    console.error("regeneratePetugasCode failed", error);
    return { ok: false, error: "Gagal membuat ulang kode." };
  }
}

export async function forcePetugasLogout(input: { id: string }): Promise<PetugasResult> {
  const parsed = z.object({ id: z.uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Data tidak valid." };
  const wedding = await resolveOwnerWedding();
  if (!wedding) return { ok: false, error: "Kamu harus masuk dulu." };
  try {
    await db
      .update(guestbookTokens)
      .set({ sessionNonce: null, updatedAt: new Date() })
      .where(await ownedTokenWhere(parsed.data.id, wedding.id));
    revalidatePath("/dashboard/petugas");
    return { ok: true };
  } catch (error) {
    console.error("forcePetugasLogout failed", error);
    return { ok: false, error: "Gagal keluarkan perangkat." };
  }
}

// Shared kiosk wedding resolution for the guestbook.
//
// The kiosk is gated ONLY by a Petugas Resepsi token session (cookie nonce →
// token row). It deliberately does NOT consult the owner's dashboard login:
// whoever runs the kiosk — including the owner — must sign in with a token code,
// and the token alone determines which wedding this buku tamu is for. This keeps
// the guestbook fully decoupled from the dashboard session.
//
// Returns null when there is no valid token (cookie missing, or the token was
// revoked / kicked by a login on another device).

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { guestbookTokens, weddings } from "@/lib/db/schema";
import { readKioskNonce } from "@/lib/guestbook-session";

export type KioskResolution = {
  weddingId: string;
  /** The token's label — shown as the "Penjaga" (attendant) on the kiosk. */
  attendantLabel: string | null;
  /**
   * Always true: the kiosk is token-only and must stay decoupled from the
   * dashboard login — do NOT add an owner/session branch here. Retained so the
   * kiosk shell can render the attendant logout unconditionally.
   */
  viaToken: boolean;
};

export async function resolveKiosk(): Promise<KioskResolution | null> {
  // The kiosk session IS the token cookie nonce; it must match a live token.
  const nonce = await readKioskNonce();
  if (!nonce) {
    return null;
  }

  const [row] = await db
    .select({
      weddingId: guestbookTokens.weddingId,
      label: guestbookTokens.label,
    })
    .from(guestbookTokens)
    .innerJoin(weddings, eq(guestbookTokens.weddingId, weddings.id))
    .where(
      and(
        eq(guestbookTokens.sessionNonce, nonce),
        isNull(guestbookTokens.deletedAt),
        isNull(weddings.deletedAt),
      ),
    )
    .limit(1);

  // nonce present but no match → token was revoked, or kicked by another device.
  if (!row) {
    return null;
  }
  return { weddingId: row.weddingId, attendantLabel: row.label, viaToken: true };
}

/** Just the wedding id (for actions that only need ownership scoping). */
export async function resolveKioskWeddingId(): Promise<string | null> {
  return (await resolveKiosk())?.weddingId ?? null;
}

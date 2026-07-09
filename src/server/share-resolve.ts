// Shared session resolution for the family "quick send" pages (/kirim).
//
// Gated ONLY by a share-token session (cookie nonce → token row), decoupled
// from the dashboard login — same design as the guestbook kiosk. Returns null
// when the cookie is missing, the token was revoked/kicked, or the 1-hour
// sending window (expires_at) has passed.

import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { shareTokens, weddings } from "@/lib/db/schema";
import { readShareNonce } from "@/lib/share-session";

export type ShareResolution = {
  /** The share token id — for mutations scoped to this exact token. */
  tokenId: string;
  weddingId: string;
  /** The token's label — shown as the sender identity, e.g. "Ibu Pengantin Pria". */
  label: string;
  /** Guest side values this sender may see. */
  sides: string[];
  /** The sender's saved WA template ({nama}/{link}); null = use default. */
  template: string | null;
  /** End of the 1-hour sending window. */
  expiresAt: Date;
};

export async function resolveShareSession(): Promise<ShareResolution | null> {
  const nonce = await readShareNonce();
  if (!nonce) {
    return null;
  }

  const [row] = await db
    .select({
      tokenId: shareTokens.id,
      weddingId: shareTokens.weddingId,
      label: shareTokens.label,
      sides: shareTokens.sides,
      template: shareTokens.template,
      expiresAt: shareTokens.expiresAt,
    })
    .from(shareTokens)
    .innerJoin(weddings, eq(shareTokens.weddingId, weddings.id))
    .where(
      and(
        eq(shareTokens.sessionNonce, nonce),
        isNull(shareTokens.deletedAt),
        isNull(weddings.deletedAt),
        gt(shareTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!row || !row.expiresAt) {
    return null;
  }
  return {
    tokenId: row.tokenId,
    weddingId: row.weddingId,
    label: row.label,
    sides: row.sides,
    template: row.template,
    expiresAt: row.expiresAt,
  };
}

/**
 * Where a /kirim page should bounce a visitor whose session did not resolve.
 * Distinguishes the two present-but-invalid cookie cases so the login page can
 * give the right next step: the nonce still matching a live token row means the
 * only possible failure is the 1-hour window (`?expired=1`); no matching row
 * means kicked by another device / revoked / regenerated (`?kicked=1`).
 */
export async function shareBouncePath(): Promise<string> {
  const nonce = await readShareNonce();
  if (!nonce) {
    return "/kirim/login";
  }
  const [row] = await db
    .select({ id: shareTokens.id })
    .from(shareTokens)
    .where(and(eq(shareTokens.sessionNonce, nonce), isNull(shareTokens.deletedAt)))
    .limit(1);
  return row ? "/kirim/login?expired=1" : "/kirim/login?kicked=1";
}

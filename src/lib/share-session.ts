// Family "quick send" session — a token-based session SEPARATE from both the
// dashboard auth session and the kiosk session, so a family member can send
// invites via their own WhatsApp without any dashboard access. Mirrors
// guestbook-session.ts: the cookie carries a long random nonce matched against
// the token row; a login elsewhere overwrites the nonce (single active device).
// The authoritative 1-hour lifetime lives on share_tokens.expires_at.
//
// Server-only (uses next/headers).

import { cookies } from "next/headers";

export const SHARE_COOKIE = "share_session";

// The DB expiry (expires_at) is authoritative — the 1-hour window is armed in
// SQL by loginShare; the cookie just needs to outlive the sending session.
const MAX_AGE_SECONDS = 60 * 60 * 2;

export async function readShareNonce(): Promise<string | null> {
  const c = await cookies();
  return c.get(SHARE_COOKIE)?.value ?? null;
}

export async function setShareCookie(nonce: string): Promise<void> {
  const c = await cookies();
  c.set(SHARE_COOKIE, nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearShareCookie(): Promise<void> {
  const c = await cookies();
  c.delete(SHARE_COOKIE);
}

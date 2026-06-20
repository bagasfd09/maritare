// Reception/kiosk ("Petugas Resepsi") session — a token-based session that is
// SEPARATE from the dashboard auth session, so an attendant can run the kiosk
// without any access to the owner's dashboard. The cookie carries a long random
// `nonce`; the matching token row stores the same nonce. A login elsewhere
// overwrites the row's nonce, so only the most recent device's cookie validates
// (single active device — the previous device is "kicked").
//
// Server-only (uses next/headers + node:crypto).

import { randomBytes, randomInt } from "node:crypto";
import { cookies } from "next/headers";

export const GUESTBOOK_COOKIE = "gb_session";

// Cookie lifetime — a long event day. Re-login (token code) after expiry.
const MAX_AGE_SECONDS = 60 * 60 * 18; // 18 hours

/** A long, unguessable session secret stored in the cookie + the token row. */
export function newSessionNonce(): string {
  return randomBytes(24).toString("hex");
}

// Login code alphabet — uppercase, no ambiguous chars (0/O/1/I) so it's easy to
// read out loud / type on a phone.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** A short human-friendly login code, e.g. "K7P2-MQ9X". */
export function newGuestbookCode(): string {
  let out = "";
  for (let i = 0; i < 8; i++) {
    if (i === 4) out += "-";
    out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return out;
}

export async function readKioskNonce(): Promise<string | null> {
  const c = await cookies();
  return c.get(GUESTBOOK_COOKIE)?.value ?? null;
}

/**
 * Where a kiosk page should send a visitor whose session did not resolve. When a
 * `gb_session` cookie is present but no longer valid (the token was kicked by a
 * login elsewhere, or revoked), append `?kicked=1` so the login page can explain
 * why the device was logged out. With no cookie at all it's a plain login.
 */
export async function kioskLoginPath(): Promise<string> {
  const c = await cookies();
  return c.has(GUESTBOOK_COOKIE)
    ? "/guestbook/login?kicked=1"
    : "/guestbook/login";
}

export async function setKioskCookie(nonce: string): Promise<void> {
  const c = await cookies();
  c.set(GUESTBOOK_COOKIE, nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearKioskCookie(): Promise<void> {
  const c = await cookies();
  c.delete(GUESTBOOK_COOKIE);
}

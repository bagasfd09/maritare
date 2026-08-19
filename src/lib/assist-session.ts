// Admin "bantu edit" session — lets an admin open a customer's editor to help
// them fill the invitation. Mirrors share-session.ts: a cookie SEPARATE from the
// dashboard auth session, here carrying the wedding id being assisted.
//
// The cookie is NOT signed on purpose: authority is the admin role re-read from
// the Auth.js session on every resolve (see resolveAssistWeddingId), so the same
// cookie on a customer session is inert.
//
// Pure module (no next/headers) so the decision below stays unit-testable; the
// three call sites use `cookies()` directly with the options here.

export const ASSIST_COOKIE = "assist_wedding";

/** Cookie options for setAssist — short-lived by design, an admin should not sit in assist mode indefinitely. */
export const ASSIST_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 2,
} as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The decision: which wedding id an assist cookie grants, given the session role.
 * Only "admin" grants — never a missing role (the dev fallback in
 * resolveEditorUserId must not become an assist backdoor).
 */
export function assistIdFor(cookieValue: string | null, role: string | undefined): string | null {
  if (!cookieValue || role !== "admin") return null;
  // Shape-check before the value ever reaches a uuid column — a hand-crafted
  // cookie would otherwise blow up the query instead of being ignored.
  return UUID_RE.test(cookieValue) ? cookieValue : null;
}

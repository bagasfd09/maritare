import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth.js v5 session cookie names. The `__Secure-` prefix is used when the
// site is served over HTTPS (production); the bare name in local dev over HTTP.
const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
] as const;

// The kiosk attendant session cookie, set by a Petugas Resepsi token login
// (see src/lib/guestbook-session.ts). Separate from the dashboard auth session.
const GUESTBOOK_COOKIE = "gb_session";

/**
 * Optimistic edge gate.
 *
 * Proxy must not hit the DB (it runs on every matched request, including
 * prefetches), so we only check for the *presence* of a session cookie. The
 * authoritative checks (valid session + role, valid kiosk token) live in the
 * server layouts / page getters.
 *
 * - /dashboard, /admin → require the dashboard auth cookie; else → /login.
 * - /guestbook → token-only. Gated SOLELY by the kiosk token cookie
 *   (gb_session); the dashboard login is intentionally NOT accepted here, so the
 *   guestbook stays decoupled from the owner's account. Missing the kiosk cookie
 *   → /guestbook/login. The login page itself is always public.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;

  // ── Kiosk (/guestbook) — token-only, independent of the dashboard login ──
  if (pathname.startsWith("/guestbook")) {
    // The attendant login page is always reachable (it grants the session).
    if (pathname === "/guestbook/login") {
      return NextResponse.next();
    }
    if (request.cookies.has(GUESTBOOK_COOKIE)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/guestbook/login", request.nextUrl));
  }

  const hasAuthSession = SESSION_COOKIE_NAMES.some((name) =>
    request.cookies.has(name),
  );

  // ── Dashboard / admin ───────────────────────────────────────────
  if (!hasAuthSession) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Guard authenticated areas. The kiosk (/guestbook) has its own token-based
  // gate; marketing/auth routes stay public.
  matcher: ["/dashboard/:path*", "/admin/:path*", "/guestbook/:path*"],
};

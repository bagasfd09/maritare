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

// The family quick-send session cookie, set by an Akses Keluarga token login
// (see src/lib/share-session.ts). Also separate from the dashboard session.
const SHARE_COOKIE = "share_session";

// The admin "bantu edit" cookie (see src/lib/assist-session.ts). While it is
// set, the dashboard is narrowed to the pages an admin actually needs.
const ASSIST_COOKIE = "assist_wedding";
const ASSIST_PATHS = ["/dashboard/editor", "/dashboard/gallery"] as const;

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

  // ── Family quick-send (/kirim) — token-only, same design as the kiosk ──
  if (pathname.startsWith("/kirim")) {
    if (pathname === "/kirim/login") {
      return NextResponse.next();
    }
    if (request.cookies.has(SHARE_COOKIE)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/kirim/login", request.nextUrl));
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

  // ── Admin "bantu edit" — assist is scoped to the editor + gallery ──
  // While an assist cookie is present, keep the admin out of the customer's
  // account-scoped pages (billing/checkout, settings, akses keluarga): those
  // resolve the SIGNED-IN user, so an admin there would act on their own
  // account or, worse, join the customer's wedding as a member. The
  // authoritative admin check lives in the (dashboard) layout — this only
  // narrows navigation.
  if (
    pathname.startsWith("/dashboard") &&
    request.cookies.has(ASSIST_COOKIE) &&
    !ASSIST_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return NextResponse.redirect(new URL("/dashboard/editor", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  // Guard authenticated areas. The kiosk (/guestbook) and family quick-send
  // (/kirim) have their own token-based gates; marketing/auth routes stay public.
  matcher: ["/dashboard/:path*", "/admin/:path*", "/guestbook/:path*", "/kirim/:path*"],
};

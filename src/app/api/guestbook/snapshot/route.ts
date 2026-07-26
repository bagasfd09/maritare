import { getKioskData } from "@/server/queries/guestbook";

// Kiosk snapshot poll for the offline-capable guestbook flow.
//
// A GET route handler (not a server action) on purpose: Next.js dispatches
// server actions from one client strictly one-at-a-time, so polling via an
// action would head-of-line block interactive check-ins behind a slow
// snapshot download on bad venue wifi — and fetch() gives the client a real
// AbortSignal timeout. Read-only; both kiosk mutations remain server actions.
//
// Auth is the same token-only resolution as every kiosk getter (inside
// getKioskData): the response is `null` when the session is missing/kicked,
// so the client can tell "logged out" (JSON null) apart from "offline"
// (network error).
export async function GET(): Promise<Response> {
  const data = await getKioskData();
  return Response.json(data, {
    headers: { "cache-control": "no-store" },
  });
}

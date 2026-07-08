// Builds the /dashboard/guests URL for a filter/page state, omitting defaults
// so the bare path stays clean. Shared by the desktop and mobile guest lists
// (both drive the server-paged list through the URL).

import type { GuestsFilters } from "@/server/queries/dashboard";

export function guestsPath(f: GuestsFilters & { page: number }): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.status) p.set("status", f.status);
  if (f.side) p.set("side", f.side);
  if (f.page > 1) p.set("page", String(f.page));
  const qs = p.toString();
  return `/dashboard/guests${qs ? `?${qs}` : ""}`;
}

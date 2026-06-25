// Shared filtering + counting for the Buku Ucapan list, used by both the desktop
// (numbered pagination) and mobile (infinite scroll) wish lists so the filter
// semantics stay identical across platforms.

export type WishStatus = "pending" | "approved" | "hidden";
export type WishFilter = "all" | WishStatus;

type FilterableWish = { status: WishStatus; fromName: string; body: string };

// Filter by status bucket, then by a free-text query over name + body. An empty
// query matches everything; "all" matches every status.
export function filterWishes<T extends FilterableWish>(
  wishes: T[],
  filter: WishFilter,
  query = "",
): T[] {
  const q = query.trim().toLowerCase();
  return wishes.filter((w) => {
    if (filter !== "all" && w.status !== filter) return false;
    if (q && !`${w.fromName} ${w.body}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

// Per-status tallies for the filter-tab badges (computed client-side over the
// full list the server already returned).
export function countByStatus(
  wishes: { status: WishStatus }[],
): { all: number; pending: number; approved: number; hidden: number } {
  const c = { all: wishes.length, pending: 0, approved: 0, hidden: 0 };
  for (const w of wishes) c[w.status] += 1;
  return c;
}

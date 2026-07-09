"use client";

// Client feed for the family pages' server-driven infinite scroll (/kirim and
// /kirim/tamu): holds the loaded rows, debounces the search box into a
// server-side ILIKE query, and pulls the next keyset page when the sentinel
// element scrolls into view. Only a DEAD share session triggers
// router.refresh() (the server bounces to /kirim/login with the reason);
// transient/validation failures stop the feed instead of retry-storming — a
// new search re-arms it.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { ShareGuestCursor } from "@/server/queries/share";

type FeedResult<Row> =
  | { ok: true; rows: Row[]; nextCursor: ShareGuestCursor | null }
  | { ok: false; error: string; dead?: boolean };

export function useGuestFeed<Row extends { id: string }>({
  initialRows,
  initialCursor,
  fetchPage,
}: {
  initialRows: Row[];
  initialCursor: ShareGuestCursor | null;
  fetchPage: (input: {
    query: string;
    cursor: ShareGuestCursor | null;
  }) => Promise<FeedResult<Row>>;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialCursor !== null);
  const cursorRef = useRef<ShareGuestCursor | null>(initialCursor);
  // The query whose rows are currently COMMITTED to `rows` — appends must
  // continue this list, never the in-flight search text, or two different
  // result sets would interleave.
  const activeQueryRef = useRef("");
  // Monotonic request id — a stale response (superseded search or page load)
  // must never clobber newer rows.
  const reqRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const runFetch = useCallback(
    async (q: string, cursor: ShareGuestCursor | null, append: boolean) => {
      const id = ++reqRef.current;
      setLoading(true);
      let res: FeedResult<Row>;
      try {
        res = await fetchPage({ query: q, cursor });
      } catch {
        // Transport failure (offline, redeploy skew) — recover the UI and
        // stop the observer from hammering a broken connection; a new search
        // re-arms the feed.
        if (id === reqRef.current) {
          setLoading(false);
          setHasMore(false);
        }
        return;
      }
      if (id !== reqRef.current) return;
      setLoading(false);
      if (!res.ok) {
        if (res.dead) {
          // Dead session (expired/kicked/revoked) — the server redirects to
          // /kirim/login with the right explanation on refresh.
          router.refresh();
        } else {
          setHasMore(false);
        }
        return;
      }
      activeQueryRef.current = q;
      cursorRef.current = res.nextCursor;
      setHasMore(res.nextCursor !== null);
      setRows((prev) => {
        if (!append) return res.rows;
        const seen = new Set(prev.map((r) => r.id));
        return [...prev, ...res.rows.filter((r) => !seen.has(r.id))];
      });
    },
    [fetchPage, router],
  );

  // Debounced server search. The mount run is skipped — page 1 already
  // arrived with the RSC payload.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const t = window.setTimeout(() => {
      void runFetch(query.trim(), null, false);
    }, 300);
    return () => window.clearTimeout(t);
  }, [query, runFetch]);

  // Load the next page shortly before the sentinel scrolls into view. `query`
  // is deliberately NOT a dependency: appends read activeQueryRef so typing
  // never tears the observer down or appends across two different queries.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          void runFetch(activeQueryRef.current, cursorRef.current, true);
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, runFetch]);

  return { rows, query, setQuery, sentinelRef, loading, hasMore };
}

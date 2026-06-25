"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { MobileShell } from "@/components/templates/mobile-shell";
import {
  MobileCard,
  MobileChip,
  MobileChipRow,
  MobileEm,
} from "@/components/molecules/mobile-primitives";
import { Avatar, initials } from "@/components/atoms/avatar";
import { WishModerationActionsMobile } from "@/components/molecules/wish-moderation";
import { relativeTimeId } from "@/lib/datetime";
import { countByStatus, filterWishes, type WishFilter } from "@/lib/wishes";
import type { DashboardChrome, WishesData } from "@/server/queries/dashboard";

type WishRow = WishesData["wishes"][number];
type AvatarTone = "burgundy" | "peach" | "blush";

const AVATAR_TONES = ["burgundy", "peach", "blush"] as const;

// Filter tabs. Hidden wishes have no restore action on mobile yet, so the
// "Disembunyikan" bucket is intentionally omitted here (the desktop board still
// exposes it). Rejecting a wish simply removes it from these views.
const FILTER_TABS: { key: WishFilter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "approved", label: "Disetujui" },
];

// How many wishes to reveal per infinite-scroll step.
const STEP = 8;

type WishesMobileProps = {
  data: WishesData;
  // `chrome` is part of the page's data contract (mirrors the desktop call) but
  // the mobile shell has no chrome region, so it is intentionally not consumed.
  chrome: DashboardChrome | null;
};

// Mobile screen 05 · Buku Ucapan (wishes moderation) — functional filters +
// infinite scroll over the full list the server returned.
export function WishesMobile({ data }: WishesMobileProps) {
  const rows = data.wishes;
  const counts = data.counts;

  const [filter, setFilter] = useState<WishFilter>("all");
  const [visible, setVisible] = useState(STEP);

  const statusCounts = useMemo(() => countByStatus(rows), [rows]);
  const filtered = useMemo(() => filterWishes(rows, filter), [rows, filter]);

  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > shown.length;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  function changeFilter(next: WishFilter) {
    setFilter(next);
    setVisible(STEP);
  }

  // Infinite scroll: extend the window when the bottom sentinel nears the end of
  // the list. Root on MobileShell's actual scroll container (its <main>) — not
  // the viewport — so the bottom rootMargin pre-loads the next batch before it's
  // reached (a viewport root never sees past <main>'s clip + bottom nav).
  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible((v) => v + STEP);
        }
      },
      { root: sentinel.closest("main"), rootMargin: "0px 0px 300px 0px" },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasMore]);

  return (
    <MobileShell
      active="ucapan"
      eyebrow="Buku Ucapan"
      title={
        <>
          Ucapan <MobileEm>tamu.</MobileEm>
        </>
      }
    >
      <MobileChipRow>
        {FILTER_TABS.map((t) => {
          const active = t.key === filter;
          const badge = t.key === "pending" ? statusCounts.pending : 0;
          return (
            <MobileChip key={t.key} active={active} onClick={() => changeFilter(t.key)}>
              {t.label}
              {t.key === "pending" && badge > 0 && (
                <span
                  className={
                    "ml-[2px] text-white text-[9px] px-[6px] py-px rounded-full " +
                    (active ? "bg-[rgba(255,255,255,0.25)]" : "bg-terracotta")
                  }
                >
                  {badge}
                </span>
              )}
            </MobileChip>
          );
        })}
      </MobileChipRow>
      <div className="text-xs text-muted-ink px-[2px]">
        {counts.total} ucapan masuk · {counts.pending} menunggu moderasi
      </div>

      {filtered.length === 0 ? (
        <MobileCard>
          <div className="text-[13.5px] text-muted-ink text-center py-2">
            {rows.length === 0 ? "Belum ada ucapan." : "Tidak ada ucapan di filter ini."}
          </div>
        </MobileCard>
      ) : (
        <>
          {shown.map((wish: WishRow, i) => {
            const av: AvatarTone = AVATAR_TONES[i % AVATAR_TONES.length];
            return (
              <MobileCard key={wish.id}>
                <div className="flex gap-3">
                  <Avatar tone={av} size={38}>
                    {initials(wish.fromName)}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <span className="font-display italic text-base">{wish.fromName}</span>
                      <span className="text-[10px] text-faint [font-variant:small-caps] tracking-[0.08em]">
                        {relativeTimeId(wish.createdAt)}
                      </span>
                    </div>
                    <div className="mt-[3px]">
                      {wish.attending ? (
                        <span className="text-[9.5px] text-[#1c5a36] tracking-[0.14em] uppercase font-bold">
                          ✓ Hadir
                        </span>
                      ) : (
                        <span className="text-[9.5px] text-muted-ink tracking-[0.14em] uppercase font-bold">
                          Tidak hadir
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-[13.5px] leading-[1.55] text-charcoal mt-3">
                  &quot;{wish.body}&quot;
                </div>
                <div className="flex gap-2 mt-[14px]">
                  {wish.status === "pending" ? (
                    <WishModerationActionsMobile wishId={wish.id} />
                  ) : (
                    <a
                      href="#"
                      className="inline-flex items-center justify-center gap-2 h-[38px] px-[18px] rounded-full text-xs font-semibold tracking-[0.04em] bg-transparent text-charcoal border border-charcoal/20 no-underline"
                    >
                      Balas ucapan
                    </a>
                  )}
                </div>
              </MobileCard>
            );
          })}
          {hasMore && (
            <div
              ref={sentinelRef}
              className="py-3 text-center text-[11px] tracking-[0.08em] text-muted-ink"
            >
              Memuat ucapan lainnya…
            </div>
          )}
        </>
      )}
    </MobileShell>
  );
}

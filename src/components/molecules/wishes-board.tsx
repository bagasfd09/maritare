"use client";

// Client-side filter + search + numbered pagination for the dashboard Buku
// Ucapan list. The server passes every wish; this owns the active filter
// (Semua / Menunggu / Disetujui / Disembunyikan), the search query, and the
// current page, rendering the matching WishCards one page at a time.

import { useMemo, useState } from "react";

import { Button } from "@/components/atoms/button";
import { CircleButton } from "@/components/atoms/circle-button";
import { Icon } from "@/components/atoms/icon";
import { WishCard } from "@/components/molecules/wish-card";
import { relativeTimeId } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import { countByStatus, filterWishes, type WishFilter } from "@/lib/wishes";
import type { WishesData } from "@/server/queries/dashboard";

type WishRow = WishesData["wishes"][number];

const AVATAR_TONES = ["burgundy", "peach", "sage", "blush", "dark"] as const;
// Wishes per page.
const PAGE_SIZE = 8;

// Compact page-number list: all pages up to 7, otherwise 1 … current±1 … last.
// ponytail: simple window, good enough for any wish volume a wedding will hit.
function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("…");
  for (let n = start; n <= end; n += 1) out.push(n);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

export function WishesBoard({ wishes }: { wishes: WishRow[] }) {
  const [filter, setFilter] = useState<WishFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const counts = useMemo(() => countByStatus(wishes), [wishes]);
  const filtered = useMemo(
    () => filterWishes(wishes, filter, query),
    [wishes, filter, query],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp instead of resetting state so stale page values can never overflow
  // (e.g. after moderating the last wish on the final page).
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = (safePage - 1) * PAGE_SIZE + pageRows.length;

  function changeFilter(next: WishFilter) {
    setFilter(next);
    setPage(1);
  }

  const tabs: { key: WishFilter; label: string; n: number; accent?: boolean }[] = [
    { key: "all", label: "Semua", n: counts.all },
    { key: "pending", label: "Menunggu", n: counts.pending, accent: true },
    { key: "approved", label: "Disetujui", n: counts.approved },
    { key: "hidden", label: "Disembunyikan", n: counts.hidden },
  ];

  return (
    <div className="flex min-h-0 flex-col overflow-hidden">
      {/* Filter tabs + search */}
      <div className="mb-5 flex shrink-0 items-center gap-3">
        <div className="flex gap-1 rounded-full border border-line bg-paper p-[3px]">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => changeFilter(t.key)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-full px-[14px] py-[7px] text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
                filter === t.key ? "bg-charcoal text-cream" : "bg-transparent text-muted-ink",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-[7px] py-px text-[10px] font-bold tracking-normal",
                  filter === t.key
                    ? "bg-[rgba(245,239,230,0.18)] text-cream"
                    : t.accent && t.n > 0
                      ? "bg-terracotta text-white"
                      : "border border-line bg-cream text-muted-ink",
                )}
              >
                {t.n}
              </span>
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 rounded-full border border-line bg-paper px-[14px] py-[6px]">
          <Icon name="search" size={13} stroke="var(--color-muted-ink)" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama atau kata kunci…"
            className="w-[180px] border-none bg-transparent text-[12px] outline-none"
          />
        </div>
      </div>

      {/* Pending banner — clicking jumps to the Menunggu filter. */}
      {counts.pending > 0 && filter !== "pending" && (
        <div className="mb-4 flex shrink-0 items-center gap-[14px] rounded-[14px] bg-peach px-5 py-[14px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(124,45,45,0.15)] text-burgundy-dark">
            <Icon name="bell" size={14} />
          </div>
          <div className="flex-1">
            <div className="font-display text-[17px] italic text-burgundy-dark">
              {counts.pending} ucapan baru menunggu disetujui
            </div>
            <div className="mt-[2px] text-[12px] text-[#5a2a18]">
              Ucapan otomatis disembunyikan sampai kamu setujui.
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => changeFilter("pending")}>
            Tinjau semua →
          </Button>
        </div>
      )}

      {/* Paged list */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-10 text-center text-[14px] text-muted-ink">
            {wishes.length === 0 ? "Belum ada ucapan." : "Tidak ada ucapan di filter ini."}
          </div>
        ) : (
          pageRows.map((w, i) => (
            <WishCard
              key={w.id}
              wish={{
                id: w.id,
                from: w.fromName,
                text: w.body,
                time: relativeTimeId(w.createdAt),
                attending: w.attending,
                status: w.status === "pending" ? "pending" : "approved",
                pinned: w.pinned,
                groupName: w.groupName,
                badgeUrl: w.badgeUrl,
              }}
              tone={AVATAR_TONES[i % 5]}
            />
          ))
        )}
      </div>

      {/* Pagination footer — mirrors the Tamu screen's idiom. Hidden when the
          filtered list fits on a single page. */}
      {filtered.length > 0 && totalPages > 1 && (
        <div className="mt-4 flex shrink-0 items-center justify-between gap-3">
          <div className="text-[11px] text-muted-ink tracking-[0.16em] uppercase font-semibold">
            Menampilkan {rangeStart}–{rangeEnd} dari {filtered.length} · halaman {safePage} / {totalPages}
          </div>
          <div className="flex gap-[6px]">
            <CircleButton
              size={30}
              onClick={() => setPage(Math.max(1, safePage - 1))}
              disabled={safePage <= 1}
              aria-label="Halaman sebelumnya"
              className="disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span aria-hidden="true">‹</span>
            </CircleButton>
            {pageNumbers(safePage, totalPages).map((n, i) =>
              n === "…" ? (
                <span
                  key={`gap-${i}`}
                  className="min-w-[30px] h-[30px] inline-flex items-center justify-center text-[12px] text-faint"
                >
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-label={`Halaman ${n}`}
                  aria-current={n === safePage ? "page" : undefined}
                  className={cn(
                    "min-w-[30px] h-[30px] rounded-full border border-[rgba(26,26,26,0.18)]",
                    "text-[12px] font-display font-bold cursor-pointer transition-colors",
                    n === safePage ? "bg-charcoal text-cream" : "bg-transparent text-charcoal",
                  )}
                >
                  {n}
                </button>
              ),
            )}
            <CircleButton
              size={30}
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage >= totalPages}
              aria-label="Halaman berikutnya"
              className="disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span aria-hidden="true">›</span>
            </CircleButton>
          </div>
        </div>
      )}
    </div>
  );
}

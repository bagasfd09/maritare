"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/templates/admin-shell";
import { AdminTopBar } from "@/components/organisms/admin-topbar";
import { AdminStatus, PkgBadge } from "@/components/molecules/admin-badges";
import { Button } from "@/components/atoms/button";
import { CircleButton } from "@/components/atoms/circle-button";
import { Icon } from "@/components/atoms/icon";
import { Avatar } from "@/components/atoms/avatar";
import { rupiah, rupiahShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  adminDeleteWedding,
  adminSetWeddingStatus,
} from "@/server/actions/admin-wedding";
import type { AdminWeddingRow } from "@/server/queries/admin";

type WeddingStatus = AdminWeddingRow["status"];

type StatTone = "default" | "sage" | "peach" | "warn" | "muted";

// Each card doubles as a status-filter shortcut; "" (Total) clears the filter.
type Stat = { l: string; tone: StatTone; status: WeddingStatus | "" };

// Stat strip — tones port the source's inline background switch 1:1. Counts are
// derived from the real `weddings` array at render time (see `statCounts`).
const STATS: Stat[] = [
  { l: "Total", tone: "default", status: "" },
  { l: "Live", tone: "sage", status: "live" },
  { l: "Draft", tone: "peach", status: "draft" },
  { l: "Menunggu bayar", tone: "warn", status: "pending" },
  { l: "Expired", tone: "muted", status: "expired" },
];

const STAT_SURFACE: Record<StatTone, string> = {
  default: "bg-paper border border-line",
  sage: "bg-sage-soft",
  peach: "bg-peach",
  warn: "bg-[rgba(182,107,77,0.16)]",
  muted: "bg-cream",
};

const AVATAR_TONES = ["peach", "sage", "blush", "burgundy", "dark"] as const;

const SELECT =
  "px-[14px] py-[7px] rounded-full border border-line bg-paper font-body text-[11px] font-semibold text-charcoal tracking-[0.06em]";

const TH =
  "font-body text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-ink text-left px-[14px] py-3 border-b border-beige";
const TD = "p-[14px] border-b border-line align-middle";

const MENU_ITEM =
  "w-full flex items-center gap-2 px-3 py-[7px] text-left text-[11px] font-semibold text-charcoal hover:bg-cream cursor-pointer";

const PAGE_SIZE = 12;

type SortKey = "newest" | "oldest" | "az" | "za" | "paid_desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Diurut · Terbaru" },
  { value: "oldest", label: "Diurut · Terlama" },
  { value: "az", label: "Diurut · A–Z" },
  { value: "za", label: "Diurut · Z–A" },
  { value: "paid_desc", label: "Diurut · Bayar tertinggi" },
];

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// Mock dates use English month abbreviations; accept Indonesian ones too.
const MONTH_BY_ABBREV: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Mei: 4, Jun: 5, Jul: 6,
  Aug: 7, Agu: 7, Sep: 8, Oct: 9, Okt: 9, Nov: 10, Des: 11, Dec: 11,
};

// Parses "14 Jun 2026" → timestamp + month index; null for "—" / malformed.
function parseAkad(date: string): { time: number; month: number } | null {
  const [d, m, y] = date.split(" ");
  const month: number | undefined = m ? MONTH_BY_ABBREV[m] : undefined;
  const day = Number(d);
  const year = Number(y);
  if (month === undefined || Number.isNaN(day) || Number.isNaN(year)) return null;
  return { time: new Date(year, month, day).getTime(), month };
}

function csvEscape(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(rows: AdminWeddingRow[], filename: string) {
  const header = ["id", "couple", "slug", "pkg", "status", "date", "paid", "customer", "city", "template"];
  const lines = [
    header.join(","),
    ...rows.map((w) =>
      [w.id, w.couple, w.slug, w.pkg, w.status, w.date, w.paid, w.customer, w.city, w.template]
        .map(csvEscape)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// "Andi & Putri" -> "AP" (first letter of each partner).
function coupleInitials(couple: string) {
  return couple
    .split(" & ")
    .map((p) => p[0])
    .join("");
}

// Detail-modal rows, derived from the AdminWeddingRow already in props (no new query).
const DETAIL_FIELDS: { label: string; value: (w: AdminWeddingRow) => React.ReactNode }[] = [
  { label: "Pasangan", value: (w) => w.couple },
  { label: "Pemilik", value: (w) => w.customer },
  { label: "Kota", value: (w) => w.city },
  { label: "Paket", value: (w) => <PkgBadge pkg={w.pkg} /> },
  { label: "Status", value: (w) => <AdminStatus status={w.status} /> },
  { label: "Tanggal acara", value: (w) => w.date },
  { label: "Pembayaran", value: (w) => (w.paid ? rupiah(w.paid) : "—") },
  { label: "Template", value: (w) => w.template },
  { label: "Slug", value: (w) => `/inv/${w.slug}` },
];

// Admin screen 02 · Undangan — master table of all weddings.
// `initialQuery` seeds the search box (used by the User table's "Lihat undangan"
// action, which links here with the owner email pre-filled).
export function AdminWeddings({
  weddings,
  initialQuery = "",
}: {
  weddings: AdminWeddingRow[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [pkgFilter, setPkgFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<WeddingStatus | "">("");
  const [cityFilter, setCityFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [templateFilter, setTemplateFilter] = useState("");
  const [monthFrom, setMonthFrom] = useState("");
  const [monthTo, setMonthTo] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [detailWedding, setDetailWedding] = useState<AdminWeddingRow | null>(null);
  // Row id awaiting delete confirmation (inline, not window.confirm).
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const runAction = (
    action: () => Promise<{ ok: true } | { ok: false; error: string }>,
  ) => {
    setActionError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setActionError(result.error);
        return;
      }
      setOpenMenuId(null);
      setConfirmDeleteId(null);
      router.refresh();
    });
  };

  const deactivateWedding = (w: AdminWeddingRow) =>
    runAction(() => adminSetWeddingStatus({ id: w.id, status: "draft" }));

  const deleteWedding = (w: AdminWeddingRow) =>
    runAction(() => adminDeleteWedding({ id: w.id }));

  // Escape dismisses the detail modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetailWedding(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Filter-option lists + stat counts derived from the real data so the
  // dropdowns and stat strip never drift from what's actually in the table.
  const cities = useMemo(
    () => Array.from(new Set(weddings.map((w) => w.city))).sort((a, b) => a.localeCompare(b)),
    [weddings],
  );
  const templateNames = useMemo(
    () => Array.from(new Set(weddings.map((w) => w.template))).sort((a, b) => a.localeCompare(b)),
    [weddings],
  );
  const statCounts = useMemo(() => {
    const counts: Record<WeddingStatus, number> = { live: 0, draft: 0, pending: 0, expired: 0 };
    for (const w of weddings) counts[w.status] += 1;
    return counts;
  }, [weddings]);
  const liveCount = statCounts.live;
  const draftCount = statCounts.draft;
  const pendingCount = statCounts.pending;
  const expiredCount = statCounts.expired;

  // Count for each stat card (Total = all rows; the rest by status).
  const statValue = (status: WeddingStatus | ""): number =>
    status === "" ? weddings.length : statCounts[status];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = weddings.filter((w) => {
      if (pkgFilter && w.pkg !== pkgFilter) return false;
      if (statusFilter && w.status !== statusFilter) return false;
      if (cityFilter && w.city !== cityFilter) return false;
      if (templateFilter && w.template !== templateFilter) return false;
      if (monthFrom !== "" || monthTo !== "") {
        const akad = parseAkad(w.date);
        if (!akad) return false;
        if (monthFrom !== "" && akad.month < Number(monthFrom)) return false;
        if (monthTo !== "" && akad.month > Number(monthTo)) return false;
      }
      if (q) {
        const hay = `${w.couple} ${w.slug} ${w.customer}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    switch (sortKey) {
      case "oldest":
        rows.sort(
          (a, b) =>
            (parseAkad(a.date)?.time ?? Number.MAX_SAFE_INTEGER) -
            (parseAkad(b.date)?.time ?? Number.MAX_SAFE_INTEGER),
        );
        break;
      case "az":
        rows.sort((a, b) => a.couple.localeCompare(b.couple));
        break;
      case "za":
        rows.sort((a, b) => b.couple.localeCompare(a.couple));
        break;
      case "paid_desc":
        rows.sort((a, b) => b.paid - a.paid);
        break;
      case "newest":
        // Rows arrive newest-first from the query (ordered by createdAt desc),
        // so the default sort intentionally keeps the source order.
        break;
    }
    return rows;
  }, [weddings, query, pkgFilter, statusFilter, cityFilter, templateFilter, monthFrom, monthTo, sortKey]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const effectivePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((effectivePage - 1) * PAGE_SIZE, effectivePage * PAGE_SIZE);
  const rangeStart = total === 0 ? 0 : (effectivePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(effectivePage * PAGE_SIZE, total);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const pageIds = pageRows.map((w) => w.id);
  const allPageSelected = pageRows.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSelected = pageIds.some((id) => selectedIds.has(id));

  const goToPage = (n: number) => setPage(Math.min(Math.max(1, n), totalPages));

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const resetFilters = () => {
    setQuery("");
    setPkgFilter("");
    setStatusFilter("");
    setCityFilter("");
    setTemplateFilter("");
    setMonthFrom("");
    setMonthTo("");
    setSortKey("newest");
    setPage(1);
  };

  const copyLink = (w: AdminWeddingRow) => {
    navigator.clipboard.writeText(`https://maritare.id/${w.slug}`).catch(() => {
      // Clipboard unavailable (e.g. insecure context) — fail silently.
    });
    setCopiedId(w.id);
    window.setTimeout(() => {
      setCopiedId(null);
      setOpenMenuId(null);
    }, 900);
  };

  return (
    <AdminShell active="weddings">
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Click-away layer for the per-row "Lainnya" menu. */}
        {openMenuId !== null && (
          <div
            className="fixed inset-0 z-20"
            onClick={() => {
              setOpenMenuId(null);
              setConfirmDeleteId(null);
            }}
          />
        )}
        <AdminTopBar
          crumbs={["Admin", "Undangan"]}
          title={`${weddings.length} undangan dalam sistem`}
          eyebrow={`${liveCount} live · ${draftCount} draft · ${expiredCount} expired · ${pendingCount} menunggu pembayaran`}
          actions={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced((v) => !v)}
                className={cn(showAdvanced && "border-charcoal")}
              >
                <Icon name="filter" size={12} />Filter lanjut
              </Button>
              <Button variant="ghost" size="sm" onClick={() => downloadCsv(filtered, "maritare-weddings.csv")}>
                <Icon name="download" size={12} />Export CSV
              </Button>
              {/* Manual wedding creation isn't built yet — honestly disabled. */}
              <Button
                size="sm"
                disabled
                title="Segera hadir"
                className="bg-forest-deep text-cream hover:bg-forest-deep opacity-50 cursor-not-allowed"
              >
                <Icon name="plus" size={12} />Buat manual
              </Button>
            </>
          }
        />

        <div className="flex-1 px-9 py-[22px] overflow-y-auto flex flex-col">
          {/* Stat strip — each card is a status-filter shortcut */}
          <div className="grid grid-cols-5 gap-[10px] mb-4">
            {STATS.map((s) => {
              const active = s.status !== "" && statusFilter === s.status;
              return (
                <button
                  key={s.l}
                  type="button"
                  onClick={() => {
                    setStatusFilter(active ? "" : s.status);
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-xl px-4 py-[14px] flex items-center gap-3 text-left cursor-pointer",
                    STAT_SURFACE[s.tone],
                    active && "ring-2 ring-burgundy/60",
                  )}
                >
                  <div>
                    <div className="text-[10px] text-muted-ink tracking-[0.18em] uppercase font-semibold">{s.l}</div>
                    <div className="font-display font-extrabold text-[28px] leading-none tracking-[-0.02em] text-charcoal mt-1">
                      {statValue(s.status)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-[10px] mb-[14px]">
            <div className="flex items-center gap-2 bg-paper border border-line rounded-full px-[14px] py-[7px] flex-1 max-w-[340px]">
              <Icon name="search" size={13} stroke="var(--color-muted-ink)" />
              <input
                placeholder="Cari pasangan, slug, atau email…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="flex-1 border-none bg-transparent outline-none text-[12px]"
              />
            </div>
            <select
              className={SELECT}
              value={pkgFilter}
              onChange={(e) => {
                setPkgFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua paket</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>
            <select
              className={SELECT}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as WeddingStatus | "");
                setPage(1);
              }}
            >
              <option value="">Semua status</option>
              <option value="live">Live</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
            <select
              className={SELECT}
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua kota</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="flex-1" />
            <select
              value={sortKey}
              onChange={(e) => {
                setSortKey(e.target.value as SortKey);
                setPage(1);
              }}
              className="text-[11px] text-muted-ink tracking-[0.18em] [font-variant:small-caps] appearance-none bg-transparent border-none outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Advanced filter panel — toggled by "Filter lanjut" */}
          {showAdvanced && (
            <div className="flex items-center gap-[10px] mb-[14px] bg-paper border border-line rounded-[14px] px-4 py-3">
              <span className="text-[10px] text-muted-ink tracking-[0.18em] uppercase font-semibold">Filter lanjut</span>
              <select
                className={SELECT}
                value={templateFilter}
                onChange={(e) => {
                  setTemplateFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Semua template</option>
                {templateNames.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select
                className={SELECT}
                value={monthFrom}
                onChange={(e) => {
                  setMonthFrom(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Akad dari bulan</option>
                {MONTH_LABELS.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
              <select
                className={SELECT}
                value={monthTo}
                onChange={(e) => {
                  setMonthTo(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Sampai bulan</option>
                {MONTH_LABELS.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
              <div className="flex-1" />
              <Button variant="ghost" size="sm" onClick={resetFilters}>Reset filter</Button>
            </div>
          )}

          {/* Bulk-action bar — appears when rows are selected */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-4 mb-[14px] bg-forest-deep text-cream rounded-full px-[18px] py-[9px]">
              <span className="text-[11px] font-semibold tracking-[0.12em]">
                {selectedIds.size} undangan dipilih
              </span>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    weddings.filter((w) => selectedIds.has(w.id)),
                    "maritare-weddings-terpilih.csv",
                  )
                }
                className="text-[10px] font-bold tracking-[0.14em] uppercase cursor-pointer hover:opacity-80"
              >
                Export terpilih
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-[10px] font-bold tracking-[0.14em] uppercase cursor-pointer hover:opacity-80"
              >
                Hapus pilihan
              </button>
            </div>
          )}

          {/* Table — card fills the remaining height; rows scroll INSIDE it
              (sticky header) so the pagination footer is always visible. */}
          <div className="flex-1 min-h-[280px] bg-paper border border-line rounded-[14px] overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <table className="w-full border-separate border-spacing-0 text-[13px] [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:hover_td]:bg-[rgba(124,45,45,0.03)] [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:bg-cream [&_thead_th]:z-10">
                <thead>
                  <tr>
                    <th className={cn(TH, "w-10 pl-[22px]")}>
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = !allPageSelected && somePageSelected;
                        }}
                        onChange={toggleAllVisible}
                      />
                    </th>
                    <th className={TH}>Pasangan</th>
                    <th className={TH}>Pemilik (email)</th>
                    <th className={TH}>Paket</th>
                    <th className={TH}>Template</th>
                    <th className={TH}>Status</th>
                    <th className={TH}>Akad</th>
                    <th className={cn(TH, "text-right")}>Bayar</th>
                    <th className={cn(TH, "w-[60px]")} />
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-[22px] py-10 text-center text-[12px] text-muted-ink font-display italic">
                        {weddings.length === 0
                          ? "Belum ada undangan."
                          : "Tidak ada undangan yang cocok dengan filter ini."}
                      </td>
                    </tr>
                  )}
                  {pageRows.map((w, i) => (
                    <tr key={w.id}>
                      <td className={cn(TD, "pl-[22px]")}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(w.id)}
                          onChange={() => toggleRow(w.id)}
                        />
                      </td>
                      <td className={TD}>
                        <div className="flex items-center gap-3">
                          <Avatar tone={AVATAR_TONES[i % 5]} size={30} className="text-[11px]">
                            {coupleInitials(w.couple)}
                          </Avatar>
                          <div>
                            <div className="font-semibold text-[13px] text-charcoal">{w.couple}</div>
                            <div className="text-[10px] text-muted-ink tracking-[0.06em] mt-[2px] font-body">
                              maritare.id/<span className="text-burgundy font-semibold">{w.slug}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={TD}>
                        <div className="text-[12px]">{w.customer}</div>
                        <div className="text-[10px] text-muted-ink mt-[2px]">{w.city}</div>
                      </td>
                      <td className={TD}><PkgBadge pkg={w.pkg} /></td>
                      <td className={TD}>
                        <span className="text-[11px] px-2 py-[3px] rounded bg-cream border border-line font-medium">
                          {w.template}
                        </span>
                      </td>
                      <td className={TD}><AdminStatus status={w.status} /></td>
                      <td className={cn(TD, "text-[12px] text-charcoal font-display italic")}>{w.date}</td>
                      <td className={cn(TD, "text-right font-display font-bold text-[13px] tracking-[-0.01em]")}>
                        {w.paid ? rupiahShort(w.paid) : <span className="text-faint italic font-normal">—</span>}
                      </td>
                      <td className={TD}>
                        <div className="flex gap-[3px] relative">
                          <CircleButton
                            size={26}
                            title="Lihat detail"
                            onClick={() => setDetailWedding(w)}
                          >
                            <Icon name="eye" size={11} />
                          </CircleButton>
                          <CircleButton
                            size={26}
                            title="Lainnya"
                            onClick={() => {
                              setOpenMenuId(openMenuId === w.id ? null : w.id);
                              setConfirmDeleteId(null);
                            }}
                          >
                            <Icon name="more" size={11} />
                          </CircleButton>
                          {openMenuId === w.id && (
                            <div
                              className={cn(
                                "absolute right-0 z-30 min-w-[160px] bg-paper border border-line rounded-[10px] shadow-lg py-1",
                                // Flip upward near the bottom of long lists so the
                                // menu is not clipped by the card's overflow.
                                i >= pageRows.length - 2 && pageRows.length >= 5
                                  ? "bottom-[30px]"
                                  : "top-[30px]",
                              )}
                            >
                              <button
                                type="button"
                                className={MENU_ITEM}
                                onClick={() => {
                                  setDetailWedding(w);
                                  setOpenMenuId(null);
                                }}
                              >
                                <Icon name="eye" size={11} />Lihat detail
                              </button>
                              <button type="button" className={MENU_ITEM} onClick={() => copyLink(w)}>
                                <Icon name="copy" size={11} />{copiedId === w.id ? "Tersalin!" : "Salin link"}
                              </button>
                              <button
                                type="button"
                                className={cn(MENU_ITEM, isPending && "opacity-50 pointer-events-none")}
                                onClick={() => deactivateWedding(w)}
                              >
                                <Icon name="x" size={11} />Nonaktifkan
                              </button>
                              {confirmDeleteId === w.id ? (
                                <div className="px-3 py-2 border-t border-line">
                                  <div className="text-[10px] text-muted-ink mb-2">Hapus undangan ini?</div>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      disabled={isPending}
                                      className="flex-1 rounded-md bg-burgundy text-cream text-[10px] font-bold tracking-[0.06em] uppercase py-[5px] cursor-pointer disabled:opacity-50"
                                      onClick={() => deleteWedding(w)}
                                    >
                                      {isPending ? "Menghapus…" : "Ya, hapus"}
                                    </button>
                                    <button
                                      type="button"
                                      className="flex-1 rounded-md border border-line text-[10px] font-bold tracking-[0.06em] uppercase py-[5px] cursor-pointer"
                                      onClick={() => setConfirmDeleteId(null)}
                                    >
                                      Batal
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className={cn(MENU_ITEM, "text-burgundy hover:bg-[rgba(124,45,45,0.06)]")}
                                  onClick={() => setConfirmDeleteId(w.id)}
                                >
                                  <Icon name="x" size={11} />Hapus
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Footer — outside the scroller, pinned to the card bottom */}
            <div className="mt-auto px-[22px] py-3 border-t border-line bg-cream flex items-center justify-between shrink-0">
              <div className="text-[11px] text-muted-ink tracking-[0.12em]">
                {total === 0
                  ? "Menampilkan 0 dari 0"
                  : `Menampilkan ${rangeStart}–${rangeEnd} dari ${total} · halaman ${effectivePage} dari ${totalPages}`}
              </div>
              <div className="flex gap-[5px]">
                <CircleButton
                  size={28}
                  onClick={() => goToPage(effectivePage - 1)}
                  disabled={effectivePage === 1}
                  className={cn(effectivePage === 1 && "opacity-40 pointer-events-none")}
                >
                  ‹
                </CircleButton>
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => goToPage(n)}
                    className={cn(
                      "min-w-[28px] h-[28px] rounded-full border border-[rgba(26,26,26,0.18)]",
                      "text-[11px] font-display font-bold cursor-pointer",
                      n === effectivePage
                        ? "bg-forest-deep text-cream"
                        : "bg-transparent text-charcoal",
                    )}
                  >
                    {n}
                  </button>
                ))}
                <CircleButton
                  size={28}
                  onClick={() => goToPage(effectivePage + 1)}
                  disabled={effectivePage === totalPages}
                  className={cn(effectivePage === totalPages && "opacity-40 pointer-events-none")}
                >
                  ›
                </CircleButton>
              </div>
            </div>
          </div>
        </div>

        {/* Inline error toast for failed status / delete actions */}
        {actionError && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 bg-burgundy text-cream rounded-full px-[18px] py-[10px] shadow-lg">
            <span className="text-[11px] font-semibold tracking-[0.04em]">{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-[10px] font-bold tracking-[0.14em] uppercase cursor-pointer hover:opacity-80"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Wedding detail modal — fields from the AdminWeddingRow already in props. */}
        {detailWedding && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40"
            onClick={() => setDetailWedding(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Detail undangan ${detailWedding.couple}`}
              onClick={(e) => e.stopPropagation()}
              className="w-[400px] max-w-[90vw] bg-paper border border-line rounded-[14px] overflow-hidden shadow-[0_24px_60px_rgba(27,31,24,0.25)]"
            >
              <div className="px-5 py-[14px] border-b border-line bg-cream flex items-center justify-between">
                <div className="font-display italic font-semibold text-base text-charcoal">
                  Detail undangan
                </div>
                <CircleButton size={28} aria-label="Tutup detail" onClick={() => setDetailWedding(null)}>
                  <Icon name="x" size={12} />
                </CircleButton>
              </div>
              <div className="px-5 py-4 flex flex-col gap-[10px]">
                {DETAIL_FIELDS.map((f) => (
                  <div key={f.label} className="flex items-center justify-between gap-4">
                    <span className="text-[10px] text-muted-ink tracking-[0.18em] uppercase font-semibold shrink-0">
                      {f.label}
                    </span>
                    <span className="text-xs font-semibold text-charcoal text-right min-w-0 break-words">
                      {f.value(detailWedding)}
                    </span>
                  </div>
                ))}
                <a
                  href={`/inv/${detailWedding.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-forest-deep text-cream text-[11px] font-bold tracking-[0.1em] uppercase py-[9px] no-underline hover:opacity-90"
                >
                  <Icon name="external" size={12} />Lihat undangan
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </AdminShell>
  );
}

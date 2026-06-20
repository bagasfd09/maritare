"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/atoms/avatar";
import { Icon } from "@/components/atoms/icon";
import { AdminStatus, PkgBadge } from "@/components/molecules/admin-badges";
import {
  AdminMobileCard,
  AdminMobileChip,
  AdminMobileHead,
  AdminMobileHScroll,
  AdminMobileIconMini,
} from "@/components/molecules/admin-mobile-primitives";
import { AdminMobileShell } from "@/components/templates/admin-mobile-shell";
import { rupiah, rupiahShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  adminDeleteWedding,
  adminSetWeddingStatus,
} from "@/server/actions/admin-wedding";
import type { AdminWeddingRow } from "@/server/queries/admin";

type WeddingStatus = AdminWeddingRow["status"];

// Design avatar tone cycle (AV in mobile-admin-screens.jsx).
const AV = ["peach", "sage", "blush", "burgundy", "dark"] as const;

type StatTone = "paper" | "sage" | "peach" | "warn" | "cream";

// Single filter value shared by the filter chips and the stat shortcut row.
type FilterValue = "all" | "Silver" | "Gold" | "Platinum" | "live" | "draft" | "pending" | "expired";

const PKG_FILTERS: ReadonlyArray<FilterValue> = ["Silver", "Gold", "Platinum"];

// Counts are derived from the real `weddings` array at render time (statCounts).
const STATS: { l: string; tone: StatTone; filter: FilterValue }[] = [
  { l: "Total", tone: "paper", filter: "all" },
  { l: "Live", tone: "sage", filter: "live" },
  { l: "Draft", tone: "peach", filter: "draft" },
  { l: "Tunggu bayar", tone: "warn", filter: "pending" },
  { l: "Expired", tone: "cream", filter: "expired" },
];

const STAT_TONE: Record<StatTone, string> = {
  paper: "bg-paper border border-line",
  sage: "bg-sage-soft",
  peach: "bg-peach",
  warn: "bg-[rgba(182,107,77,0.16)]",
  cream: "bg-cream",
};

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "Semua paket", value: "all" },
  { label: "Silver", value: "Silver" },
  { label: "Gold", value: "Gold" },
  { label: "Platinum", value: "Platinum" },
  { label: "Live", value: "live" },
  { label: "Draft", value: "draft" },
];

const PAGE_SIZE = 8;

// Local controlled clone of AdminMobileSearch (the shared molecule does not
// forward value/onChange; markup and classes are kept 1:1 with the original).
function ControlledSearch({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex items-center gap-[9px] bg-paper border border-line rounded-full px-[15px] py-[10px]">
      <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="var(--color-faint)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-5-5" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 border-none bg-transparent outline-none font-body text-[13px] text-charcoal placeholder:text-faint"
      />
    </div>
  );
}

// Minimal CSV field escaping (quotes fields containing comma/quote/newline).
function csvEscape(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Detail-sheet rows, derived from the AdminWeddingRow already in props.
const DETAIL_FIELDS: { label: string; value: (w: AdminWeddingRow) => React.ReactNode }[] = [
  { label: "Pasangan", value: (w) => w.couple },
  { label: "Customer", value: (w) => w.customer },
  { label: "Kota", value: (w) => w.city },
  { label: "Paket", value: (w) => <PkgBadge pkg={w.pkg} /> },
  { label: "Status", value: (w) => <AdminStatus status={w.status} /> },
  { label: "Tanggal acara", value: (w) => w.date },
  { label: "Pembayaran", value: (w) => (w.paid ? rupiah(w.paid) : "—") },
  { label: "Template", value: (w) => w.template },
  { label: "Slug", value: (w) => `/inv/${w.slug}` },
];

const SHEET_MENU_ITEM =
  "w-full flex items-center gap-3 px-[18px] py-[13px] text-left text-[13.5px] font-semibold text-charcoal border-b border-line last:border-b-0 cursor-pointer";

// Admin mobile · Undangan — ports `M_Weddings` from mobile-admin-screens.jsx.
export function AdminWeddingsMobile({ weddings }: { weddings: AdminWeddingRow[] }) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Card whose action menu (kebab) is open.
  const [menuWedding, setMenuWedding] = useState<AdminWeddingRow | null>(null);
  // Card whose full-detail sheet is open.
  const [detailWedding, setDetailWedding] = useState<AdminWeddingRow | null>(null);
  // Whether the open menu is showing the inline delete confirmation.
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Escape closes the menu and detail sheets.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuWedding(null);
        setDetailWedding(null);
        setConfirmDelete(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeMenu = () => {
    setMenuWedding(null);
    setConfirmDelete(false);
    setCopied(false);
  };

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
      closeMenu();
      router.refresh();
    });
  };

  const copyLink = (w: AdminWeddingRow) => {
    navigator.clipboard.writeText(`https://maritare.id/${w.slug}`).catch(() => {
      // Clipboard unavailable (e.g. insecure context) — fail silently.
    });
    setCopied(true);
    window.setTimeout(() => closeMenu(), 900);
  };

  const filteredWeddings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return weddings.filter((w) => {
      const matchesQuery =
        q === "" || [w.couple, w.slug, w.customer].some((f) => f.toLowerCase().includes(q));
      const matchesFilter =
        activeFilter === "all" ||
        (PKG_FILTERS.includes(activeFilter) ? w.pkg === activeFilter : w.status === activeFilter);
      return matchesQuery && matchesFilter;
    });
  }, [weddings, query, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredWeddings.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filteredWeddings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filteredWeddings.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filteredWeddings.length);

  // Header sub-line counts come from the full real dataset, not the filtered
  // view, so the totals stay stable as the user filters.
  const statCounts = useMemo(() => {
    const counts: Record<WeddingStatus, number> = { live: 0, draft: 0, pending: 0, expired: 0 };
    for (const w of weddings) counts[w.status] += 1;
    return counts;
  }, [weddings]);
  const liveCount = statCounts.live;
  const draftCount = statCounts.draft;
  const pendingCount = statCounts.pending;
  const expiredCount = statCounts.expired;

  // Count behind each stat chip (Total = all rows; the rest by status).
  const statValue = (filter: FilterValue): number => {
    if (filter === "all") return weddings.length;
    if (filter === "live") return liveCount;
    if (filter === "draft") return draftCount;
    if (filter === "pending") return pendingCount;
    if (filter === "expired") return expiredCount;
    return 0;
  };

  const applyFilter = (value: FilterValue) => {
    setActiveFilter(value);
    setPage(1);
  };

  const handleSearch = (next: string) => {
    setQuery(next);
    setPage(1);
  };

  const exportCsv = () => {
    const header = "ID,Couple,Slug,Package,Status,Date,Paid,City,Template";
    const rows = filteredWeddings.map((w) =>
      [w.id, w.couple, w.slug, w.pkg, w.status, w.date, w.paid, w.city, w.template]
        .map(csvEscape)
        .join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "maritare-admin-weddings.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminMobileShell active="weddings">
      <div className="relative">
        <AdminMobileHead
          eyebrow={`${weddings.length} undangan`}
          title="Semua undangan"
          sub={`${liveCount} live · ${draftCount} draft · ${expiredCount} expired`}
        />
        <AdminMobileIconMini
          onClick={exportCsv}
          aria-label="Ekspor CSV"
          title="Ekspor CSV"
          className="absolute right-[18px] top-[18px]"
        >
          <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <path d="M4 19h16" />
          </svg>
        </AdminMobileIconMini>
      </div>

      {/* stat chips — horizontal scroll, doubles as a status filter shortcut row */}
      <AdminMobileHScroll className="px-[18px] pt-[14px] pb-[2px]">
        {STATS.map((s) => (
          <button
            key={s.l}
            type="button"
            onClick={() => applyFilter(s.filter)}
            className={cn(
              "flex-none min-w-[96px] rounded-xl px-[14px] py-3 text-left cursor-pointer",
              STAT_TONE[s.tone],
              activeFilter === s.filter && s.filter !== "all" && "ring-2 ring-forest-deep",
            )}
          >
            <div className="text-[9px] text-muted-ink tracking-[0.16em] uppercase font-semibold">{s.l}</div>
            <div className="font-display font-extrabold text-[26px] leading-none tracking-[-0.02em] text-charcoal mt-1">
              {statValue(s.filter)}
            </div>
          </button>
        ))}
      </AdminMobileHScroll>

      {/* search */}
      <div className="px-[18px] pt-3">
        <ControlledSearch placeholder="Cari pasangan, slug, email…" value={query} onChange={handleSearch} />
      </div>

      {/* filter chips */}
      <AdminMobileHScroll className="px-[18px] pt-3">
        {FILTERS.map((f) => (
          <AdminMobileChip key={f.value} on={activeFilter === f.value} onClick={() => applyFilter(f.value)}>
            {f.label}
          </AdminMobileChip>
        ))}
      </AdminMobileHScroll>

      {/* list */}
      <div className="px-[18px] pt-4 flex flex-col gap-2">
        {pageRows.map((w, i) => (
          <AdminMobileCard
            key={w.id}
            className="p-[14px] cursor-pointer"
            onClick={() => setExpandedId((prev) => (prev === w.id ? null : w.id))}
          >
            <div className="flex items-center gap-3">
              <Avatar tone={AV[i % 5]} size={40}>
                {w.couple
                  .split(" & ")
                  .map((p) => p[0])
                  .join("")}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14.5px] text-charcoal">{w.couple}</div>
                <div className="text-[10.5px] text-muted-ink mt-[2px]">
                  maritare.id/<span className="text-burgundy font-semibold">{w.slug}</span>
                </div>
              </div>
              <AdminStatus status={w.status} />
              <AdminMobileIconMini
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(false);
                  setCopied(false);
                  setMenuWedding(w);
                }}
                aria-label={`Aksi untuk ${w.couple}`}
                title="Aksi"
                className="w-8 h-8"
              >
                <Icon name="more" size={14} />
              </AdminMobileIconMini>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-line">
              <PkgBadge pkg={w.pkg} />
              <span className="text-[10.5px] px-2 py-[3px] rounded bg-cream border border-line font-medium text-muted-ink">
                {w.template}
              </span>
              <div className="flex-1" />
              <span className="font-display italic text-[12px] text-muted-ink">{w.date}</span>
              <span className="font-display font-bold text-[14px]">
                {w.paid ? rupiahShort(w.paid) : <span className="text-faint">—</span>}
              </span>
            </div>
            {expandedId === w.id && (
              <div className="mt-3 pt-3 border-t border-line flex flex-col gap-[6px] text-[11.5px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-ink">Pelanggan</span>
                  <span className="font-semibold text-charcoal truncate">{w.customer}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-ink">Kota</span>
                  <span className="font-semibold text-charcoal">{w.city}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-ink">Undangan</span>
                  <a
                    href={`/inv/${w.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-burgundy"
                  >
                    maritare.id/{w.slug}
                  </a>
                </div>
              </div>
            )}
          </AdminMobileCard>
        ))}
        {pageRows.length === 0 && (
          <div className="text-center py-8 font-display italic text-[12.5px] text-muted-ink">
            {weddings.length === 0
              ? "Belum ada undangan."
              : "Tidak ada undangan yang cocok. Coba ubah kata kunci atau filternya, ya."}
          </div>
        )}
        <div className="flex items-center justify-center gap-3 pt-[10px]">
          <AdminMobileIconMini
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Halaman sebelumnya"
            className="w-7 h-7 disabled:opacity-40 disabled:cursor-default"
          >
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </AdminMobileIconMini>
          <div className="text-center text-[11px] text-muted-ink tracking-[0.1em]">
            {filteredWeddings.length === 0
              ? "Menampilkan 0 dari 0"
              : `Menampilkan ${rangeStart}–${rangeEnd} dari ${filteredWeddings.length}`}
          </div>
          <AdminMobileIconMini
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Halaman berikutnya"
            className="w-7 h-7 disabled:opacity-40 disabled:cursor-default"
          >
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </AdminMobileIconMini>
        </div>
      </div>

      {/* Per-card action menu — bottom sheet */}
      {menuWedding && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40" onClick={closeMenu}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Aksi undangan ${menuWedding.couple}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] bg-paper rounded-t-[20px] overflow-hidden shadow-[0_-12px_40px_rgba(27,31,24,0.25)]"
          >
            <div className="px-[18px] pt-4 pb-3 border-b border-line">
              <div className="font-display italic font-semibold text-[15px] text-charcoal">{menuWedding.couple}</div>
              <div className="text-[11px] text-muted-ink mt-[2px]">maritare.id/{menuWedding.slug}</div>
            </div>
            <button
              type="button"
              className={SHEET_MENU_ITEM}
              onClick={() => {
                const w = menuWedding;
                closeMenu();
                setDetailWedding(w);
              }}
            >
              <Icon name="eye" size={15} />Lihat detail
            </button>
            <button type="button" className={SHEET_MENU_ITEM} onClick={() => copyLink(menuWedding)}>
              <Icon name="copy" size={15} />{copied ? "Tersalin!" : "Salin link"}
            </button>
            <button
              type="button"
              className={cn(SHEET_MENU_ITEM, isPending && "opacity-50 pointer-events-none")}
              onClick={() => runAction(() => adminSetWeddingStatus({ id: menuWedding.id, status: "draft" }))}
            >
              <Icon name="x" size={15} />Nonaktifkan
            </button>
            {confirmDelete ? (
              <div className="px-[18px] py-3 border-b border-line">
                <div className="text-[12px] text-muted-ink mb-[10px]">Hapus undangan ini? Tindakan ini menyembunyikannya dari daftar.</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isPending}
                    className="flex-1 rounded-full bg-burgundy text-cream text-[11px] font-bold tracking-[0.08em] uppercase py-[10px] cursor-pointer disabled:opacity-50"
                    onClick={() => runAction(() => adminDeleteWedding({ id: menuWedding.id }))}
                  >
                    {isPending ? "Menghapus…" : "Ya, hapus"}
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-full border border-line text-[11px] font-bold tracking-[0.08em] uppercase py-[10px] cursor-pointer"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className={cn(SHEET_MENU_ITEM, "text-burgundy")}
                onClick={() => setConfirmDelete(true)}
              >
                <Icon name="x" size={15} />Hapus
              </button>
            )}
            <button
              type="button"
              className="w-full px-[18px] py-[14px] text-center text-[12px] font-bold tracking-[0.12em] uppercase text-muted-ink cursor-pointer"
              onClick={closeMenu}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Full-detail sheet — fields from the AdminWeddingRow already in props */}
      {detailWedding && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40" onClick={() => setDetailWedding(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Detail undangan ${detailWedding.couple}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] bg-paper rounded-t-[20px] overflow-hidden shadow-[0_-12px_40px_rgba(27,31,24,0.25)]"
          >
            <div className="px-[18px] py-[14px] border-b border-line bg-cream flex items-center justify-between">
              <div className="font-display italic font-semibold text-[15px] text-charcoal">Detail undangan</div>
              <AdminMobileIconMini onClick={() => setDetailWedding(null)} aria-label="Tutup detail" className="w-8 h-8">
                <Icon name="x" size={14} />
              </AdminMobileIconMini>
            </div>
            <div className="px-[18px] py-4 flex flex-col gap-[10px]">
              {DETAIL_FIELDS.map((f) => (
                <div key={f.label} className="flex items-center justify-between gap-4">
                  <span className="text-[10px] text-muted-ink tracking-[0.16em] uppercase font-semibold shrink-0">
                    {f.label}
                  </span>
                  <span className="text-[12.5px] font-semibold text-charcoal text-right min-w-0 break-words">
                    {f.value(detailWedding)}
                  </span>
                </div>
              ))}
              <a
                href={`/inv/${detailWedding.slug}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-forest-deep text-cream text-[11px] font-bold tracking-[0.1em] uppercase py-[11px] no-underline"
              >
                <Icon name="external" size={13} />Lihat undangan
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Inline error toast for failed status / delete actions */}
      {actionError && (
        <div className="fixed bottom-[84px] left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 bg-burgundy text-cream rounded-full px-[18px] py-[10px] shadow-lg">
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
    </AdminMobileShell>
  );
}

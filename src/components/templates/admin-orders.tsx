"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/templates/admin-shell";
import { AdminTopBar } from "@/components/organisms/admin-topbar";
import { AdminStatus } from "@/components/molecules/admin-badges";
import { Button } from "@/components/atoms/button";
import { CircleButton } from "@/components/atoms/circle-button";
import { Icon } from "@/components/atoms/icon";
import { adminSetOrderStatus } from "@/server/actions/order";
import type { AdminTransactionRow } from "@/server/queries/admin";
import { rupiahShort } from "@/lib/format";
import { cn } from "@/lib/utils";

// Statuses this screen can settle an order into (never back to "pending").
type SettleStatus = "paid" | "failed" | "refunded";

// Order/transaction status union (mirrors AdminTransactionRow["status"]).
type TransactionStatus = AdminTransactionRow["status"];

type SummaryTone = "dark" | "default" | "peach";

const SUMMARY_SURFACE: Record<SummaryTone, string> = {
  dark: "bg-charcoal text-cream",
  default: "bg-paper text-charcoal border border-line",
  peach: "bg-peach text-burgundy-dark",
};

const SUMMARY_LABEL: Record<SummaryTone, string> = {
  dark: "text-peach",
  default: "text-muted-ink",
  peach: "text-[#5a2a18]",
};

const SUMMARY_SUB: Record<SummaryTone, string> = {
  dark: "text-[rgba(245,239,230,0.6)]",
  default: "text-muted-ink",
  peach: "text-[#5a2a18]",
};

type TabValue = TransactionStatus | "all";

type StatusTab = {
  l: string;
  value: TabValue;
  warn?: boolean;
};

const STATUS_TABS: StatusTab[] = [
  { l: "Semua", value: "all" },
  { l: "Lunas", value: "paid" },
  { l: "Pending", value: "pending", warn: true },
  { l: "Gagal", value: "failed" },
  { l: "Refund", value: "refunded" },
];

const TH = "font-body text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-ink text-left px-[14px] py-3 border-b border-beige";
const TD = "p-[14px] border-b border-line align-middle";

// RFC-4180-ish CSV field escaping for the export action.
function escapeCsv(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Single-row CSV receipt for one transaction (no PDF generator exists). Columns
// and filename match admin-orders-mobile.tsx so both surfaces emit identical files.
function downloadReceiptCsv(t: AdminTransactionRow) {
  const header = ["id", "customer", "couple", "pkg", "amount", "method", "status", "time"];
  const row = [t.id, t.customer, t.couple, t.pkg, t.amount, t.method, t.status, t.time];
  const csv = [header.join(","), row.map(escapeCsv).join(",")].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `maritare-receipt-${t.id}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type AdminOrdersProps = {
  orders: AdminTransactionRow[];
};

// Admin screen 03 · Pesanan (Orders / transactions).
export function AdminOrders({ orders }: AdminOrdersProps) {
  const router = useRouter();
  // Rows live in state so Konfirmasi / reject can flip a transaction's status
  // optimistically while the server action persists, then revert on failure.
  const [rows, setRows] = useState<AdminTransactionRow[]>(() => orders.map((t) => ({ ...t })));
  // null = pristine: the design highlights "Lunas" but the table shows every
  // row. First tab click switches to real filtering.
  const [activeTab, setActiveTab] = useState<TabValue | null>(null);
  const [query, setQuery] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [openMoreId, setOpenMoreId] = useState<string | null>(null);
  // rowId currently being persisted (disables its controls), and the last
  // error message (inline banner — no toast lib in this project).
  const [savingId, setSavingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const visualTab: TabValue = activeTab ?? "paid";

  const statusFiltered = useMemo(() => {
    if (activeTab === null || activeTab === "all") return rows;
    return rows.filter((t) => t.status === activeTab);
  }, [rows, activeTab]);

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return statusFiltered;
    return statusFiltered.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.customer.toLowerCase().includes(q) ||
        t.couple.toLowerCase().includes(q),
    );
  }, [statusFiltered, query]);

  const pendingCount = useMemo(() => rows.filter((t) => t.status === "pending").length, [rows]);

  // Revenue summary derived from the real rows. `time` is a relative label
  // (no parseable timestamp), so we can't bucket by today/week/month —
  // instead the cards report figures we can actually back: total settled
  // revenue, paid-vs-all counts, and the value awaiting manual confirmation.
  const summary = useMemo(() => {
    const paid = rows.filter((t) => t.status === "paid");
    const pending = rows.filter((t) => t.status === "pending");
    const refunded = rows.filter((t) => t.status === "refunded");
    const paidRevenue = paid.reduce((sum, t) => sum + t.amount, 0);
    const pendingValue = pending.reduce((sum, t) => sum + t.amount, 0);
    const refundedValue = refunded.reduce((sum, t) => sum + t.amount, 0);
    return {
      paidRevenue,
      paidCount: paid.length,
      pendingValue,
      pendingCount: pending.length,
      refundedValue,
      refundedCount: refunded.length,
      totalCount: rows.length,
    };
  }, [rows]);

  const summaryCards = useMemo(
    () =>
      [
        {
          l: "Pendapatan lunas",
          n: rupiahShort(summary.paidRevenue),
          sub: `${summary.paidCount} transaksi lunas`,
          tone: "dark" as SummaryTone,
        },
        {
          l: "Total transaksi",
          n: String(summary.totalCount),
          sub: `${summary.paidCount} lunas · ${summary.pendingCount} pending`,
          tone: "default" as SummaryTone,
        },
        {
          l: "Refund",
          n: rupiahShort(summary.refundedValue),
          sub: `${summary.refundedCount} transaksi`,
          tone: "default" as SummaryTone,
        },
        {
          l: "Pending review",
          n: rupiahShort(summary.pendingValue),
          sub: `${summary.pendingCount} menunggu manual`,
          tone: "peach" as SummaryTone,
          warn: true,
        },
      ] satisfies { l: string; n: string; sub: string; tone: SummaryTone; warn?: boolean }[],
    [summary],
  );

  const countFor = (value: TabValue): number =>
    value === "all" ? rows.length : rows.filter((t) => t.status === value).length;

  const selectTab = (value: TabValue) => {
    setActiveTab(value);
  };

  // Persist a status change via the server action with optimistic UI: flip the
  // row immediately, then revert + surface an inline error if the action fails.
  const setStatus = (row: AdminTransactionRow, status: SettleStatus) => {
    if (savingId !== null) return;
    setOpenMoreId(null);
    setActionError(null);
    const prevStatus = row.status;
    setSavingId(row.rowId);
    setRows((prev) => prev.map((t) => (t.rowId === row.rowId ? { ...t, status } : t)));
    startTransition(async () => {
      const res = await adminSetOrderStatus({ id: row.rowId, status });
      setSavingId(null);
      if (res.ok) {
        router.refresh();
      } else {
        // Revert the optimistic flip and show why it failed.
        setRows((prev) => prev.map((t) => (t.rowId === row.rowId ? { ...t, status: prevStatus } : t)));
        setActionError(res.error);
      }
    });
  };

  const handleExport = () => {
    const header = ["id", "customer", "couple", "pkg", "amount", "method", "status", "time"];
    const lines = [
      header.join(","),
      ...rows.map((t) =>
        [t.id, t.customer, t.couple, t.pkg, t.amount, t.method, t.status, t.time].map(escapeCsv).join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "maritare-orders.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleBell = () => {
    const firstPending = rows.find((t) => t.status === "pending");
    if (!firstPending) return;
    // Make sure the row is actually rendered before scrolling to it.
    if (!visibleRows.some((t) => t.id === firstPending.id)) {
      setActiveTab("pending");
      setQuery("");
    }
    window.setTimeout(() => {
      document.getElementById(`tx-${firstPending.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
    setHighlightId(firstPending.id);
    window.setTimeout(() => {
      setHighlightId((prev) => (prev === firstPending.id ? null : prev));
    }, 1600);
  };

  const bellLabel = `${pendingCount} perlu tindakan`;
  const bannerCount = pendingCount;
  const showBanner = pendingCount > 0;

  return (
    <AdminShell active="orders">
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminTopBar
          crumbs={["Admin", "Pesanan"]}
          title="Transaksi & pembayaran"
          eyebrow={
            pendingCount > 0
              ? `${pendingCount} pesanan menunggu konfirmasi manual`
              : "Semua pembayaran sudah diproses"
          }
          actions={
            <>
              <Button variant="ghost" size="sm" onClick={handleExport}><Icon name="download" size={12} />Export</Button>
              <Button size="sm" className="bg-terracotta text-white hover:bg-terracotta" onClick={handleBell}>
                <Icon name="bell" size={12} />{bellLabel}
              </Button>
            </>
          }
        />

        <div className="flex-1 px-9 py-[22px] overflow-y-auto flex flex-col">
          {/* Revenue summary */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {summaryCards.map((k) => (
              <div key={k.l} className={cn("rounded-xl px-[18px] py-4", SUMMARY_SURFACE[k.tone])}>
                <div className={cn("text-[10px] tracking-[0.22em] uppercase font-semibold mb-[10px]", SUMMARY_LABEL[k.tone])}>
                  {k.l}
                </div>
                <div
                  className={cn(
                    "font-display font-extrabold text-[28px] leading-none tracking-[-0.02em]",
                    k.tone === "dark" ? "text-peach" : k.warn ? "text-terracotta" : "text-charcoal",
                  )}
                >
                  {k.n}
                </div>
                <div className={cn("text-[11px] font-display italic mt-1", SUMMARY_SUB[k.tone])}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-[10px] mb-[14px]">
            <div className="flex gap-1 bg-paper border border-line rounded-full p-[3px]">
              {STATUS_TABS.map((t) => {
                const isActive = visualTab === t.value;
                return (
                  <button
                    key={t.l}
                    type="button"
                    onClick={() => selectTab(t.value)}
                    className={cn(
                      "px-[14px] py-[7px] rounded-full text-[11px] font-semibold tracking-[0.12em] uppercase",
                      "border-none cursor-pointer inline-flex items-center gap-[7px]",
                      isActive ? "text-cream bg-forest-deep" : t.warn ? "text-terracotta bg-transparent" : "text-muted-ink bg-transparent",
                    )}
                  >
                    {t.l}{" "}
                    <span className={cn("text-[9px]", isActive ? "opacity-70" : "opacity-100")}>
                      {countFor(t.value)}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2 bg-paper border border-line rounded-full px-[14px] py-[7px]">
              <Icon name="search" size={13} stroke="var(--color-muted-ink)" />
              <input
                placeholder="Cari invoice atau nama…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
                className="border-none bg-transparent outline-none text-[12px] w-[200px]"
              />
            </div>
          </div>

          {/* Pending alert */}
          {showBanner && (
            <div className="bg-peach rounded-xl px-[18px] py-[14px] flex items-center gap-[14px] mb-[14px]">
              <div className="w-8 h-8 rounded-full bg-[rgba(124,45,45,0.15)] text-burgundy-dark flex items-center justify-center shrink-0">
                <Icon name="bell" size={14} />
              </div>
              <div className="flex-1">
                <div className="font-display italic text-[16px] text-burgundy-dark">
                  {bannerCount} transaksi manual menunggu konfirmasi
                </div>
                <div className="text-[11px] text-[#5a2a18] mt-[2px]">
                  Customer udah upload bukti transfer — perlu di-review tim Finance dalam 24 jam.
                </div>
              </div>
              <Button size="sm" onClick={() => selectTab("pending")}>Tinjau sekarang →</Button>
            </div>
          )}

          {/* Action error (no toast lib in-project → inline, dismissable banner) */}
          {actionError && (
            <div className="bg-[rgba(124,45,45,0.08)] border border-[rgba(124,45,45,0.25)] rounded-xl px-[18px] py-[12px] flex items-center gap-[14px] mb-[14px]">
              <div className="flex-1 text-[12px] text-burgundy-dark">{actionError}</div>
              <button
                type="button"
                onClick={() => setActionError(null)}
                className="text-burgundy-dark/70 hover:text-burgundy-dark cursor-pointer bg-transparent border-none p-1"
                aria-label="Tutup"
              >
                <Icon name="x" size={13} />
              </button>
            </div>
          )}

          {/* Table — fills the remaining height; rows scroll inside the card
              with a sticky header so the frame stays pinned. */}
          <div className="flex-1 min-h-[280px] bg-paper border border-line rounded-[14px] overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <table className="w-full border-separate border-spacing-0 text-[13px] [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:hover_td]:bg-[rgba(124,45,45,0.03)] [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:bg-cream [&_thead_th]:z-10">
                <thead>
                  <tr>
                    <th className={cn(TH, "pl-[22px] w-[130px]")}>Invoice</th>
                    <th className={TH}>Customer</th>
                    <th className={TH}>Paket</th>
                    <th className={TH}>Metode</th>
                    <th className={cn(TH, "text-right")}>Jumlah</th>
                    <th className={TH}>Status</th>
                    <th className={TH}>Waktu</th>
                    <th className={cn(TH, "w-[90px]")}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((t) => (
                    <tr
                      key={t.id}
                      id={`tx-${t.id}`}
                      className={cn(highlightId === t.id && "[&_td]:bg-peach")}
                    >
                      <td className={cn(TD, "pl-[22px] font-display font-bold text-[12px] tracking-[-0.005em]")}>{t.id}</td>
                      <td className={TD}>
                        <div className="text-[12px] font-semibold">{t.customer}</div>
                        <div className="text-[10px] text-muted-ink mt-[2px]">{t.couple}</div>
                      </td>
                      <td className={cn(TD, "text-[12px]")}>{t.pkg}</td>
                      <td className={TD}>
                        <span className="text-[11px] text-charcoal">{t.method}</span>
                      </td>
                      <td className={cn(TD, "text-right font-display font-bold text-[13px]")}>
                        <span className={t.status === "refunded" ? "line-through text-muted-ink" : "no-underline text-charcoal"}>
                          {rupiahShort(t.amount)}
                        </span>
                      </td>
                      <td className={TD}><AdminStatus status={t.status} /></td>
                      <td className={cn(TD, "text-[11px] text-muted-ink font-display italic")}>{t.time}</td>
                      <td className={TD}>
                        <div className="flex gap-1">
                          {t.status === "pending" ? (
                            <>
                              <button
                                type="button"
                                disabled={savingId !== null}
                                onClick={() => setStatus(t, "paid")}
                                className="px-[10px] py-[5px] text-[10px] font-bold tracking-[0.12em] uppercase border-none rounded-[5px] bg-sage text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Konfirmasi
                              </button>
                              <CircleButton size={26} title="Tolak" disabled={savingId !== null} onClick={() => setStatus(t, "failed")}>
                                <Icon name="x" size={11} />
                              </CircleButton>
                            </>
                          ) : (
                            <>
                              <CircleButton size={26} title="Lihat detail"><Icon name="eye" size={11} /></CircleButton>
                              <CircleButton size={26} title="Unduh struk (CSV)" onClick={() => downloadReceiptCsv(t)}><Icon name="download" size={11} /></CircleButton>
                              <div className="relative flex">
                                <CircleButton
                                  size={26}
                                  title="Aksi lainnya"
                                  onClick={() => setOpenMoreId((prev) => (prev === t.id ? null : t.id))}
                                >
                                  <Icon name="more" size={11} />
                                </CircleButton>
                                {openMoreId === t.id && (
                                  <>
                                    <button
                                      type="button"
                                      aria-label="Tutup menu"
                                      className="fixed inset-0 z-10 cursor-default bg-transparent border-none"
                                      onClick={() => setOpenMoreId(null)}
                                    />
                                    <div className="absolute right-0 top-[30px] z-20 min-w-[180px] bg-paper border border-line rounded-[10px] py-1 shadow-[0_10px_28px_rgba(27,31,24,0.14)]">
                                      {/* "Kirim bukti ke customer" isn't built yet — honestly disabled. */}
                                      <button
                                        type="button"
                                        disabled
                                        title="Segera hadir"
                                        className="block w-full text-left whitespace-nowrap border-none bg-transparent px-[14px] py-2 text-[11px] text-charcoal opacity-50 cursor-not-allowed"
                                      >
                                        Kirim bukti ke customer
                                      </button>
                                      <button
                                        type="button"
                                        disabled={savingId !== null}
                                        onClick={() => setStatus(t, "refunded")}
                                        className="block w-full text-left whitespace-nowrap border-none bg-transparent px-[14px] py-2 text-[11px] text-charcoal cursor-pointer hover:bg-cream disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        Tandai refund
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visibleRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-[22px] py-10 text-center">
                        {rows.length === 0 ? (
                          <>
                            <div className="font-display italic text-[15px] text-muted-ink">Belum ada pesanan</div>
                            <div className="text-[11px] text-muted-ink mt-1">
                              Transaksi pelanggan bakal muncul di sini.
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-display italic text-[15px] text-muted-ink">Tidak ada hasil</div>
                            <div className="text-[11px] text-muted-ink mt-1">
                              Coba ubah kata kunci atau pilih tab status lain.
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}

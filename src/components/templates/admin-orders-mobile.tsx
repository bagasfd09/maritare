"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/atoms/icon";
import { AdminStatus } from "@/components/molecules/admin-badges";
import {
  AdminMobileBtnMini,
  AdminMobileCard,
  AdminMobileChip,
  AdminMobileHead,
  AdminMobileHScroll,
  AdminMobileIconMini,
} from "@/components/molecules/admin-mobile-primitives";
import { AdminMobileShell } from "@/components/templates/admin-mobile-shell";
import { adminSetOrderStatus } from "@/server/actions/order";
import type { AdminTransactionRow } from "@/server/queries/admin";
import { rupiahShort } from "@/lib/format";
import { cn } from "@/lib/utils";

// Statuses this screen can settle an order into (never back to "pending").
type SettleStatus = "paid" | "failed" | "refunded";

// Admin mobile · Pesanan (Orders) — ported 1:1 from the design's M_Orders.

type TransactionStatus = AdminTransactionRow["status"];

type SummaryTone = "dark" | "paper" | "peach";

// Chip labels in display order; counts are derived from the real rows.
const STATUS_CHIPS: { l: string; value: TransactionStatus | "all" }[] = [
  { l: "Semua", value: "all" },
  { l: "Lunas", value: "paid" },
  { l: "Pending", value: "pending" },
  { l: "Gagal", value: "failed" },
  { l: "Refund", value: "refunded" },
];

// Chip highlighted by default before the user touches the filter (matches the static design).
const DEFAULT_STATUS_CHIP = "Lunas";

// Maps a chip label to the transaction status it filters by; null means "show everything".
function statusForChip(label: string): TransactionStatus | null {
  switch (label) {
    case "Lunas":
      return "paid";
    case "Pending":
      return "pending";
    case "Gagal":
      return "failed";
    case "Refund":
      return "refunded";
    default:
      return null; // "Semua"
  }
}

// Single-row CSV receipt built from the transaction fields, downloaded client-side.
function downloadReceiptCsv(t: AdminTransactionRow) {
  const escapeCsv = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const header = ["id", "customer", "couple", "pkg", "amount", "method", "status", "time"];
  const row = [t.id, t.customer, t.couple, t.pkg, String(t.amount), t.method, t.status, t.time];
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

type AdminOrdersMobileProps = {
  orders: AdminTransactionRow[];
};

export function AdminOrdersMobile({ orders }: AdminOrdersMobileProps) {
  const router = useRouter();
  // null = filter untouched: the default chip is highlighted but all rows stay visible,
  // so the page at rest matches the static design exactly.
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [txns, setTxns] = useState<AdminTransactionRow[]>(() => orders.map((t) => ({ ...t })));
  // rowId of the card whose more-actions menu is open, the rowId being saved
  // (disables its controls), and the last error message (no toast lib here).
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filterStatus = activeChip === null ? null : statusForChip(activeChip);
  const visibleTransactions = filterStatus === null ? txns : txns.filter((t) => t.status === filterStatus);
  const pendingCount = txns.filter((t) => t.status === "pending").length;

  const countFor = (value: TransactionStatus | "all"): number =>
    value === "all" ? txns.length : txns.filter((t) => t.status === value).length;

  // Revenue summary derived from the real rows. `time` is a relative label (no
  // parseable timestamp), so cards report figures we can back: settled revenue,
  // transaction counts, refunds, and the value awaiting manual confirmation.
  const summaryCards = useMemo(() => {
    const paid = txns.filter((t) => t.status === "paid");
    const refunded = txns.filter((t) => t.status === "refunded");
    const paidRevenue = paid.reduce((sum, t) => sum + t.amount, 0);
    const pendingValue = txns
      .filter((t) => t.status === "pending")
      .reduce((sum, t) => sum + t.amount, 0);
    const refundedValue = refunded.reduce((sum, t) => sum + t.amount, 0);
    return [
      { l: "Pendapatan", n: rupiahShort(paidRevenue), sub: `${paid.length} lunas`, tone: "dark" as SummaryTone },
      { l: "Total", n: String(txns.length), sub: "transaksi", tone: "paper" as SummaryTone },
      { l: "Refund", n: rupiahShort(refundedValue), sub: `${refunded.length} transaksi`, tone: "paper" as SummaryTone },
      { l: "Pending", n: rupiahShort(pendingValue), sub: `${pendingCount} manual`, tone: "peach" as SummaryTone },
    ];
  }, [txns, pendingCount]);

  // Persist a status change via the server action with optimistic UI: flip the
  // card immediately, then revert + surface an inline error if the action fails.
  const setStatus = (row: AdminTransactionRow, status: SettleStatus) => {
    if (savingId !== null) return;
    setOpenMenuId(null);
    setActionError(null);
    const prevStatus = row.status;
    setSavingId(row.rowId);
    setTxns((prev) => prev.map((r) => (r.rowId === row.rowId ? { ...r, status } : r)));
    startTransition(async () => {
      const res = await adminSetOrderStatus({ id: row.rowId, status });
      setSavingId(null);
      if (res.ok) {
        router.refresh();
      } else {
        setTxns((prev) => prev.map((r) => (r.rowId === row.rowId ? { ...r, status: prevStatus } : r)));
        setActionError(res.error);
      }
    });
  };

  return (
    <AdminMobileShell active="orders">
      <AdminMobileHead
        eyebrow="Pesanan & transaksi"
        title="Transaksi"
        sub={
          pendingCount > 0
            ? `${pendingCount} menunggu konfirmasi manual`
            : "Semua pembayaran sudah diproses"
        }
      />

      {/* revenue summary — horizontal scroll */}
      <AdminMobileHScroll className="px-[18px] pt-[14px] pb-[2px]">
        {summaryCards.map((k, i) => (
          <div
            key={i}
            className={cn(
              "flex-none min-w-[140px] rounded-[14px] px-4 py-[15px]",
              k.tone === "dark" && "bg-charcoal",
              k.tone === "peach" && "bg-peach",
              k.tone === "paper" && "bg-paper border border-line",
            )}
          >
            <div
              className={cn(
                "text-[9px] tracking-[0.18em] uppercase font-semibold mb-2",
                k.tone === "dark" ? "text-peach" : k.tone === "peach" ? "text-[#5a2a18]" : "text-muted-ink",
              )}
            >
              {k.l}
            </div>
            <div
              className={cn(
                "font-display font-extrabold text-[24px] leading-none tracking-[-0.02em]",
                k.tone === "dark" ? "text-peach" : k.tone === "peach" ? "text-terracotta" : "text-charcoal",
              )}
            >
              {k.n}
            </div>
            <div
              className={cn(
                "text-[10px] font-display italic mt-1",
                k.tone === "dark" ? "text-[rgba(245,239,230,0.6)]" : k.tone === "peach" ? "text-[#5a2a18]" : "text-muted-ink",
              )}
            >
              {k.sub}
            </div>
          </div>
        ))}
      </AdminMobileHScroll>

      {/* pending alert */}
      {pendingCount > 0 && (
        <div className="mx-[18px] mt-[14px] bg-peach rounded-[14px] px-4 py-[14px] flex items-center gap-3">
          <div className="w-[34px] h-[34px] rounded-full bg-[rgba(124,45,45,0.15)] text-burgundy-dark flex items-center justify-center shrink-0">
            <Icon name="bell" size={15} />
          </div>
          <div className="flex-1">
            <div className="font-display italic text-[15px] text-burgundy-dark leading-[1.2]">
              {`${pendingCount} transaksi menunggu konfirmasi`}
            </div>
            <div className="text-[10.5px] text-[#5a2a18] mt-[3px]">Bukti transfer perlu di-review tim Finance.</div>
          </div>
        </div>
      )}

      {/* action error (no toast lib in-project → inline, dismissable banner) */}
      {actionError && (
        <div className="mx-[18px] mt-[14px] bg-[rgba(124,45,45,0.08)] border border-[rgba(124,45,45,0.25)] rounded-[14px] px-4 py-[12px] flex items-center gap-3">
          <div className="flex-1 text-[12px] text-burgundy-dark">{actionError}</div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-burgundy-dark/70 cursor-pointer bg-transparent border-none p-1"
            aria-label="Tutup"
          >
            <Icon name="x" size={13} />
          </button>
        </div>
      )}

      {/* status chips */}
      <AdminMobileHScroll className="px-[18px] pt-[14px]">
        {STATUS_CHIPS.map((t, i) => (
          <AdminMobileChip
            key={i}
            on={(activeChip ?? DEFAULT_STATUS_CHIP) === t.l}
            onClick={() => setActiveChip(t.l)}
          >
            {t.l} · {countFor(t.value)}
          </AdminMobileChip>
        ))}
      </AdminMobileHScroll>

      {/* transactions list */}
      <div className="px-[18px] pt-4 flex flex-col gap-2">
        {visibleTransactions.map((t) => (
          <AdminMobileCard key={t.id} className="p-[14px]">
            <div className="flex items-start justify-between gap-[10px]">
              <div className="min-w-0">
                <div className="font-display font-bold text-[12.5px] text-charcoal">{t.id}</div>
                <div className="text-[13px] font-semibold mt-1">{t.customer}</div>
                <div className="text-[10.5px] text-muted-ink mt-[2px]">
                  {t.couple} · {t.pkg}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div
                  className={cn(
                    "font-display font-bold text-[16px]",
                    t.status === "refunded" ? "text-muted-ink line-through" : "text-charcoal",
                  )}
                >
                  {rupiahShort(t.amount)}
                </div>
                <div className="mt-[6px]">
                  <AdminStatus status={t.status} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-[11px] border-t border-line">
              <span className="text-[11px] text-muted-ink">{t.method}</span>
              <span className="text-[11px] text-faint">· {t.time}</span>
              <div className="flex-1" />
              {t.status === "pending" && (
                <AdminMobileBtnMini sage disabled={savingId !== null} onClick={() => setStatus(t, "paid")}>
                  Konfirmasi
                </AdminMobileBtnMini>
              )}
              {t.status !== "pending" && (
                <>
                  <AdminMobileIconMini>
                    <Icon name="eye" size={13} />
                  </AdminMobileIconMini>
                  <AdminMobileIconMini onClick={() => downloadReceiptCsv(t)}>
                    <Icon name="download" size={13} />
                  </AdminMobileIconMini>
                </>
              )}
              {/* More-actions menu — Tolak / Tandai refund parity with desktop. */}
              <div className="relative flex">
                <AdminMobileIconMini
                  aria-label="Aksi lainnya"
                  disabled={savingId !== null}
                  onClick={() => setOpenMenuId((prev) => (prev === t.rowId ? null : t.rowId))}
                >
                  <Icon name="more" size={13} />
                </AdminMobileIconMini>
                {openMenuId === t.rowId && (
                  <>
                    <button
                      type="button"
                      aria-label="Tutup menu"
                      className="fixed inset-0 z-10 cursor-default bg-transparent border-none"
                      onClick={() => setOpenMenuId(null)}
                    />
                    <div className="absolute right-0 bottom-[38px] z-20 min-w-[160px] bg-paper border border-line rounded-[10px] py-1 shadow-[0_10px_28px_rgba(27,31,24,0.14)]">
                      <button
                        type="button"
                        disabled={savingId !== null}
                        onClick={() => setStatus(t, "failed")}
                        className="block w-full text-left whitespace-nowrap border-none bg-transparent px-[14px] py-2 text-[11px] text-charcoal cursor-pointer hover:bg-cream disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Tolak
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
            </div>
          </AdminMobileCard>
        ))}
        {visibleTransactions.length === 0 && (
          <div className="text-center text-[12px] text-muted-ink py-6 font-display italic">
            {txns.length === 0 ? "Belum ada pesanan" : "Tidak ada transaksi dengan status ini."}
          </div>
        )}
      </div>
    </AdminMobileShell>
  );
}

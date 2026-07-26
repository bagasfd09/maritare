"use client";

import Link from "next/link";

import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import { rupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

// Billing functional bits shared by the desktop and mobile checkout screens:
// a "continue payment" banner for a pending order, and the invoice history
// list. Both read from the orders getBillingData already fetches.

export type BillingOrderItem = {
  id: string;
  invoiceNo: string;
  createdAt: Date;
  description: string | null;
  amount: number;
  status: "pending" | "paid" | "failed" | "refunded";
  method: string | null;
};

const STATUS_CHIP: Record<BillingOrderItem["status"], { label: string; className: string }> = {
  pending: { label: "Menunggu", className: "bg-peach text-[#5a2a18]" },
  paid: { label: "Lunas", className: "bg-sage-soft text-[#1c2818]" },
  failed: { label: "Gagal", className: "bg-[rgba(193,102,84,0.16)] text-terracotta" },
  refunded: { label: "Refund", className: "bg-cream text-faint border border-line" },
};

function shortDate(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(value));
}

/** Nudge back into an unfinished payment — links to our own payment page. */
export function PendingPaymentBanner({ order }: { order: BillingOrderItem }) {
  return (
    <Link
      href={`/dashboard/billing/bayar/${order.invoiceNo}`}
      className="flex items-center gap-3 rounded-[14px] border border-[rgba(244,180,130,0.7)] bg-[rgba(244,180,130,0.14)] px-4 py-3"
    >
      <span className="w-7 h-7 rounded-lg bg-peach text-burgundy-dark flex items-center justify-center shrink-0">
        <Icon name="card" size={14} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[12px] font-semibold text-charcoal">
          Tagihan menunggu pembayaran — {rupiah(order.amount)}
        </span>
        <span className="block text-[10.5px] text-muted-ink mt-px truncate">
          {order.invoiceNo}
          {order.description ? ` · ${order.description}` : ""}
        </span>
      </span>
      <span className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-burgundy shrink-0 inline-flex items-center gap-1">
        Lanjutkan <Icon name="arrow-r" size={12} />
      </span>
    </Link>
  );
}

/** The last few invoices with status; pending rows link back to the payment page. */
export function BillingHistory({ orders, className }: { orders: BillingOrderItem[]; className?: string }) {
  return (
    <div
      id="riwayat-tagihan"
      className={cn("bg-paper border border-line rounded-[14px] px-4 py-[13px] scroll-mt-6", className)}
    >
      <div className="flex items-center gap-2 mb-[10px]">
        <FlowerMark size={11} color="var(--color-burgundy)" core="var(--color-terracotta)" stamen="var(--color-peach)" />
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-ink">Riwayat tagihan</span>
        <span className="h-px flex-1 bg-line" />
        {orders.length > 0 && (
          <span className="text-[10px] text-faint font-semibold">{orders.length}</span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-[11.5px] text-muted-ink leading-[1.5]">
          Belum ada tagihan. Pilih paket di atas untuk mulai — invoice pertamamu bakal muncul di sini.
        </div>
      ) : (
        <div className="flex flex-col">
          {orders.slice(0, 5).map((o) => {
            const chip = STATUS_CHIP[o.status];
            const row = (
              <div className="flex items-center gap-3 py-[9px]">
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-charcoal truncate">
                    {o.description ?? o.invoiceNo}
                  </div>
                  <div className="text-[10px] text-faint mt-px tracking-[0.04em]">
                    {shortDate(o.createdAt)} · {o.invoiceNo}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[12px] font-display font-bold text-charcoal">{rupiah(o.amount)}</div>
                  <span
                    className={cn(
                      "inline-block text-[8.5px] px-[7px] py-[2px] rounded-full font-bold tracking-[0.12em] uppercase mt-[3px]",
                      chip.className,
                    )}
                  >
                    {chip.label}
                  </span>
                </div>
                {o.status === "pending" && (
                  <Icon name="arrow-r" size={12} stroke="var(--color-burgundy)" />
                )}
              </div>
            );
            return o.status === "pending" ? (
              <Link
                key={o.id}
                href={`/dashboard/billing/bayar/${o.invoiceNo}`}
                className="block border-b border-line last:border-b-0"
              >
                {row}
              </Link>
            ) : (
              <div key={o.id} className="border-b border-line last:border-b-0">
                {row}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

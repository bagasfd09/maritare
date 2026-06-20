import { cn } from "@/lib/utils";
import { rupiah } from "@/lib/format";
import { Icon, type IconName } from "@/components/atoms/icon";
import { CircleButton } from "@/components/atoms/circle-button";

export type InvoiceRow = {
  id: string;
  invoiceNo: string;
  date: string;
  desc: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "refunded";
  method: string;
};

const TH =
  "font-body text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-ink text-left px-[14px] py-3 border-b border-beige";
const TD =
  "p-[14px] border-b border-line align-middle group-hover:bg-[rgba(124,45,45,0.03)] group-last:border-b-0";

// Status pill styling per order status — keeps the template's pill look (the
// "Lunas" green) and adds tones for the remaining order states.
const STATUS_PILL: Record<
  InvoiceRow["status"],
  { label: string; className: string; icon: IconName | null }
> = {
  paid: {
    label: "Lunas",
    className: "bg-[rgba(77,216,145,0.18)] text-[#1c5a36]",
    icon: "check",
  },
  pending: {
    label: "Menunggu",
    className: "bg-peach text-[#5a2a18]",
    icon: null,
  },
  failed: {
    label: "Gagal",
    className: "bg-[rgba(124,45,45,0.12)] text-burgundy",
    icon: "x",
  },
  refunded: {
    label: "Dikembalikan",
    className: "bg-cream border border-line text-muted-ink",
    icon: null,
  },
};

// Invoice history table. Ports the `.d-tbl` invoice table.
export function BillingInvoiceTable({ invoices = [] }: { invoices?: InvoiceRow[] }) {
  return (
    <div className="bg-paper border border-line rounded-[14px] overflow-hidden mb-[22px]">
      <table className="w-full border-separate border-spacing-0 text-[13px]">
        <thead>
          <tr className="bg-cream">
            <th className={cn(TH, "pl-[22px]")}>Nomor invoice</th>
            <th className={TH}>Tanggal</th>
            <th className={TH}>Deskripsi</th>
            <th className={TH}>Metode</th>
            <th className={cn(TH, "text-right")}>Jumlah</th>
            <th className={TH}>Status</th>
            <th className={cn(TH, "w-[50px]")} />
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 && (
            <tr>
              <td colSpan={7} className="px-[22px] py-10 text-center text-[13px] text-muted-ink">
                Belum ada tagihan.
              </td>
            </tr>
          )}
          {invoices.map((inv) => {
            const pill = STATUS_PILL[inv.status];
            return (
              <tr key={inv.id} className="group">
                <td className={cn(TD, "pl-[22px] font-display font-bold text-[13px]")}>{inv.invoiceNo}</td>
                <td className={cn(TD, "text-[12px] text-charcoal")}>{inv.date}</td>
                <td className={cn(TD, "text-[12px]")}>{inv.desc}</td>
                <td className={TD}>
                  <span className="text-[11px] px-2 py-[3px] rounded-full bg-cream border border-line font-semibold tracking-[0.08em]">
                    {inv.method}
                  </span>
                </td>
                <td className={cn(TD, "text-right font-display font-bold text-[14px]")}>
                  {rupiah(inv.amount)}
                </td>
                <td className={TD}>
                  <span
                    className={cn(
                      "text-[10px] px-[9px] py-[3px] rounded-full font-bold tracking-[0.16em] uppercase inline-flex items-center gap-1",
                      pill.className,
                    )}
                  >
                    {pill.icon && <Icon name={pill.icon} size={10} />}
                    {pill.label}
                  </span>
                </td>
                <td className={TD}>
                  <CircleButton size={28} title="Unduh PDF">
                    <Icon name="download" size={12} />
                  </CircleButton>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

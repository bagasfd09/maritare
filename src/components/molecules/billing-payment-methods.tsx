import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";

// Saved payment methods. Maritare charges per order via Midtrans (no stored
// cards table yet), so there are no persisted methods to show — render an honest
// empty state rather than fabricated cards.
export function BillingPaymentMethods() {
  return (
    <div className="bg-paper border border-line rounded-[14px] px-[18px] py-5">
      <div className="text-center py-3">
        <div className="text-[13px] text-muted-ink">Belum ada metode pembayaran tersimpan.</div>
        <div className="text-[11px] text-faint mt-1 leading-[1.5]">
          Pembayaran diproses per transaksi lewat Midtrans saat kamu membeli atau memperpanjang
          paket.
        </div>
      </div>
      <Button variant="ghost" size="sm" className="w-full justify-center mt-3 border-dashed">
        <Icon name="plus" size={12} />
        Tambah metode pembayaran
      </Button>
    </div>
  );
}

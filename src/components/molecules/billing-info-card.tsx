import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";

const LABEL = "text-[10px] text-muted-ink tracking-[0.18em] uppercase font-semibold mb-1";

type BillingInfoCardProps = {
  // The account owner — the billing contact. NPWP isn't modeled yet.
  name: string;
  email: string;
};

// Billing contact / tax info card.
export function BillingInfoCard({ name, email }: BillingInfoCardProps) {
  return (
    <div className="bg-paper border border-line rounded-[14px] px-[18px] py-4 flex flex-col gap-3">
      <div>
        <div className={LABEL}>Nama / Perusahaan</div>
        <div className="text-[13px] text-charcoal font-medium">
          {name || <span className="text-faint italic font-display">belum diisi</span>}
        </div>
      </div>
      <div>
        <div className={LABEL}>Email invoice</div>
        <div className="text-[13px] text-charcoal">{email}</div>
      </div>
      <div>
        <div className={LABEL}>NPWP (opsional)</div>
        <div className="text-[13px] text-faint italic font-display">belum diisi</div>
      </div>
      <Button variant="ghost" size="sm" className="mt-1">
        <Icon name="edit" size={12} />
        Edit info penagihan
      </Button>
    </div>
  );
}

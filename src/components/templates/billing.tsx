import { DashboardShell } from "@/components/templates/dashboard-shell";
import { DashboardTopBar } from "@/components/organisms/dashboard-topbar";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Em } from "@/components/atoms/typography";
import { SectionNumber } from "@/components/atoms/section-number";
import { BillingPlanCard } from "@/components/molecules/billing-plan-card";
import { BillingUpgradeCard } from "@/components/molecules/billing-upgrade-card";
import {
  BillingInvoiceTable,
  type InvoiceRow,
} from "@/components/molecules/billing-invoice-table";
import { BillingPaymentMethods } from "@/components/molecules/billing-payment-methods";
import { BillingInfoCard } from "@/components/molecules/billing-info-card";
import type { BillingData } from "@/server/queries/dashboard";

// "12 Feb 2026" — matches the design's short invoice date format.
const invoiceDateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function toInvoiceRows(orders: BillingData["orders"]): InvoiceRow[] {
  return orders.map((o) => ({
    id: o.id,
    invoiceNo: o.invoiceNo,
    date: invoiceDateFmt.format(o.createdAt),
    desc: o.description ?? "—",
    amount: o.amount,
    status: o.status,
    method: o.method ?? "—",
  }));
}

// Screen 08 · Tagihan & Paket (Billing).
//
// `data` is required and always real — the page (billing/page.tsx) redirects to
// onboarding when getBillingData() returns null, so Billing only renders with
// live DB data. The molecules carry no mock fallbacks; honest empty states stand
// in for anything not yet modeled (stored payment methods, NPWP).
export function Billing({ data }: { data: BillingData }) {
  const invoices = toInvoiceRows(data.orders);

  return (
    <DashboardShell active="billing" chrome={data.chrome}>
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          num="§ VIII"
          eyebrow="Tagihan & Paket"
          title={<>Paket <Em className="text-burgundy">kamu.</Em></>}
          actions={
            <>
              <Button variant="ghost"><Icon name="download" size={14} />Unduh semua invoice</Button>
              {data.upgrade && (
                <Button variant="primary">
                  <Icon name="sparkle" size={14} />
                  Upgrade ke {data.upgrade.name}
                </Button>
              )}
            </>
          }
        />

        <div className="flex-1 overflow-y-auto px-10 py-7">
          {/* Current plan hero + upgrade nudge */}
          <div className="grid grid-cols-[1.3fr_1fr] gap-[18px] mb-[26px]">
            <BillingPlanCard
              packageName={data.packageName}
              packagePrice={data.packagePrice}
              durationDays={data.plan.durationDays}
              guestLimit={data.plan.guestLimit}
              guestCount={data.plan.guestCount}
              expiresAt={data.plan.expiresAt}
              status={data.plan.status}
            />
            <BillingUpgradeCard upgrade={data.upgrade} />
          </div>

          {/* Invoices */}
          <SectionNumber className="text-[12px] mb-3">ii. Riwayat tagihan</SectionNumber>
          <BillingInvoiceTable invoices={invoices} />

          {/* Payment methods + billing info */}
          <div className="grid grid-cols-[1.4fr_1fr] gap-[18px]">
            <div>
              <SectionNumber className="text-[12px] mb-3">iii. Metode pembayaran tersimpan</SectionNumber>
              <BillingPaymentMethods />
            </div>
            <div>
              <SectionNumber className="text-[12px] mb-3">iv. Info penagihan</SectionNumber>
              <BillingInfoCard
                name={data.billingContact.name}
                email={data.billingContact.email}
              />
            </div>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}

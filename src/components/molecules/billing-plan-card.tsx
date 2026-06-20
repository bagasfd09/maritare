import { Button } from "@/components/atoms/button";
import { Display } from "@/components/atoms/typography";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { rupiahShort } from "@/lib/format";
import { cn } from "@/lib/utils";

// "11 Agustus 2026"
const longDateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

type BillingPlanCardProps = {
  packageName: string | null;
  packagePrice: number | null;
  durationDays: number | null;
  guestLimit: number | null; // null = unlimited
  guestCount: number;
  expiresAt: Date | null;
  status: "draft" | "pending" | "live" | "expired";
};

// Status → the "Paket aktif" pill copy (the plan period only runs once published).
const STATUS_BADGE: Record<BillingPlanCardProps["status"], string> = {
  live: "★ Paket aktif",
  expired: "Paket kedaluwarsa",
  pending: "Menunggu pembayaran",
  draft: "Belum aktif",
};

function daysLeft(expiresAt: Date): number {
  const ms = expiresAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

// Dark "current plan" hero card for the billing screen.
export function BillingPlanCard({
  packageName,
  packagePrice,
  durationDays,
  guestLimit,
  guestCount,
  expiresAt,
  status,
}: BillingPlanCardProps) {
  // A null guestLimit means "unlimited" ONLY when a package exists; with no
  // package it just means "no entitlement" — never advertise unlimited for that.
  const hasPackage = packageName != null;
  const planName = packageName ?? "—";
  const priceLabel = packagePrice != null ? rupiahShort(packagePrice) : "—";

  // Factual subtitle from the package limits (no marketing copy invented). Only
  // shown for a real package — a package-less wedding has no quota to describe.
  const subtitleParts = hasPackage
    ? [
        guestLimit != null ? `${guestLimit} tamu` : "Tamu unlimited",
        durationDays != null ? `${durationDays} hari` : null,
      ].filter(Boolean)
    : [];

  const quotaValue = !hasPackage
    ? `${guestCount}`
    : guestLimit != null
      ? `${guestCount} / ${guestLimit}`
      : `${guestCount} · unlimited`;

  const stats: { label: string; value: string; highlight: boolean }[] = [
    {
      label: "Berlaku sampai",
      value: expiresAt ? longDateFmt.format(expiresAt) : "Belum aktif",
      highlight: false,
    },
    {
      label: "Sisa hari",
      value: expiresAt ? `${daysLeft(expiresAt)} hari` : "—",
      highlight: true,
    },
    {
      label: "Quota tamu",
      value: quotaValue,
      highlight: false,
    },
  ];

  return (
    <div className="relative overflow-hidden min-h-[220px] bg-charcoal text-cream rounded-[18px] px-7 py-[26px]">
      <div className="absolute -top-[30px] -right-10 w-[180px] h-[180px] opacity-[0.07]">
        <FlowerMark
          size={180}
          color="var(--color-peach)"
          core="var(--color-peach)"
          stamen="var(--color-terracotta)"
        />
      </div>
      <div className="relative z-[2] grid grid-cols-[1fr_auto] gap-6 h-full">
        <div className="flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-[11px] py-[5px] rounded-full bg-terracotta text-white text-[10px] font-bold tracking-[0.18em] uppercase mb-4">
              {STATUS_BADGE[status]}
            </div>
            <Display as="div" className="text-[56px] text-peach leading-[0.95]">
              {planName}
            </Display>
            {subtitleParts.length > 0 && (
              <div className="font-display italic text-[17px] text-[rgba(245,239,230,0.7)] mt-[6px]">
                {subtitleParts.join(" · ")}
              </div>
            )}
          </div>
          <div className="flex gap-6 pt-4 border-t border-[rgba(245,239,230,0.16)]">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-[9px] text-[rgba(245,239,230,0.55)] tracking-[0.22em] uppercase font-semibold">
                  {s.label}
                </div>
                <div
                  className={cn(
                    "font-display text-[17px] mt-[2px]",
                    s.highlight ? "font-bold text-peach" : "italic text-cream",
                  )}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between items-end">
          <div className="font-display font-extrabold text-[32px] text-peach tracking-[-0.02em] text-right">
            {priceLabel}
          </div>
          <Button variant="dark" className="bg-[rgba(245,239,230,0.1)] text-cream">
            Perpanjang →
          </Button>
        </div>
      </div>
    </div>
  );
}

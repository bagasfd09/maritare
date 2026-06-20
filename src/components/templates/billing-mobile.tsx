import { Chip } from "@/components/atoms/chip";
import { CircleButton } from "@/components/atoms/circle-button";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import { StatusPill } from "@/components/atoms/status-pill";
import {
  MobileButton,
  MobileCard,
  MobileEm,
  MobileHeading,
  MobileProgress,
} from "@/components/molecules/mobile-primitives";
import { MobileShell } from "@/components/templates/mobile-shell";
import { rupiah, rupiahShort } from "@/lib/format";
import type { BillingData } from "@/server/queries/dashboard";

const longDateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const shortDateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const STATUS_BADGE: Record<BillingData["plan"]["status"], string> = {
  live: "Paket aktif",
  expired: "Kedaluwarsa",
  pending: "Menunggu pembayaran",
  draft: "Belum aktif",
};

// Order status → mobile pill (StatusPill tones: default | draft | live).
const ORDER_PILL: Record<
  BillingData["orders"][number]["status"],
  { label: string; tone: "default" | "draft" | "live" }
> = {
  paid: { label: "Lunas", tone: "live" },
  pending: { label: "Menunggu", tone: "draft" },
  failed: { label: "Gagal", tone: "default" },
  refunded: { label: "Dikembalikan", tone: "default" },
};

function daysLeft(expiresAt: Date): number {
  return Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000));
}

// Mobile screen 08 · Tagihan & Paket — same live data as the desktop Billing.
export function BillingMobile({ data }: { data: BillingData }) {
  const { plan, upgrade, packageName, packagePrice, orders } = data;
  const hasPackage = packageName != null;
  const planName = packageName ?? "—";

  // Hero subtitle: active period (when published) + the one-time package price.
  const heroParts = [
    plan.expiresAt ? `Aktif sampai ${longDateFmt.format(plan.expiresAt)}` : null,
    packagePrice != null ? rupiahShort(packagePrice) : null,
  ].filter(Boolean);

  // Usage — only real, modeled facts (guest quota + remaining active period).
  const guestUsage = !hasPackage
    ? { value: `${plan.guestCount} tamu`, pct: 0 }
    : plan.guestLimit != null
      ? {
          value: `${plan.guestCount} / ${plan.guestLimit}`,
          pct: plan.guestLimit > 0 ? Math.min(100, Math.round((plan.guestCount / plan.guestLimit) * 100)) : 0,
        }
      : { value: `${plan.guestCount} · tak terbatas`, pct: 100 };

  const periodUsage = plan.expiresAt
    ? {
        value: `${daysLeft(plan.expiresAt)} hari lagi`,
        pct:
          plan.durationDays && plan.durationDays > 0
            ? Math.min(100, Math.round((daysLeft(plan.expiresAt) / plan.durationDays) * 100))
            : 100,
      }
    : { value: "Belum aktif", pct: 0 };

  return (
    <MobileShell
      active="tagihan"
      eyebrow="Tagihan & Paket"
      title={<>Paket <MobileEm>{planName}.</MobileEm></>}
    >
      {/* Active plan hero */}
      <MobileCard tone="burgundy" className="overflow-hidden">
        <div className="flex items-center justify-between">
          <Chip tone="cream" className="text-[9px]">{STATUS_BADGE[plan.status]}</Chip>
          <FlowerMark size={18} color="var(--color-peach)" core="var(--color-peach)" stamen="var(--color-cream)" />
        </div>
        <div className="font-display font-extrabold text-[30px] mt-3">{planName}</div>
        {heroParts.length > 0 && (
          <div className="text-[12.5px] text-[rgba(245,239,230,0.75)] mt-1">
            {heroParts.join(" · ")}
          </div>
        )}
        {hasPackage && plan.perks.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-[14px]">
            {plan.perks.map((f) => (
              <span key={f} className="text-[11px] px-[10px] py-[5px] rounded-full bg-[rgba(245,239,230,0.16)] text-cream">
                {f}
              </span>
            ))}
          </div>
        )}
      </MobileCard>

      {/* Usage */}
      <MobileCard>
        <MobileHeading className="text-base mb-[14px]">Pemakaian.</MobileHeading>
        <div className="flex flex-col gap-[14px]">
          <div>
            <div className="flex justify-between text-[12.5px] mb-[6px]">
              <span className="font-medium">Tamu undangan</span>
              <span className="text-muted-ink">{guestUsage.value}</span>
            </div>
            <MobileProgress
              value={guestUsage.pct}
              fillClassName={guestUsage.pct >= 100 ? "bg-sage" : "bg-burgundy"}
            />
          </div>
          <div>
            <div className="flex justify-between text-[12.5px] mb-[6px]">
              <span className="font-medium">Masa aktif</span>
              <span className="text-muted-ink">{periodUsage.value}</span>
            </div>
            <MobileProgress value={periodUsage.pct} fillClassName="bg-burgundy" />
          </div>
        </div>
      </MobileCard>

      {/* Upgrade nudge — only when a higher tier exists */}
      {upgrade && (
        <MobileCard tone="sage" className="flex items-center gap-[14px]">
          <div className="flex-1">
            <MobileHeading className="text-lg text-[#2E3325]">
              Naik ke <MobileEm className="text-burgundy-deep">{upgrade.name}.</MobileEm>
            </MobileHeading>
            {upgrade.perks.length > 0 && (
              <div className="text-xs text-[#3a4029] mt-1">
                {upgrade.perks.slice(0, 2).join(" · ")}.
              </div>
            )}
          </div>
          <MobileButton variant="dark" className="h-10 shrink-0">Upgrade</MobileButton>
        </MobileCard>
      )}

      {/* Payment history */}
      <div className="flex items-center justify-between gap-[10px] mt-[2px]">
        <MobileHeading className="text-[17px]">
          Riwayat <MobileEm>bayar.</MobileEm>
        </MobileHeading>
      </div>
      <MobileCard flush>
        {orders.length === 0 ? (
          <div className="px-4 py-8 text-center text-[12.5px] text-muted-ink">Belum ada tagihan.</div>
        ) : (
          orders.map((o) => {
            const pill = ORDER_PILL[o.status];
            return (
              <div key={o.id} className="flex items-center justify-between px-4 py-[14px] border-b border-line last:border-b-0">
                <div>
                  <div className="text-[13.5px] font-semibold">{rupiah(o.amount)}</div>
                  <div className="text-[11px] text-muted-ink">{shortDateFmt.format(o.createdAt)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill tone={pill.tone} className="text-[10px]">{pill.label}</StatusPill>
                  <CircleButton type="button" title="Unduh invoice">
                    <Icon name="download" size={15} />
                  </CircleButton>
                </div>
              </div>
            );
          })
        )}
      </MobileCard>
    </MobileShell>
  );
}

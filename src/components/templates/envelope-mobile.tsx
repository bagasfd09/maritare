import { MobileShell } from "@/components/templates/mobile-shell";
import {
  MobileCard,
  MobileEm,
  MobileEyebrow,
  MobileHeading,
} from "@/components/molecules/mobile-primitives";
import { Icon } from "@/components/atoms/icon";
import { CircleButton } from "@/components/atoms/circle-button";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { rupiah } from "@/lib/format";
import type { EnvelopeData } from "@/server/queries/dashboard";

// Mobile screen 07 · Amplop Digital.
export function EnvelopeMobile({ data }: { data: EnvelopeData }) {
  return (
    <MobileShell
      active="amplop"
      eyebrow="Amplop Digital"
      title={
        <>
          Amplop <MobileEm>digital.</MobileEm>
        </>
      }
    >
      {/* Total collected hero — empty state (no gifts-received tracking yet) */}
      <MobileCard tone="dark" className="overflow-hidden">
        <div className="absolute -top-7 -right-7 w-[130px] h-[130px] opacity-10">
          <FlowerMark
            size={130}
            color="var(--color-peach)"
            core="var(--color-peach)"
            stamen="var(--color-terracotta)"
          />
        </div>
        <div className="relative z-[2]">
          <MobileEyebrow className="text-peach">Total terkumpul</MobileEyebrow>
          <div className="font-display font-extrabold [font-variation-settings:'opsz'_144] text-[38px] tracking-[-0.03em] text-cream mt-2">
            {rupiah(data.totals.total)}
          </div>
          <div className="text-xs text-[rgba(245,239,230,0.6)] mt-[6px]">
            {rupiah(data.totals.total)} · {data.totals.count} amplop
          </div>
        </div>
      </MobileCard>

      {/* Gift accounts */}
      <MobileHeading className="text-[17px]">
        Rekening <MobileEm>hadiah.</MobileEm>
      </MobileHeading>
      {data.accounts.length > 0 ? (
        data.accounts.map((a) => (
          <MobileCard key={`${a.bank}-${a.number}`} className="flex items-center gap-[14px]">
            <div className="w-[46px] h-[46px] rounded-xl bg-sage-soft flex items-center justify-center font-display font-extrabold text-sm text-[#2E3325] shrink-0">
              {a.bank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-lg tracking-[0.04em]">{a.number}</div>
              <div className="text-[11.5px] text-muted-ink">a.n. {a.holder}</div>
            </div>
            <CircleButton>
              <Icon name="copy" size={15} />
            </CircleButton>
          </MobileCard>
        ))
      ) : (
        <MobileCard className="text-center py-6">
          <div className="font-display italic text-[15px] text-charcoal mb-1">Belum ada rekening</div>
          <div className="text-[11.5px] text-muted-ink">Tambah di editor bab Amplop.</div>
        </MobileCard>
      )}
      {data.ewallets.length > 0 && (
        <div className="flex gap-[10px]">
          {data.ewallets.map((w) => (
            <MobileCard
              key={`${w.provider}-${w.number}`}
              className="flex-1 text-center px-[10px] py-[14px] font-display italic text-[15px]"
            >
              {w.provider}
            </MobileCard>
          ))}
        </div>
      )}

      {/* Latest envelopes — empty state */}
      <MobileHeading className="text-[17px] mt-[2px]">
        Amplop <MobileEm>terbaru.</MobileEm>
      </MobileHeading>
      <MobileCard className="text-center py-8">
        <div className="font-display italic text-[15px] text-charcoal mb-1">Belum ada amplop masuk</div>
        <div className="text-[11.5px] text-muted-ink">Hadiah dari tamu akan muncul di sini.</div>
      </MobileCard>
    </MobileShell>
  );
}

import { Button } from "@/components/atoms/button";
import { Display, Em } from "@/components/atoms/typography";
import { SectionNumber } from "@/components/atoms/section-number";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { rupiahShort } from "@/lib/format";

type Upgrade = { name: string; price: number; priceDiff: number; perks: string[] };

// Peach "upgrade to the next tier" nudge next to the current plan hero. When
// there's no higher tier (already on the top package) it shows a calm "highest
// plan" state instead of a fake upsell.
export function BillingUpgradeCard({ upgrade }: { upgrade?: Upgrade | null }) {
  if (!upgrade) {
    return (
      <div className="relative overflow-hidden bg-paper border border-line rounded-[18px] px-6 py-[22px] flex flex-col justify-center text-center">
        <div className="absolute -bottom-8 -right-6 w-[120px] h-[120px] opacity-[0.06]">
          <FlowerMark size={120} color="var(--color-burgundy)" />
        </div>
        <SectionNumber className="text-[11px] text-terracotta mb-[10px]">
          Paket tertinggi
        </SectionNumber>
        <div className="text-[13px] text-muted-ink leading-[1.5]">
          Kamu sudah di paket teratas. Semua fitur sudah aktif.
        </div>
      </div>
    );
  }

  // The first perk is the headline benefit of moving up; show up to two.
  const highlight = upgrade.perks.slice(0, 2).join(" · ");
  const diffLabel =
    upgrade.priceDiff > 0 ? `+ ${rupiahShort(upgrade.priceDiff)}` : rupiahShort(upgrade.price);

  return (
    <div className="bg-peach rounded-[18px] px-6 py-[22px] flex flex-col justify-between">
      <div>
        <SectionNumber className="text-[11px] text-terracotta mb-[10px]">
          Upgrade tersedia
        </SectionNumber>
        <Display as="div" className="text-[26px] text-burgundy-dark leading-[1.1]">
          Naik ke <Em className="text-burgundy">{upgrade.name}</Em>?
        </Display>
        {highlight && (
          <div className="text-[13px] text-[#5a2a18] mt-2 leading-[1.5]">{highlight}.</div>
        )}
      </div>
      <div className="flex items-center justify-between mt-4">
        <div>
          <div className="font-display font-extrabold text-[22px] text-burgundy-dark">
            {diffLabel}
          </div>
          <div className="text-[10px] text-[#5a2a18] tracking-[0.18em] uppercase font-semibold">
            {upgrade.priceDiff > 0 ? "selisih dari paket sekarang" : "harga paket"}
          </div>
        </div>
        <Button variant="primary">Bandingkan paket →</Button>
      </div>
    </div>
  );
}

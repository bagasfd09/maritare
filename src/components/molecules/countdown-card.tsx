import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import { Num, Em, Eyebrow } from "@/components/atoms/typography";

type CountdownCardProps = {
  daysLeft: number;
  dateLabel: string;
  venueLabel: string;
};

// Hero countdown — dark editorial card with the ghosted flower mark.
export function CountdownCard({ daysLeft, dateLabel, venueLabel }: CountdownCardProps) {
  return (
    <div className="bg-charcoal text-cream rounded-[22px] px-8 py-[30px] relative overflow-hidden flex flex-col justify-between min-h-[240px]">
      <div className="absolute -top-10 -right-10 w-[240px] h-[240px] opacity-[0.08]">
        <FlowerMark size={240} color="var(--color-peach)" core="var(--color-peach)" stamen="var(--color-terracotta)" />
      </div>

      <div className="relative z-[2]">
        <Eyebrow className="text-peach opacity-80">Hari bahagiamu</Eyebrow>
        <div className="flex items-baseline gap-4 mt-[14px]">
          <Num className="text-peach text-[96px]">{daysLeft}</Num>
          <div>
            <Em className="block text-[28px] text-cream leading-none">hari lagi</Em>
            <div className="text-[12px] text-[rgba(245,239,230,0.6)] tracking-[0.2em] uppercase mt-1">{dateLabel}</div>
          </div>
        </div>
      </div>

      <div className="relative z-[2] flex items-center justify-between pt-[18px] border-t border-[rgba(245,239,230,0.16)]">
        <div className="flex items-center gap-[10px]">
          <Icon name="pin" size={14} stroke="var(--color-peach)" />
          <span className="font-display italic text-[14px] text-peach">{venueLabel}</span>
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-2 text-[11px] text-peach tracking-[0.18em] uppercase font-semibold"
        >
          Edit acara <Icon name="arrow-ur" size={12} />
        </a>
      </div>
    </div>
  );
}

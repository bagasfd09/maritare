// Event cards (Akad, Resepsi, …) — cream cards crowned by the hanging gold
// ornament, with a lush watercolor cluster bleeding from one corner (alternating
// side per card) and a "Lihat Peta" pill.

import { Icon } from "@/components/atoms/icon";
import type { AcaraEvent } from "@/lib/invitation/sections";

import { Reveal } from "../flora/reveal";
import { formatFullDateId, formatTimeRangeId } from "./format";
import { FolkFloral, FolkSectionHeading, type FolkFloralName } from "./folk-ornaments";

type FolkEventsProps = {
  events: AcaraEvent[];
};

// Each card gets its own signature watercolor cluster for variety.
const CARD_FLORALS: FolkFloralName[] = [
  "hibiscus-peony-arrangement",
  "lily-red",
  "trumpet-vine-orange",
  "bee-balm-red",
];

export function FolkEvents({ events }: FolkEventsProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="px-5 pb-12 text-center">
      <Reveal>
        <FolkSectionHeading eyebrow="Rangkaian Acara" tone="onOlive">
          Waktu &amp; <span className="text-[#E8A0B8]">tempat</span>
        </FolkSectionHeading>
      </Reveal>

      <div className="mt-9 space-y-8">
        {events.map((event, i) => {
          const left = i % 2 === 0;
          const floral = CARD_FLORALS[i % CARD_FLORALS.length];
          return (
            <Reveal key={`${event.name}-${i}`} variant="zoom-in">
              <div className="relative overflow-hidden rounded-[26px] border border-[#E0D6BE] bg-[#F5EFE0] px-7 pb-8 pt-10 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.45)]">
                {/* watercolor cluster bleeding from a bottom corner (alternates) */}
                <FolkFloral
                  name={floral}
                  className={
                    left
                      ? "pointer-events-none absolute -bottom-7 -left-10 w-[120px] select-none opacity-90"
                      : "pointer-events-none absolute -bottom-7 -right-10 w-[120px] -scale-x-100 select-none opacity-90"
                  }
                />

                {/* hanging gold ornament centerpiece crowning the card */}
                <FolkFloral name="gold-ornament" className="relative mx-auto h-14 w-auto opacity-95" />
                <h3 className="relative mt-1 font-display text-[26px] font-bold italic tracking-[-0.02em] text-[#9E2B62] [font-variation-settings:'opsz'_96]">
                  {event.name}
                </h3>

                <div className="relative mt-4 space-y-1.5">
                  <p className="font-body text-[13px] font-medium text-[#3C471F]">
                    {formatFullDateId(event.date)}
                  </p>
                  <p className="font-body text-[12px] uppercase tracking-[0.12em] text-[#52602F]">
                    {formatTimeRangeId(event.timeStart, event.timeEnd)}
                  </p>
                </div>

                <div className="relative mx-auto mt-4 h-px w-12 bg-[#C9A24B]/50" />

                <p className="relative mt-4 font-body text-[14px] font-semibold text-[#3C471F]">
                  {event.venue}
                </p>
                {event.address && (
                  <p className="relative mx-auto mt-1.5 max-w-[280px] font-body text-[12.5px] leading-relaxed text-[#52602F]">
                    {event.address}
                  </p>
                )}

                {event.mapsUrl && (
                  <a
                    href={event.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-[#9E2B62] px-5 py-2 font-body text-[11px] font-medium uppercase tracking-[0.16em] text-[#F5EFE0] transition hover:bg-[#7A1E48]"
                  >
                    <Icon name="pin" size={13} />
                    Lihat Peta
                  </a>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

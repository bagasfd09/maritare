// Event cards (Akad, Resepsi, …) with date, time range, venue and maps link.
// Each card carries a gold double-rule border + a watercolor rose corner cluster.
// The section is crowned by a gold ornament and grounded by a dense rose bank.

import { Icon } from "@/components/atoms/icon";
import type { AcaraEvent } from "@/lib/invitation/sections";

import { Reveal } from "../flora/reveal";
import { CrimsonFloralImg } from "./crimson-florals";
import { CrimsonCardFrame, CrimsonJoglo } from "./crimson-ornaments";
import { formatFullDateId, formatTimeRangeId } from "./format";

type CrimsonEventsProps = {
  events: AcaraEvent[];
};

export function CrimsonEvents({ events }: CrimsonEventsProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[#EFE3CC]/70 px-8 py-16 text-center">
      {/* hanging gold ornament crowning the section */}
      <Reveal variant="fade-down" className="pointer-events-none absolute left-1/2 -top-2 w-16 -translate-x-1/2">
        <CrimsonFloralImg asset="gold-ornament" sway swayOrigin="origin-top" />
      </Reveal>

      {/* maroon roses banking the heading from both top corners */}
      <Reveal variant="fade-right" className="pointer-events-none absolute -left-16 top-6 w-40">
        <CrimsonFloralImg asset="burgundy-roses" className="rotate-[16deg]" sway swayOrigin="origin-top-right" />
      </Reveal>
      <Reveal variant="fade-left" className="pointer-events-none absolute -right-16 top-6 w-40">
        <CrimsonFloralImg
          asset="burgundy-roses"
          mirrored
          className="-rotate-[16deg]"
          sway
          swayOrigin="origin-top-left"
        />
      </Reveal>

      <p className="relative mt-8 font-body text-[10px] font-semibold uppercase tracking-[0.34em] text-[#7C7E5E]">
        Rangkaian Acara
      </p>
      <h2 className="relative mt-4 [font-family:var(--font-cormorant)] text-[34px] font-normal tracking-[0.01em] text-[#8B1E2D]">
        Waktu &amp; <span className="italic text-[#C9A24B]">tempat</span>
      </h2>

      <div className="relative mt-10 space-y-10">
        {events.map((event, i) => (
          <Reveal key={`${event.name}-${i}`} variant="zoom-in" className="relative">
            {/* watercolor cluster draped over one top corner — sides alternate per card */}
            <Reveal
              variant="fade-down"
              delay={240}
              className={
                i % 2 === 0
                  ? "pointer-events-none absolute -left-14 -top-12 z-10 w-36"
                  : "pointer-events-none absolute -right-14 -top-12 z-10 w-36"
              }
            >
              <CrimsonFloralImg
                asset={i % 2 === 0 ? "burgundy-roses" : "peony-alstroemeria"}
                mirrored={i % 2 === 1}
                className={i % 2 === 0 ? "rotate-[8deg]" : "-rotate-[8deg]"}
                sway
                swayOrigin={i % 2 === 0 ? "origin-top-right" : "origin-top-left"}
              />
            </Reveal>

            <div className="relative rounded-[18px] bg-[#F4ECDC] px-7 pb-8 pt-8 shadow-[0_16px_34px_-24px_rgba(110,22,34,0.45)]">
              <CrimsonCardFrame className="pointer-events-none absolute inset-0 h-full w-full text-[#C9A24B]" />
              <CrimsonJoglo className="relative mx-auto w-16 text-[#C9A24B]" />
              <h3 className="relative mt-3 [font-family:var(--font-cormorant)] text-[30px] font-normal italic tracking-[0.01em] text-[#8B1E2D]">
                {event.name}
              </h3>

              <div className="relative mt-4 space-y-1.5">
                <p className="font-body text-[13px] font-medium text-[#2A2320]">
                  {formatFullDateId(event.date)}
                </p>
                <p className="font-body text-[12px] uppercase tracking-[0.14em] text-[#7C7E5E]">
                  {formatTimeRangeId(event.timeStart, event.timeEnd)}
                </p>
              </div>

              <div className="relative mx-auto mt-5 h-px w-12 bg-[#C9A24B]/60" />

              <p className="relative mt-5 font-body text-[14px] font-semibold text-[#2A2320]">
                {event.venue}
              </p>
              {event.address && (
                <p className="relative mx-auto mt-1.5 max-w-[280px] font-body text-[12.5px] leading-relaxed text-[#7C7E5E]">
                  {event.address}
                </p>
              )}

              {event.mapsUrl && (
                <a
                  href={event.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-[#8B1E2D] bg-[#8B1E2D] px-5 py-2 font-body text-[11px] font-medium uppercase tracking-[0.16em] text-[#F4ECDC] transition hover:bg-[#6E1622]"
                >
                  <Icon name="pin" size={13} />
                  Lihat Peta
                </a>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      {/* dense rose + hibiscus bank grounding the foot */}
      <CrimsonFloralImg
        asset="hibiscus-peony"
        className="pointer-events-none absolute -bottom-3 -left-12 w-[70%] rotate-[2deg]"
        sway
        swayOrigin="origin-bottom-left"
      />
      <CrimsonFloralImg
        asset="hibiscus-peony"
        mirrored
        className="pointer-events-none absolute -bottom-3 -right-12 w-[70%] -rotate-[2deg]"
        sway
        swayOrigin="origin-bottom-right"
      />
    </section>
  );
}

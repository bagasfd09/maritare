// Event cards (Akad, Resepsi, …) with date, time range, venue and maps link.

import { Icon } from "@/components/atoms/icon";
import type { AcaraEvent } from "@/lib/invitation/sections";

import { FloraBloom, OrnamentImg } from "./flora-ornaments";
import { formatFullDateId, formatTimeRangeId } from "./format";
import { Reveal } from "./reveal";

type FloraEventsProps = {
  events: AcaraEvent[];
};

export function FloraEvents({ events }: FloraEventsProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-cream/60 px-8 py-16 text-center">
      <p className="font-body text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-ink">
        Rangkaian Acara
      </p>
      <h2 className="mt-4 font-display text-[28px] font-bold tracking-[-0.02em] text-charcoal [font-variation-settings:'opsz'_96]">
        Waktu &amp; <span className="font-normal italic text-burgundy">tempat</span>
      </h2>

      <div className="mt-10 space-y-10">
        {events.map((event, i) => (
          <Reveal key={`${event.name}-${i}`} variant="zoom-in" className="relative">
            {/* cluster draped over one top corner — sides alternate per card */}
            <Reveal
              variant="fade-down"
              delay={240}
              className={
                i % 2 === 0
                  ? "pointer-events-none absolute -left-10 -top-9 z-10 w-28"
                  : "pointer-events-none absolute -right-10 -top-9 z-10 w-28"
              }
            >
              <OrnamentImg
                asset={i % 2 === 0 ? "anemone-red" : "rose-red"}
                mirrored={i % 2 === 1}
                className={i % 2 === 0 ? "rotate-[8deg]" : "-rotate-[8deg]"}
                sway
                swayOrigin={i % 2 === 0 ? "origin-top-right" : "origin-top-left"}
              />
            </Reveal>

            <div className="rounded-2xl border border-line bg-paper px-7 pb-8 pt-7 shadow-[0_14px_30px_-22px_rgba(60,30,10,0.35)]">
              <FloraBloom className="mx-auto w-9 text-terracotta/70" />
              <h3 className="mt-3 font-display text-[26px] font-bold italic tracking-[-0.02em] text-burgundy [font-variation-settings:'opsz'_96]">
                {event.name}
              </h3>

              <div className="mt-5 space-y-1.5">
                <p className="font-body text-[13px] font-medium text-charcoal">
                  {formatFullDateId(event.date)}
                </p>
                <p className="font-body text-[12px] uppercase tracking-[0.14em] text-muted-ink">
                  {formatTimeRangeId(event.timeStart, event.timeEnd)}
                </p>
              </div>

              <div className="mx-auto mt-5 h-px w-12 bg-rule" />

              <p className="mt-5 font-body text-[14px] font-semibold text-charcoal">{event.venue}</p>
              {event.address && (
                <p className="mx-auto mt-1.5 max-w-[280px] font-body text-[12.5px] leading-relaxed text-muted-ink">
                  {event.address}
                </p>
              )}

              {event.mapsUrl && (
                <a
                  href={event.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-burgundy px-5 py-2 font-body text-[11px] font-medium uppercase tracking-[0.16em] text-burgundy transition hover:bg-burgundy hover:text-ivory"
                >
                  <Icon name="pin" size={13} />
                  Lihat Peta
                </a>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

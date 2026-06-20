// Event cards (Akad, Resepsi, …) — each framed by the carved gold Javanese
// gateway (gebyok), with date, time range, venue and a maps link.

import { Icon } from "@/components/atoms/icon";
import type { AcaraEvent } from "@/lib/invitation/sections";

import { formatFullDateId, formatTimeRangeId } from "./format";
import { BG_SECTION, FRAME_GATE, SHIELD_RED, ScarletImg } from "./scarlet-ornaments";
import { Reveal } from "../flora/reveal";

type ScarletEventsProps = {
  events: AcaraEvent[];
};

export function ScarletEvents({ events }: ScarletEventsProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[#fcf9f4] px-8 py-20 text-center">
      <ScarletImg
        name={BG_SECTION}
        className="absolute inset-0 z-0 w-full opacity-[0.08] [&>img]:h-full [&>img]:object-cover"
      />

      <div className="relative z-10">
        <ScarletImg name={SHIELD_RED} className="mx-auto mb-5 w-11" />
        <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-[#8a643c]">
          Rangkaian Acara
        </p>
        <h2 className="mt-4 [font-family:var(--font-cormorant)] text-[34px] font-light leading-tight text-[#2a221c]">
          Waktu &amp; <span className="italic text-[#700f06]">tempat</span>
        </h2>

        <div className="mt-12 space-y-12">
          {events.map((event, i) => (
            <Reveal key={`${event.name}-${i}`} variant="zoom-in" className="relative mx-auto w-[310px]">
              <ScarletImg name={FRAME_GATE} className="w-full" />
              <div className="absolute inset-x-[15%] bottom-[11%] top-[23%] flex flex-col items-center justify-center text-center">
                <h3 className="[font-family:var(--font-cormorant)] text-[27px] font-medium uppercase leading-tight tracking-[0.04em] text-[#700f06]">
                  {event.name}
                </h3>
                <p className="mt-3 text-[12.5px] font-medium text-[#2a221c]">
                  {formatFullDateId(event.date)}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[#6f6253]">
                  {formatTimeRangeId(event.timeStart, event.timeEnd)}
                </p>
                <div className="my-3 h-px w-10 bg-[#a98534]" />
                <p className="text-[13px] font-medium text-[#2a221c]">{event.venue}</p>
                {event.address && (
                  <p className="mt-1 max-w-[200px] text-[11px] leading-relaxed text-[#6f6253]">
                    {event.address}
                  </p>
                )}
                {event.mapsUrl && (
                  <a
                    href={event.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#700f06] px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#700f06] transition hover:bg-[#700f06] hover:text-[#f5f2e4]"
                  >
                    <Icon name="pin" size={12} />
                    Lihat Peta
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

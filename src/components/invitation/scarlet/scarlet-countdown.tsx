"use client";

// Live countdown to the first event. Remaining time is computed only in a client
// effect after mount — server/first render shows "—" placeholders, so there is
// never a hydration mismatch. Gold Cormorant numerals over a faint temple bg.

import { useEffect, useState } from "react";

import { Icon } from "@/components/atoms/icon";
import { buildGoogleCalendarUrl } from "@/lib/invitation/calendar";
import type { AcaraEvent } from "@/lib/invitation/sections";

import { BG_SECTION, DIVIDER_GOLD, ScarletImg } from "./scarlet-ornaments";

type ScarletCountdownProps = {
  event?: AcaraEvent;
  fallbackDate?: string | null;
};

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function computeRemaining(target: number): Remaining | "passed" {
  const diff = target - Date.now();
  if (diff <= 0) return "passed";
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
}

export function ScarletCountdown({ event, fallbackDate }: ScarletCountdownProps) {
  const targetIso = event
    ? `${event.date}T${event.timeStart}:00`
    : fallbackDate
      ? `${fallbackDate}T00:00:00`
      : null;

  const [remaining, setRemaining] = useState<Remaining | "passed" | null>(null);

  useEffect(() => {
    if (!targetIso) return;
    const target = new Date(targetIso).getTime();
    const tick = () => setRemaining(computeRemaining(target));
    const initial = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [targetIso]);

  if (!targetIso) {
    return null;
  }

  const tiles: { label: string; value: number | null }[] =
    remaining && remaining !== "passed"
      ? [
          { label: "Hari", value: remaining.days },
          { label: "Jam", value: remaining.hours },
          { label: "Menit", value: remaining.minutes },
          { label: "Detik", value: remaining.seconds },
        ]
      : [
          { label: "Hari", value: null },
          { label: "Jam", value: null },
          { label: "Menit", value: null },
          { label: "Detik", value: null },
        ];

  return (
    <section className="relative overflow-hidden bg-[#f5f2e4] px-8 py-20 text-center">
      <ScarletImg
        name={BG_SECTION}
        className="absolute inset-0 z-0 w-full opacity-[0.1] [&>img]:h-full [&>img]:object-cover"
      />

      <div className="relative z-10">
        <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-[#8a643c]">
          Menghitung Hari
        </p>

        {remaining === "passed" ? (
          <p className="mt-9 [font-family:var(--font-cormorant)] text-[30px] font-light italic text-[#700f06]">
            Hari bahagia telah tiba!
          </p>
        ) : (
          <div className="mt-10 flex items-start justify-center">
            {tiles.map((tile, i) => (
              <div key={tile.label} className="flex items-start">
                <div className="w-[68px]">
                  <div className="[font-family:var(--font-cormorant)] text-[52px] font-medium leading-none text-[#700f06] [font-feature-settings:'tnum']">
                    {tile.value ?? "—"}
                  </div>
                  <div className="mt-2 text-[9px] font-medium uppercase tracking-[0.22em] text-[#9c8f7c]">
                    {tile.label}
                  </div>
                </div>
                {i < tiles.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="mt-1 [font-family:var(--font-cormorant)] text-[40px] font-light leading-none text-[#a98534]"
                  >
                    :
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {event && (
          <a
            href={buildGoogleCalendarUrl({
              title: event.name,
              date: event.date,
              timeStart: event.timeStart,
              timeEnd: event.timeEnd,
              venue: event.venue,
              address: event.address,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-[#700f06] px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#700f06] transition hover:bg-[#700f06] hover:text-[#f5f2e4]"
          >
            <Icon name="calendar" size={14} />
            Tambah ke Kalender
          </a>
        )}

        <ScarletImg name={DIVIDER_GOLD} className="mx-auto mt-12 w-48" />
      </div>
    </section>
  );
}

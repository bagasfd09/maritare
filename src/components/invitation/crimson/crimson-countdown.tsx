"use client";

// Live countdown to the first event. Remaining time is computed only in a client
// effect after mount — server (and first client) render shows "—" placeholders,
// so there is never a hydration mismatch.

import { useEffect, useState } from "react";

import { Icon } from "@/components/atoms/icon";
import { buildGoogleCalendarUrl } from "@/lib/invitation/calendar";
import type { AcaraEvent } from "@/lib/invitation/sections";

import { Reveal } from "../flora/reveal";
import { CrimsonFloralImg } from "./crimson-florals";
import { CrimsonDivider } from "./crimson-ornaments";

type CrimsonCountdownProps = {
  /** First acara event (drives both the target and the calendar button). */
  event?: AcaraEvent;
  /** Fallback target date (YYYY-MM-DD) when no events exist. */
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

export function CrimsonCountdown({ event, fallbackDate }: CrimsonCountdownProps) {
  const targetIso = event
    ? `${event.date}T${event.timeStart}:00`
    : fallbackDate
      ? `${fallbackDate}T00:00:00`
      : null;

  // null = not mounted yet → placeholders.
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
    <section className="relative overflow-hidden px-8 py-16 text-center">
      {/* hanging gold ornament crowning the section */}
      <Reveal variant="fade-down" className="pointer-events-none absolute left-1/2 -top-2 w-14 -translate-x-1/2">
        <CrimsonFloralImg asset="gold-ornament" sway swayOrigin="origin-top" />
      </Reveal>

      {/* maroon rose clusters banking the heading from both sides */}
      <Reveal variant="fade-right" className="pointer-events-none absolute -left-16 top-10 w-44">
        <CrimsonFloralImg asset="burgundy-roses" className="rotate-[20deg]" sway swayOrigin="origin-bottom-right" />
      </Reveal>
      <Reveal variant="fade-left" className="pointer-events-none absolute -right-16 top-10 w-44">
        <CrimsonFloralImg
          asset="burgundy-roses"
          mirrored
          className="-rotate-[20deg]"
          sway
          swayOrigin="origin-bottom-left"
        />
      </Reveal>

      <p className="relative mt-8 font-body text-[10px] font-semibold uppercase tracking-[0.34em] text-[#7C7E5E]">
        Menghitung Hari
      </p>

      {remaining === "passed" ? (
        <p className="relative mt-8 [font-family:var(--font-cormorant)] text-[30px] font-normal italic text-[#8B1E2D]">
          Hari bahagia telah tiba!
        </p>
      ) : (
        <div className="relative mt-8 grid grid-cols-4 gap-2.5">
          {tiles.map((tile, i) => (
            <Reveal
              key={tile.label}
              delay={i * 120}
              className="rounded-xl border border-[#C9A24B]/50 bg-[#F4ECDC] px-1 pb-3 pt-4 shadow-[0_10px_24px_-18px_rgba(110,22,34,0.4)]"
            >
              <div className="[font-family:var(--font-cormorant)] text-[34px] font-normal leading-none tracking-[0.01em] text-[#8B1E2D] [font-feature-settings:'tnum']">
                {tile.value ?? "—"}
              </div>
              <div className="mt-2 font-body text-[9px] font-semibold uppercase tracking-[0.2em] text-[#7C7E5E]">
                {tile.label}
              </div>
            </Reveal>
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
          className="relative mt-9 inline-flex items-center gap-2 rounded-full border border-[#8B1E2D] px-6 py-2.5 font-body text-[11px] font-medium uppercase tracking-[0.16em] text-[#8B1E2D] transition hover:bg-[#8B1E2D] hover:text-[#F4ECDC]"
        >
          <Icon name="calendar" size={14} />
          Tambah ke Kalender
        </a>
      )}

      {/* hibiscus + peony bank grounding the foot */}
      <CrimsonFloralImg
        asset="hibiscus-peony"
        className="pointer-events-none absolute -bottom-3 -left-10 w-52 rotate-[3deg] opacity-95"
        sway
        swayOrigin="origin-bottom-left"
      />
      <CrimsonFloralImg
        asset="hibiscus-peony"
        mirrored
        className="pointer-events-none absolute -bottom-3 -right-10 w-52 -rotate-[3deg] opacity-95"
        sway
        swayOrigin="origin-bottom-right"
      />

      <CrimsonDivider className="relative mx-auto mt-14 w-52 text-[#C9A24B]" />
    </section>
  );
}

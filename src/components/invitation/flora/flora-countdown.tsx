"use client";

// Live countdown to the first event. The remaining time is only computed in a
// client effect after mount — the server (and first client) render shows "—"
// placeholders, so there is never a hydration mismatch.

import { useEffect, useState } from "react";

import { Icon } from "@/components/atoms/icon";
import { buildGoogleCalendarUrl } from "@/lib/invitation/calendar";
import type { AcaraEvent } from "@/lib/invitation/sections";

import { FloraDivider, OrnamentImg } from "./flora-ornaments";
import { Reveal } from "./reveal";

type FloraCountdownProps = {
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

export function FloraCountdown({ event, fallbackDate }: FloraCountdownProps) {
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
    // First tick is deferred a frame so the effect body stays setState-free
    // (placeholders render for one paint at most).
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
      {/* soft cluster behind the heading */}
      <OrnamentImg
        asset="bouquet-blush"
        className="absolute left-1/2 top-2 w-44 -translate-x-1/2 opacity-50"
        sway
        swayOrigin="origin-bottom"
      />

      <p className="relative font-body text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-ink">
        Menghitung Hari
      </p>

      {remaining === "passed" ? (
        <p className="relative mt-8 font-display text-[26px] font-bold italic text-burgundy [font-variation-settings:'opsz'_96]">
          Hari bahagia telah tiba!
        </p>
      ) : (
        <div className="relative mt-8 grid grid-cols-4 gap-2.5">
          {tiles.map((tile, i) => (
            <Reveal
              key={tile.label}
              delay={i * 120}
              className="rounded-xl border border-line bg-ivory px-1 pb-3 pt-4"
            >
              <div className="font-display text-[28px] font-extrabold leading-none tracking-[-0.02em] text-burgundy [font-variation-settings:'opsz'_96] [font-feature-settings:'tnum']">
                {tile.value ?? "—"}
              </div>
              <div className="mt-2 font-body text-[9px] font-semibold uppercase tracking-[0.2em] text-faint">
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
          className="mt-9 inline-flex items-center gap-2 rounded-full border border-burgundy px-6 py-2.5 font-body text-[11px] font-medium uppercase tracking-[0.16em] text-burgundy transition hover:bg-burgundy hover:text-ivory"
        >
          <Icon name="calendar" size={14} />
          Tambah ke Kalender
        </a>
      )}

      <FloraDivider className="mx-auto mt-14 w-48 text-rule" />
    </section>
  );
}

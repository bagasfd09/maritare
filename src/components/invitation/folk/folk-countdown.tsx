"use client";

// Live countdown to the first event — magenta card, 4 cream tiles + calendar
// button, sunflower accents. Remaining time is computed only client-side after
// mount (placeholders first render → no hydration mismatch).

import { useEffect, useState } from "react";

import { Icon } from "@/components/atoms/icon";
import { buildGoogleCalendarUrl } from "@/lib/invitation/calendar";
import type { AcaraEvent } from "@/lib/invitation/sections";

import { Reveal } from "../flora/reveal";
import { FolkFloral } from "./folk-ornaments";

type FolkCountdownProps = {
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

export function FolkCountdown({ event, fallbackDate }: FolkCountdownProps) {
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
    <section className="px-5 pb-10">
      <Reveal variant="zoom-in">
        <div className="relative overflow-hidden rounded-[28px] bg-[#9E2B62] px-7 pb-9 pt-8 text-center shadow-[0_20px_44px_-26px_rgba(0,0,0,0.55)]">
          {/* calendula sprays bleeding from opposite bottom corners */}
          <FolkFloral
            name="calendula-orange"
            className="pointer-events-none absolute -bottom-10 -left-12 w-[110px] -rotate-12 select-none opacity-95"
          />
          <FolkFloral
            name="calendula-orange"
            className="pointer-events-none absolute -bottom-10 -right-12 w-[110px] -scale-x-100 rotate-12 select-none opacity-95"
          />

          <FolkFloral name="gold-ornament" className="relative mx-auto mb-2 h-12 w-auto opacity-95" />
          <p className="relative [font-family:var(--font-caveat)] text-[22px] font-semibold text-[#E8A0B8]">
            Menghitung Hari
          </p>

          {remaining === "passed" ? (
            <p className="relative mt-6 font-display text-[24px] font-bold italic text-[#F5EFE0] [font-variation-settings:'opsz'_96]">
              Hari bahagia telah tiba!
            </p>
          ) : (
            <div className="relative mt-6 grid grid-cols-4 gap-2.5">
              {tiles.map((tile, i) => (
                <Reveal
                  key={tile.label}
                  delay={i * 120}
                  className="rounded-2xl bg-[#F5EFE0] px-1 pb-3 pt-4"
                >
                  <div className="font-display text-[28px] font-extrabold leading-none tracking-[-0.02em] text-[#9E2B62] [font-feature-settings:'tnum'] [font-variation-settings:'opsz'_96]">
                    {tile.value ?? "—"}
                  </div>
                  <div className="mt-1.5 font-body text-[9px] font-semibold uppercase tracking-[0.18em] text-[#52602F]">
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
              className="relative mt-8 inline-flex items-center gap-2 rounded-full border border-[#F5EFE0] px-6 py-2.5 font-body text-[11px] font-medium uppercase tracking-[0.16em] text-[#F5EFE0] transition hover:bg-[#F5EFE0] hover:text-[#9E2B62]"
            >
              <Icon name="calendar" size={14} />
              Tambah ke Kalender
            </a>
          )}
        </div>
      </Reveal>
    </section>
  );
}

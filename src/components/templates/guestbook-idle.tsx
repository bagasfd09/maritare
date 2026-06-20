import Link from "next/link";

import { FlowerMark } from "@/components/atoms/flower-mark";
import { Logo } from "@/components/atoms/logo";
import { Icon } from "@/components/atoms/icon";
import type { KioskHeader } from "@/server/queries/guestbook";

// Guestbook 01 — Idle / Welcome. Full-bleed attract screen shown while the
// kiosk waits for the next guest. Burgundy tone (design default): deep
// burgundy gradient, cream type, peach accents, giant flower watermarks in
// the corners. The whole screen is tappable and starts check-in.
// Motion: breathing CTA (design's gb2Pulse), staggered entrance, and slowly
// rotating watermarks.
//
// Couple, live HADIR counter, and the date · venue line derive from the
// session-owned wedding header when present; otherwise the prototype mock
// (Andi & Putri · 142 / 280) renders so the design degrades gracefully.
export function GuestbookIdle({ header }: { header?: KioskHeader | null }) {
  const groomName = header?.groomName ?? "Andi";
  const brideName = header?.brideName ?? "Putri";
  const checkedIn = header?.stats.checkedIn ?? 142;
  const invited = header?.stats.invited ?? 280;

  // Date · venue line from the real labels. A real wedding with no date/venue
  // set shows nothing (never a fake date); the prototype string renders only
  // when there is NO header at all (preview/no-session degradation).
  const contextLine = header
    ? [header.dateLabel, header.venueLabel].filter(Boolean).join(" · ")
    : "14 Juni 2026 · Pendopo Kayon · Yogyakarta";

  return (
    <div className="w-full h-screen min-w-[1280px] min-h-[800px] relative overflow-hidden font-body bg-[linear-gradient(170deg,var(--color-burgundy)_0%,var(--color-burgundy-deep)_100%)]">
      {/* Kiosk attract screen: the WHOLE screen is tappable, not just the CTA */}
      <Link href="/guestbook/search" aria-label="Mulai check-in" className="absolute inset-0 z-[6]" />

      {/* Giant flower watermarks — ambient slow rotation */}
      <div className="absolute right-[-150px] bottom-[-180px] pointer-events-none animate-gb-spin-slow">
        <FlowerMark size={620} color="rgba(245,239,230,0.06)" core="rgba(245,239,230,0.06)" stamen="transparent" />
      </div>
      <div className="absolute left-[-220px] top-[-240px] pointer-events-none animate-gb-spin-slow [animation-direction:reverse] [animation-duration:150s]">
        <FlowerMark size={520} color="rgba(245,239,230,0.06)" core="rgba(245,239,230,0.06)" stamen="transparent" />
      </div>

      {/* Corners */}
      <div className="absolute top-9 left-12 z-[5] animate-gb-fade-up">
        <Logo size={21} light />
      </div>
      <div className="absolute top-9 right-12 z-[5] text-right animate-gb-fade-up">
        <div className="font-body text-[9.5px] tracking-[0.26em] uppercase font-semibold text-[rgba(245,239,230,0.6)]">
          Tamu hadir
        </div>
        <div className="font-display font-bold text-[24px] tracking-[-0.03em] text-cream mt-[2px] tabular-nums">
          {checkedIn} <span className="opacity-50 font-normal text-[18px]">/ {invited}</span>
        </div>
      </div>

      {/* Top eyebrow */}
      <div className="absolute top-11 left-0 right-0 text-center z-[4] animate-gb-fade-up [animation-delay:120ms]">
        <span className="inline-flex items-center gap-4">
          <span className="w-7 h-px bg-[rgba(245,239,230,0.35)]" />
          <span className="font-body text-[11px] tracking-[0.42em] uppercase font-semibold text-peach">
            Resepsi Pernikahan
          </span>
          <span className="w-7 h-px bg-[rgba(245,239,230,0.35)]" />
        </span>
      </div>

      {/* Center names */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-[4] text-center pb-[60px]">
        <h1 className="font-display [font-variation-settings:'opsz'_144] font-extrabold tracking-[-0.045em] leading-[0.94] text-cream text-[150px] m-0 animate-gb-fade-up [animation-delay:200ms]">
          {groomName}
        </h1>
        <h1 className="font-display [font-variation-settings:'opsz'_144] font-extrabold tracking-[-0.045em] leading-[0.94] text-cream text-[150px] m-0 animate-gb-fade-up [animation-delay:320ms]">
          <span className="font-display italic font-normal tracking-[-0.01em] text-peach text-[0.78em] align-baseline">
            &amp;
          </span>{" "}
          {brideName}
        </h1>
        <div className="w-[72px] h-px bg-[rgba(245,239,230,0.35)] mt-[34px] mb-[22px] animate-gb-fade-up [animation-delay:440ms]" />
        <div className="font-body text-[12px] tracking-[0.34em] uppercase font-semibold text-peach animate-gb-fade-up [animation-delay:520ms]">
          {contextLine}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="absolute left-0 right-0 bottom-14 z-[5] text-center animate-gb-fade-up [animation-delay:640ms]">
        <Link
          href="/guestbook/search"
          className="bg-cream text-burgundy-dark border-none h-[68px] px-[52px] rounded-full cursor-pointer font-body font-semibold text-[14px] tracking-[0.2em] uppercase shadow-[0_22px_44px_-18px_rgba(0,0,0,0.45)] inline-flex items-center gap-[14px] animate-gb-pulse"
        >
          Sentuh untuk check-in
          <Icon name="arrow-r" size={17} />
        </Link>
        <div className="font-display italic font-normal tracking-[-0.01em] text-[16px] text-[rgba(245,239,230,0.6)] mt-4">
          Buku tamu digital — tulis nama atau pindai QR dari undangan
        </div>
      </div>
    </div>
  );
}

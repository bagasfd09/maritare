"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import type { KioskGuest, KioskHeader } from "@/server/queries/guestbook";

const RETURN_SECONDS = 4;

// Prototype fallbacks (t = {Andi, Putri}) used when no live header/guest.
const FALLBACK_COUPLE = { groom: "Andi", bride: "Putri" };
const FALLBACK_RECEIPT = "Reza Hartono · 4 orang · check-in tercatat";
const FALLBACK_SIGN_META = "14 Juni 2026 · Yogyakarta";

type GuestbookThankYouProps = {
  header?: KioskHeader | null;
  guest?: KioskGuest | null;
};

// Guestbook 07 — Terima Kasih. Full-bleed gratitude screen shown right after
// a guest finishes check-in (and optionally signs the wish book). Counts down
// for real and auto-returns to the idle screen; tapping the chip skips ahead.
// When a guest id resolves the receipt pill shows the real name + headcount;
// otherwise it renders the prototype sample copy.
export function GuestbookThankYou({ header, guest }: GuestbookThankYouProps) {
  const router = useRouter();
  const [left, setLeft] = useState(RETURN_SECONDS);

  useEffect(() => {
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (left <= 0) router.push("/guestbook");
  }, [left, router]);

  const groomName = header?.groomName ?? FALLBACK_COUPLE.groom;
  const brideName = header?.brideName ?? FALLBACK_COUPLE.bride;

  // Receipt pill — real name + party size when checked in; mock otherwise.
  const receipt = guest
    ? `${guest.name} · ${guest.checkedInPartySize ?? guest.partySize ?? 1} orang · check-in tercatat`
    : FALLBACK_RECEIPT;

  // Bottom signature meta line: prefer the canonical date · venue labels.
  const signMeta = header
    ? [header.dateLabel, header.venueLabel].filter(Boolean).join(" · ") || FALLBACK_SIGN_META
    : FALLBACK_SIGN_META;

  return (
    <div className="w-full h-screen min-w-[1280px] min-h-[800px] relative overflow-hidden font-body bg-cream">
      {/* Centered flower watermark */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <span className="inline-block animate-gb-spin-slow">
          <FlowerMark size={680} color="rgba(182,107,77,0.07)" core="rgba(182,107,77,0.05)" stamen="transparent" />
        </span>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-20 z-[2]">
        <span className="animate-gb-fade-up">
        <FlowerMark
          size={44}
          color="var(--color-terracotta)"
          core="var(--color-burgundy)"
          stamen="var(--color-peach)"
        />
        </span>

        {/* Check-in receipt pill */}
        <div className="animate-gb-fade-up [animation-delay:120ms] inline-flex items-center gap-2 bg-sage-pill text-[#2E3325] px-4 py-[7px] rounded-full mt-[22px] mb-[18px] font-body text-[10.5px] tracking-[0.18em] uppercase font-semibold">
          <Icon name="check" size={12} stroke="#2E3325" />
          {receipt}
        </div>

        <h1 className="animate-gb-fade-up [animation-delay:220ms] font-display [font-variation-settings:'opsz'_144] font-extrabold tracking-[-0.045em] leading-[0.92] text-charcoal text-[124px] m-0">
          Terima kasih
        </h1>
        <div className="animate-gb-fade-up [animation-delay:340ms] font-display italic font-normal tracking-[-0.01em] text-[30px] text-burgundy mt-[14px]">
          telah hadir di hari bahagia kami.
        </div>

        <div className="animate-gb-fade-up [animation-delay:440ms] w-16 h-px bg-[#C9BC9A] mt-[30px] mb-5" />

        <p className="animate-gb-fade-up [animation-delay:520ms] font-body text-[18px] leading-[1.6] text-[#3F3B35] max-w-[560px] m-0">
          Doa restu kalian adalah hadiah terindah untuk perjalanan baru {groomName} &amp; {brideName}. Selamat menikmati acara.
        </p>

        {/* Auto-return countdown chip — live timer; tap to skip ahead */}
        <Link
          href="/guestbook"
          className="animate-gb-fade-up [animation-delay:640ms] mt-9 px-5 py-[9px] border border-beige rounded-full font-body text-[10px] tracking-[0.24em] uppercase font-semibold text-faint no-underline tabular-nums"
        >
          Kembali ke beranda dalam {Math.max(left, 0)} detik…
        </Link>
      </div>

      {/* Bottom signature */}
      <div className="absolute bottom-12 left-0 right-0 text-center z-[2]">
        <div className="font-display font-bold text-[22px] tracking-[-0.025em] text-charcoal">
          {groomName} <span className="font-display italic font-normal tracking-[-0.01em] text-terracotta">&amp;</span> {brideName}
        </div>
        <div className="font-body text-[9px] tracking-[0.3em] uppercase font-semibold text-faint mt-[6px]">
          {signMeta}
        </div>
      </div>
    </div>
  );
}

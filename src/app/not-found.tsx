import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Instrument_Sans } from "next/font/google";

import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

// Global 404 — implemented from the "Maritare 404.html" Claude Design file.
// Renders inside the ROOT layout (which only loads Geist), so the brand fonts
// (Fraunces/Instrument → font-display/font-body) are loaded here and scoped to
// this page's wrapper. Covers every notFound() — including a guest who opens an
// unpublished / removed invitation link.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan · Maritare",
};

// The detailed 5-petal Maritare bloom (logo + the "0" in 404). The simpler
// 6-ellipse mark used for the background scatter is the shared <FlowerMark/>.
function BloomMark({ className }: { className?: string }) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <svg viewBox="-50 -50 100 100" fill="none" className={cn("block w-full h-full", className)}>
      {petals.map((r) => (
        <g key={r} transform={`rotate(${r})`}>
          <path d="M 0 -36 C 14 -36 18 -14 0 -2 C -18 -14 -14 -36 0 -36 Z" fill="#B66B4D" />
          <path d="M 0 -28 C 6 -28 8 -16 0 -8 C -8 -16 -6 -28 0 -28 Z" fill="#D4906F" />
        </g>
      ))}
      <circle r="9" cx="0" cy="0" fill="#7C2D2D" />
      <circle r="2" cx="0" cy="-3" fill="#EAD3C2" />
      <circle r="1.6" cx="3.5" cy="2" fill="#EAD3C2" />
      <circle r="1.6" cx="-3.5" cy="2" fill="#EAD3C2" />
    </svg>
  );
}

// Faint floral scatter behind the content (top value, left value, px size,
// rotation deg, opacity) — ported 1:1 from the design's petal spec.
const PETALS = [
  { t: "-3%", l: "-3%", s: 210, r: 18, o: 0.08 },
  { t: "12%", l: "87%", s: 140, r: -14, o: 0.08 },
  { t: "70%", l: "-4%", s: 175, r: 28, o: 0.07 },
  { t: "78%", l: "89%", s: 200, r: -22, o: 0.08 },
  { t: "44%", l: "5%", s: 88, r: 8, o: 0.06 },
  { t: "34%", l: "91%", s: 78, r: -30, o: 0.06 },
] as const;

export default function NotFound() {
  return (
    <div
      className={`${fraunces.variable} ${instrumentSans.variable} relative min-h-dvh flex flex-col items-center justify-center overflow-x-hidden px-6 py-16 font-body text-charcoal`}
      style={{
        background:
          "radial-gradient(110% 75% at 50% -15%, #F1E4D4 0%, transparent 55%), var(--color-ivory)",
      }}
    >
      {/* Faint floral scatter */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {PETALS.map((p, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: p.t,
              left: p.l,
              width: p.s,
              height: p.s,
              opacity: p.o,
              transform: `rotate(${p.r}deg)`,
            }}
          >
            <FlowerMark size={p.s} color="#D4906F" core="#7C2D2D" stamen="#EAD3C2" />
          </div>
        ))}
      </div>

      {/* Wordmark */}
      <div className="relative z-[1] mb-16 inline-flex items-start gap-[2px] font-display font-black [font-variation-settings:'opsz'_48] text-[30px] leading-none tracking-[-0.03em] lowercase text-charcoal">
        maritare
        <span className="w-4 h-4 self-start -translate-y-px">
          <BloomMark />
        </span>
      </div>

      <main className="relative z-[1] w-full max-w-[620px] text-center">
        {/* Label */}
        <div className="inline-flex items-center gap-[13px] text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7C7E5E] mb-[18px]">
          <span className="w-[26px] h-px bg-[#C9BC9A]" />
          Error 404
          <span className="w-[26px] h-px bg-[#C9BC9A]" />
        </div>

        {/* 404 — the "0" is the bloom mark */}
        <div
          className="flex items-center justify-center gap-[0.02em] font-display font-bold [font-variation-settings:'opsz'_144] leading-[0.86] tracking-[-0.03em] text-burgundy m-0 mb-2"
          style={{ fontSize: "clamp(140px, 30vw, 260px)" }}
        >
          <span>4</span>
          <span className="inline-flex items-center justify-center" style={{ width: "0.62em" }}>
            <span className="block" style={{ width: "0.66em", height: "0.66em" }}>
              <BloomMark />
            </span>
          </span>
          <span>4</span>
        </div>

        <h1 className="mx-auto mt-2 mb-4 max-w-[16ch] font-display font-medium [font-variation-settings:'opsz'_144] text-[clamp(28px,5.5vw,42px)] leading-[1.06] tracking-[-0.028em] text-charcoal">
          Halaman ini <em className="font-display italic text-burgundy">tidak ditemukan.</em>
        </h1>

        <p className="mx-auto mb-9 max-w-[44ch] font-body text-[15.5px] leading-[1.62] text-[#5C5852] [text-wrap:pretty]">
          Sepertinya tautan yang kamu buka sudah dipindahkan, kedaluwarsa, atau tidak
          pernah ada. Mari kita antar kamu kembali ke tempat yang tepat.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-[13px]">
          <Link
            href="/"
            className="inline-flex h-[50px] items-center gap-[9px] rounded-full bg-burgundy px-[26px] font-body text-[12.5px] font-medium uppercase tracking-[0.1em] text-cream no-underline transition-colors hover:bg-burgundy-deep"
          >
            <Icon name="home" size={16} strokeWidth={1.7} />
            Kembali ke Beranda
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-[50px] items-center gap-[9px] rounded-full border border-[rgba(26,26,26,0.2)] bg-transparent px-[26px] font-body text-[12.5px] font-medium uppercase tracking-[0.1em] text-charcoal no-underline transition-colors hover:border-charcoal"
          >
            <Icon name="users" size={16} strokeWidth={1.7} />
            Buka Dashboard
          </Link>
        </div>

        {/* Footnote — design used a sample couple; swapped for a brand line so the
            production 404 never shows fake names. */}
        <div className="mt-[46px] inline-flex items-center gap-3 font-display italic text-[14px] text-[#8B8478]">
          <span className="w-[22px] h-px bg-[#C9BC9A]" />
          Undangan pernikahan digital
          <span className="w-[22px] h-px bg-[#C9BC9A]" />
        </div>
      </main>
    </div>
  );
}

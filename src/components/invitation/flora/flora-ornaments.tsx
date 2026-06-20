// Flora Atelier ornament layer.
//
// Two families live here:
// 1. `OrnamentImg` + `FallingPetals` — the lush painted layer. Public-domain
//    botanical watercolors (see public/invitation/ornaments/ATTRIBUTION.md),
//    pre-processed with a real alpha channel (paper keyed to transparent by
//    scripts/fetch-ornaments.mjs), so they composite cleanly on ANY surface —
//    light sections or the dark burgundy footer alike. No blend-mode needed.
// 2. The original thin-stroke SVG line ornaments (FloraDivider, FloraArch, …)
//    that still serve as dividers and frames.

import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------- */
/* Painted watercolor layer                                                 */
/* ----------------------------------------------------------------------- */

export type OrnamentAsset =
  | "rose-white"
  | "lily-white"
  | "rose-red"
  | "anemone-red"
  | "bouquet-blush"
  | "peony-blush"
  | "fern-green"
  | "bird-pair";

// Assets are pre-keyed (transparent paper) and trimmed, so no clip/blend is
// needed. `opacityClass` is purely an aesthetic softener for a given placement.
const ORNAMENT_ASSETS: Record<OrnamentAsset, { src: string; opacityClass?: string }> = {
  "rose-white": { src: "/invitation/ornaments/rose-white.webp" },
  "lily-white": { src: "/invitation/ornaments/lily-white.webp" },
  "rose-red": { src: "/invitation/ornaments/rose-red.webp" },
  "anemone-red": { src: "/invitation/ornaments/anemone-red.webp" },
  "bouquet-blush": { src: "/invitation/ornaments/bouquet-blush.webp" },
  "peony-blush": { src: "/invitation/ornaments/peony-blush.webp" },
  "fern-green": { src: "/invitation/ornaments/fern-green.webp" },
  "bird-pair": { src: "/invitation/ornaments/bird-pair.webp" },
};

type OrnamentImgProps = {
  asset: OrnamentAsset;
  /**
   * Positioning/size/static-rotation classes for the WRAPPER (e.g.
   * "absolute -left-14 -top-8 w-40 rotate-12"). Static transforms live on the
   * wrapper so the sway animation (which owns `transform` on the inner img)
   * never overwrites them.
   */
  className?: string;
  /** Flip horizontally — the reference's "same PNG on the opposite corner". */
  mirrored?: boolean;
  /** Ambient breathing (animate-inv-sway on the inner img). */
  sway?: boolean;
  /** transform-origin for the sway — anchor at the stem side. */
  swayOrigin?: "origin-bottom" | "origin-top" | "origin-bottom-left" | "origin-bottom-right" | "origin-top-left" | "origin-top-right";
};

export function OrnamentImg({
  asset,
  className,
  mirrored = false,
  sway = false,
  swayOrigin = "origin-bottom",
}: OrnamentImgProps) {
  const meta = ORNAMENT_ASSETS[asset];
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none block select-none", mirrored && "-scale-x-100", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative ornament; plain img + lazy keeps it out of the critical path and away from the image optimizer */}
      <img
        src={meta.src}
        alt=""
        loading="lazy"
        draggable={false}
        className={cn(
          "h-auto w-full",
          meta.opacityClass,
          sway && cn("animate-inv-sway", swayOrigin),
        )}
      />
    </span>
  );
}

/* ----------------------------------------------------------------------- */
/* Falling petals                                                           */
/* ----------------------------------------------------------------------- */

type PetalSpec = {
  /** Horizontal position, 4%–92%. */
  left: string;
  /** Width in px (14–30). */
  size: number;
  /** animation-duration seconds (15–30, varied). */
  duration: number;
  /** NEGATIVE animation-delay seconds so petals are mid-fall on load. */
  delay: number;
  /** Burgundy/terracotta fill tone. */
  tone: string;
  fillOpacity: number;
};

// Deterministic constants — NO Math.random (hydration safety).
const COVER_PETALS: PetalSpec[] = [
  { left: "4%", size: 20, duration: 19, delay: -3, tone: "#7c2d2d", fillOpacity: 0.85 },
  { left: "14%", size: 14, duration: 26, delay: -12, tone: "#b66b4d", fillOpacity: 0.7 },
  { left: "26%", size: 24, duration: 17, delay: -7, tone: "#8a3535", fillOpacity: 0.8 },
  { left: "38%", size: 16, duration: 28, delay: -18, tone: "#a14a3e", fillOpacity: 0.65 },
  { left: "50%", size: 22, duration: 21, delay: -5, tone: "#7c2d2d", fillOpacity: 0.75 },
  { left: "62%", size: 15, duration: 30, delay: -15, tone: "#b66b4d", fillOpacity: 0.6 },
  { left: "73%", size: 26, duration: 16, delay: -9, tone: "#8a3535", fillOpacity: 0.85 },
  { left: "84%", size: 18, duration: 24, delay: -2, tone: "#a14a3e", fillOpacity: 0.7 },
  { left: "92%", size: 30, duration: 20, delay: -13, tone: "#7c2d2d", fillOpacity: 0.65 },
];

// Sparser, softer layer drifting over the whole page after open.
const PAGE_PETALS: PetalSpec[] = [
  { left: "6%", size: 16, duration: 23, delay: -6, tone: "#7c2d2d", fillOpacity: 0.5 },
  { left: "28%", size: 20, duration: 18, delay: -14, tone: "#b66b4d", fillOpacity: 0.45 },
  { left: "52%", size: 14, duration: 29, delay: -3, tone: "#8a3535", fillOpacity: 0.5 },
  { left: "71%", size: 22, duration: 20, delay: -10, tone: "#a14a3e", fillOpacity: 0.45 },
  { left: "89%", size: 17, duration: 25, delay: -17, tone: "#7c2d2d", fillOpacity: 0.5 },
];

type FallingPetalsProps = {
  /** cover = dense 9-petal layer; page = sparse soft 5-petal layer. */
  variant?: "cover" | "page";
  /** Positioning of the overlay itself (defaults to absolute inset-0). */
  className?: string;
};

export function FallingPetals({ variant = "cover", className }: FallingPetalsProps) {
  const petals = variant === "cover" ? COVER_PETALS : PAGE_PETALS;
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {petals.map((petal, i) => (
        <span
          key={i}
          className="absolute block animate-inv-petal-fall"
          style={{
            left: petal.left,
            width: petal.size,
            animationDuration: `${petal.duration}s`,
            animationDelay: `${petal.delay}s`,
          }}
        >
          {/* simple curved-teardrop petal */}
          <svg viewBox="0 0 24 30" className="h-auto w-full">
            <path
              d="M12 1.5C18.8 7 21.4 15.8 12.6 28.2C4.6 16.6 4.4 8.4 12 1.5Z"
              fill={petal.tone}
              fillOpacity={petal.fillOpacity}
            />
          </svg>
        </span>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Original hand-drawn botanical line-art ornaments.                        */
/* All strokes use currentColor so callers tint them with text-* utilities. */
/* ----------------------------------------------------------------------- */

type OrnamentProps = {
  className?: string;
};

/** Five-petal open bloom with a stamen dot — the Flora signature mark. */
export function FloraBloom({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        {[0, 72, 144, 216, 288].map((deg) => (
          <path
            key={deg}
            d="M24 22C20.5 17 20.5 10.5 24 6.5C27.5 10.5 27.5 17 24 22Z"
            transform={`rotate(${deg} 24 24)`}
          />
        ))}
        <circle cx="24" cy="24" r="2.4" />
      </g>
    </svg>
  );
}

/** Slender curved branch with alternating leaves and berry dots. */
export function FloraSprig({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 58C24 48 32 32 34 8" />
        <path d="M30 44C23 43 17 38 15 31C22 32 28 37 30 44Z" />
        <path d="M33 30C39 27 42 21 42 14C36 17 33 23 33 30Z" />
        <path d="M31 38C26 34 24 28 25 22C30 26 32 32 31 38Z" />
        <path d="M34 18C38 15 40 11 40 6C36 9 34 13 34 18Z" />
        <circle cx="14" cy="50" r="1.3" />
        <circle cx="44" cy="22" r="1.3" />
      </g>
    </svg>
  );
}

/**
 * Corner cluster — two layered stems, leaves and a bloom, drawn for the
 * top-left corner; rotate via className for the other corners.
 */
export function FloralCorner({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 160 160" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        {/* primary stem sweeping out of the corner */}
        <path d="M6 24C38 30 78 50 102 92C112 110 116 128 114 150" />
        {/* secondary inner stem */}
        <path d="M8 60C34 66 58 82 72 108C78 119 81 132 80 146" />
        {/* leaves on the primary stem */}
        <path d="M44 36C38 28 36 18 39 9C46 15 48 26 44 36Z" />
        <path d="M64 46C56 41 51 33 50 23C58 27 63 36 64 46Z" />
        <path d="M84 62C75 60 68 54 64 45C73 46 80 52 84 62Z" />
        <path d="M99 82C90 82 82 78 76 70C85 69 93 73 99 82Z" />
        <path d="M108 104C99 106 90 104 83 98C91 94 101 96 108 104Z" />
        {/* leaves on the secondary stem */}
        <path d="M34 70C28 64 25 56 26 47C33 51 36 61 34 70Z" />
        <path d="M52 86C45 83 40 76 38 68C46 70 51 77 52 86Z" />
        <path d="M66 106C59 105 53 100 50 93C58 93 64 98 66 106Z" />
        {/* bloom near the corner */}
        {[0, 72, 144, 216, 288].map((deg) => (
          <path
            key={deg}
            d="M22 17.4C19.8 14.2 19.8 10.2 22 7.6C24.2 10.2 24.2 14.2 22 17.4Z"
            transform={`rotate(${deg} 22 20)`}
          />
        ))}
        <circle cx="22" cy="20" r="1.6" />
        {/* berries */}
        <circle cx="112" cy="124" r="1.5" />
        <circle cx="119" cy="116" r="1.2" />
        <circle cx="86" cy="128" r="1.3" />
      </g>
    </svg>
  );
}

/** Thin rule broken by a center bud with two flanking leaves. */
export function FloraDivider({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 240 28" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14H88" />
        <path d="M152 14H236" />
        {/* flanking leaves */}
        <path d="M104 14C99 11 96 7 96 2C101 5 104 9 104 14Z" />
        <path d="M136 14C141 11 144 7 144 2C139 5 136 9 136 14Z" />
        <path d="M104 14C99 17 96 21 96 26C101 23 104 19 104 14Z" />
        <path d="M136 14C141 17 144 21 144 26C139 23 136 19 136 14Z" />
        {/* center bud */}
        <path d="M120 8C117 11 117 17 120 20C123 17 123 11 120 8Z" />
        <circle cx="120" cy="14" r="4.6" />
      </g>
    </svg>
  );
}

/**
 * Decorative double-line arch crowned by a bloom and flanking sprigs —
 * the cover's framing motif.
 */
export function FloraArch({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 200 130" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        {/* double arch */}
        <path d="M30 128V86C30 47 61 22 100 22C139 22 170 47 170 86V128" />
        <path d="M40 128V88C40 53 67 31 100 31C133 31 160 53 160 88V128" />
        {/* crown bloom */}
        {[0, 72, 144, 216, 288].map((deg) => (
          <path
            key={deg}
            d="M100 9.8C98 7 98 3.4 100 1.2C102 3.4 102 7 100 9.8Z"
            transform={`rotate(${deg} 100 12) translate(0 0)`}
          />
        ))}
        <circle cx="100" cy="12" r="1.5" />
        {/* flanking sprigs falling along the arch */}
        <path d="M58 30C50 24 46 16 46 7" />
        <path d="M53 24C48 23 44 20 42 15" />
        <path d="M56 27C56 22 58 18 62 15" />
        <path d="M142 30C150 24 154 16 154 7" />
        <path d="M147 24C152 23 156 20 158 15" />
        <path d="M144 27C144 22 142 18 138 15" />
        {/* berries at the arch feet */}
        <circle cx="30" cy="80" r="1.3" />
        <circle cx="170" cy="80" r="1.3" />
      </g>
    </svg>
  );
}

// Scarlet (Katsudoto "Anselma & Alvaro" tribute) ornament layer.
//
// This template composites the reference's OWN raster assets (copied into
// public/invitation/scarlet/): misty engraving backdrops (bg-cover mountains,
// bg-sd Prambanan temple), warm-brown/gold carved frames (frame-cover arch,
// frame-event Javanese gateway, frame-qt gold scroll, frame-bank card), deep
// maroon megamendung/batik shields + peonies (Orn-*), gold sumping tassels and
// filigree dividers, and naturalistic hummingbirds (Orn-burung-*).
//
// NOTE: these are the reference vendor's proprietary images, used here at the
// owner's explicit request for their own platform. Swap for own-licensed art
// before production. See the matching note in scarlet-template.tsx.

import { cn } from "@/lib/utils";

const BASE = "/invitation/scarlet";

/** Decorative raster asset from the Scarlet pack. `name` = filename w/o ext. */
export function ScarletImg({
  name,
  className,
  mirrored = false,
  sway = false,
  swayOrigin = "origin-bottom",
  ext = "png",
}: {
  name: string;
  /** Positioning/size/static-rotation classes for the WRAPPER. */
  className?: string;
  /** Flip horizontally — "same art on the opposite corner". */
  mirrored?: boolean;
  /** Ambient breathing (animate-inv-sway on the inner img). */
  sway?: boolean;
  swayOrigin?:
    | "origin-bottom"
    | "origin-top"
    | "origin-bottom-left"
    | "origin-bottom-right"
    | "origin-top-left"
    | "origin-top-right";
  ext?: "png" | "jpg" | "webp";
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none block select-none", mirrored && "-scale-x-100", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative ornament; plain img + lazy keeps it off the critical path and away from the image optimizer */}
      <img
        src={`${BASE}/${name}.${ext}`}
        alt=""
        loading="lazy"
        draggable={false}
        className={cn("h-auto w-full", sway && cn("animate-inv-sway", swayOrigin))}
      />
    </span>
  );
}

// ── Named roles (filenames mapped to meaning, so sections read clearly) ──────

/** Misty mountain engraving — the cover backdrop. */
export const BG_COVER = "bg-cover";
/** Misty Prambanan-temple engraving — the section backdrop. */
export const BG_SECTION = "bg-sd";

/** Warm-brown rounded arch outline — frames the cover/hero portrait. */
export const FRAME_ARCH = "frame-cover";
/** Carved gold Javanese gateway (gebyok) — frames event cards. */
export const FRAME_GATE = "frame-event";
/** Gold baroque scroll crown — tops the quote. */
export const FRAME_SCROLL = "frame-qt";
/** Cream card with ornamental brown border — gift/amplop cards. */
export const FRAME_CARD = "frame-bank";

/** Gold filigree horizontal divider. */
export const DIVIDER_GOLD = "Orn-cp";
/** Gold sumping tassel that hangs from a corner. */
export const TASSEL_GOLD = "Orn-30";
/** Deep-maroon megamendung/batik gunungan shield — heading flanker. */
export const SHIELD_RED = "Orn-23";
/** Deep-maroon peony bloom — photo corner cluster. */
export const PEONY_RED = "Orn-26";
/** Hummingbirds. */
export const BIRD_1 = "Orn-burung-1";
export const BIRD_2 = "Orn-burung-2";

/** Gold joglo pavilion landmark. */
export const JOGLO = "Orn-53";
/** Traditional Javanese bride/groom figures (paes), flank the cover. */
export const FIGURE_L = "Orn-09";
export const FIGURE_R = "Orn-10";

/**
 * The lush deep-red / burgundy peony + rose clusters that define the reference's
 * floral framing (see the ornament contact sheet). These are the rich blooms —
 * NOT the pale sprigs — used around the cover arch, couple frames and corners.
 */
export const FLORAL = {
  /** Dense dark-burgundy peony + rose cluster (the richest). */
  burgundyCluster: "Orn-17",
  /** Red + white rose cluster, full. */
  roseClusterA: "Orn-45",
  /** Red + white rose cluster, alt. */
  roseClusterB: "Orn-56",
  /** Deep-red rose cluster. */
  redRoses: "Orn-25",
  /** Red roses, smaller. */
  redRosesSm: "Orn-19",
  /** Red/pink rose bouquet. */
  bouquet: "Orn-02",
  /** Single deep-red peony bloom. */
  peony: "Orn-22",
} as const;

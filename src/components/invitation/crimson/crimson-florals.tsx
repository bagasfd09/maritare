// Crimson Pavilion — the LUSH painted layer, built from the couple's OWN
// licensed watercolor florals (public/invitation/crimson/florals/*.webp). These
// are real-alpha transparent webp so they composite cleanly on the crimson and
// parchment surfaces alike, exactly like Flora's OrnamentImg — but this set is
// Crimson-specific (deep maroon roses + gold leaves, red hibiscus/peony banks,
// the hanging gold Javanese ornament) so the cover and sections read like the
// Javanese-heritage reference: a dense red-rose oval border + gold accents.
//
// Rendered as a plain <img loading="lazy" alt="" aria-hidden> (no next/image):
// these are decorative, kept out of the critical path and the image optimizer.

import { cn } from "@/lib/utils";

export type CrimsonFloral =
  // THE signature cluster — maroon roses + peony + gold leaves. Use heavily,
  // large, mirrored, banked along the cover bottom and section corners.
  | "burgundy-roses"
  // horizontal red hibiscus + peony + sage bank — perfect for the cover bottom.
  | "hibiscus-peony"
  // horizontal white peony + red alstroemeria bank.
  | "peony-alstroemeria"
  | "lily-red" // tall red lily + foliage spray.
  | "bee-balm-red" // single dramatic red bloom.
  | "peony-pink" // single soft-pink peony on a stem.
  | "pastel-chrysanthemum" // pink chrysanthemum + sage cluster.
  | "babys-breath" // white gypsophila bouquet (soft filler).
  | "white-umbel" // white umbel + green foliage cluster.
  | "green-leaves" // sage leaf branch (foliage filler).
  // hanging GOLD Javanese ornament — the recurring gold accent / section crown.
  | "gold-ornament";

const FLORAL_SRC: Record<CrimsonFloral, string> = {
  "burgundy-roses": "/invitation/crimson/florals/burgundy-roses-bouquet.webp",
  "hibiscus-peony": "/invitation/crimson/florals/hibiscus-peony-arrangement.webp",
  "peony-alstroemeria": "/invitation/crimson/florals/peony-alstroemeria-bouquet.webp",
  "lily-red": "/invitation/crimson/florals/lily-red.webp",
  "bee-balm-red": "/invitation/crimson/florals/bee-balm-red.webp",
  "peony-pink": "/invitation/crimson/florals/peony-pink.webp",
  "pastel-chrysanthemum": "/invitation/crimson/florals/pastel-chrysanthemum-bouquet.webp",
  "babys-breath": "/invitation/crimson/florals/babys-breath-bouquet.webp",
  "white-umbel": "/invitation/crimson/florals/white-umbel-cluster.webp",
  "green-leaves": "/invitation/crimson/florals/green-leaves-branch.webp",
  "gold-ornament": "/invitation/crimson/florals/gold-ornament.webp",
};

type CrimsonFloralImgProps = {
  asset: CrimsonFloral;
  /**
   * Positioning/size/static-rotation classes for the WRAPPER (e.g.
   * "absolute -left-14 -bottom-8 w-56 rotate-6"). Static transforms live on the
   * wrapper so the sway animation (which owns `transform` on the inner img)
   * never overwrites them.
   */
  className?: string;
  /** Flip horizontally — the reference's "same bouquet, opposite corner". */
  mirrored?: boolean;
  /** Ambient breathing (animate-inv-sway on the inner img). */
  sway?: boolean;
  /** transform-origin for the sway — anchor at the stem/bank side. */
  swayOrigin?:
    | "origin-bottom"
    | "origin-top"
    | "origin-bottom-left"
    | "origin-bottom-right"
    | "origin-top-left"
    | "origin-top-right";
};

export function CrimsonFloralImg({
  asset,
  className,
  mirrored = false,
  sway = false,
  swayOrigin = "origin-bottom",
}: CrimsonFloralImgProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none block select-none", mirrored && "-scale-x-100", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative watercolor floral; plain img + lazy keeps it off the critical path and away from the image optimizer */}
      <img
        src={FLORAL_SRC[asset]}
        alt=""
        loading="lazy"
        draggable={false}
        className={cn("h-auto w-full", sway && cn("animate-inv-sway", swayOrigin))}
      />
    </span>
  );
}

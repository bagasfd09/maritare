// Photo gallery — 2-column grid where every 3rd photo spans the full width.
// Heading flanked by mirrored rose clusters; photos zoom in staggered.

import type { InvitationPhoto } from "@/server/queries/invitation";

import { FloraDivider, OrnamentImg } from "./flora-ornaments";
import { Reveal } from "./reveal";

type FloraGalleryProps = {
  photos: InvitationPhoto[];
  /** "Groom & Bride" — used for the alt fallback. */
  coupleLabel: string;
};

export function FloraGallery({ photos, coupleLabel }: FloraGalleryProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden px-8 py-16 text-center">
      {/* flanking clusters around the heading */}
      <Reveal variant="fade-right" className="pointer-events-none absolute -left-12 -top-6 w-32">
        <OrnamentImg asset="rose-white" className="rotate-[22deg]" sway swayOrigin="origin-bottom-right" />
      </Reveal>
      <Reveal variant="fade-left" className="pointer-events-none absolute -right-12 -top-6 w-32">
        <OrnamentImg
          asset="rose-white"
          mirrored
          className="-rotate-[22deg]"
          sway
          swayOrigin="origin-bottom-left"
        />
      </Reveal>

      <div className="relative">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-ink">
          Galeri
        </p>
        <h2 className="mt-4 font-display text-[28px] font-bold tracking-[-0.02em] text-charcoal [font-variation-settings:'opsz'_96]">
          Potret <span className="font-normal italic text-burgundy">kebersamaan</span>
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-2.5">
          {photos.map((photo, i) => (
            <Reveal
              key={photo.id}
              variant="zoom-in"
              delay={(i % 3) * 120}
              className={
                i % 3 === 2
                  ? "col-span-2 aspect-[16/10] overflow-hidden rounded-xl bg-beige"
                  : "aspect-[4/5] overflow-hidden rounded-xl bg-beige"
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL with query string; next/image would re-proxy and break the short-lived signature */}
              <img
                src={photo.url}
                alt={photo.label ?? `Galeri ${coupleLabel}`}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
              />
            </Reveal>
          ))}
        </div>

        <FloraDivider className="mx-auto mt-14 w-48 text-rule" />
      </div>
    </section>
  );
}

// Photo gallery — 2-column grid where every 3rd photo spans the full width.
// Heading flanked by mirrored rose clusters; photos zoom in staggered, each
// framed by a thin gold hairline.

import type { InvitationPhoto } from "@/server/queries/invitation";

import { Reveal } from "../flora/reveal";
import { CrimsonFloralImg } from "./crimson-florals";
import { CrimsonDivider } from "./crimson-ornaments";

type CrimsonGalleryProps = {
  photos: InvitationPhoto[];
  /** "Groom & Bride" — used for the alt fallback. */
  coupleLabel: string;
};

export function CrimsonGallery({ photos, coupleLabel }: CrimsonGalleryProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden px-8 py-16 text-center">
      {/* hanging gold ornament crowning the section */}
      <Reveal variant="fade-down" className="pointer-events-none absolute left-1/2 -top-2 w-14 -translate-x-1/2">
        <CrimsonFloralImg asset="gold-ornament" sway swayOrigin="origin-top" />
      </Reveal>

      {/* maroon rose clusters flanking the heading */}
      <Reveal variant="fade-right" className="pointer-events-none absolute -left-16 -top-6 w-44">
        <CrimsonFloralImg asset="burgundy-roses" className="rotate-[22deg]" sway swayOrigin="origin-bottom-right" />
      </Reveal>
      <Reveal variant="fade-left" className="pointer-events-none absolute -right-16 -top-6 w-44">
        <CrimsonFloralImg
          asset="burgundy-roses"
          mirrored
          className="-rotate-[22deg]"
          sway
          swayOrigin="origin-bottom-left"
        />
      </Reveal>

      <div className="relative mt-8">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.34em] text-[#7C7E5E]">
          Galeri
        </p>
        <h2 className="mt-4 [font-family:var(--font-cormorant)] text-[34px] font-normal tracking-[0.01em] text-[#8B1E2D]">
          Potret <span className="italic text-[#C9A24B]">kebersamaan</span>
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-2.5">
          {photos.map((photo, i) => (
            <Reveal
              key={photo.id}
              variant="zoom-in"
              delay={(i % 3) * 120}
              className={
                i % 3 === 2
                  ? "col-span-2 aspect-[16/10] overflow-hidden rounded-xl border border-[#C9A24B]/60 bg-[#EFE3CC] p-1"
                  : "aspect-[4/5] overflow-hidden rounded-xl border border-[#C9A24B]/60 bg-[#EFE3CC] p-1"
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL with query string; next/image would re-proxy and break the short-lived signature */}
              <img
                src={photo.url}
                alt={photo.label ?? `Galeri ${coupleLabel}`}
                loading="lazy"
                className="h-full w-full rounded-lg object-cover transition duration-500 hover:scale-[1.03]"
              />
            </Reveal>
          ))}
        </div>

        <CrimsonDivider className="mx-auto mt-14 w-52 text-[#C9A24B]" />
      </div>
    </section>
  );
}

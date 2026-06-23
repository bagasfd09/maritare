"use client";

// Folk gallery — a featured photo above a swipeable thumbnail strip (CSS
// scroll-snap, no carousel library; tapping a thumbnail swaps the featured
// photo via a single useState). Crowned with gold sumping tassels and anchored
// by burgundy florals so it reads as one family with the quote/couple sections.
//
// Curation rule mirrors ScarletGallery: only owner-selected gallery photos
// appear (never the cover/closing photos). Hidden entirely when none are picked.

import { useState } from "react";

import type { InvitationView } from "@/server/queries/invitation";

import { Reveal } from "../flora/reveal";
import { InvImage } from "../scarlet/inv-image";
import { FLORAL, ScarletImg, TASSEL_GOLD } from "../scarlet/scarlet-ornaments";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

export function FolkGallery({ data }: Props) {
  const selected = new Set(data.sections.galeri.selectedPhotoIds);
  const photos = data.photos.filter((p) => !p.isCover && !p.isClosing && selected.has(p.id));
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return null;
  }

  // Clamp against a shrinking set (the editor live-edits the selection).
  const current = photos[Math.min(active, photos.length - 1)] ?? photos[0];
  const coupleLabel = `${data.groomName} & ${data.brideName}`;

  return (
    <section className="relative overflow-hidden px-7 pb-16 pt-24 text-center">
      {/* Gold sumping tassels draping from the top corners. */}
      <ScarletImg name={TASSEL_GOLD} mirrored className="absolute -top-2 left-0 z-10 w-20" />
      <ScarletImg name={TASSEL_GOLD} className="absolute -top-2 right-0 z-10 w-20" />
      {/* Burgundy florals anchoring the bottom corners (gentle ambient sway). */}
      <ScarletImg
        name={FLORAL.burgundyCluster}
        className="absolute -bottom-3 -left-10 z-10 w-28 -rotate-6"
        sway
        swayOrigin="origin-bottom-left"
      />
      <ScarletImg
        name={FLORAL.burgundyCluster}
        mirrored
        className="absolute -bottom-3 -right-10 z-10 w-28 rotate-6"
        sway
        swayOrigin="origin-bottom-right"
      />

      <Reveal>
        <h2 className="[font-family:var(--font-pinyon)] text-[44px] leading-none text-[#700f06]">
          Our Gallery
        </h2>
      </Reveal>

      {/* Featured photo — keyed by id so each selection fades in cleanly. */}
      <Reveal variant="zoom-in" className="relative mx-auto mt-8 max-w-[300px]">
        <div className="rounded-[22px] border-[3px] border-[#F5EFE0] bg-[#F5EFE0] p-1.5 shadow-[0_18px_38px_-26px_rgba(0,0,0,0.5)]">
          <div className="aspect-[4/5] overflow-hidden rounded-[16px] bg-[#E8D6C2]">
            <InvImage
              key={current.id}
              src={current.url}
              alt={current.label ?? coupleLabel}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </Reveal>

      {/* Swipeable thumbnail strip — only when there's more than one photo. */}
      {photos.length > 1 && (
        <div className="relative mx-auto mt-4 max-w-[320px]">
          <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {photos.map((photo, i) => {
              const isActive = photo.id === current.id;
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Lihat foto ${i + 1}`}
                  className={`snap-start shrink-0 overflow-hidden rounded-[8px] border-2 transition ${
                    isActive
                      ? "border-[#700f06]"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className="block h-[62px] w-[62px] bg-[#E8D6C2]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- presigned/public R2 URL; next/image would re-proxy and break the short-lived signature */}
                    <img
                      src={photo.url}
                      alt=""
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

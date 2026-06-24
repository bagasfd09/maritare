"use client";

// Folk gallery — a faithful port of the Katsudoto "Anselma & Alvaro" reference:
// ONE large ornately-framed photo shown at a time (no thumbnail strip), navigated
// by prev/next arrows that wrap around. The frame bursts with the reference's own
// florals — maroon shields rotating out of the top corners (Orn-23), big peony
// sprays on the bottom sides (Orn-27 + swaying Orn-28 accent) and peony clusters
// at the bottom corners (Orn-26 + Orn-29) — crowned by gold sumping tassels
// (Orn-30) at the section's top corners. Slick's center carousel becomes a single
// useState index here; no carousel library.
//
// Curation rule mirrors ScarletGallery: only owner-selected gallery photos appear
// (never the cover/closing photos). Hidden entirely when none are picked.

import { useState } from "react";

import type { InvitationView } from "@/server/queries/invitation";

import { Reveal } from "../flora/reveal";
import { InvImage } from "../scarlet/inv-image";
import { ScarletImg, PEONY_RED, SHIELD_RED, TASSEL_GOLD } from "../scarlet/scarlet-ornaments";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

export function FolkGallery({ data }: Props) {
  const selected = new Set(data.sections.galeri.selectedPhotoIds);
  const photos = data.photos.filter((p) => !p.isCover && !p.isClosing && selected.has(p.id));
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return null;
  }

  // Clamp against a shrinking set (the editor live-edits the selection).
  const idx = Math.min(active, photos.length - 1);
  const current = photos[idx] ?? photos[0];
  const coupleLabel = `${data.groomName} & ${data.brideName}`;
  const go = (delta: number) => setActive((photos.length + idx + delta) % photos.length);

  return (
    <section className="relative overflow-hidden px-5 pb-[7%] pt-[30%] text-center">
      {/* Gold sumping tassels draping from the section's top corners. */}
      <ScarletImg
        name={TASSEL_GOLD}
        sway
        swayOrigin="origin-top-left"
        className="absolute left-0 top-0 z-10 w-[48%] max-w-[180px] -translate-x-[14%] translate-y-[6%]"
      />
      <ScarletImg
        name={TASSEL_GOLD}
        mirrored
        sway
        swayOrigin="origin-top-right"
        className="absolute right-0 top-0 z-10 w-[48%] max-w-[180px] translate-x-[14%] translate-y-[6%]"
      />

      <Reveal>
        <h2 className="[font-family:var(--font-pinyon)] text-[44px] leading-none text-[#700f06]">
          Our Gallery
        </h2>
      </Reveal>

      {/* Carousel: one ornately-framed photo, arrows on each side. */}
      <div className="relative mx-auto mt-6 max-w-[420px] px-2">
        <Reveal variant="zoom-in" className="relative mx-auto w-[300px] max-w-[80vw]">
          {/* Florals BEHIND the photo frame ─────────────────────────────── */}
          {/* Maroon shields rotating out of the top corners. */}
          <ScarletImg
            name={SHIELD_RED}
            className="absolute left-0 top-0 z-0 w-[59%] -translate-x-[33%] -translate-y-[4%] -rotate-[18deg]"
          />
          <ScarletImg
            name={SHIELD_RED}
            mirrored
            className="absolute right-0 top-0 z-0 w-[59%] translate-x-[33%] -translate-y-[4%] rotate-[18deg]"
          />
          {/* Big peony sprays on the bottom sides. */}
          <ScarletImg
            name="Orn-27"
            className="absolute bottom-0 left-0 z-0 w-[47%] -translate-x-[50%]"
          />
          <ScarletImg
            name="Orn-27"
            mirrored
            className="absolute bottom-0 right-0 z-0 w-[47%] translate-x-[50%]"
          />
          {/* Swaying accent bloom tucked over each spray. */}
          <ScarletImg
            name="Orn-28"
            sway
            className="absolute bottom-[8%] left-0 z-0 w-[30%] -translate-x-[42%]"
          />
          <ScarletImg
            name="Orn-28"
            mirrored
            sway
            className="absolute bottom-[8%] right-0 z-0 w-[30%] translate-x-[42%]"
          />

          {/* The featured photo — keyed by id so each step fades in cleanly. */}
          <div className="relative z-10 rounded-[20px] bg-[#F5EFE0] p-1.5 shadow-[0_18px_38px_-26px_rgba(0,0,0,0.5)]">
            <div className="aspect-[3/4] overflow-hidden rounded-[16px] bg-[#E8D6C2]">
              <InvImage
                key={current.id}
                src={current.url}
                alt={current.label ?? coupleLabel}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Peony clusters IN FRONT at the bottom corners. */}
          <ScarletImg
            name={PEONY_RED}
            className="absolute bottom-0 left-0 z-20 w-[20%] -translate-x-[46%] translate-y-[10%]"
          />
          <ScarletImg
            name="Orn-29"
            className="absolute bottom-0 left-0 z-20 w-[18%] -translate-x-[78%] -translate-y-[2%]"
          />
          <ScarletImg
            name={PEONY_RED}
            mirrored
            className="absolute bottom-0 right-0 z-20 w-[20%] translate-x-[46%] translate-y-[10%]"
          />
          <ScarletImg
            name="Orn-29"
            mirrored
            className="absolute bottom-0 right-0 z-20 w-[18%] translate-x-[78%] -translate-y-[2%]"
          />
        </Reveal>

        {/* Prev / next arrows (hidden for a single photo). */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Foto sebelumnya"
              className="absolute left-0 top-1/2 z-30 -translate-y-1/2 p-2.5 text-[#700f06] opacity-60 transition hover:opacity-100"
            >
              <Chevron className="rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Foto berikutnya"
              className="absolute right-0 top-1/2 z-30 -translate-y-1/2 p-2.5 text-[#700f06] opacity-60 transition hover:opacity-100"
            >
              <Chevron />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip — the other gallery photos, centered and swipeable.
          Tapping one makes it the featured photo (mirrors the reference's
          center-mode photo-slider). */}
      {photos.length > 1 && (
        <div className="-mx-5 mt-8">
          <div className="flex gap-2 overflow-x-auto px-[calc(50%-55px)] pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {photos.map((photo, i) => {
              const isActive = photo.id === current.id;
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Lihat foto ${i + 1}`}
                  className={`snap-center shrink-0 overflow-hidden rounded-[4px] border-2 transition ${
                    isActive ? "border-[#700f06]" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className="block h-[80px] w-[110px] bg-[#E8D6C2]">
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

function Chevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 20" width="12" height="20" fill="none" aria-hidden="true" className={className}>
      <path d="M2 2l8 8-8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

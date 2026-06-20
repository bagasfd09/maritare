// Photo gallery — a scrapbook-style folk grid (rounded corners, slight per-tile
// rotation), zoom-in reveals, with watercolor florals tucked at the section
// corners. Skipped entirely when there are no photos.

import type { InvitationPhoto } from "@/server/queries/invitation";

import { Reveal } from "../flora/reveal";
import { FolkFloral, FolkSectionHeading } from "./folk-ornaments";

type FolkGalleryProps = {
  photos: InvitationPhoto[];
  coupleLabel: string;
};

// Deterministic scrapbook tilts (no Math.random → hydration-safe).
const TILTS = ["rotate-[-2.5deg]", "rotate-[1.8deg]", "rotate-[2.2deg]", "rotate-[-1.6deg]"];

export function FolkGallery({ photos, coupleLabel }: FolkGalleryProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden px-5 pb-12 text-center">
      {/* watercolor accents tucked at the section corners */}
      <FolkFloral
        name="flowers-on-rock"
        className="pointer-events-none absolute -right-8 top-2 w-[110px] select-none opacity-80"
      />
      <FolkFloral
        name="white-umbel-cluster"
        className="pointer-events-none absolute -left-10 bottom-0 w-[120px] select-none opacity-75"
      />

      <Reveal>
        <FolkSectionHeading eyebrow="Galeri" tone="onOlive">
          Potret <span className="text-[#E8A0B8]">kebersamaan</span>
        </FolkSectionHeading>
      </Reveal>

      <div className="relative mt-8 grid grid-cols-2 gap-3">
        {photos.map((photo, i) => (
          <Reveal
            key={photo.id}
            variant="zoom-in"
            delay={(i % 3) * 120}
            className={
              i % 3 === 2
                ? "col-span-2 rounded-[20px] border-[3px] border-[#F5EFE0] bg-[#F5EFE0] p-1.5 shadow-[0_14px_30px_-22px_rgba(0,0,0,0.5)]"
                : `${TILTS[i % TILTS.length]} rounded-[20px] border-[3px] border-[#F5EFE0] bg-[#F5EFE0] p-1.5 shadow-[0_14px_30px_-22px_rgba(0,0,0,0.5)]`
            }
          >
            <div
              className={
                i % 3 === 2
                  ? "aspect-[16/10] overflow-hidden rounded-[14px] bg-[#E8D6C2]"
                  : "aspect-[4/5] overflow-hidden rounded-[14px] bg-[#E8D6C2]"
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL with query string; next/image would re-proxy and break the short-lived signature */}
              <img
                src={photo.url}
                alt={photo.label ?? `Galeri ${coupleLabel}`}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 hover:scale-[1.04]"
              />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

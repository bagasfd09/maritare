"use client";

// Folk "Our Story" — a horizontal slideshow of story chapters instead of one
// long downward column. Each chapter (cerita.items) is one swipeable slide built
// to the Screenshot_89 reference: the photo sits in a deep-maroon rounded frame
// with a cream description panel below it (where the reference's "Open Link"
// button sits) holding the chapter title + prose. Around the frame, lush
// burgundy/rose florals are STACKED the way ScarletCouple frames its photos —
// shields behind the top corners, rose clusters climbing both side edges, and
// layered peony + rose bouquets spilling from the bottom corners.
//
// Photos are gallery references (photoId) resolved against data.photos client-
// side, like FolkGallery. When a wedding has no items yet, the legacy free-text
// cerita.body is parsed into chapters so older stories still render.

import { useRef, useState } from "react";

import type { InvitationView } from "@/server/queries/invitation";
import { cn } from "@/lib/utils";

import { Reveal } from "../flora/reveal";
import { InvImage } from "../scarlet/inv-image";
import { FLORAL, PEONY_RED, ScarletImg, SHIELD_RED } from "../scarlet/scarlet-ornaments";
import { parseStoryChapters } from "./folk-story-parse";

type FolkStoryProps = { data: InvitationView };

type Slide = { photoUrl?: string; title?: string; body: string };

const MAROON = "#6e1219";

export function FolkStory({ data }: FolkStoryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const cerita = data.sections.cerita;
  const byId = new Map(data.photos.map((p) => [p.id, p]));

  // Prefer the structured items; fall back to parsing the legacy free-text body.
  const raw: Slide[] = cerita.items?.length
    ? cerita.items.map((it) => ({
        photoUrl: it.photoId ? byId.get(it.photoId)?.url : undefined,
        title: it.title,
        body: it.body ?? "",
      }))
    : parseStoryChapters(cerita.body ?? "").map((c) => ({ title: c.title, body: c.body }));
  const slides = raw.filter((s) => s.photoUrl || s.title?.trim() || s.body.trim());

  function goTo(i: number) {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
    setActive(next);
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    if (i !== active) setActive(i);
  }

  if (slides.length === 0) {
    return null;
  }

  const heading = cerita.title?.trim() || "Our Story";
  const single = slides.length === 1;
  const coupleLabel = `${data.groomName} & ${data.brideName}`;

  return (
    <section className="relative overflow-hidden bg-[#F5F2E4] px-4 pb-8 pt-16 text-center">
      <div className="relative z-10">
      <Reveal>
        {/* Orn-52 flanks the heading the way the "Ucapan & Doa" (wishes) section
            does: large clusters anchored to the corners and bled ~52% off each
            edge (left mirrored, right upright), so one bloom sits beside the text
            and the rest spills off — not a small whole-cluster inline. */}
        <div className="relative mx-auto max-w-[440px]">
          <ScarletImg
            name="Orn-52"
            ext="webp"
            mirrored
            className="absolute left-0 top-1/2 z-0 w-[34%] max-w-[140px] -translate-x-[52%] -translate-y-1/2"
          />
          <ScarletImg
            name="Orn-52"
            ext="webp"
            className="absolute right-0 top-1/2 z-0 w-[34%] max-w-[140px] -translate-y-1/2 translate-x-[52%]"
          />
          <h2 className="relative z-10 [font-family:var(--font-cormorant)] text-[40px] font-light italic leading-none text-[#6e1219]">
            {heading}
          </h2>
        </div>
      </Reveal>

      <Reveal variant="zoom-in" className="mt-10">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden pb-5 pt-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, i) => {
            return (
              <div
                key={i}
                className="flex min-w-full shrink-0 snap-center items-stretch justify-center px-6"
              >
                <div className="relative flex w-[290px] max-w-[80vw] flex-col">
                  <CardFlorals />

                  {/* Maroon frame: photo on top, cream description panel below.
                      flex-col + flex-1 so every card fills the (equal) slide height
                      regardless of how much text it has. */}
                  <div
                    className="relative z-10 flex flex-1 flex-col rounded-[22px] p-2.5 shadow-[0_24px_46px_-28px_rgba(50,8,8,0.65)]"
                    style={{ backgroundColor: MAROON }}
                  >
                    {slide.photoUrl && (
                      <div className="shrink-0 overflow-hidden rounded-[15px] bg-[#E8D6C2]">
                        <div className="aspect-[4/3]">
                          <InvImage
                            src={slide.photoUrl}
                            alt={slide.title || coupleLabel}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <div
                      className={cn(
                        "relative flex flex-1 flex-col justify-center overflow-hidden rounded-[14px] border bg-[#fbf4e6] px-5 py-5 text-center",
                        slide.photoUrl && "mt-2.5",
                      )}
                      style={{ borderColor: `${MAROON}33` }}
                    >
                      {/* Burgundy cluster as a faint watermark BEHIND the text. */}
                      <ScarletImg
                        name={FLORAL.burgundyCluster}
                        className="pointer-events-none absolute -bottom-3 left-1/2 z-0 w-[88%] -translate-x-1/2 opacity-[0.13]"
                      />
                      <div className="relative z-10">
                        {slide.title && (
                          <h3
                            className="line-clamp-2 [font-family:var(--font-cormorant)] text-[22px] font-medium italic leading-tight break-words"
                            style={{ color: MAROON }}
                          >
                            {slide.title}
                          </h3>
                        )}
                        <span
                          aria-hidden
                          className="mx-auto my-3 block h-px w-12"
                          style={{ backgroundColor: `${MAROON}40` }}
                        />
                        {/* One clamped block (whitespace-pre-line keeps paragraph
                            breaks). Long stories truncate to … so all cards match. */}
                        <p className="line-clamp-[7] whitespace-pre-line text-[12.5px] leading-[1.95] text-[#6f5b49] break-words">
                          {slide.body.trim()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Arrows + dots. */}
        {!single && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <SlideArrow dir="prev" disabled={active === 0} onClick={() => goTo(active - 1)} />
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Ke babak ${i + 1}`}
                  aria-current={i === active}
                  onClick={() => goTo(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === active ? "w-5 bg-[#6e1219]" : "w-2 bg-[#6e1219]/30",
                  )}
                />
              ))}
            </div>
            <SlideArrow
              dir="next"
              disabled={active === slides.length - 1}
              onClick={() => goTo(active + 1)}
            />
          </div>
        )}
      </Reveal>
      </div>
    </section>
  );
}

// Lush, layered floral frame around one story card — the ScarletCouple stacking
// vocabulary, mirrored left/right: maroon shields behind the top corners, big
// rose clusters climbing both side edges, and peony + rose bouquets stacked at
// the bottom corners (a couple in front of the frame, a couple behind it).
function CardFlorals() {
  return (
    <>
      {/* BEHIND the frame (z-0) — only the parts past the frame edge show. */}
      <ScarletImg
        name={SHIELD_RED}
        className="absolute left-0 top-0 z-0 w-[50%] -translate-x-[30%] -translate-y-[8%] -rotate-[16deg]"
      />
      <ScarletImg
        name={SHIELD_RED}
        mirrored
        className="absolute right-0 top-0 z-0 w-[50%] translate-x-[30%] -translate-y-[8%] rotate-[16deg]"
      />
      {/* rose clusters climbing the side edges */}
      <ScarletImg
        name={FLORAL.redRoses}
        className="absolute left-0 top-[22%] z-0 w-[44%] -translate-x-[50%]"
      />
      <ScarletImg
        name={FLORAL.redRoses}
        mirrored
        className="absolute right-0 top-[22%] z-0 w-[44%] translate-x-[50%]"
      />
      {/* big peony sprays behind the bottom sides */}
      <ScarletImg
        name="Orn-27"
        className="absolute bottom-0 left-0 z-0 w-[48%] -translate-x-[44%] translate-y-[6%]"
      />
      <ScarletImg
        name="Orn-27"
        mirrored
        className="absolute bottom-0 right-0 z-0 w-[48%] translate-x-[44%] translate-y-[6%]"
      />

      {/* IN FRONT of the frame (z-20) — stacked bouquets on the bottom corners.
          (Orn-17 burgundy cluster now lives behind the text, not here.) */}
      <ScarletImg
        name={FLORAL.redRosesSm}
        className="absolute bottom-0 left-0 z-20 w-[26%] -translate-x-[62%] translate-y-[2%]"
      />
      <ScarletImg
        name={FLORAL.redRosesSm}
        mirrored
        className="absolute bottom-0 right-0 z-20 w-[26%] translate-x-[62%] translate-y-[2%]"
      />
      <ScarletImg
        name={PEONY_RED}
        sway
        className="absolute bottom-0 left-0 z-20 w-[24%] translate-x-[14%] translate-y-[26%]"
      />
      <ScarletImg
        name={PEONY_RED}
        mirrored
        sway
        className="absolute bottom-0 right-0 z-20 w-[24%] -translate-x-[14%] translate-y-[26%]"
      />
    </>
  );
}

function SlideArrow({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Babak sebelumnya" : "Babak selanjutnya"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#6e1219]/40 text-[#6e1219] transition disabled:opacity-30"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path
          d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

"use client";
/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */
// Ivory "Our Love Story" — the Katsudoto Aulia <section.love-story> design, but
// presented as a HORIZONTAL SLIDER (folk-story pattern) instead of one long
// downward column: each cerita item is one swipeable slide (the gold frame-ls
// photo + ornament cluster + sub-title, then its caption), with arrows + dots
// below. The scroll-snap track / goTo / onScroll mechanism mirrors folk-story.
//
// NOTE: no data-aos inside the slides — a slide scrolled off to the right isn't
// vertically-intersecting, so the ivory AOS observer would leave it opacity-0
// (blank) after swiping to it. The reveal is dropped per-slide (folk does the
// same); only the section heading keeps its data-aos.
//
// Data: data.sections.cerita. Mirrors folk-story's items-vs-legacy-body fallback
// and self-hide. Photos are gallery references resolved against data.photos.
// A chapter becomes a slide only when it has a photo (1 slide = 1 foto) — text-
// only chapters don't make a bare slide; see the slides filter below.

import { Fragment, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { InvitationView } from "@/server/queries/invitation";

import { parseStoryChapters } from "../folk/folk-story-parse";
import { InvImage } from "../scarlet/inv-image";

const BASE = "/invitation/ivory";
const MAROON = "#723d4c";

type IvoryStoryProps = { data: InvitationView };

type Slide = { photoUrl?: string; title?: string; body: string };

export function IvoryStory({ data }: IvoryStoryProps) {
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
  // One slide per PHOTO ("1 slide = 1 foto"): a chapter only becomes its own
  // slide when it has a photo — a chapter with just text no longer produces a
  // bare, photoless slide. Fallback: if NO chapter has a photo (e.g. a legacy
  // free-text story, or all chapters are text-only), show the text chapters so
  // nothing is lost.
  const withPhoto = raw.filter((s) => s.photoUrl);
  const slides =
    withPhoto.length > 0 ? withPhoto : raw.filter((s) => s.title?.trim() || s.body.trim());

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

  const single = slides.length === 1;
  const coupleLabel = `${data.groomName} & ${data.brideName}`;

  return (
    <section className="love-story" data-section-order="love_story">
      <div className="ornaments-wrapper" />

      <div className=" story-inner">
        <div className="story-head">
          <h1 className="story-title" data-aos="zoom-in" data-aos-duration="1000">
            Our Love Story
          </h1>
        </div>

        <div className="story-body">
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {slides.map((slide, i) => (
              <div
                key={i}
                // w/min/max all 100%: without the max, the flex item grows to the
                // frame art's natural 722px and one photo spans two snap points.
                className="w-full min-w-full max-w-full shrink-0 snap-center overflow-hidden"
              >
                {/* Preview — framed photo + sub-title */}
                {(slide.photoUrl || slide.title?.trim()) && (
                  <div className="story__slider-preview">
                    <div className="story-preview">
                      {slide.photoUrl && (
                        <div className="story-picture-wrapper">
                          <div className="story-picture">
                            <div className="ls-img-content">
                              <InvImage src={slide.photoUrl} alt={slide.title?.trim() || coupleLabel} />
                            </div>
                            <div className="image-wrap">
                              <img loading="lazy" decoding="async" src={`${BASE}/frame-ls.png`} alt="Ornament" />
                            </div>
                          </div>

                          <div className="ornaments-wrapper">
                            <div className="orn-ls-4">
                              <div className="image-wrap">
                                <img loading="lazy" decoding="async" src={`${BASE}/Orn-02.png`} alt="Ornament" />
                              </div>
                            </div>
                            <div className="orn-ls-3">
                              <div className="image-wrap">
                                <img loading="lazy" decoding="async" src={`${BASE}/Orn-55.png`} alt="Ornament" />
                              </div>
                              <div className="orn-ls-3-1">
                                <div className="image-wrap">
                                  <img loading="lazy" decoding="async" src={`${BASE}/Orn-56.png`} alt="Ornament" />
                                </div>
                              </div>
                              <div className="orn-ls-3-2">
                                <div className="image-wrap">
                                  <img loading="lazy" decoding="async" src={`${BASE}/Orn-18.png`} alt="Ornament" />
                                </div>
                              </div>
                            </div>
                            <div className="orn-ls-2 left">
                              <div className="image-wrap">
                                <img loading="lazy" decoding="async" src={`${BASE}/Orn-54.png`} alt="Ornament" />
                              </div>
                            </div>
                            <div className="orn-ls-1">
                              <div className="image-wrap">
                                <img loading="lazy" decoding="async" src={`${BASE}/Orn-53.png`} alt="Ornament" />
                              </div>
                            </div>
                            {/* RIGHT  */}
                            <div className="orn-ls-2 right">
                              <div className="image-wrap">
                                <img loading="lazy" decoding="async" src={`${BASE}/Orn-54.png`} alt="Ornament" />
                              </div>
                            </div>
                            <div className="orn-ls-9">
                              <div className="image-wrap">
                                <img loading="lazy" decoding="async" src={`${BASE}/Orn-15.png`} alt="Ornament" />
                              </div>
                            </div>
                            <div className="orn-ls-8">
                              <div className="orn-ls-8-1">
                                <div className="image-wrap">
                                  <img loading="lazy" decoding="async" src={`${BASE}/Orn-16.png`} alt="Ornament" />
                                </div>
                              </div>
                              <div className="image-wrap">
                                <img loading="lazy" decoding="async" src={`${BASE}/Orn-58.png`} alt="Ornament" />
                              </div>
                            </div>
                            <div className="orn-ls-7">
                              <div className="image-wrap">
                                <img loading="lazy" decoding="async" src={`${BASE}/Orn-50.png`} alt="Ornament" />
                              </div>
                            </div>
                            <div className="orn-ls-6">
                              <div className="image-wrap">
                                <img loading="lazy" decoding="async" src={`${BASE}/Orn-02.png`} alt="Ornament" />
                              </div>
                            </div>
                            <div className="orn-ls-5">
                              <div className="image-wrap">
                                <img loading="lazy" decoding="async" src={`${BASE}/Orn-57.png`} alt="Ornament" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {slide.title?.trim() && (
                        <h3 className="story-sub-title">{slide.title}</h3>
                      )}
                    </div>
                  </div>
                )}

                {/* Caption */}
                {slide.body.trim() && (
                  <div className="story__slider-caption-wrap">
                    <div className="story__slider-caption">
                      <div className="story-details-wrapper">
                        <div className="story-details">
                          <p className="story-caption">
                            {slide.body
                              .trim()
                              .split("\n")
                              .map((line, j, lines) => (
                                <Fragment key={j}>
                                  {line}
                                  {j < lines.length - 1 && <br />}
                                </Fragment>
                              ))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Arrows + dots (ivory maroon) — hidden for a single chapter. */}
          {!single && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <StoryArrow dir="prev" disabled={active === 0} onClick={() => goTo(active - 1)} />
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
                      i === active ? "w-5" : "w-2 opacity-30",
                    )}
                    style={{ backgroundColor: MAROON }}
                  />
                ))}
              </div>
              <StoryArrow
                dir="next"
                disabled={active === slides.length - 1}
                onClick={() => goTo(active + 1)}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StoryArrow({
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
      className="flex h-9 w-9 items-center justify-center rounded-full border transition disabled:opacity-30"
      style={{ borderColor: `${MAROON}66`, color: MAROON }}
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

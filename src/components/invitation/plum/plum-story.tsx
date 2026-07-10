"use client";
/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */
// Plum "Cerita kami" love-story — the Kinanti framed-photo + caption-card design
// presented as a HORIZONTAL SLIDER (folk/ivory/sienna pattern) instead of one
// long downward column: each cerita chapter is one swipeable slide (orn-cluster
// framed photo, then its sub-title + caption card), with arrows + dots below.
// The scroll-snap track / goTo / onScroll mechanism mirrors folk-story.
//
// 1 slide = 1 foto: only chapters WITH a photo become slides; when NO chapter
// has a photo (legacy free-text story, all-text chapters) the text chapters
// show instead so nothing is lost.
//
// NOTE: no data-aos inside the slides — a slide scrolled off to the right isn't
// vertically-intersecting, so the AOS observer would leave it opacity-0 (blank)
// after swiping to it. Only the section heading keeps its reveal.

import { Fragment, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { InvitationView } from "@/server/queries/invitation";

import { parseStoryChapters } from "../folk/folk-story-parse";
import { InvImage } from "../scarlet/inv-image";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
};

type Slide = { photoUrl?: string; title?: string; body: string };

// Plum accents (from the .plum-inv.original preset palette).
const PLUM = "#613947";
const BROWN = "#57411c";

export function PlumStory({ data }: Props) {
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
  // One slide per PHOTO; text-only chapters render only when no photo exists at all.
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

  const heading = cerita.title?.trim() || "Cerita kami";
  const single = slides.length === 1;
  const coupleLabel = `${data.brideName} & ${data.groomName}`;

  return (
    <section className="love-story" data-section-order="love_story">
      <div className=" story-inner">
        <div className="story-head">
          <h1 className="story-title" data-aos="zoom-in" data-aos-duration="1000">
            {heading}
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
                // w/min/max all 100%: without the max, a flex item can grow to
                // its content and one photo would span two snap points.
                className="w-full min-w-full max-w-full shrink-0 snap-center overflow-hidden"
              >
                {/* Preview */}
                {slide.photoUrl && (
                  <div className="story__slider-preview">
                    <div className="story-preview">
                      <div className="preview-wrap">
                        <div className="ornaments-wrapper">
                          <div className="orn-story--bottom bl-1">
                            <div className="image-wrap">
                              <img loading="lazy" decoding="async" src="/invitation/plum/orn-22-min.png" alt="Ornament" />
                            </div>
                          </div>
                          <div className="orn-story--bottom bl-2">
                            <div className="image-wrap">
                              <img loading="lazy" decoding="async" src="/invitation/plum/orn-3-min.png" alt="Ornament" />
                            </div>
                          </div>
                          <div className="orn-story--bottom br-1">
                            <div className="image-wrap">
                              <img loading="lazy" decoding="async" src="/invitation/plum/orn-22-min.png" alt="Ornament" />
                            </div>
                          </div>
                          <div className="orn-story--bottom br-2">
                            <div className="image-wrap">
                              <img loading="lazy" decoding="async" src="/invitation/plum/orn-3-min.png" alt="Ornament" />
                            </div>
                          </div>
                        </div>
                        <div className="story-picture">
                          <InvImage src={slide.photoUrl} alt={slide.title?.trim() || coupleLabel} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Caption */}
                {(slide.title?.trim() || slide.body.trim()) && (
                  <div className="story__slider-caption-wrap">
                    <div className="story__slider-caption">
                      <div className="story-details-card">
                        <div className="story-details-wrapper">
                          <div className="ornaments-wrapper">
                            <div className="orn-story--bottom bl-3">
                              <div className="image-wrap">
                                <img loading="lazy" decoding="async" src="/invitation/plum/orn-32-min.png" alt="Ornament" />
                              </div>
                            </div>
                            <div className="orn-story--bottom br-3">
                              <div className="image-wrap">
                                <img loading="lazy" decoding="async" src="/invitation/plum/orn-32-min.png" alt="Ornament" />
                              </div>
                            </div>
                          </div>
                          <div className="story-details">
                            {slide.title?.trim() && (
                              <p className="story-sub-title">{slide.title}</p>
                            )}
                            {slide.body.trim() && (
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
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Arrows + dots (plum) — hidden for a single chapter. */}
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
                    style={{ backgroundColor: PLUM }}
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
      style={{ borderColor: `${PLUM}66`, color: BROWN }}
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

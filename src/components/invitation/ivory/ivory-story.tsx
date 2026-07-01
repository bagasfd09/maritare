/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */
// Ivory "Our Love Story" — verbatim port of the Katsudoto Aulia <section.love-story>
// reference. The Aulia original is a pair of synced slick sliders (a framed photo +
// sub-title preview slider, and a prose caption slider). Slick is not loaded here, so
// it is rendered STATICALLY: each cerita item becomes one stacked slide — framed photo
// + sub-title, then its caption — repeated down the page. Class names match the scoped
// CSS under .ivory-inv so the gold frame + orn-ls ornament cluster render byte-identical.
//
// Data: data.sections.cerita. Mirrors folk-story's items-vs-legacy-body fallback and
// self-hide (parse the legacy free-text body when there are no structured items; render
// nothing when both are empty). Photos are gallery references resolved against
// data.photos and bound through InvImage; everything else is the reference's design copy.

import { Fragment } from "react";

import type { InvitationView } from "@/server/queries/invitation";

import { parseStoryChapters } from "../folk/folk-story-parse";
import { InvImage } from "../scarlet/inv-image";

const BASE = "/invitation/ivory";

type IvoryStoryProps = { data: InvitationView };

type Slide = { photoUrl?: string; title?: string; body: string };

export function IvoryStory({ data }: IvoryStoryProps) {
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

  if (slides.length === 0) {
    return null;
  }

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
          {slides.map((slide, i) => (
            <Fragment key={i}>
              {/* Preview */}
              {(slide.photoUrl || slide.title?.trim()) && (
                <div className="story__slider-preview">
                  <div className="story-preview">
                    {slide.photoUrl && (
                      <div className="story-picture-wrapper">
                        <div className="story-picture" data-aos="zoom-in" data-aos-duration="1000">
                          <div className="ls-img-content">
                            <InvImage src={slide.photoUrl} alt={slide.title?.trim() || coupleLabel} />
                          </div>
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="1000">
                            <img loading="lazy" decoding="async" src={`${BASE}/frame-ls.png`} alt="Ornament" />
                          </div>
                        </div>

                        <div className="ornaments-wrapper">
                          <div className="orn-ls-4">
                            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1500" data-aos-delay="900">
                              <img loading="lazy" decoding="async" src={`${BASE}/Orn-02.png`} alt="Ornament" />
                            </div>
                          </div>
                          <div className="orn-ls-3">
                            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1500" data-aos-delay="900">
                              <img loading="lazy" decoding="async" src={`${BASE}/Orn-55.png`} alt="Ornament" />
                            </div>
                            <div className="orn-ls-3-1">
                              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1500" data-aos-delay="1100">
                                <img loading="lazy" decoding="async" src={`${BASE}/Orn-56.png`} alt="Ornament" />
                              </div>
                            </div>
                            <div className="orn-ls-3-2">
                              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1500" data-aos-delay="1100">
                                <img loading="lazy" decoding="async" src={`${BASE}/Orn-18.png`} alt="Ornament" />
                              </div>
                            </div>
                          </div>
                          <div className="orn-ls-2 left">
                            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="800" data-aos-delay="800">
                              <img loading="lazy" decoding="async" src={`${BASE}/Orn-54.png`} alt="Ornament" />
                            </div>
                          </div>
                          <div className="orn-ls-1">
                            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="800" data-aos-delay="800">
                              <img loading="lazy" decoding="async" src={`${BASE}/Orn-53.png`} alt="Ornament" />
                            </div>
                          </div>
                          {/* RIGHT  */}
                          <div className="orn-ls-2 right">
                            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="800" data-aos-delay="800">
                              <img loading="lazy" decoding="async" src={`${BASE}/Orn-54.png`} alt="Ornament" />
                            </div>
                          </div>
                          <div className="orn-ls-9">
                            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="800" data-aos-delay="800">
                              <img loading="lazy" decoding="async" src={`${BASE}/Orn-15.png`} alt="Ornament" />
                            </div>
                          </div>
                          <div className="orn-ls-8">
                            <div className="orn-ls-8-1">
                              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="800" data-aos-delay="800">
                                <img loading="lazy" decoding="async" src={`${BASE}/Orn-16.png`} alt="Ornament" />
                              </div>
                            </div>
                            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="800" data-aos-delay="800">
                              <img loading="lazy" decoding="async" src={`${BASE}/Orn-58.png`} alt="Ornament" />
                            </div>
                          </div>
                          <div className="orn-ls-7">
                            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="800" data-aos-delay="800">
                              <img loading="lazy" decoding="async" src={`${BASE}/Orn-50.png`} alt="Ornament" />
                            </div>
                          </div>
                          <div className="orn-ls-6">
                            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="800" data-aos-delay="800">
                              <img loading="lazy" decoding="async" src={`${BASE}/Orn-02.png`} alt="Ornament" />
                            </div>
                          </div>
                          <div className="orn-ls-5">
                            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="800" data-aos-delay="800">
                              <img loading="lazy" decoding="async" src={`${BASE}/Orn-57.png`} alt="Ornament" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {slide.title?.trim() && (
                      <h3 className="story-sub-title" data-aos="fade-up" data-aos-duration="1000">
                        {slide.title}
                      </h3>
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
                        <p className="story-caption" data-aos="fade-up" data-aos-duration="1000">
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
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

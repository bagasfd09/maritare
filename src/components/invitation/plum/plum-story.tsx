/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */
// Plum "Cerita kami" love-story — verbatim port of the Katsudoto "Kinanti"
// (Arvi & Aditya) <section class="love-story" data-section-order="love_story">.
// The original is a pair of synced slick sliders (a framed-photo preview slider +
// a prose caption slider). Slick is not loaded here, so it renders STATICALLY:
// each cerita item becomes one stacked slide — the orn-cluster-framed photo, then
// its sub-title + caption card — repeated down the page (mirroring ivory-story's
// resolver, items-vs-legacy-body fallback, and self-hide). Class names match the
// scoped CSS under `.plum-inv` so the rounded photo + orn-story clusters render
// byte-identically; slick/lightgallery scaffolding (slick-*, lightgallery/lg-uid,
// the slide <a> link, the arrows + dots) and AOS runtime artifacts
// (aos-init/aos-animate + baked inline slide styles) are stripped, data-aos kept.
//
// Photos are gallery references (photoId) resolved against data.photos and bound
// through InvImage; the section heading binds to cerita.title with the reference's
// "Cerita kami" as the fallback. Every other label is the reference's design copy.

import { Fragment } from "react";

import type { InvitationView } from "@/server/queries/invitation";

import { parseStoryChapters } from "../folk/folk-story-parse";
import { InvImage } from "../scarlet/inv-image";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
};

type Slide = { photoUrl?: string; title?: string; body: string };

export function PlumStory({ data }: Props) {
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

  const heading = cerita.title?.trim() || "Cerita kami";
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
          {slides.map((slide, i) => (
            <Fragment key={i}>
              {/* Preview */}
              {slide.photoUrl && (
                <div className="story__slider-preview">
                  <div className="story-preview">
                    <div className="preview-wrap">
                      <div className="ornaments-wrapper">
                        <div className="orn-story--bottom bl-1">
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1500" data-aos-delay="100">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-22-min.png" alt="Ornament" />
                          </div>
                        </div>
                        <div className="orn-story--bottom bl-2">
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1500" data-aos-delay="200">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-3-min.png" alt="Ornament" />
                          </div>
                        </div>
                        <div className="orn-story--bottom br-1">
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1500" data-aos-delay="100">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-22-min.png" alt="Ornament" />
                          </div>
                        </div>
                        <div className="orn-story--bottom br-2">
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1500" data-aos-delay="200">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-3-min.png" alt="Ornament" />
                          </div>
                        </div>
                      </div>
                      <div className="story-picture" data-aos="zoom-in" data-aos-duration="1000">
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
                            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1500" data-aos-delay="100">
                              <img loading="lazy" decoding="async" src="/invitation/plum/orn-32-min.png" alt="Ornament" />
                            </div>
                          </div>
                          <div className="orn-story--bottom br-3">
                            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1500" data-aos-delay="100">
                              <img loading="lazy" decoding="async" src="/invitation/plum/orn-32-min.png" alt="Ornament" />
                            </div>
                          </div>
                        </div>
                        <div className="story-details">
                          {slide.title?.trim() && (
                            <p className="story-sub-title" data-aos="fade-up" data-aos-duration="1000">
                              {slide.title}
                            </p>
                          )}
                          {slide.body.trim() && (
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
                          )}
                        </div>
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

/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */
// Sienna "Meant to Be" love-story — verbatim Syakira port of
// <section class="love-story" data-section-order="love_story">. The reference is a
// column of `.story-item`s, each a lightgallery-framed photo + ornament beside a
// title + caption. Lightgallery is not loaded here, so the framed photo renders
// STATICALLY (the <a>/lg-uid hooks dropped) and the hardcoded items become a
// .map over data.sections.cerita — mirroring ivory-story's resolver, items-vs-
// legacy-body fallback, and self-hide. Class names match the scoped CSS under
// `.sienna-inv` so the rounded photo frame + orn cluster render byte-identical.
//
// Photos are gallery references (photoId) resolved against data.photos and bound
// through InvImage; the section heading binds to cerita.title (folk-story's
// editable-heading pattern) with the reference's "Meant to Be" as the fallback.
// Every other heading/label is the reference's design copy. data-aos delays use
// the reference's first-item values for every item (the cross-item escalation
// does not generalize past the original three items).

import { Fragment } from "react";

import type { InvitationView } from "@/server/queries/invitation";

import { parseStoryChapters } from "../folk/folk-story-parse";
import { InvImage } from "../scarlet/inv-image";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
};

type Slide = { photoUrl?: string; title?: string; body: string };

export function SiennaStory({ data }: Props) {
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

  const heading = cerita.title?.trim() || "Meant to Be";
  const coupleLabel = `${data.groomName} & ${data.brideName}`;

  return (
    <section className="love-story" data-section-order="love_story">
      <div className="ornaments-wrapper">
        <div className="orn-1">
          <div className="orn-2">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-story-1.png" alt="Orn 2" />
            </div>
          </div>
          <div className="image-wrap" data-aos="fade-right" data-aos-duration="1200" data-aos-delay="400">
            <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-1.png" alt="Orn 1" />
          </div>
        </div>
      </div>

      <div className="story-inner">
        <div className="story-head">
          <h1 className="story-title" data-aos="zoom-in" data-aos-duration="1000">
            {heading}
          </h1>
        </div>

        <div className="story-body">
          {/* Preview */}
          <div className="story-wrap">
            {slides.map((slide, i) => (
              <div className="story-item" key={i}>
                <div className="story-preview">
                  {slide.photoUrl && (
                    <div
                      className="story-picture"
                      data-aos="fade-up"
                      data-aos-duration="1000"
                      data-aos-delay="100"
                      style={{ borderTopLeftRadius: "200px", borderTopRightRadius: "200px" }}
                    >
                      <InvImage src={slide.photoUrl} alt={slide.title?.trim() || coupleLabel} />
                    </div>
                  )}

                  <div className="ornaments-wrapper">
                    <div className="orn-3">
                      <div className="image-wrap" data-aos="fade-right" data-aos-duration="1200" data-aos-delay="600">
                        <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-3-min.png" alt="Orn 1" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="story-content">
                  {slide.title?.trim() && (
                    <h3 className="story-label" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                      {slide.title}
                    </h3>
                  )}
                  {slide.body.trim() && (
                    <p className="story-caption" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300">
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

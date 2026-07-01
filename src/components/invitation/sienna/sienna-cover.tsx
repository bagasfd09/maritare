/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */
// Sienna cover (opening hero) — markup ported VERBATIM from the Syakira
// `<section class="cover">` fragment so the scoped CSS in the sienna theme
// (selectors under `.sienna-inv`) styles it byte-identically. Only the
// data-bearing parts are bound to InvitationView:
//   - couple display names in the foot <h1> (bride-first),
//   - the framed cover photo as a single <InvImage> (was a slick slide thumb).
// The .head logo-wrap monogram (no matching field) is dropped. Decorative
// ornaments and every data-aos attribute are kept; slick scaffolding is stripped.

import type { InvitationView } from "@/server/queries/invitation";

import { InvImage } from "../scarlet/inv-image";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
};

// Display name = the editable "Nama lengkap" (pasangan.fullName) first word,
// falling back to the wedding's top-level name. Editing the form updates this.
function firstName(fullName: string | undefined, fallback: string): string {
  const n = (fullName ?? "").trim() || fallback;
  return n.split(/\s+/)[0] || fallback;
}

export function SiennaCover({ data }: Props) {
  const coverPhoto = data.photos.find((p) => p.isCover) ?? data.photos[0];
  const groomFirst = firstName(data.sections.pasangan.groom.fullName, data.groomName);
  const brideFirst = firstName(data.sections.pasangan.bride.fullName, data.brideName);

  return (
    <section className="cover" data-section-order="cover">
      <div className="inner">
        <div className="head">
          <p
            className="top-text"
            data-aos="fade-down"
            data-aos-duration="1200"
            data-aos-delay="150"
          >
            The wedding Of
          </p>
        </div>

        <div
          className="body highlight"
          data-aos="zoom-in-up"
          data-aos-duration="1200"
          data-aos-delay="500"
        >
          <div className="cover-frame" id="coverFrame">
            <div className="preview-container cover-show" id="cover-main">
              <div className="picture mobile">
                {coverPhoto && (
                  <InvImage
                    priority
                    src={coverPhoto.url}
                    alt={coverPhoto.label ?? `Foto ${brideFirst} & ${groomFirst}`}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="ornaments-wrapper">
            <div className="orn-left">
              <div className="orn-6">
                <div
                  className="image-wrap"
                  data-aos="fade-down-right"
                  data-aos-duration="1000"
                  data-aos-delay="850"
                >
                  <img loading="lazy" decoding="async" src="/invitation/sienna/orn-event-2.png" alt="Orn 6" />
                </div>
              </div>
              <div className="orn-5">
                <div
                  className="image-wrap"
                  data-aos="fade-down-right"
                  data-aos-duration="1000"
                  data-aos-delay="800"
                >
                  <img loading="lazy" decoding="async" src="/invitation/sienna/orn-cover-1.png" alt="Orn 5" />
                </div>
              </div>
              <div className="orn-4">
                <div
                  className="image-wrap"
                  data-aos="fade-down-right"
                  data-aos-duration="1000"
                  data-aos-delay="750"
                >
                  <img loading="lazy" decoding="async" src="/invitation/sienna/orn-event-4.png" alt="Orn 4" />
                </div>
              </div>
              <div className="orn-3">
                <div
                  className="image-wrap"
                  data-aos="fade-down-right"
                  data-aos-duration="1000"
                  data-aos-delay="700"
                >
                  <img loading="lazy" decoding="async" src="/invitation/sienna/orn-event-tl-3.png" alt="Orn 3" />
                </div>
              </div>
              <div className="orn-2">
                <div
                  className="image-wrap"
                  data-aos="fade-down-right"
                  data-aos-duration="1000"
                  data-aos-delay="650"
                >
                  <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-9.png" alt="Orn 2" />
                </div>
              </div>
              <div
                className="image-wrap"
                data-aos="fade-down-right"
                data-aos-duration="1000"
                data-aos-delay="600"
              >
                <img loading="lazy" decoding="async" src="/invitation/sienna/orn-event-tl-4.png" alt="Orn 1" />
              </div>
            </div>

            <div className="orn-right">
              <div className="orn-1">
                <div
                  className="image-wrap"
                  data-aos="fade-up-left"
                  data-aos-duration="1000"
                  data-aos-delay="600"
                >
                  <img loading="lazy" decoding="async" src="/invitation/sienna/orn-event-5.png" alt="Orn 1" />
                </div>
              </div>
              <div
                className="image-wrap"
                data-aos="fade-up-right"
                data-aos-duration="1000"
                data-aos-delay="650"
              >
                <img loading="lazy" decoding="async" src="/invitation/sienna/orn-cover-1.png" alt="Orn 2" />
              </div>
              <div className="orn-3">
                <div
                  className="image-wrap"
                  data-aos="fade-up-left"
                  data-aos-duration="1000"
                  data-aos-delay="700"
                >
                  <img loading="lazy" decoding="async" src="/invitation/sienna/orn-event-4.png" alt="Orn 3" />
                </div>
              </div>
              <div className="orn-4">
                <div
                  className="image-wrap"
                  data-aos="fade-up-left"
                  data-aos-duration="1000"
                  data-aos-delay="750"
                >
                  <img loading="lazy" decoding="async" src="/invitation/sienna/orn-event-2.png" alt="Orn 4" />
                </div>
              </div>
              <div className="orn-5">
                <div
                  className="image-wrap"
                  data-aos="fade-up-right"
                  data-aos-duration="1000"
                  data-aos-delay="800"
                >
                  <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-9.png" alt="Orn 5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="foot">
          <h1
            className="prime-title"
            data-aos="fade-up"
            data-aos-duration="1200"
            data-aos-delay="0"
          >
            {brideFirst} &amp; {groomFirst}
          </h1>
        </div>
      </div>
    </section>
  );
}

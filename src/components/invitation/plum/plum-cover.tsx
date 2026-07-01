/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */
// Plum cover (opening hero) — markup ported VERBATIM from the Katsudoto
// `<section class="cover-wrap">` fragment so the scoped CSS in the plum theme
// (selectors under `.plum-inv`) styles it byte-identically. Only the
// data-bearing parts are bound to InvitationView:
//   - couple display names in the prime-title <h1> (bride-first),
//   - the framed cover photo as a single <InvImage> (was a slick slide thumb).
// The cover-logo monogram (no matching field) and the hashtag bottom-text (no
// field) are dropped. Decorative ornaments and every data-aos attribute are
// kept; slick scaffolding is stripped.

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

export function PlumCover({ data }: Props) {
  const coverPhoto = data.photos.find((p) => p.isCover) ?? data.photos[0];
  const groomFirst = firstName(data.sections.pasangan.groom.fullName, data.groomName);
  const brideFirst = firstName(data.sections.pasangan.bride.fullName, data.brideName);

  return (
    <section className="cover-wrap" data-section-order="cover">
      <div className="ornaments-wrapper">
        <div className="bg-cover-forest">
          <div
            className="image-wrap"
            data-aos="zoom-out"
            data-aos-duration="1200"
            data-aos-delay="100"
          >
            <img loading="lazy" decoding="async" src="/invitation/plum/bg-overlay-min.png" alt="Ornament" />
          </div>
        </div>
        <div className="bg-cover-mount">
          <div
            className="image-wrap"
            data-aos="zoom-out"
            data-aos-duration="1200"
            data-aos-delay="200"
          >
            <img loading="lazy" decoding="async" src="/invitation/plum/bg-min.png" alt="Ornament" />
          </div>
        </div>
      </div>

      <div className="cover-inner covers desktop">
        <div className="cover-illustration show-logo">
          <div className="cover-illustration-head">
            <p
              className="top-text"
              data-aos="fade-down"
              data-aos-duration="1000"
            >
              The Wedding of
            </p>

            <h1
              className="prime-title"
              data-aos="zoom-in"
              data-aos-duration="1000"
              data-aos-delay="200"
            >
              {brideFirst} &amp; {groomFirst}
            </h1>
          </div>
          <div className="cover-illustration-body">
            <div className="cover-details">
              <div
                className="cover-highlight have-desktop-coverhave-mobile-cover"
                data-aos="zoom-in"
                data-aos-duration="1200"
                data-aos-delay="100"
              >
                {/* PREVIEW */}
                <div className="cover-preview-wrap">
                  <div className="cover-preview cover-show" id="cover-main">
                    <div className="cover-picture desktop">
                      <div className="cover-picture-image">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ornaments-wrapper">
        <div className="orn-cover--bottom bl-6">
          <div
            className="image-wrap"
            data-aos="fade-up"
            data-aos-duration="1200"
            data-aos-delay="100"
          >
            <img loading="lazy" decoding="async" src="/invitation/plum/orn-31-min.png" alt="Ornament" />
          </div>
          <div className="orn-cover--bottom bl-8 have-mobile-cover have-desktop-cover">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="200"
            >
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-31-min.png" alt="Ornament" />
            </div>
          </div>
        </div>
        <div className="orn-cover--bottom br-2">
          <div
            className="image-wrap"
            data-aos="fade-up"
            data-aos-duration="1200"
            data-aos-delay="100"
          >
            <img loading="lazy" decoding="async" src="/invitation/plum/orn-31-min.png" alt="Ornament" />
          </div>
          <div className="orn-cover--bottom bl-8 have-mobile-cover have-desktop-cover">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="200"
            >
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-31-min.png" alt="Ornament" />
            </div>
          </div>
        </div>

        <div className="orn-cover--bottom bc have-mobile-cover have-desktop-cover">
          <div
            className="image-wrap"
            data-aos="fade-up"
            data-aos-duration="1200"
            data-aos-delay="100"
          >
            <img loading="lazy" decoding="async" src="/invitation/plum/orn-34-min.png" alt="Ornament" />
          </div>
        </div>

        <div className="orn-cover--bottom br-1">
          <div className="orn-cover--bottom bl-7">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="100"
            >
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-1-min.png" alt="Ornament" />
            </div>
          </div>
          <div className="orn-cover--bottom bl-5">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="200"
            >
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-33-min.png" alt="Ornament" />
            </div>
          </div>
          <div className="orn-cover--bottom bl-4">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="300"
            >
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-21-min.png" alt="Ornament" />
            </div>
          </div>
          <div className="orn-cover--bottom bl-3">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="400"
            >
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-9-min.png" alt="Ornament" />
            </div>
          </div>
          <div className="orn-cover--bottom bl-2">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="500"
            >
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-3-min.png" alt="Ornament" />
            </div>
          </div>
          <div
            className="image-wrap"
            data-aos="fade-up"
            data-aos-duration="1200"
            data-aos-delay="600"
          >
            <img loading="lazy" decoding="async" src="/invitation/plum/orn-20-min.png" alt="Ornament" />
          </div>
        </div>

        <div className="orn-cover--bottom bl-1">
          <div className="orn-cover--bottom bl-7">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="100"
            >
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-1-min.png" alt="Ornament" />
            </div>
          </div>
          <div className="orn-cover--bottom bl-5">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="200"
            >
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-33-min.png" alt="Ornament" />
            </div>
          </div>
          <div className="orn-cover--bottom bl-4">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="300"
            >
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-21-min.png" alt="Ornament" />
            </div>
          </div>
          <div className="orn-cover--bottom bl-3">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="400"
            >
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-9-min.png" alt="Ornament" />
            </div>
          </div>
          <div className="orn-cover--bottom bl-2">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="500"
            >
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-3-min.png" alt="Ornament" />
            </div>
          </div>
          <div
            className="image-wrap"
            data-aos="fade-up"
            data-aos-duration="1200"
            data-aos-delay="600"
          >
            <img loading="lazy" decoding="async" src="/invitation/plum/orn-20-min.png" alt="Ornament" />
          </div>
        </div>
      </div>
    </section>
  );
}

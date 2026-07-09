/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */
// Ivory cover (opening hero) — markup ported VERBATIM from the Aulia
// `<section class="cover">` fragment so the scoped CSS in the ivory theme
// (selectors under `.ivory-inv`) styles it byte-identically. Only the
// data-bearing parts are bound to InvitationView:
//   - couple display names in the head <h1> (bride-first),
//   - the framed cover photo as a single <InvImage> (was a slick slide thumb).
// The .logo-wrap monogram and .foot hashtag (no matching fields) are dropped.
// Decorative ornaments, butterflies and every data-aos attribute are kept.

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

export function IvoryCover({ data }: Props) {
  const coverPhoto = data.photos.find((p) => p.isCover) ?? data.photos[0];
  const groomFirst = firstName(data.sections.pasangan.groom.fullName, data.groomName);
  const brideFirst = firstName(data.sections.pasangan.bride.fullName, data.brideName);
  // Editor toggle "Tampilkan nama & tanggal di sampul" — off hides the cover's
  // text head (for cover photos with the names baked in), like scarlet-cover.
  const showHeroText = data.sections.pasangan.showHeroText;

  return (
    <section className="cover" data-section-order="cover">
      <div className="ornaments-wrapper">
        <div className="orn-cover-center">
          <div className="image-wrap" data-aos="zoom-out" data-aos-duration="2300" data-aos-delay="500">
            <img loading="lazy" decoding="async" src="/invitation/ivory/bg-cover.png" alt="" />
          </div>
        </div>

        <div className="orn-cover-6 right">
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="3000" data-aos-delay="2500">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-08.png" alt="" />
          </div>
        </div>
        <div className="orn-cover-6 left">
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="3000" data-aos-delay="2500">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-08.png" alt="" />
          </div>
        </div>
      </div>

      <div className="inner">
        {showHeroText && (
          <div className="head">
            <p className="top-text" data-aos="fade-down" data-aos-duration="2500" data-aos-delay="1800">
              We are getting married!
            </p>
            <h1 className="prime-title" data-aos="zoom-in" data-aos-duration="2500" data-aos-delay="1800">
              {brideFirst} &amp; {groomFirst}
            </h1>
          </div>
        )}

        <div className="body highlight" data-aos="zoom-in-up" data-aos-duration="2000" data-aos-delay="500">
          <div className="ornaments-wrapper">
            <div className="orn-cover-5 right">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="2800" data-aos-delay="1600">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-07.png" alt="" />
              </div>
            </div>
            <div className="orn-cover-5 left">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="2800" data-aos-delay="1600">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-07.png" alt="" />
              </div>
            </div>
          </div>
          <div className="orn-cover-frame">
            <div className="cover-frame" id="coverFrame">
              <div className="cover-picture cover-show" id="cover-main">
                <div className="picture desktop">
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
            <div className="image-wrap">
              <img loading="lazy" decoding="async" src="/invitation/ivory/frame-cover.png" alt="Cover Frame" />
            </div>

            <div className="ornaments-wrapper">
              <div className="orn-cover-3 right">
                <div className="orn-cover-3-1">
                  <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2700" data-aos-delay="1050">
                    <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-05.png" alt="" />
                  </div>
                </div>
                <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2500" data-aos-delay="1000">
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-04.png" alt="" />
                </div>
              </div>
              <div className="orn-cover-3 left">
                <div className="orn-cover-3-1">
                  <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2700" data-aos-delay="1050">
                    <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-05.png" alt="" />
                  </div>
                </div>
                <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2500" data-aos-delay="1000">
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-04.png" alt="" />
                </div>
              </div>

              <div className="orn-cover-2 right">
                <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2300" data-aos-delay="900">
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-03.png" alt="" />
                </div>
              </div>
              <div className="orn-cover-2 left">
                <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2300" data-aos-delay="900">
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-03.png" alt="" />
                </div>
              </div>

              <div className="orn-cover-1 right">
                <div className="orn-cover-1-1">
                  <div className="image-wrap" data-aos="fade-down" data-aos-duration="2200" data-aos-delay="850">
                    <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-02.png" alt="" />
                  </div>
                </div>
                <div className="image-wrap" data-aos="zoom-in" data-aos-duration="2000" data-aos-delay="800">
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-01.png" alt="" />
                </div>
              </div>
              <div className="orn-cover-1 left">
                <div className="orn-cover-1-1">
                  <div className="image-wrap" data-aos="fade-down" data-aos-duration="2200" data-aos-delay="850">
                    <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-02.png" alt="" />
                  </div>
                </div>
                <div className="image-wrap" data-aos="zoom-in" data-aos-duration="2000" data-aos-delay="800">
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-01.png" alt="" />
                </div>
              </div>

              <div className="orn-cover-kp1 kupu-1">
                <div className="image-wrap" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="1850">
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-kupu-1.png" alt="" />
                </div>
              </div>
            </div>
          </div>

          <div className="ornaments-wrapper">
            <div className="orn-cover-4 right">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="2600" data-aos-delay="1400">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-06.png" alt="" />
              </div>
            </div>
            <div className="orn-cover-4 left">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="2600" data-aos-delay="1400">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-06.png" alt="" />
              </div>
            </div>
            <div className="orn-cover-kp2 kupu-2">
              <div className="image-wrap" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="750">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-kupu-2.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */
// Scarlet/Folk cover (opening hero) â€” markup ported VERBATIM from the
// `<section class="cover">` block in scarlet-body.ts so the scoped CSS in
// scarlet-theme.ts (selectors under `.scarlet-inv section.cover`) styles it
// byte-identically. Only the data-bearing parts are bound to InvitationView:
//   - couple display names in the head <h1> (bride-first),
//   - the cover photo as the single cover <img> (was a slick slide thumb),
//   - the full Bahasa date label under the names.
// Decorative ornaments, the cover mask/bg and every data-aos attribute are kept.

import type { InvitationView } from "@/server/queries/invitation";

import { formatFullDateId } from "../../flora/format";
import { InvImage } from "../inv-image";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

// Display name = the editable "Nama lengkap" (pasangan.fullName) first word,
// falling back to the wedding's top-level name. Editing the form updates this.
function firstName(fullName: string | undefined, fallback: string): string {
  const n = (fullName ?? "").trim() || fallback;
  return n.split(/\s+/)[0] || fallback;
}

export function ScarletCover({ data }: Props) {
  const coverPhoto = data.photos.find((p) => p.isCover) ?? data.photos[0];
  const dateSource = data.sections.acara.events[0]?.date ?? data.eventDate;
  const showHeroText = data.sections.pasangan.showHeroText;
  const groomFirst = firstName(data.sections.pasangan.groom.fullName, data.groomName);
  const brideFirst = firstName(data.sections.pasangan.bride.fullName, data.brideName);

  return (
    <section className="cover">
      <div className="bg-cover">
        <div className="image-wrap" data-aos="zoom-out" data-aos-duration="1000" data-aos-delay="600">
          <img loading="lazy" decoding="async" src="/invitation/scarlet/bg-cover.webp" alt="orn-cover" />
        </div>
      </div>

      <div className="cover-mask"></div>

      <div className="ornaments-wrapper">
        <div className="orn-cover-1 top">
          <div className="image-wrap" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="500">
            <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-slip.webp" alt="Ornament" />
          </div>
        </div>
      </div>

      <div className="inner">
        <div className="ornaments-wrapper">
          <div className="orn-cover-14 right">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1400" data-aos-delay="1200">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-17.webp" alt="Ornament" />
            </div>
          </div>
          <div className="orn-cover-14 left">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1400" data-aos-delay="1200">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-17.webp" alt="Ornament" />
            </div>
          </div>

          <div className="orn-cover-12 right">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1400" data-aos-delay="1200">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-15.webp" alt="Ornament" />
            </div>
          </div>
          <div className="orn-cover-12 left">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1400" data-aos-delay="1200">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-15.webp" alt="Ornament" />
            </div>
          </div>

          <div className="orn-cover-13 right">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1400" data-aos-delay="1200">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-16.webp" alt="Ornament" />
            </div>
          </div>
          <div className="orn-cover-13 left">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1400" data-aos-delay="1200">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-16.webp" alt="Ornament" />
            </div>
          </div>

          <div className="orn-cover-11 right">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="1000">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-14.webp" alt="Ornament" />
            </div>
          </div>
          <div className="orn-cover-9 left">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="1000">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-12.webp" alt="Ornament" />
            </div>
          </div>
          <div className="orn-cover-10 left">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="1000">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-13.webp" alt="Ornament" />
            </div>
          </div>
        </div>

        {showHeroText && (
          <div className="head" data-aos="zoom-in" data-aos-duration="1000">
            <p data-aos="fade-down" data-aos-duration="1000" className="">
              The Wedding of
            </p>
            <h1 data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100" className="">
              {brideFirst}
              <br />
              &amp;
              <br />
              {groomFirst}
            </h1>
            {dateSource && (
              <p data-aos="fade-up" data-aos-duration="1000" className="date">
                {formatFullDateId(dateSource)}
              </p>
            )}
          </div>
        )}

        <div className="body highlight" data-aos="zoom-in-up" data-aos-duration="1200" data-aos-delay="500">
          <div className="orn-cover-frame">
            <div className="orn-cover-8 left">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1500" data-aos-delay="1000">
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-11.webp" alt="" />
              </div>
            </div>
            <div className="orn-cover-7 left">
              <div className="image-wrap" data-aos="fade-right" data-aos-duration="1500" data-aos-delay="1000">
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-10.webp" alt="" />
              </div>
            </div>
            <div className="orn-cover-7 right">
              <div className="image-wrap" data-aos="fade-left" data-aos-duration="1500" data-aos-delay="1000">
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-09.webp" alt="" />
              </div>
            </div>

            <div className="cover-frame" id="coverFrame">
              <div className="cover-picture cover-show slick-initialized slick-slider" id="cover-main">
                <div className="slick-list">
                  <div className="slick-track">
                    <div
                      className="picture desktop slick-slide slick-current slick-active"
                      data-slick-index="0"
                      aria-hidden="false"
                      tabIndex={0}
                      style={{ position: "relative", left: "0px", top: "0px", zIndex: 999, opacity: 1 }}
                    >
                      <InvImage
                        priority
                        src={coverPhoto?.url ?? "/invitation/scarlet/default-cover.webp"}
                        alt={coverPhoto?.label ?? `Foto ${brideFirst} & ${groomFirst}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="image-wrap">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/frame-cover.webp" alt="Cover Frame" />
            </div>

            <div className="orn-cover-3 center">
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1100" data-aos-delay="1000">
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-04.webp" alt="" />
              </div>
            </div>

            <div className="orn-cover-4 left">
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="900">
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-05.webp" alt="" />
              </div>
            </div>

            <div className="orn-cover-2 right">
              <div className="orn-cover-2-1">
                <div className="image-wrap" data-aos="zoom-in" data-aos-duration="900" data-aos-delay="500">
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-03.webp" alt="" />
                </div>
              </div>
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="900" data-aos-delay="600">
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-02.webp" alt="" />
              </div>
            </div>
          </div>
        </div>
        <div className="ornaments-wrapper">
          <div className="orn-cover-5 right">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="1000">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-06.webp" alt="Ornament" />
            </div>
          </div>
          <div className="orn-cover-6 left">
            <div className="orn-cover-6-1">
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="1000">
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-08.webp" alt="Ornament" />
              </div>
            </div>
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="1000">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-07.webp" alt="Ornament" />
            </div>
          </div>
          <div className="orn-cover-15 burung-1">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="1000">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-burung-1.webp" alt="Ornament" />
            </div>
          </div>
          <div className="orn-cover-16 burung-2">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="1000">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-burung-2.webp" alt="Ornament" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

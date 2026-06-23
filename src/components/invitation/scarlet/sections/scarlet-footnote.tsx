/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */
// Scarlet footnote / closing â€” ported VERBATIM from <section.footnote-wrap> and
// the following <section.footer> in scarlet-body.ts. The class names match the
// scoped CSS in scarlet-theme.ts (.scarlet-inv selectors), so styling is
// byte-identical. The only data-bearing swap is the closing cover photo (bound
// to the wedding's cover photo, falling back to the static template image); the
// logo + decorative ornaments + birds and the Maritare footer brand block
// (.footer-brand, .mrt-mark SVG, "maritare" wordmark, "Dibuat dengan kasih di")
// are copied verbatim.

import type { InvitationView } from "@/server/queries/invitation";

import { InvImage } from "../inv-image";
import { FootnoteVideo } from "./footnote-video";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  // Folk reuses this closing section but drops the Scarlet logo, birds, and the
  // baroque ornament cluster — keeping only the closing photo. (Scarlet keeps
  // them.)
  hideOrnaments?: boolean;
};

export function ScarletFootnote({ data, hideOrnaments }: Props) {
  // Prefer a dedicated closing photo; fall back to the cover (then the first
  // photo) so weddings that haven't set a separate closing image keep working.
  const closingPhoto =
    data.photos.find((p) => p.isClosing) ??
    data.photos.find((p) => p.isCover) ??
    data.photos[0];
  const coverAlt = closingPhoto?.label ?? `${data.groomName} & ${data.brideName}`;
  // Folk can set a closing VIDEO (stored on the hero section) — it takes
  // precedence over the closing photo. Scarlet never sets it, so it stays photo.
  const closingVideoUrl = data.sections.hero.closingVideoUrl;

  return (
    <section className={`footnote-wrap${hideOrnaments ? " footnote-plain" : ""}`}>
        <div className="footnote-inner">
          <div className="highlight" data-aos="zoom-out" data-aos-duration="2000">
            <div className="cover-frame" id="coverFrame">
              <div
                className="preview-container cover-show slick-initialized slick-slider"
                id="cover-footnote"
              >
                <div className="slick-list">
                  <div className="slick-track">
                    <div
                      className="picture desktop slick-slide slick-current slick-active"
                      data-slick-index="0"
                      aria-hidden="false"
                      tabIndex={0}
                      style={{
                        position: "relative",
                        left: "0px",
                        top: "0px",
                        zIndex: 999,
                        opacity: 1,
                      }}
                    >
                      {closingVideoUrl ? (
                        <FootnoteVideo src={closingVideoUrl} />
                      ) : closingPhoto ? (
                        <InvImage src={closingPhoto.url} alt={coverAlt} />
                      ) : (
                        <img loading="lazy" decoding="async" src="/invitation/scarlet/default-cover.webp" alt={coverAlt} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="ff-mask"></div>

          {!hideOrnaments && (
          <div className="footnote-body">
            <div
              className="logo-wrap"
              data-aos="fade-down"
              data-aos-duration="1200"
              data-aos-delay="300"
            >
              <img loading="lazy" decoding="async" src="/invitation/scarlet/logo.webp" alt="" className="logo" />
              <div className="orn-ff-log1 burung-1">
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="1200"
                  data-aos-delay="1000"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-burung-1.webp" alt="Ornament" />
                </div>
              </div>
              <div className="orn-ff-log2 burung-2">
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="1200"
                  data-aos-delay="1000"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-burung-2.webp" alt="Ornament" />
                </div>
              </div>
            </div>
          </div>
          )}

          {!hideOrnaments && (
          <div className=" ornaments-wrapper">
            <div className="orn-ff-4">
              <div className="orn-ff-4-2">
                <div
                  className="image-wrap"
                  data-aos="fade-up"
                  data-aos-duration="1000"
                  data-aos-delay="800"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-12.webp" alt="" />
                </div>
              </div>
              <div
                className="image-wrap"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="800"
              >
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-23.webp" alt="" />
              </div>
              <div className="orn-ff-4-1">
                <div className="orn-ff-4-1-1">
                  <div
                    className="image-wrap"
                    data-aos="fade-up"
                    data-aos-duration="1000"
                    data-aos-delay="800"
                  >
                    <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-16.webp" alt="" />
                  </div>
                </div>
                <div
                  className="image-wrap"
                  data-aos="fade-up"
                  data-aos-duration="1000"
                  data-aos-delay="800"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-60.webp" alt="" />
                </div>
              </div>
            </div>
            <div className="orn-ff-3">
              <div
                className="image-wrap"
                data-aos="fade-up"
                data-aos-duration="900"
                data-aos-delay="700"
              >
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-46.webp" alt="" />
              </div>
            </div>
            <div className="orn-ff-2">
              <div className="orn-ff-2-1">
                <div
                  className="image-wrap"
                  data-aos="fade-up"
                  data-aos-duration="900"
                  data-aos-delay="700"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-59.webp" alt="" />
                </div>
              </div>
              <div
                className="image-wrap"
                data-aos="fade-up"
                data-aos-duration="700"
                data-aos-delay="500"
              >
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-58.webp" alt="" />
              </div>
            </div>
            <div className="orn-ff-1">
              <div className="orn-ff-1-3">
                <div
                  className="image-wrap"
                  data-aos="fade-up"
                  data-aos-duration="1100"
                  data-aos-delay="700"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-13.webp" alt="" />
                </div>
              </div>
              <div className="orn-ff-1-2">
                <div
                  className="image-wrap"
                  data-aos="fade-up"
                  data-aos-duration="1200"
                  data-aos-delay="800"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-23.webp" alt="" />
                </div>
                <div className="orn-ff-1-2-1">
                  <div className="orn-ff-1-2-1-1">
                    <div
                      className="image-wrap"
                      data-aos="fade-up"
                      data-aos-duration="1400"
                      data-aos-delay="800"
                    >
                      <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-34.webp" alt="" />
                    </div>
                  </div>
                  <div
                    className="image-wrap"
                    data-aos="fade-up"
                    data-aos-duration="1300"
                    data-aos-delay="800"
                  >
                    <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-40.webp" alt="" />
                  </div>
                </div>
              </div>
              <div className="orn-ff-1-1">
                <div className="orn-ff-1-1-2">
                  <div
                    className="image-wrap"
                    data-aos="fade-up"
                    data-aos-duration="1000"
                    data-aos-delay="700"
                  >
                    <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-14.webp" alt="" />
                  </div>
                </div>
                <div className="orn-ff-1-1-1">
                  <div
                    className="image-wrap"
                    data-aos="fade-up"
                    data-aos-duration="1000"
                    data-aos-delay="700"
                  >
                    <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-35.webp" alt="" />
                  </div>
                </div>
                <div
                  className="image-wrap"
                  data-aos="fade-up"
                  data-aos-duration="900"
                  data-aos-delay="600"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-57.webp" alt="" />
                </div>
              </div>
              <div
                className="image-wrap"
                data-aos="fade-up"
                data-aos-duration="700"
                data-aos-delay="500"
              >
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-56.webp" alt="" />
              </div>
            </div>
          </div>
          )}
        </div>
      </section>
  );
}

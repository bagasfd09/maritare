/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */
// Scarlet opening quote â€” ported from <div.quote-sec-wrap> in scarlet-body.ts.
// The static Ar-Rum verse + citation are replaced by the couple's quote:
// arabic (optional <p dir="rtl" lang="ar">), text â†’ .quote-sec-caption,
// source â†’ .quote-sec-caption.bottom. Renders nothing when neither arabic nor
// text is set. All decorative ornaments + data-aos timings are kept verbatim.

import type { InvitationView } from "@/server/queries/invitation";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

export function ScarletQuote({ data }: Props) {
  const quote = data.sections.pasangan.quote;
  const arabic = quote?.arabic?.trim();
  const text = quote?.text?.trim();
  const source = quote?.source?.trim();
  if (!arabic && !text) {
    return null;
  }

  return (
    <div className="quote-sec-wrap">
      <div className="orn-clip-mask bot">
        <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="500">
          <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-clip.webp" alt="Ornament" />
        </div>
      </div>

      <div className="quote-sec-inner">
        <div className="ornaments-wrapper">
          <div className="orn-qt-bg">
            <div
              className="image-wrap"
              data-aos="zoom-out"
              data-aos-duration="1500"
              data-aos-delay="800"
            >
              <img loading="lazy" decoding="async" src="/invitation/scarlet/bg-sd.webp" alt="" />
            </div>
          </div>
        </div>

        <div className="frame-qt">
          <div
            className="image-wrap"
            data-aos="zoom-out"
            data-aos-duration="1200"
            data-aos-delay="500"
          >
            <img loading="lazy" decoding="async" src="/invitation/scarlet/frame-qt.webp" alt="Background Awan" />
          </div>
        </div>

        <div className="quote-sec">
          {arabic && (
            <p
              className="quote-sec-caption"
              dir="rtl"
              lang="ar"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="500"
            >
              {arabic}
            </p>
          )}

          {text && (
            <p
              className="quote-sec-caption"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="500"
            >
              &ldquo;{text}&rdquo;
            </p>
          )}

          {source && (
            <p
              className="quote-sec-caption bottom"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="500"
            >
              {source}
            </p>
          )}
        </div>

        <div className="ornaments-wrapper">
          <div className="orn-qt-2 right">
            <div className="orn-qt-2-2">
              <div
                className="image-wrap"
                data-aos="fade-up"
                data-aos-duration="1500"
                data-aos-delay="800"
              >
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-11.webp" alt="" />
              </div>
            </div>
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1400"
              data-aos-delay="700"
            >
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-17.webp" alt="" />
            </div>
            <div className="orn-qt-2-1">
              <div className="orn-qt-2-1-1">
                <div
                  className="image-wrap"
                  data-aos="fade-up"
                  data-aos-duration="1500"
                  data-aos-delay="800"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-13.webp" alt="" />
                </div>
              </div>
              <div
                className="image-wrap"
                data-aos="fade-up"
                data-aos-duration="1300"
                data-aos-delay="800"
              >
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-46.webp" alt="" />
              </div>
            </div>
          </div>
          <div className="orn-qt-2 left">
            <div className="orn-qt-2-2">
              <div
                className="image-wrap"
                data-aos="fade-up"
                data-aos-duration="1500"
                data-aos-delay="800"
              >
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-11.webp" alt="" />
              </div>
            </div>
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1400"
              data-aos-delay="700"
            >
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-17.webp" alt="" />
            </div>
            <div className="orn-qt-2-1">
              <div className="orn-qt-2-1-1">
                <div
                  className="image-wrap"
                  data-aos="fade-up"
                  data-aos-duration="1500"
                  data-aos-delay="800"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-13.webp" alt="" />
                </div>
              </div>
              <div
                className="image-wrap"
                data-aos="fade-up"
                data-aos-duration="1300"
                data-aos-delay="800"
              >
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-46.webp" alt="" />
              </div>
            </div>
          </div>
          <div className="orn-qt-1 center">
            <div className="orn-qt-1-1 right">
              <div
                className="image-wrap"
                data-aos="fade-up"
                data-aos-duration="1300"
                data-aos-delay="600"
              >
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-47.webp" alt="" />
              </div>
            </div>
            <div className="orn-qt-1-1 left">
              <div
                className="image-wrap"
                data-aos="fade-up"
                data-aos-duration="1300"
                data-aos-delay="600"
              >
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-47.webp" alt="" />
              </div>
            </div>
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="500"
            >
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-53.webp" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

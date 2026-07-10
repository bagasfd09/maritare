/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */
// Ivory opening quote — verbatim port of <section.quote-wrap> from the Katsudoto
// "Aulia" template. The static Adh-Dhariyat verse + citation are replaced by the
// couple's quote: arabic (optional, inline rtl span), text → curly-quoted, source.
// Renders nothing when arabic, text AND source are all empty. All decorative
// ornaments and data-aos timings are kept verbatim.

import type { InvitationView } from "@/server/queries/invitation";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
};

export function IvoryQuote({ data }: Props) {
  const quote = data.sections.pasangan.quote;
  const arabic = quote?.arabic?.trim();
  const text = quote?.text?.trim();
  const source = quote?.source?.trim();
  if (!arabic && !text && !source) {
    return null;
  }

  return (
    <section className="quote-wrap" data-section-order="quote">
      <div className="quote">
        <div className="quotes-frame">
          <div className="ornaments-wrapper" />

          <div
            className="image-wrap"
            data-aos="zoom-in"
            data-aos-duration="1000"
            data-aos-delay="650"
          >
            <img
              loading="lazy"
              decoding="async"
              src="/invitation/ivory/frame-quote.png"
              alt="Quote Frame"
            />
          </div>
          <div className="quotes-content">
            <p className="quote-caption" data-aos="fade-up" data-aos-duration="1000">
              {arabic && (
                <>
                  <span dir="rtl" lang="ar">
                    {arabic}
                  </span>
                  {(text || source) && (
                    <>
                      <br />
                      <br />
                    </>
                  )}
                </>
              )}
              {text && (
                <>
                  &ldquo;{text}&rdquo;
                </>
              )}
              {text && source && (
                <>
                  <br />
                  <br />
                </>
              )}
              {source}
            </p>
          </div>

          <div className="ornaments-wrapper">
            <div className="orn-quote-1 right">
              <div className="orn-quote-1-3">
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="1500"
                  data-aos-delay="1100"
                >
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-13.png" alt="" />
                </div>
              </div>
              <div className="orn-quote-1-2">
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="1400"
                  data-aos-delay="1000"
                >
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-12.png" alt="" />
                </div>
              </div>
              <div className="orn-quote-1-1">
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="1200"
                  data-aos-delay="900"
                >
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-11.png" alt="" />
                </div>
              </div>
              <div
                className="image-wrap"
                data-aos="zoom-in"
                data-aos-duration="1000"
                data-aos-delay="800"
              >
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-09.png" alt="" />
              </div>
            </div>
            <div className="orn-quote-1 left">
              <div className="orn-quote-1-3">
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="1500"
                  data-aos-delay="1100"
                >
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-13.png" alt="" />
                </div>
              </div>
              <div className="orn-quote-1-2">
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="1400"
                  data-aos-delay="1000"
                >
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-12.png" alt="" />
                </div>
              </div>
              <div className="orn-quote-1-1">
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="1200"
                  data-aos-delay="900"
                >
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-11.png" alt="" />
                </div>
              </div>
              <div
                className="image-wrap"
                data-aos="zoom-in"
                data-aos-duration="1000"
                data-aos-delay="800"
              >
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-09.png" alt="" />
              </div>
            </div>
            <div className="orn-quote-2 right">
              <div className="orn-quote-2-1">
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="1400"
                  data-aos-delay="1300"
                >
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-15.png" alt="" />
                </div>
              </div>
              <div
                className="image-wrap"
                data-aos="zoom-in"
                data-aos-duration="1400"
                data-aos-delay="1200"
              >
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-14.png" alt="" />
              </div>
            </div>
            <div className="orn-quote-2 left">
              <div className="orn-quote-2-1">
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="1400"
                  data-aos-delay="1300"
                >
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-15.png" alt="" />
                </div>
              </div>
              <div
                className="image-wrap"
                data-aos="zoom-in"
                data-aos-duration="1400"
                data-aos-delay="1200"
              >
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-14.png" alt="" />
              </div>
            </div>
            <div className="orn-quote-4 right">
              <div
                className="image-wrap"
                data-aos="zoom-in"
                data-aos-duration="1400"
                data-aos-delay="1200"
              >
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-18.png" alt="" />
              </div>
            </div>
            <div className="orn-quote-4 left">
              <div
                className="image-wrap"
                data-aos="zoom-in"
                data-aos-duration="1400"
                data-aos-delay="1200"
              >
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-18.png" alt="" />
              </div>
            </div>
            <div className="orn-quote-3 right">
              <div
                className="image-wrap"
                data-aos="zoom-in"
                data-aos-duration="1400"
                data-aos-delay="1200"
              >
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-16.png" alt="" />
              </div>
            </div>
            <div className="orn-quote-3 left">
              <div
                className="image-wrap"
                data-aos="zoom-in"
                data-aos-duration="1400"
                data-aos-delay="1200"
              >
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-16.png" alt="" />
              </div>
            </div>
            <div className="orn-quote-1 center">
              <div
                className="image-wrap"
                data-aos="zoom-in"
                data-aos-duration="1000"
                data-aos-delay="800"
              >
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-10.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */
// Plum opening quote — markup ported VERBATIM from the Katsudoto "kinanti"
// `<section class="quote-wrap">` fragment so the scoped CSS in the plum theme
// (selectors under `.plum-inv`) styles it byte-identically. The static doa
// (arabic + transliteration + translation) is replaced by the couple's quote:
//   - arabic  → optional rtl span, shown only when set (no fallback),
//   - text    → the main caption, falling back to the reference's non-arabic
//               lines (transliteration + translation) so it ALWAYS renders,
//   - source  → optional citation line, shown only when set.
// All decorative ornaments and every data-aos timing are kept verbatim; the
// runtime aos-init/aos-animate tokens are stripped (the embed observer drives
// reveal). Always renders (text fallback) — mirrors SiennaQuote's philosophy.

import type { InvitationView } from "@/server/queries/invitation";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
};

// The reference's non-arabic caption lines, used as the `text` fallback so the
// section always renders something meaningful when the couple set no quote.
const FALLBACK_TRANSLITERATION =
  "Allâhumma allif bainahumâ kamâ allafta baina âdama wa hawwâ, wa ashlih dzâta baininâ wahdinâ subulas-salâm..";
const FALLBACK_TRANSLATION =
  '"Ya Allah, rukunkan keduanya sebagaimana Engkau rukunkan Nabi Adam dan Hawa, dan perbaikilah hubungan di antara kami, dan tunjukkanlah kami kepada jalan keselamatan."';

export function PlumQuote({ data }: Props) {
  const quote = data.sections.pasangan.quote;
  const arabic = quote?.arabic?.trim();
  const text = quote?.text?.trim();
  const source = quote?.source?.trim();

  return (
    <section className="quote-wrap" data-section-order="quote">
      <div className="quote">
        <div className="quotes-frame">
          <div className="ornaments-wrapper">
            <div className="orn-quote--top tc-1">
              <div
                className="image-wrap"
                data-aos="zoom-in"
                data-aos-duration="1200"
                data-aos-delay="100"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src="/invitation/plum/orn-29-min.png"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="orn-quote-header">
            <div
              className="image-wrap"
              data-aos="zoom-in"
              data-aos-duration="1800"
              data-aos-delay="100"
            >
              <img
                loading="lazy"
                decoding="async"
                src="/invitation/plum/orn-23-min.png"
                alt=""
              />
            </div>
          </div>

          <div className="quotes-content">
            <p className="quote-caption" data-aos="fade-up" data-aos-duration="1000">
              {arabic && (
                <>
                  <span dir="rtl" lang="ar">
                    {arabic}
                  </span>
                  <br />
                </>
              )}
              {text ? (
                text
              ) : (
                <>
                  {FALLBACK_TRANSLITERATION}
                  <br />
                  {FALLBACK_TRANSLATION}
                </>
              )}
              {source && (
                <>
                  <br />
                  {source}
                </>
              )}
            </p>
          </div>

          <div className="quotes-footer">
            <div className="orn-quote--bottom bl-1">
              <div className="orn-quote--bottom bl-3">
                <div className="orn-quote--bottom bl-7">
                  <div
                    className="image-wrap"
                    data-aos="fade-up-left"
                    data-aos-duration="1800"
                    data-aos-delay="100"
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src="/invitation/plum/orn-2-min.png"
                      alt=""
                    />
                  </div>
                </div>
                <div className="orn-quote--bottom bl-6">
                  <div
                    className="image-wrap"
                    data-aos="fade-up-left"
                    data-aos-duration="1800"
                    data-aos-delay="200"
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src="/invitation/plum/orn-16-min.png"
                      alt=""
                    />
                  </div>
                </div>
                <div className="orn-quote--bottom bl-5">
                  <div
                    className="image-wrap"
                    data-aos="fade-up-left"
                    data-aos-duration="1800"
                    data-aos-delay="300"
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src="/invitation/plum/orn-26-min.png"
                      alt=""
                    />
                  </div>
                </div>
                <div className="orn-quote--bottom bl-4">
                  <div
                    className="image-wrap"
                    data-aos="fade-up-left"
                    data-aos-duration="1800"
                    data-aos-delay="400"
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src="/invitation/plum/orn-27-min.png"
                      alt=""
                    />
                  </div>
                </div>
                <div
                  className="image-wrap"
                  data-aos="fade-up-left"
                  data-aos-duration="1800"
                  data-aos-delay="500"
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    src="/invitation/plum/orn-3-min.png"
                    alt=""
                  />
                </div>
              </div>
              <div
                className="image-wrap"
                data-aos="fade-up-left"
                data-aos-duration="1800"
                data-aos-delay="100"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src="/invitation/plum/orn-30-min.png"
                  alt=""
                />
              </div>
              <div className="orn-quote--bottom bl-2">
                <div
                  className="image-wrap"
                  data-aos="fade-up-left"
                  data-aos-duration="1800"
                  data-aos-delay="200"
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    src="/invitation/plum/orn-10-min.png"
                    alt=""
                  />
                </div>
              </div>
            </div>
            <div className="orn-quote--bottom br-1">
              <div className="orn-quote--bottom bl-3">
                <div className="orn-quote--bottom bl-7">
                  <div
                    className="image-wrap"
                    data-aos="fade-up-left"
                    data-aos-duration="1800"
                    data-aos-delay="100"
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src="/invitation/plum/orn-2-min.png"
                      alt=""
                    />
                  </div>
                </div>
                <div className="orn-quote--bottom bl-6">
                  <div
                    className="image-wrap"
                    data-aos="fade-up-left"
                    data-aos-duration="1800"
                    data-aos-delay="200"
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src="/invitation/plum/orn-16-min.png"
                      alt=""
                    />
                  </div>
                </div>
                <div className="orn-quote--bottom bl-5">
                  <div
                    className="image-wrap"
                    data-aos="fade-up-left"
                    data-aos-duration="1800"
                    data-aos-delay="300"
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src="/invitation/plum/orn-26-min.png"
                      alt=""
                    />
                  </div>
                </div>
                <div className="orn-quote--bottom bl-4">
                  <div
                    className="image-wrap"
                    data-aos="fade-up-left"
                    data-aos-duration="1800"
                    data-aos-delay="400"
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src="/invitation/plum/orn-27-min.png"
                      alt=""
                    />
                  </div>
                </div>
                <div
                  className="image-wrap"
                  data-aos="fade-up-left"
                  data-aos-duration="1800"
                  data-aos-delay="500"
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    src="/invitation/plum/orn-3-min.png"
                    alt=""
                  />
                </div>
              </div>
              <div
                className="image-wrap"
                data-aos="fade-up-left"
                data-aos-duration="1800"
                data-aos-delay="100"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src="/invitation/plum/orn-30-min.png"
                  alt=""
                />
              </div>
              <div className="orn-quote--bottom bl-2">
                <div
                  className="image-wrap"
                  data-aos="fade-up-left"
                  data-aos-duration="1800"
                  data-aos-delay="200"
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    src="/invitation/plum/orn-10-min.png"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

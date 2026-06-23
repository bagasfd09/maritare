/* eslint-disable @next/next/no-img-element -- decorative ornaments; raw <img> keeps this a verbatim port of the Katsudoto <section.quote-message-wrap> and matches the existing scarlet-footnote pattern */
// Scarlet "Thank you" closing message — ported VERBATIM from
// <section.quote-message-wrap> in the Katsudoto reference. The class names match
// the scoped CSS in scarlet-theme.ts (.scarlet-inv .quote-message-*), so the
// arched frame + burgundy floral ornament cluster render byte-identically. Sits
// just above the footnote/closing photo section. Static copy (no data binding).

const BASE = "/invitation/scarlet";

export function ScarletThankYou() {
  return (
    <section className="quote-message-wrap">
      <div className="orn-clip-mask">
        <div className="image-wrap">
          <img loading="lazy" decoding="async" src={`${BASE}/Orn-clip.png`} alt="Ornament" />
        </div>
      </div>
      <div className="quote-message">
        <div className="quote-message-inner-wrap">
          <div className="quote-message-inner">
            <div className="orn-agenda-top">
              <div className="image-wrap">
                <img loading="lazy" decoding="async" src={`${BASE}/Orn-01.png`} alt="" />
              </div>
            </div>
            <h1 className="quote-message-title zin-3">Thank you</h1>
            <p className="quote-message-desc zin-3">
              We would like to express our gratitude for your presence and prayers in this special
              moment of ours. We hope that you will be willing to attend and enjoy the entire series
              of our events.
            </p>
          </div>
        </div>

        <div className="ornaments-wrapper">
          <div className="orn-qm-4 right">
            <div className="orn-qm-4-1">
              <div className="image-wrap">
                <img loading="lazy" decoding="async" src={`${BASE}/Orn-14.png`} alt="" />
              </div>
              <div className="image-wrap">
                <img loading="lazy" decoding="async" src={`${BASE}/Orn-24.png`} alt="" />
              </div>
            </div>
          </div>
          <div className="orn-qm-4 left">
            <div className="orn-qm-4-1">
              <div className="image-wrap">
                <img loading="lazy" decoding="async" src={`${BASE}/Orn-14.png`} alt="" />
              </div>
              <div className="image-wrap">
                <img loading="lazy" decoding="async" src={`${BASE}/Orn-24.png`} alt="" />
              </div>
            </div>
          </div>
          <div className="orn-qm-3 right">
            <div className="image-wrap">
              <img loading="lazy" decoding="async" src={`${BASE}/Orn-55.png`} alt="" />
            </div>
          </div>
          <div className="orn-qm-3 left">
            <div className="image-wrap">
              <img loading="lazy" decoding="async" src={`${BASE}/Orn-55.png`} alt="" />
            </div>
          </div>
          <div className="orn-qm-2 right">
            <div className="image-wrap">
              <img loading="lazy" decoding="async" src={`${BASE}/Orn-10.png`} alt="" />
            </div>
          </div>
          <div className="orn-qm-2 left">
            <div className="image-wrap">
              <img loading="lazy" decoding="async" src={`${BASE}/Orn-09.png`} alt="" />
            </div>
          </div>
          <div className="orn-qm-1 right">
            <div className="image-wrap">
              <img loading="lazy" decoding="async" src={`${BASE}/Orn-54.png`} alt="" />
            </div>
          </div>
          <div className="orn-qm-1 left">
            <div className="image-wrap">
              <img loading="lazy" decoding="async" src={`${BASE}/Orn-54.png`} alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

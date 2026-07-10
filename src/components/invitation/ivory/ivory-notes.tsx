/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */
// Ivory "Thank You" closing note — ported VERBATIM from the Katsudoto Aulia
// <section.notes-container> reference. Class names match the scoped CSS under
// .ivory-inv, so the ornament cluster + note card render byte-identically.
// Static copy (no data binding); mirrors scarlet-thankyou.tsx's static pattern.

const BASE = "/invitation/ivory";

export function IvoryNotes() {
  return (
    <section className="notes-container" data-section-order="greet_thanks">
      <div className="ornaments-wrapper">
        {/* ORN SD SIDE */}
        <div className="orn-note-2">
          <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="1900" data-aos-delay="1100">
            <img loading="lazy" decoding="async" src={`${BASE}/Orn-26.png`} alt="orn-bank" />
          </div>
        </div>
        <div className="orn-sd-9 right">
          <div className="orn-sd-9-1">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1500" data-aos-delay="1100">
              <img loading="lazy" decoding="async" src={`${BASE}/Orn-18.png`} alt="orn-bank" />
            </div>
          </div>
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="1500" data-aos-delay="1100">
            <img loading="lazy" decoding="async" src={`${BASE}/Orn-32.png`} alt="orn-bank" />
          </div>
          <div className="orn-sd-9-2">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1500" data-aos-delay="1200">
              <img loading="lazy" decoding="async" src={`${BASE}/Orn-16.png`} alt="orn-bank" />
            </div>
          </div>
        </div>
        <div className="orn-sd-9 left">
          <div className="orn-sd-9-1">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1500" data-aos-delay="1100">
              <img loading="lazy" decoding="async" src={`${BASE}/Orn-18.png`} alt="orn-bank" />
            </div>
          </div>
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="1500" data-aos-delay="1100">
            <img loading="lazy" decoding="async" src={`${BASE}/Orn-32.png`} alt="orn-bank" />
          </div>
          <div className="orn-sd-9-2">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1500" data-aos-delay="1200">
              <img loading="lazy" decoding="async" src={`${BASE}/Orn-16.png`} alt="orn-bank" />
            </div>
          </div>
        </div>
        <div className="orn-sd-7 right">
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="1400" data-aos-delay="800">
            <img loading="lazy" decoding="async" src={`${BASE}/Orn-30.png`} alt="orn-bank" />
          </div>
        </div>
        <div className="orn-sd-7 left">
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="1400" data-aos-delay="800">
            <img loading="lazy" decoding="async" src={`${BASE}/Orn-30.png`} alt="orn-bank" />
          </div>
        </div>

        <div className="orn-note-1 right">
          <div className="orn-note-1-1">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="800">
              <img loading="lazy" decoding="async" src={`${BASE}/Orn-29.png`} alt="" />
            </div>
          </div>
          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="800">
            <img loading="lazy" decoding="async" src={`${BASE}/Orn-09.png`} alt="" />
          </div>
        </div>
        <div className="orn-note-1 left">
          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="800">
            <img loading="lazy" decoding="async" src={`${BASE}/Orn-09.png`} alt="" />
          </div>
        </div>
      </div>
      <div className="note" data-aos="zoom-in" data-aos-duration="2500" data-aos-delay="1800">
        <h4 className="note-title">Thank You</h4>
        <p className="note-description">From the bottom of our hearts we just want to thank you for being part of our big day. We are extreamly lucky to have each of you in our lives and honered you could be here with us.</p>
      </div>
    </section>
  );
}

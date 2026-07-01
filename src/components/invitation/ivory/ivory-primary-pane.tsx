/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */
// Ivory primary-pane contents — markup ported VERBATIM from the children of
// `<section class="primary-pane"><div class="inner">` in the Katsudoto "Aulia"
// (Sinta & Fanny) reference, so the scoped CSS in ivory-theme.ts (selectors
// under `.ivory-inv .primary-pane`) styles it byte-identically. IvoryEmbed
// supplies the <section class="primary-pane"><div class="inner"> shell; this
// component renders only the inner content: the decorative background ornament
// layers (raw <img>) and the inner-wrapper head-wrap with the "The Wedding Of"
// title. The only data-bearing part is the couple display names in the <h1>
// (bride-first). All data-aos attributes are kept; AOS runtime artifacts
// (aos-init/aos-animate + baked inline transition styles) are stripped — the
// IvoryEmbed IntersectionObserver + scoped CSS drive the reveal.

import type { InvitationView } from "@/server/queries/invitation";

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

export function IvoryPrimaryPane({ data }: Props) {
  const brideFirst = firstName(data.sections.pasangan.bride.fullName, data.brideName);
  const groomFirst = firstName(data.sections.pasangan.groom.fullName, data.groomName);

  return (
    <>
      <div className="ornaments-wrapper">
        <div className="orn-tc-center">
          <div className="image-wrap" data-aos="zoom-out" data-aos-duration="1500" data-aos-delay="900">
            <img loading="lazy" decoding="async" src="/invitation/ivory/tc-mask.png" alt="orn-bank" />
          </div>
        </div>
        <div className="orn-pp-center">
          <div className="image-wrap" data-aos="zoom-out" data-aos-duration="2600" data-aos-delay="2200">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-70.png" alt="orn-bank" />
          </div>
        </div>
        <div className="orn-ff-center-2">
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="2500" data-aos-delay="2100">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-51.png" alt="orn-bank" />
          </div>
          <div className="orn-ff-center-2-2">
            <div className="image-wrap" data-aos="fade-left" data-aos-duration="3500" data-aos-delay="3000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-bebek-1.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-center-2-3">
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="3500" data-aos-delay="3000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-bebek-2.png" alt="orn-bank" />
            </div>
          </div>
        </div>
        <div className="orn-ff-1 right">
          <div className="orn-ff-1-1">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="2800" data-aos-delay="2000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-06.png" alt="orn-bank" />
            </div>
          </div>
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="2500" data-aos-delay="2000">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-35.png" alt="orn-bank" />
          </div>
          <div className="orn-ff-1-2">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="2000" data-aos-delay="2000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-38.png" alt="orn-bank" />
            </div>
          </div>
        </div>
        <div className="orn-ff-1 left">
          <div className="orn-ff-1-1">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="2800" data-aos-delay="2000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-06.png" alt="orn-bank" />
            </div>
          </div>
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="2500" data-aos-delay="2000">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-35.png" alt="orn-bank" />
          </div>
          <div className="orn-ff-1-2">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="2000" data-aos-delay="2000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-38.png" alt="orn-bank" />
            </div>
          </div>
        </div>

        <div className="orn-tc-1">
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="3500" data-aos-delay="2900">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-28.png" alt="orn-bank" />
          </div>
        </div>

        <div className="orn-ff-awan right awan">
          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1500" data-aos-delay="2500">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-awan.png" alt="orn-bank" />
          </div>
        </div>
        <div className="orn-ff-awan left awan">
          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1500" data-aos-delay="2500">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-awan.png" alt="orn-bank" />
          </div>
        </div>

        <div className="orn-herd-burung orn-herd-ff-1">
          <div className="image-wrap herd-pct">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-herd.png" alt="orn-gift" />
          </div>
          <div className="orn-burung-1">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/01.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-2">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/02.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-3">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/01.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-4">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/05.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-5">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/03.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-6">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/03.png" alt="orn-gift" />
            </div>
          </div>
        </div>
        <div className="orn-herd-burung orn-herd-ff-2">
          <div className="image-wrap herd-pct">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-herd.png" alt="orn-gift" />
          </div>
          <div className="orn-burung-1">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/01.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-2">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/02.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-3">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/01.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-4">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/05.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-5">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/03.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-6">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/03.png" alt="orn-gift" />
            </div>
          </div>
        </div>
      </div>

      <div className="inner-wrapper">
        <div className="head-wrap" data-aos="zoom-in" data-aos-duration="3500" data-aos-delay="3500">
          <h1 className="primary-pane-title" data-aos="zoom-in" data-aos-duration="3500" data-aos-delay="3500">
            The Wedding Of <br />
            {brideFirst} & {groomFirst}
          </h1>
        </div>
      </div>

      <div className="ornaments-wrapper">
        {/* Btm Orn  */}
        <div className="orn-pp-1 right">
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="2000" data-aos-delay="1400">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-69.png" alt="orn-bank" />
          </div>
        </div>
        <div className="orn-pp-1 left">
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="2000" data-aos-delay="1400">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-69.png" alt="orn-bank" />
          </div>
        </div>
        <div className="orn-ff-2 left">
          <div className="orn-ff-2-7">
            <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2700" data-aos-delay="1900">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-18.png" alt="orn-bank" />
            </div>
            <div className="orn-ff-2-7-1 kupu-1">
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1700" data-aos-delay="2900">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-kupu-1.png" alt="orn-bank" />
              </div>
            </div>
          </div>
          <div className="orn-ff-2-3">
            <div className="orn-ff-2-3-1">
              <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2600" data-aos-delay="1600">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-40.png" alt="orn-bank" />
              </div>
            </div>
            <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2400" data-aos-delay="1500">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-22.png" alt="orn-bank" />
            </div>
          </div>

          <div className="image-wrap" data-aos="zoom-in-right" data-aos-duration="2000" data-aos-delay="1400">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-63.png" alt="orn-bank" />
          </div>

          <div className="orn-ff-2-6">
            <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2200" data-aos-delay="1500">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-13.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-2-4">
            <div className="orn-ff-2-4-1">
              <div className="image-wrap" data-aos="fade-right" data-aos-duration="1800" data-aos-delay="1300">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-12.png" alt="orn-bank" />
              </div>
            </div>
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="1900" data-aos-delay="1400">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-64.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-2-5">
            <div className="image-wrap" data-aos="fade-left" data-aos-duration="1900" data-aos-delay="1100">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-04.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-2-1">
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="1600" data-aos-delay="700">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-61.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-2-2">
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="1800" data-aos-delay="1200">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-62.png" alt="orn-bank" />
            </div>
          </div>
        </div>
        <div className="orn-ff-2 right">
          <div className="orn-ff-2-7">
            <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2700" data-aos-delay="1900">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-18.png" alt="orn-bank" />
            </div>
            <div className="orn-ff-2-7-1 kupu-1">
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1700" data-aos-delay="2900">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-kupu-1.png" alt="orn-bank" />
              </div>
            </div>
          </div>
          <div className="orn-ff-2-3">
            <div className="orn-ff-2-3-1">
              <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2600" data-aos-delay="1600">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-40.png" alt="orn-bank" />
              </div>
            </div>
            <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2400" data-aos-delay="1500">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-22.png" alt="orn-bank" />
            </div>
          </div>

          <div className="image-wrap" data-aos="zoom-in-right" data-aos-duration="2000" data-aos-delay="1400">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-63.png" alt="orn-bank" />
          </div>

          <div className="orn-ff-2-6">
            <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2200" data-aos-delay="1500">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-13.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-2-4">
            <div className="orn-ff-2-4-1">
              <div className="image-wrap" data-aos="fade-right" data-aos-duration="1800" data-aos-delay="1300">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-12.png" alt="orn-bank" />
              </div>
            </div>
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="1900" data-aos-delay="1400">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-64.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-2-5">
            <div className="image-wrap" data-aos="fade-left" data-aos-duration="1900" data-aos-delay="1100">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-04.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-2-1">
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="1600" data-aos-delay="700">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-65.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-2-2">
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="1800" data-aos-delay="1200">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-62.png" alt="orn-bank" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

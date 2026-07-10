/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */
// Plum footnote / closing — markup ported VERBATIM from the Katsudoto Kinanti
// `<section class="footnote-wrap">` fragment so the scoped CSS in the plum theme
// (selectors under `.plum-inv`) styles it byte-identically. Like the sienna
// footnote, the plum footnote is TEXT-ONLY: no closing photo, and there is NO
// date line in this theme. Only the data-bearing part is bound to InvitationView:
//   - the couple display names in the .footnote-title (bride-first).
// "The Wedding of" stays verbatim. The reference footnote-logo monogram and the
// "#..." hashtag bottom-text are DROPPED (no maritare field backs them). Every
// decorative bg/orn-footnote ornament and all data-aos attributes are kept.

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

export function PlumFootnote({ data }: Props) {
  const groomFirst = firstName(data.sections.pasangan.groom.fullName, data.groomName);
  const brideFirst = firstName(data.sections.pasangan.bride.fullName, data.brideName);

  return (
    <section className="footnote-wrap" data-section-order="footnote">
      <div className="footnote-inner">

        <div className="ornaments-wrapper">
          <div className="bg-footnote-forest">
            <div className="image-wrap" data-aos="zoom-out" data-aos-duration="1200" data-aos-delay="100">
              <img loading="lazy" decoding="async" src="/invitation/plum/bg-overlay-min.png" alt="Ornament" />
            </div>
          </div>
          <div className="bg-footnote-mount">
            <div className="image-wrap" data-aos="zoom-out" data-aos-duration="1200" data-aos-delay="200">
              <img loading="lazy" decoding="async" src="/invitation/plum/bg-min.png" alt="Ornament" />
            </div>
          </div>
        </div>

        <div className="orn-footnote-frame">
          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="100">
            <img loading="lazy" decoding="async" src="/invitation/plum/orn-frame-2-min.png" alt="Ornament" />
          </div>
        </div>

        <div className="ornaments-wrapper">
          {/* BOTTOM LEFT */}
          <div className="orn-footnote--bottom br-1">
            <div className="orn-footnote--bottom br-5">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="100">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-33-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="orn-footnote--bottom br-4">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-1-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="orn-footnote--bottom br-3">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="300">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-5-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="orn-footnote--bottom br-2">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="400">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-2-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="500">
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-26-min.png" alt="Ornament" />
            </div>
            <div className="orn-footnote--bottom br-6">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="100">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-37-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="orn-footnote--bottom br-7">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-36-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="orn-footnote--bottom br-8">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="300">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-28-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="orn-footnote--bottom br-9">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="400">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-3-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="orn-footnote--bottom br-10">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="500">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-8-min.png" alt="Ornament" />
              </div>
            </div>
          </div>

          <div className="orn-footnote--bottom bl-1">
            <div className="orn-footnote--bottom br-5">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="100">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-33-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="orn-footnote--bottom br-4">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-1-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="orn-footnote--bottom br-3">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="300">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-5-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="orn-footnote--bottom br-2">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="400">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-2-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="500">
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-26-min.png" alt="Ornament" />
            </div>
            <div className="orn-footnote--bottom br-6">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="100">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-37-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="orn-footnote--bottom br-7">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-36-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="orn-footnote--bottom br-8">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="300">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-28-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="orn-footnote--bottom br-9">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="400">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-3-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="orn-footnote--bottom br-10">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="500">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-8-min.png" alt="Ornament" />
              </div>
            </div>
          </div>

        </div>

        {/* DETAILS */}
        <div className="footnote-details">
          <div className="footnote-details--content">
            <p className="top-text" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="600">The Wedding of</p>
            <h2 className="footnote-title" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="800">{brideFirst} & {groomFirst}</h2>
          </div>
        </div>

      </div>
    </section>
  );
}

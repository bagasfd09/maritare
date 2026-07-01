/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */
// Sienna footnote / closing — markup ported VERBATIM from the Katsudoto Syakira
// `<section class="footnote-wrap">` fragment so the scoped CSS in the sienna
// theme (selectors under `.sienna-inv`) styles it byte-identically. Unlike the
// ivory footnote, the sienna footnote is TEXT-ONLY: no closing photo. Only the
// data-bearing parts are bound to InvitationView:
//   - couple display names in the .footnote-title (bride-first),
//   - the wedding date in .date (mirrors ivory-footnote's date expression).
// "The wedding Of" stays verbatim. Every decorative orn-footer-* ornament and
// all data-aos attributes are kept.

import { formatFullDateId } from "../flora/format";
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

export function SiennaFootnote({ data }: Props) {
  const groomFirst = firstName(data.sections.pasangan.groom.fullName, data.groomName);
  const brideFirst = firstName(data.sections.pasangan.bride.fullName, data.brideName);
  // formatFullDateId needs a non-null string; events[0]?.date ?? eventDate may be null.
  const eventDate = data.sections.acara.events[0]?.date ?? data.eventDate;

  return (
    <section className="footnote-wrap" data-section-order="footnote">
      <div className="ornaments-wrapper">
        <div className="orn-4">
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="500">
            <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-4.png" alt="Orn 4" />
          </div>
        </div>

        <div className="orn-3">
          <div className="orn-1">
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="1200" data-aos-delay="650">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-1.png" alt="Orn 1" />
            </div>
          </div>
          <div className="orn-2">
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="1200" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-2.png" alt="Orn 2" />
            </div>
          </div>
          <div className="image-wrap" data-aos="fade-right" data-aos-duration="1200" data-aos-delay="550">
            <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-3-min.png" alt="Orn 3" />
          </div>
        </div>

        <div className="orn-8">
          <div className="image-wrap" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="300">
            <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-8.png" alt="Orn 8" />
          </div>
          <div className="orn-7">
            <div className="image-wrap" data-aos="fade-down" data-aos-duration="1000" data-aos-delay="250">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-7.png" alt="Orn 7" />
            </div>
          </div>
          <div className="orn-5">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="450">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-5.png" alt="Orn 5" />
            </div>
          </div>
          <div className="orn-6">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-6.png" alt="Orn 6" />
            </div>
          </div>
          <div className="orn-10">
            <div className="image-wrap" data-aos="fade-left" data-aos-duration="1000">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-10.png" alt="Orn 10" />
            </div>
          </div>
          <div className="orn-9">
            <div className="image-wrap" data-aos="fade-down" data-aos-duration="1000" data-aos-delay="200">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-9.png" alt="Orn 9" />
            </div>
          </div>
          <div className="orn-1">
            <div className="image-wrap" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="350">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-1.png" alt="Orn 1" />
            </div>
          </div>
        </div>
      </div>

      <div className="footnote">
        <p className="top-text" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="100">The wedding Of</p>
        <h2 className="footnote-title" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">{brideFirst} & {groomFirst}</h2>
        <p className="date" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="300">{eventDate ? formatFullDateId(eventDate) : null}</p>
      </div>
    </section>
  );
}

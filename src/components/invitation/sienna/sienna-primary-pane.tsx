/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */
// Sienna primary-pane contents — markup ported VERBATIM from the children of
// `<section class="primary-pane"><div class="inner">` in the Katsudoto "Syakira"
// (Filan & Agung) reference, so the scoped CSS in sienna-theme.ts (selectors
// under `.sienna-inv .primary-pane`) styles it byte-identically. SiennaEmbed
// supplies the <section class="primary-pane"><div class="inner"> shell; this
// component renders only the inner content: the four decorative corner ornament
// stacks (raw <img>), the "Filan & Agung"-style title + "Dear," greeting, and the
// cover-pane preview (bound to the cover photo). Data-bearing parts: the couple
// display names (bride-first) and the cover photo. All data-aos attributes are
// kept; AOS runtime artifacts (aos-init/aos-animate + baked inline transition
// styles) are stripped — the SiennaEmbed IntersectionObserver drives the reveal.

import type { InvitationView } from "@/server/queries/invitation";

import { InvImage } from "../scarlet/inv-image";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** Guest display name (?g= guest, else ?to=) — appended after "Dear,". */
  guestName?: string;
};

// Display name = the editable "Nama lengkap" (pasangan.fullName) first word,
// falling back to the wedding's top-level name. Editing the form updates this.
function firstName(fullName: string | undefined, fallback: string): string {
  const n = (fullName ?? "").trim() || fallback;
  return n.split(/\s+/)[0] || fallback;
}

export function SiennaPrimaryPane({ data, guestName }: Props) {
  const brideFirst = firstName(data.sections.pasangan.bride.fullName, data.brideName);
  const groomFirst = firstName(data.sections.pasangan.groom.fullName, data.groomName);
  const cover = data.photos.find((p) => p.isCover) ?? data.photos[0];

  return (
    <>
      <div className="ornaments-wrapper">
        <div className="orn-top-left">
          <div className="orn-3">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="700">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-story-1.png" alt="Orn 2" />
            </div>
          </div>
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="500">
            <img loading="lazy" decoding="async" src="/invitation/sienna/top-cover-2.png" alt="Orn 1" />
          </div>
          <div className="orn-2">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/sienna/top-cover-3.png" alt="Orn 2" />
            </div>
          </div>
        </div>

        <div className="orn-bottom-left">
          <div className="orn-3">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="700">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-story-1.png" alt="Orn 2" />
            </div>
          </div>
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="500">
            <img loading="lazy" decoding="async" src="/invitation/sienna/top-cover-1.png" alt="Orn 1" />
          </div>
          <div className="orn-2">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/sienna/top-cover-3.png" alt="Orn 2" />
            </div>
          </div>
        </div>

        <div className="orn-top-right">
          <div className="orn-3">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="700">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-story-1.png" alt="Orn 2" />
            </div>
          </div>
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="500">
            <img loading="lazy" decoding="async" src="/invitation/sienna/top-cover-1.png" alt="Orn 1" />
          </div>
          <div className="orn-2">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/sienna/top-cover-3.png" alt="Orn 2" />
            </div>
          </div>
        </div>

        <div className="orn-bottom-right">
          <div className="orn-3">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="700">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-story-1.png" alt="Orn 2" />
            </div>
          </div>
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="500">
            <img loading="lazy" decoding="async" src="/invitation/sienna/top-cover-2.png" alt="Orn 1" />
          </div>
          <div className="orn-2">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="600">
              <img loading="lazy" decoding="async" src="/invitation/sienna/top-cover-3.png" alt="Orn 2" />
            </div>
          </div>
        </div>
      </div>

      <div className="details">
        <h1 data-aos="zoom-out" data-aos-duration="1200">
          {brideFirst} &amp; {groomFirst}
        </h1>
        <p data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
          Dear,{guestName ? ` ${guestName}` : ""}
        </p>
      </div>

      <div className="highlight" data-aos="zoom-out" data-aos-duration="1000">
        <div className="preview-container cover-show" id="cover-pane">
          {cover && (
            <div className="picture mobile">
              <InvImage src={cover.url} alt="" priority />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

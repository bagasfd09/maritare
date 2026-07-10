/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */
// Plum primary-pane contents — markup ported VERBATIM from the children of
// `<section class="primary-pane"><div class="inner">` in the Katsudoto "Kinanti"
// (Arvi & Aditya) reference, so the scoped CSS in plum-theme.ts (selectors under
// `.plum-inv .primary-pane`) styles it byte-identically. PlumEmbed supplies the
// <section class="primary-pane"><div class="inner"> shell; this renders the inner
// content: the forest/bg ornament layers, the stacked couple names (bride-first),
// the greeting (with the guest name when present), and the two identical bottom
// ornament clusters. data-aos attributes kept; AOS runtime artifacts
// (aos-init/aos-animate + baked inline transition styles) stripped.

import type { InvitationView } from "@/server/queries/invitation";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** Guest display name (?g= guest, else ?to=) — shown under "Kepada Yth,". */
  guestName?: string;
};

// Display name = the editable "Nama lengkap" (pasangan.fullName) first word,
// falling back to the wedding's top-level name.
function firstName(fullName: string | undefined, fallback: string): string {
  const n = (fullName ?? "").trim() || fallback;
  return n.split(/\s+/)[0] || fallback;
}

// The two bottom ornament stacks (br-1 / bl-1) are byte-identical apart from the
// outer position class — render one helper twice. `img` is a raw decorative img.
function PrimaryOrnCluster({ pos }: { pos: "br-1" | "bl-1" }) {
  return (
    <div className={`orn-primary--bottom ${pos}`}>
      <div className="orn-primary--bottom br-5">
        <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="100">
          <img loading="lazy" decoding="async" src="/invitation/plum/orn-33-min.png" alt="Ornament" />
        </div>
      </div>
      <div className="orn-primary--bottom br-4">
        <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
          <img loading="lazy" decoding="async" src="/invitation/plum/orn-1-min.png" alt="Ornament" />
        </div>
      </div>
      <div className="orn-primary--bottom br-3">
        <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="300">
          <img loading="lazy" decoding="async" src="/invitation/plum/orn-5-min.png" alt="Ornament" />
        </div>
      </div>
      <div className="orn-primary--bottom br-2">
        <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="400">
          <img loading="lazy" decoding="async" src="/invitation/plum/orn-2-min.png" alt="Ornament" />
        </div>
      </div>
      <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="500">
        <img loading="lazy" decoding="async" src="/invitation/plum/orn-26-min.png" alt="Ornament" />
      </div>
      <div className="orn-primary--bottom br-6">
        <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="100">
          <img loading="lazy" decoding="async" src="/invitation/plum/orn-37-min.png" alt="Ornament" />
        </div>
      </div>
      <div className="orn-primary--bottom br-7">
        <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
          <img loading="lazy" decoding="async" src="/invitation/plum/orn-36-min.png" alt="Ornament" />
        </div>
      </div>
      <div className="orn-primary--bottom br-8">
        <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="300">
          <img loading="lazy" decoding="async" src="/invitation/plum/orn-28-min.png" alt="Ornament" />
        </div>
      </div>
      <div className="orn-primary--bottom br-9">
        <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="400">
          <img loading="lazy" decoding="async" src="/invitation/plum/orn-3-min.png" alt="Ornament" />
        </div>
      </div>
      <div className="orn-primary--bottom br-10">
        <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="500">
          <img loading="lazy" decoding="async" src="/invitation/plum/orn-8-min.png" alt="Ornament" />
        </div>
      </div>
    </div>
  );
}

export function PlumPrimaryPane({ data, guestName }: Props) {
  const brideFirst = firstName(data.sections.pasangan.bride.fullName, data.brideName);
  const groomFirst = firstName(data.sections.pasangan.groom.fullName, data.groomName);

  return (
    <>
      <div className="ornaments-wrapper">
        <div className="bg-primary-forest">
          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="100">
            <img loading="lazy" decoding="async" src="/invitation/plum/bg-overlay-min.png" alt="Ornament" />
          </div>
        </div>
        <div className="bg-primary-mount">
          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="200">
            <img loading="lazy" decoding="async" src="/invitation/plum/bg-min.png" alt="Ornament" />
          </div>
        </div>
        <div className="orn-primary-frame">
          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="300">
            <img loading="lazy" decoding="async" src="/invitation/plum/orn-frame-2-min.png" alt="Ornament" />
          </div>
        </div>
      </div>

      <div className="primary-pane-content">
        <div className="primary-pane-details">
          <div className="primary-pane-details--content">
            <h1
              className="primary-pane-title"
              id="pp-title"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="700"
            >
              {brideFirst}
              <br />
              &amp; <br />
              {groomFirst}
            </h1>

            <div
              className="link-wrap"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay="1200"
              data-aos-anchor="#pp-title"
            >
              <p className="greeting-text">
                Kepada Yth,
                <br />
                {guestName ? guestName : "Bapak / Ibu / Sdr /i"}
              </p>
            </div>
          </div>
        </div>

        <div className="ornaments-wrapper">
          <PrimaryOrnCluster pos="br-1" />
          <PrimaryOrnCluster pos="bl-1" />
        </div>
      </div>
    </>
  );
}

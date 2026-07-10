/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */
// Ivory footnote / closing — markup ported VERBATIM from the Katsudoto Aulia
// `<section class="footnote-wrap">` fragment so the scoped CSS in the ivory
// theme (selectors under `.ivory-inv`) styles it byte-identically. Only the
// data-bearing parts are bound to InvitationView:
//   - the closing photo (was a `thumb-lg-*.webp` upload) as a single <InvImage>,
//   - couple display names in the .footnote-title (bride-first),
//   - the wedding date in .bottom-text (replaces the static hashtag — there is
//     no hashtag field to bind, and the date is the section's only other slot).
// "We are getting married!" stays verbatim. Every decorative Orn-*/0X ornament,
// the bird/cloud/butterfly clusters, and all data-aos attributes are kept.

import { formatFullDateId } from "../flora/format";
import { InvImage } from "../scarlet/inv-image";
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

export function IvoryFootnote({ data }: Props) {
  // Prefer a dedicated closing photo; fall back to the cover (then the first
  // photo) so weddings that haven't set a separate closing image keep working.
  const closingPhoto =
    data.photos.find((p) => p.isClosing) ??
    data.photos.find((p) => p.isCover) ??
    data.photos[0];
  const groomFirst = firstName(data.sections.pasangan.groom.fullName, data.groomName);
  const brideFirst = firstName(data.sections.pasangan.bride.fullName, data.brideName);
  // formatFullDateId needs a non-null string; events[0]?.date ?? eventDate may be null.
  const eventDate = data.sections.acara.events[0]?.date ?? data.eventDate;

  return (
    <section className="footnote-wrap" data-section-order="footnote">
      <div className="ornaments-wrapper">
        <div className="orn-ff-center-3">
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="2600" data-aos-delay="2300">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-60.png" alt="orn-bank" />
          </div>
        </div>
        <div className="orn-ff-center-2">
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="2100" data-aos-delay="2200">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-51.png" alt="orn-bank" />
          </div>
          <div className="orn-ff-center-2-2">
            <div className="image-wrap" data-aos="fade-left" data-aos-duration="3500" data-aos-delay="2700">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-bebek-1.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-center-2-3">
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="3500" data-aos-delay="2700">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-bebek-2.png" alt="orn-bank" />
            </div>
          </div>
        </div>
        <div className="orn-ff-center">
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="3500" data-aos-delay="500">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-59.png" alt="orn-bank" />
          </div>
        </div>
        <div className="orn-ff-1 right">
          <div className="orn-ff-1-1">
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="2600" data-aos-delay="2600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-06.png" alt="orn-bank" />
            </div>
            <div className="orn-ff-bird bird">
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1500" data-aos-delay="3000">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-burung.png" alt="orn-bank" />
              </div>
            </div>
          </div>
          <div className="image-wrap" data-aos="fade-right" data-aos-duration="2400" data-aos-delay="2100">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-35.png" alt="orn-bank" />
          </div>
          <div className="orn-ff-1-2">
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="2000" data-aos-delay="1600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-38.png" alt="orn-bank" />
            </div>
          </div>
        </div>
        <div className="orn-ff-1 left">
          <div className="orn-ff-1-1">
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="2600" data-aos-delay="2600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-06.png" alt="orn-bank" />
            </div>
          </div>
          <div className="image-wrap" data-aos="fade-right" data-aos-duration="2400" data-aos-delay="2100">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-35.png" alt="orn-bank" />
          </div>
          <div className="orn-ff-1-2">
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="2000" data-aos-delay="1600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-38.png" alt="orn-bank" />
            </div>
          </div>
        </div>
        {/* Btm Orn  */}
        <div className="orn-ff-4">
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="2000" data-aos-delay="500">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-68.png" alt="orn-bank" />
          </div>
        </div>

        <div className="orn-ff-2 left">
          <div className="orn-ff-2-7">
            <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2600" data-aos-delay="1600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-18.png" alt="orn-bank" />
            </div>
            <div className="orn-ff-2-7-1 kupu-1">
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="2200" data-aos-delay="900">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-kupu-1.png" alt="orn-bank" />
              </div>
            </div>
          </div>
          <div className="orn-ff-2-3">
            <div className="orn-ff-2-3-1">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="2300" data-aos-delay="1300">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-40.png" alt="orn-bank" />
              </div>
            </div>
            <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2000" data-aos-delay="1000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-22.png" alt="orn-bank" />
            </div>
          </div>
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="1500" data-aos-delay="600">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-63.png" alt="orn-bank" />
          </div>
          <div className="orn-ff-2-6">
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="2200" data-aos-delay="1300">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-13.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-2-4">
            <div className="orn-ff-2-4-1">
              <div className="image-wrap" data-aos="fade-right" data-aos-duration="2900" data-aos-delay="2000">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-12.png" alt="orn-bank" />
              </div>
            </div>
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="2800" data-aos-delay="1900">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-64.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-2-5">
            <div className="image-wrap" data-aos="fade-left" data-aos-duration="2400" data-aos-delay="1300">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-04.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-2-1">
            <div className="image-wrap" data-aos="zoom-in-right" data-aos-duration="2100" data-aos-delay="700">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-61.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-2-2">
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="2000" data-aos-delay="800">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-62.png" alt="orn-bank" />
            </div>
          </div>
        </div>

        <div className="orn-ff-2 right">
          <div className="orn-ff-2-7">
            <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2600" data-aos-delay="1600">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-18.png" alt="orn-bank" />
            </div>
            <div className="orn-ff-2-7-1 kupu-2">
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="2200" data-aos-delay="900">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-kupu-2.png" alt="orn-bank" />
              </div>
            </div>
          </div>
          <div className="orn-ff-2-3">
            <div className="orn-ff-2-3-1">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="2300" data-aos-delay="1300">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-40.png" alt="orn-bank" />
              </div>
            </div>
            <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2000" data-aos-delay="1000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-22.png" alt="orn-bank" />
            </div>
          </div>
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="1500" data-aos-delay="600">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-63.png" alt="orn-bank" />
          </div>
          <div className="orn-ff-2-6">
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="2200" data-aos-delay="1300">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-13.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-2-4">
            <div className="orn-ff-2-4-1">
              <div className="image-wrap" data-aos="fade-right" data-aos-duration="2900" data-aos-delay="2000">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-12.png" alt="orn-bank" />
              </div>
            </div>
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="2800" data-aos-delay="1900">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-64.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-2-5">
            <div className="image-wrap" data-aos="fade-left" data-aos-duration="2400" data-aos-delay="1300">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-04.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-2-1">
            <div className="image-wrap" data-aos="zoom-in-right" data-aos-duration="2100" data-aos-delay="700">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-61.png" alt="orn-bank" />
            </div>
          </div>
          <div className="orn-ff-2-2">
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="2000" data-aos-delay="800">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-62.png" alt="orn-bank" />
            </div>
          </div>
        </div>

        <div className="orn-ff-3">
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="2000" data-aos-delay="500">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-67.png" alt="orn-bank" />
          </div>
        </div>

        <div className="orn-ff-awan right awan">
          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1500" data-aos-delay="3000">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-awan.png" alt="orn-bank" />
          </div>
        </div>
        <div className="orn-ff-awan left awan">
          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1500" data-aos-delay="3000">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-awan.png" alt="orn-bank" />
          </div>
        </div>

        <div className="orn-herd-burung orn-herd-ff-1">
          <div className="image-wrap herd-pct">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-herd.png" alt="orn-gift" />
          </div>
          <div className="orn-burung-1">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="3000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/01.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-2">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="3000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/02.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-3">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="3000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/01.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-4">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="3000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/05.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-5">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="3000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/03.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-6">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="3000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/03.png" alt="orn-gift" />
            </div>
          </div>
        </div>
        <div className="orn-herd-burung orn-herd-ff-2">
          <div className="image-wrap herd-pct">
            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-herd.png" alt="orn-gift" />
          </div>
          <div className="orn-burung-1">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="3000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/01.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-2">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="3000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/02.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-3">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="3000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/01.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-4">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="3000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/05.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-5">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="3000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/03.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-burung-6">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="3000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/03.png" alt="orn-gift" />
            </div>
          </div>
        </div>
      </div>

      <div className="footnote">
        <div className="orn-wrapper">
          <div className="orn-footnote-logo">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="1000">
              {closingPhoto && (
                <InvImage
                  src={closingPhoto.url}
                  alt={closingPhoto.label ?? `Foto ${brideFirst} & ${groomFirst}`}
                  className="logo"
                />
              )}
            </div>
          </div>
        </div>

        <div className="content">
          <p className="top-text" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="1000">We are getting married!</p>
          <h2 className="footnote-title" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="1000">{brideFirst} &amp;<br />{groomFirst}</h2>
          <p className="bottom-text" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="1000">{eventDate ? formatFullDateId(eventDate) : null}</p>
        </div>
      </div>

      <div className="ornaments-wrapper"></div>
    </section>
  );
}

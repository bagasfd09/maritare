/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */
// Plum couple — markup ported VERBATIM from the Katsudoto "kinanti"
// `<section class="couple-wrap">` fragment so the scoped CSS under `.plum-inv`
// styles the ornament cluster byte-identically. The two couple-info blocks
// (groom first, then separator "&", then bride — the fragment's DOM order; the
// `couple-body bride-first` modifier flips the visual layout in CSS) are produced
// by one parameterized helper so the ornament markup stays identical. Only
// data-bearing parts are bound:
//   - couple-name = pasangan.<side>.fullName (fallback data.<side>Name),
//   - parents line via parentsLines (childOrder / Bapak / & Ibu) — copied from
//     sienna-couple,
//   - the framed couple photo as <InvImage>.
// DIFFERENCES vs sienna: plum has NO couple-head intro and NO couple-bio.
// Instead each card carries a couple-link-wrap with an Instagram link (rendered
// only when the handle is set). The reference used a `<i class="fab fa-instagram">`
// icon font that isn't bundled, so it's replaced by a small inline SVG glyph.

import { Fragment } from "react";

import { type PasanganData } from "@/lib/invitation/sections";
import type { InvitationView } from "@/server/queries/invitation";

import { InvImage } from "../scarlet/inv-image";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
};

type Person = PasanganData["groom"];

/** Parents block as separate lines: child order, father, mother — each on its
 *  own line, absent parts omitted. "& " prefixes the mother only when there's a
 *  father line above her. Mirrors sienna-couple's parentsLines exactly. */
function parentsLines(person: Person): string[] {
  const lines: string[] = [];
  if (person.childOrder) lines.push(person.childOrder);
  if (person.fatherName) lines.push(`Bapak ${person.fatherName}`);
  if (person.motherName) lines.push(`${person.fatherName ? "& " : ""}Ibu ${person.motherName}`);
  return lines;
}

/** Small inline Instagram glyph (rounded square + lens + dot). Replaces the
 *  reference's `<i class="fab fa-instagram">` font icon, which isn't bundled.
 *  Sized in `em` so it tracks the link's font-size; inherits `currentColor`. */
function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

type CoupleInfoProps = {
  person: Person;
  /** Wedding short name (data.groomName | data.brideName), used when the full
   *  name is blank. */
  fallbackName: string;
  photoUrl?: string;
  /** "groom" | "bride" — drives the couple-info modifier class. */
  side: "groom" | "bride";
};

function CoupleInfo({ person, fallbackName, photoUrl, side }: CoupleInfoProps) {
  const fullName = (person.fullName ?? "").trim();
  const displayName = fullName || fallbackName;
  const parents = parentsLines(person);
  const handle = (person.instagram ?? "").trim();

  return (
    <div className={`couple-info ${side}`}>
      <div className="couple-preview">
        <div className="couple-frame">
          <div className="orn-couple--top tl-1">
            <div className="image-wrap" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="100">
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-38-min.png" alt="Ornament" />
            </div>
          </div>
          <div className="orn-couple--top tr-1">
            <div className="image-wrap" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="200">
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-38-min.png" alt="Ornament" />
            </div>
          </div>

          <div className="couple-picture-wrap">
            <div className="couple-picture" data-aos="zoom-out" data-aos-duration="1000">
              {photoUrl ? (
                <a className="img-wrap" href={photoUrl} target="_blank" rel="noopener noreferrer">
                  <InvImage className="img" src={photoUrl} alt={displayName} />
                </a>
              ) : (
                <div className="img-wrap" />
              )}
            </div>
          </div>

          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000">
            <img loading="lazy" decoding="async" src="/invitation/plum/orn-frame-1-min.png" alt="Ornament" />
          </div>

          <div className="orn-couple--bottom bl-1">
            <div className="image-wrap" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="100">
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-6-min.png" alt="Ornament" />
            </div>
            <div className="orn-couple--bottom bl-2">
              <div className="image-wrap" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="200">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-4-min.png" alt="Ornament" />
              </div>
            </div>
          </div>
          <div className="orn-couple--bottom br-1">
            <div className="image-wrap" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="100">
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-6-min.png" alt="Ornament" />
            </div>
            <div className="orn-couple--bottom bl-2">
              <div className="image-wrap" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="200">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-4-min.png" alt="Ornament" />
              </div>
            </div>
          </div>
        </div>

        <div className="orn-couple--top tl-2">
          <div className="orn-couple--top tl-4">
            <div className="image-wrap" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="100">
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-2-min.png" alt="Ornament" />
            </div>
          </div>
          <div className="image-wrap" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="200">
            <img loading="lazy" decoding="async" src="/invitation/plum/orn-39-min.png" alt="Ornament" />
          </div>
          <div className="orn-couple--top tl-3">
            <div className="image-wrap" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="100">
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-11-min.png" alt="Ornament" />
            </div>
          </div>
        </div>

        <div className="orn-couple--top tr-2">
          <div className="orn-couple--top tl-4">
            <div className="image-wrap" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="100">
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-2-min.png" alt="Ornament" />
            </div>
          </div>
          <div className="image-wrap" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="200">
            <img loading="lazy" decoding="async" src="/invitation/plum/orn-39-min.png" alt="Ornament" />
          </div>
          <div className="orn-couple--top tl-3">
            <div className="image-wrap" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="100">
              <img loading="lazy" decoding="async" src="/invitation/plum/orn-11-min.png" alt="Ornament" />
            </div>
          </div>
        </div>
      </div>

      <div className="couple-details">
        <h2 className="couple-name" data-aos="fade-up" data-aos-duration="1000">
          {displayName}
        </h2>
        {parents.length > 0 && (
          <p className="couple-parents" data-aos="fade-up" data-aos-duration="1000">
            {parents.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </p>
        )}
        {handle && (
          <div className="couple-link-wrap" data-aos="fade-up" data-aos-duration="1000">
            <a
              href={`https://www.instagram.com/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="couple-link"
            >
              <InstagramIcon /> @{handle}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function PlumCouple({ data }: Props) {
  const { pasangan } = data.sections;

  return (
    <section className="couple-wrap" data-section-order="couple">
      <div className="couple">
        <div className="couple-body  bride-first   show-picture  ">
          <CoupleInfo
            person={pasangan.groom}
            fallbackName={data.groomName}
            photoUrl={data.couplePhotoUrls.groom}
            side="groom"
          />

          <div className="separator-wrap">
            <div className="separator" data-aos="zoom-in" data-aos-duration="1500">
              <h2 className="couple-separator">&amp;</h2>
            </div>
          </div>

          <CoupleInfo
            person={pasangan.bride}
            fallbackName={data.brideName}
            photoUrl={data.couplePhotoUrls.bride}
            side="bride"
          />
        </div>
      </div>
    </section>
  );
}

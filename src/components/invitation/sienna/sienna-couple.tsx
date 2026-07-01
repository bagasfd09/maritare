/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */
// Sienna couple — markup ported VERBATIM from the Katsudoto "syakira"
// `<section class="couple-wrap">` fragment so the scoped CSS under `.sienna-inv`
// styles the large ornament cluster byte-identically. The two couple-info blocks
// (groom first, then bride — the fragment's DOM order; the `couple-body
// bride-first` modifier flips the visual layout in CSS) are produced by one
// parameterized helper so the ornament markup stays identical. Only data-bearing
// parts are bound:
//   - couple-name = pasangan.<side>.fullName (fallback data.<side>Name),
//   - parents line via parentsLines (childOrder / Bapak / & Ibu) — copied from
//     ivory-couple,
//   - the framed couple photo as <InvImage>.
// couple-bio ("The Groom" / "The Bride") stays fixed design copy; the greeting
// paragraph is bound to the editable intro (mirrors ivory/scarlet).

import { Fragment } from "react";

import { COUPLE_INTRO_DEFAULTS, type PasanganData } from "@/lib/invitation/sections";
import type { InvitationView } from "@/server/queries/invitation";

import { InvImage } from "../scarlet/inv-image";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
};

type Person = PasanganData["groom"];

/** Parents block as separate lines: child order, father, mother — each on its
 *  own line, absent parts omitted. "& " prefixes the mother only when there's a
 *  father line above her. Mirrors ivory-couple's parentsLines exactly. */
function parentsLines(person: Person): string[] {
  const lines: string[] = [];
  if (person.childOrder) lines.push(person.childOrder);
  if (person.fatherName) lines.push(`Bapak ${person.fatherName}`);
  if (person.motherName) lines.push(`${person.fatherName ? "& " : ""}Ibu ${person.motherName}`);
  return lines;
}

type CoupleInfoProps = {
  person: Person;
  /** Wedding short name (data.groomName | data.brideName), used when the full
   *  name is blank. */
  fallbackName: string;
  photoUrl?: string;
  /** "groom" | "bride" — drives the couple-info modifier class. */
  side: "groom" | "bride";
  /** Static design copy: "The Groom" | "The Bride". */
  bio: string;
};

function CoupleInfo({ person, fallbackName, photoUrl, side, bio }: CoupleInfoProps) {
  const fullName = (person.fullName ?? "").trim();
  const displayName = fullName || fallbackName;
  const parents = parentsLines(person);

  return (
    <div className={`couple-info ${side}`}>
      <div className="couple-preview">
        <div className="couple-frame">
          <div className="orn-1">
            <div className="image-wrap" data-aos="fade-up-right" data-aos-duration="1200" data-aos-delay="400" data-aos-once="false">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-1.png" alt="Orn 1" />
            </div>
          </div>
          <div className="orn-2">
            <div className="image-wrap" data-aos="fade-left" data-aos-duration="1200" data-aos-delay="450" data-aos-once="false">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-event-1.png" alt="Orn 2" />
            </div>
          </div>
          <div className="orn-3">
            <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="500" data-aos-once="false">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-story-1.png" alt="Orn 3" />
            </div>
          </div>
          <div className="orn-7">
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="1200" data-aos-delay="650" data-aos-once="false">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-couple-2.png" alt="Orn 7" />
            </div>
          </div>
          <div className="orn-6">
            <div className="image-wrap" data-aos="fade-down-right" data-aos-duration="1200" data-aos-delay="700" data-aos-once="false">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-wish-1.png" alt="Orn 6" />
            </div>
          </div>
          <div className="orn-8">
            <div className="image-wrap" data-aos="fade-up-left" data-aos-duration="1200" data-aos-delay="750" data-aos-once="false">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-cover-1.png" alt="Orn 8" />
            </div>
          </div>
          <div className="orn-9">
            <div className="image-wrap" data-aos="fade-up-left" data-aos-duration="1200" data-aos-delay="800" data-aos-once="false">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-6.png" alt="Orn 9" />
            </div>
          </div>

          <div className="couple-picture-wrap">
            <div className="couple-picture" data-aos="zoom-out" data-aos-duration="500" data-aos-once="false">
              {photoUrl ? (
                <a className="img-wrap" href={photoUrl} target="_blank" rel="noopener noreferrer">
                  <InvImage className="img" src={photoUrl} alt={displayName} />
                </a>
              ) : (
                <div className="img-wrap" />
              )}
            </div>
          </div>

          <div className="decor-frame">
            <div className="image-wrap" data-aos="zoom-out" data-aos-duration="1500" data-aos-once="false">
              <img loading="lazy" decoding="async" src="/invitation/sienna/couple-frame-mirror.png" alt="Frame" />
            </div>
          </div>

          <div className="orn-4">
            <div className="image-wrap" data-aos="fade-down-right" data-aos-duration="1200" data-aos-delay="550" data-aos-once="false">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-gift-1.png" alt="Orn 4" />
            </div>
          </div>
          <div className="orn-5">
            <div className="image-wrap" data-aos="fade-down-right" data-aos-duration="1200" data-aos-delay="600" data-aos-once="false">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-7.png" alt="Orn 5" />
            </div>
          </div>
        </div>

        <div className="ornaments-wrapper">
          <div className="orn-edge">
            <div className="orn-1">
              <div className="image-wrap" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="950">
                <img loading="lazy" decoding="async" src="/invitation/sienna/orn-couple-2.png" alt="Orn 1" />
              </div>
            </div>
            <div className="orn-2">
              <div className="image-wrap" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="900">
                <img loading="lazy" decoding="async" src="/invitation/sienna/orn-couple-1.png" alt="Orn 2" />
              </div>
            </div>
            <div className="orn-3">
              <div className="image-wrap" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="800">
                <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-8.png" alt="Orn 3" />
              </div>
            </div>
            <div className="image-wrap" data-aos="fade-right" data-aos-duration="1000" data-aos-delay="850">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-event-tl-6.png" alt="Orn 2" />
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
        <p className="couple-bio" data-aos="fade-up" data-aos-duration="1000">
          {bio}
        </p>
      </div>
    </div>
  );
}

export function SiennaCouple({ data }: Props) {
  const { pasangan } = data.sections;
  // Editable couple-section greeting; blank → the template default copy.
  const introDescription =
    pasangan.intro?.description?.trim() || COUPLE_INTRO_DEFAULTS.description;

  return (
    <section className="couple-wrap" data-section-order="couple">
      <div className="couple">
        <div className="couple-head">
          <p className="couple-description" data-aos="fade-up" data-aos-duration="1000">
            {introDescription}
          </p>
        </div>

        <div className="couple-body  bride-first   show-picture  ">
          <CoupleInfo
            person={pasangan.groom}
            fallbackName={data.groomName}
            photoUrl={data.couplePhotoUrls.groom}
            side="groom"
            bio="The Groom"
          />

          <div className="separator-wrap">
            <div className="separator" data-aos="zoom-in" data-aos-duration="1500">
              <h2 className="couple-separator">&amp;</h2>
            </div>

            <div className="ornaments-wrapper">
              <div className="orn-2">
                <div className="orn-1">
                  <div className="image-wrap" data-aos="fade-right" data-aos-duration="1200" data-aos-delay="400">
                    <img loading="lazy" decoding="async" src="/invitation/sienna/orn-story-1.png" alt="Orn 1" />
                  </div>
                </div>
                <div className="image-wrap" data-aos="fade-left" data-aos-duration="1200" data-aos-delay="200">
                  <img loading="lazy" decoding="async" src="/invitation/sienna/orn-couple-separator-1.png" alt="Orn 2" />
                </div>
              </div>
            </div>
          </div>

          <CoupleInfo
            person={pasangan.bride}
            fallbackName={data.brideName}
            photoUrl={data.couplePhotoUrls.bride}
            side="bride"
            bio="The Bride"
          />
        </div>
      </div>
    </section>
  );
}

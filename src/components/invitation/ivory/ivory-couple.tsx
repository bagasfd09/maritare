/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */
// Ivory couple ("The Bride & Groom") — markup ported VERBATIM from the Katsudoto
// Aulia `<section class="couple-wrap">` fragment so the scoped CSS under
// `.ivory-inv` styles the large ornament cluster byte-identically. The two
// couple-info blocks (groom first, then bride — Aulia's `bride-first` order
// matches scarlet-couple's side order) are produced by one parameterized helper
// so the ornament markup stays identical. Only data-bearing parts are bound:
//   - couple-name = `{nickname} — {fullName}` (nickname = data.groomName/brideName,
//     used as-is; the reference's bride lead "Sinta" is the 2nd word of
//     "Dewi Sinta", so it is the wedding nickname, not firstName(fullName)),
//   - parents line via scarlet's parentsLines (childOrder / Bapak / & Ibu),
//   - instagram link (only when set), and the framed couple photo as <InvImage>.
// The couple-head heading "The Bride & Groom" is kept verbatim (design copy); the
// greeting paragraph is bound to the editable intro (scarlet mirrors this).

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
 *  father line above her. Mirrors scarlet-couple's parentsLines exactly. */
function parentsLines(person: Person): string[] {
  const lines: string[] = [];
  if (person.childOrder) lines.push(person.childOrder);
  if (person.fatherName) lines.push(`Bapak ${person.fatherName}`);
  if (person.motherName) lines.push(`${person.fatherName ? "& " : ""}Ibu ${person.motherName}`);
  return lines;
}

type CoupleInfoProps = {
  person: Person;
  /** The wedding's short/nickname (data.groomName | data.brideName) — the lead
   *  before the em-dash, used as-is. */
  nickname: string;
  photoUrl?: string;
  /** "groom" | "bride" — drives the couple-info modifier class. */
  side: "groom" | "bride";
};

function CoupleInfo({ person, nickname, photoUrl, side }: CoupleInfoProps) {
  const fullName = (person.fullName ?? "").trim();
  // One name only (the "{nickname} — {fullName}" combo read as a duplicate when
  // both are similar, e.g. "Bagas — Bagas"): the full name when set, else the
  // wedding nickname.
  const coupleName = fullName || nickname;
  const photoAlt = fullName || nickname;
  const parents = parentsLines(person);

  return (
    <div className={`couple-info ${side}`}>
      <div className="couple-details">
        <h2 className="couple-name" data-aos="fade-up" data-aos-duration="1000">
          {coupleName}
        </h2>
      </div>

      <div className="couple-preview">
        <div className="couple-frame">
          <div className="orn-cp-5">
            <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="1700" data-aos-delay="1900">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-08.png" alt="Ornaments" />
            </div>
          </div>

          <div className="orn-cp-4">
            <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="1700" data-aos-delay="1900">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-06.png" alt="Ornaments" />
            </div>
            <div className="orn-cp-4-1">
              <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="1800" data-aos-delay="1900">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-13.png" alt="Ornaments" />
              </div>
            </div>
          </div>

          <div className="cp-frame-wrap">
            <div className="orn-cp-3">
              <div className="image-wrap" data-aos="zoom-in-down" data-aos-duration="2300" data-aos-delay="2100">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-02.png" alt="Ornaments" />
              </div>
            </div>
            <div className="orn-cp-2">
              <div className="image-wrap" data-aos="zoom-in-right" data-aos-duration="1900" data-aos-delay="1700">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-23.png" alt="Ornaments" />
              </div>
              <div className="orn-cp-2-1">
                <div className="image-wrap" data-aos="zoom-in-left" data-aos-duration="2100" data-aos-delay="2000">
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-04.png" alt="Ornaments" />
                </div>
              </div>
            </div>

            <div className="couple-picture-wrap">
              <div
                className="couple-picture"
                data-aos="zoom-out"
                data-aos-duration="1000"
                data-aos-once="false"
              >
                {photoUrl ? (
                  <a className="img-wrap" href={photoUrl} target="_blank" rel="noopener noreferrer">
                    <InvImage className="img" src={photoUrl} alt={photoAlt} />
                  </a>
                ) : (
                  <div className="img-wrap" />
                )}
              </div>
            </div>
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000">
              <img loading="lazy" decoding="async" src="/invitation/ivory/frame-couple.png" className="img-couple-frame" alt="Frame" />
            </div>

            <div className="orn-cp-1">
              <div className="orn-cp-1-4">
                <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="1500" data-aos-delay="900">
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-22.png" alt="Ornaments" />
                </div>
              </div>
              <div className="orn-cp-1-3">
                <div className="orn-cp-1-3-1">
                  <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2200" data-aos-delay="1400">
                    <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-18.png" alt="Ornaments" />
                  </div>
                </div>
                <div className="image-wrap" data-aos="zoom-in-right" data-aos-duration="2100" data-aos-delay="1200">
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-20.png" alt="Ornaments" />
                </div>
              </div>
              <div className="orn-cp-1-1">
                <div className="image-wrap" data-aos="zoom-in-right" data-aos-duration="1800" data-aos-delay="900">
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-19.png" alt="Ornaments" />
                </div>
              </div>
              <div className="orn-cp-1-2">
                <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="1500" data-aos-delay="800">
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-12.png" alt="Ornaments" />
                </div>
              </div>
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="600">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-17.png" alt="Ornaments" />
              </div>
            </div>
          </div>

          <div className="orn-cp-6">
            <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="1700" data-aos-delay="1900">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-24.png" alt="Ornaments" />
            </div>
          </div>
        </div>
      </div>

      <div className="couple-details">
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
        {person.instagram && (
          <div className="couple-link-wrap" data-aos="fade-up" data-aos-duration="1000">
            <a
              href={`https://instagram.com/${person.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="couple-link"
            >
              <i className="fab fa-instagram"></i> @{person.instagram}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function IvoryCouple({ data }: Props) {
  const { pasangan } = data.sections;
  // Editable couple-section greeting; blank → the template default copy. The
  // heading ("The Bride & Groom") stays fixed design copy; only the paragraph is
  // data-bound (mirrors scarlet-couple).
  const introDescription =
    pasangan.intro?.description?.trim() || COUPLE_INTRO_DEFAULTS.description;

  return (
    <section className="couple-wrap" data-section-order="couple">
      <div className="couple">
        <div className="couple-head">
          <div className="couple-head-wrap-1">
            <h1 className="couple-title" data-aos="zoom-in" data-aos-duration="1000">
              The Bride &amp; Groom
            </h1>
          </div>

          <div className="couple-head-wrap-1">
            <p className="couple-description" data-aos="fade-up" data-aos-duration="1000">
              {introDescription}
            </p>
          </div>
        </div>

        <div className="couple-body  bride-first   show-picture  ">
          <CoupleInfo
            person={pasangan.groom}
            nickname={data.groomName}
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
            nickname={data.brideName}
            photoUrl={data.couplePhotoUrls.bride}
            side="bride"
          />
        </div>
      </div>
    </section>
  );
}

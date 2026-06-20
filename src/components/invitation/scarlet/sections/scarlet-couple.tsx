/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */
// Scarlet couple â€” ported VERBATIM from <section.couple-wrap> in scarlet-body.ts.
// The two static couple-info blocks (groom + bride, rendered bride-first) are
// produced by one parameterized helper so the large ornament cluster markup
// (couple-frame / orn-couple-*) stays byte-identical. Only the data-bearing
// parts are bound: big script + full names, parents line, instagram link, and
// the couple photo (<a class="img-wrap" href> + <img class="img" src>) with an
// initial-letter fallback when a photo is undefined.

import { COUPLE_INTRO_DEFAULTS, type PasanganData } from "@/lib/invitation/sections";
import type { InvitationView } from "@/server/queries/invitation";

import { InvImage } from "../inv-image";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** Folk passes this to drop the full name shown above each parents line (the
   *  big script name already carries it, so it would read twice). */
  hideFullName?: boolean;
};

type Person = PasanganData["groom"];

/** "Putra pertama dari" + "Bapak <father> & Ibu <mother>" â€” omit absent parts. */
function parentsLine(person: Person): string | null {
  const parents = [
    person.fatherName ? `Bapak ${person.fatherName}` : null,
    person.motherName ? `Ibu ${person.motherName}` : null,
  ]
    .filter(Boolean)
    .join(" & ");
  if (!person.childOrder && !parents) return null;
  return [person.childOrder, parents].filter(Boolean).join(" ");
}

type CoupleInfoProps = {
  person: Person;
  /** Short display name fallback when fullName is empty. */
  shortName: string;
  photoUrl?: string;
  /** "groom" | "bride" â€” drives the couple-info modifier class + photo data-aos. */
  side: "groom" | "bride";
  /** Folk hides the full name above the parents line (the big script name already
   *  shows it above the photo, so it would otherwise read twice). */
  hideFullName?: boolean;
};

function CoupleInfo({ person, shortName, photoUrl, side, hideFullName }: CoupleInfoProps) {
  const displayName = (person.fullName ?? "").trim() || shortName;
  // Big script name = first word of the editable full name (falls back to short).
  const bigName = displayName.split(/\s+/)[0] || shortName;
  const parents = parentsLine(person);
  const photoAos = side === "groom" ? "zoom-in" : "zoom-in-right";
  // Default template photo when the couple hasn't uploaded one yet.
  const fallbackUrl =
    side === "groom"
      ? "/invitation/scarlet/default-groom.webp"
      : "/invitation/scarlet/default-bride.webp";
  const photoSrc = photoUrl ?? fallbackUrl;

  return (
    <div className={`couple-info ${side}`}>
      <div className="couple-details top">
        <div className="cp-top">
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="600">
            <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-cp.webp" alt="orn-cover" />
          </div>
        </div>
        <h1 className="couple-name-big">{bigName}</h1>
      </div>

      <div className="couple-preview ">
        <div className="couple-frame">
          <div className="couple-picture">
            <div className="orn-couple-4 right">
              <div
                className="image-wrap"
                data-aos="fade-up"
                data-aos-duration="1300"
                data-aos-delay="1100"
              >
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-24.webp" alt="ornaments" />
              </div>
            </div>
            <div className="orn-couple-4 left">
              <div
                className="image-wrap"
                data-aos="fade-up"
                data-aos-duration="1300"
                data-aos-delay="1100"
              >
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-24.webp" alt="ornaments" />
              </div>
            </div>
            <div className="orn-couple-3">
              <div
                className="image-wrap"
                data-aos="fade-up"
                data-aos-duration="1300"
                data-aos-delay="1000"
              >
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-23.webp" alt="ornaments" />
              </div>
            </div>

            {photoUrl ? (
              <a
                className="img-wrap"
                data-aos={photoAos}
                data-aos-duration="1500"
                data-aos-once="false"
                href={photoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <InvImage className="img" src={photoSrc} alt={displayName} />
              </a>
            ) : (
              <div
                className="img-wrap"
                data-aos={photoAos}
                data-aos-duration="1500"
                data-aos-once="false"
              >
                {/* default template photo until a real one is uploaded */}
                <InvImage className="img" src={photoSrc} alt={displayName} />
              </div>
            )}

            <div className="orn-couple-1">
              <div className="orn-couple-1-2">
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="900"
                  data-aos-delay="500"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-22.webp" alt="ornaments" />
                </div>
              </div>
              <div className="orn-couple-1-1">
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="1100"
                  data-aos-delay="650"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-19.webp" alt="ornaments" />
                </div>
              </div>
              <div
                className="image-wrap"
                data-aos="zoom-in"
                data-aos-duration="1000"
                data-aos-delay="600"
              >
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-18.webp" alt="ornaments" />
              </div>
            </div>
            <div className="orn-couple-2">
              <div className="orn-couple-2-1">
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="1200"
                  data-aos-delay="750"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-21.webp" alt="ornaments" />
                </div>
              </div>
              <div
                className="image-wrap"
                data-aos="zoom-in"
                data-aos-duration="1400"
                data-aos-delay="900"
              >
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-20.webp" alt="ornaments" />
              </div>
            </div>
          </div>
          <div className="orn-couple-edge right">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1300"
              data-aos-delay="1100"
            >
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-25.webp" alt="ornaments" />
            </div>
          </div>
          <div className="orn-couple-edge left">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1300"
              data-aos-delay="1100"
            >
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-25.webp" alt="ornaments" />
            </div>
          </div>
        </div>
      </div>

      <div className="couple-details">
        {!hideFullName && (
          <h1 className="couple-name" data-aos="fade-up" data-aos-duration="1000">
            {displayName}
          </h1>
        )}
        {parents && (
          <p className="couple-parents" data-aos="fade-up" data-aos-duration="1000">
            {parents}
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

export function ScarletCouple({ data, hideFullName }: Props) {
  const { pasangan } = data.sections;
  // Editable couple-section intro; blank → the template default copy.
  const introTitle = pasangan.intro?.title?.trim() || COUPLE_INTRO_DEFAULTS.title;
  const introDescription =
    pasangan.intro?.description?.trim() || COUPLE_INTRO_DEFAULTS.description;

  return (
    <section className="couple-wrap">
      <div className="cp-mask"></div>
      <div className="couple">
        <div className="couple-head">
          <div className="orn-cp-head right">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1400"
              data-aos-delay="1200"
            >
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-clip-2.webp" alt="Ornament" />
            </div>
          </div>
          <div className="orn-cp-head left">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1400"
              data-aos-delay="1200"
            >
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-clip-2.webp" alt="Ornament" />
            </div>
          </div>
          <h1 className="couple-title" data-aos="zoom-in" data-aos-duration="1000">
            {introTitle}
          </h1>
          <p className="couple-description" data-aos="fade-up" data-aos-duration="1000">
            {introDescription}
          </p>
        </div>

        <div className="couple-body  bride-first   ">
          <CoupleInfo
            person={pasangan.groom}
            shortName={data.groomName}
            photoUrl={data.couplePhotoUrls.groom}
            side="groom"
            hideFullName={hideFullName}
          />

          <div className="separator-wrap">
            <div className="separator" data-aos="zoom-in" data-aos-duration="1500">
              <h2 className="couple-separator">&amp;</h2>
            </div>
          </div>

          <CoupleInfo
            person={pasangan.bride}
            shortName={data.brideName}
            photoUrl={data.couplePhotoUrls.bride}
            side="bride"
            hideFullName={hideFullName}
          />
        </div>
      </div>
    </section>
  );
}

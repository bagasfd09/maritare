// Couple profiles — restyled to imitate the Scarlet (Katsudoto "Anselma &
// Alvaro") couple section: each portrait sits in a warm-brown arch frame draped
// with lush deep-red rose clusters, the heading is flanked by maroon megamendung
// shields, and names are set in elegant Pinyon Script calligraphy. Rendered as a
// cream card so it reads like Scarlet while still sitting in Folk's olive column.
//
// Reuses the Scarlet asset pack (../scarlet/scarlet-ornaments) and is driven by
// the wedding's own data.

import { Icon } from "@/components/atoms/icon";
import type { PasanganData } from "@/lib/invitation/sections";
import type { InvitationView } from "@/server/queries/invitation";

import { Reveal } from "../flora/reveal";
import {
  DIVIDER_GOLD,
  FLORAL,
  FRAME_ARCH,
  ScarletImg,
  SHIELD_RED,
} from "../scarlet/scarlet-ornaments";

type FolkCoupleProps = {
  pasangan: PasanganData;
  groomName: string;
  brideName: string;
  couplePhotoUrls: InvitationView["couplePhotoUrls"];
};

type PersonCardProps = {
  person: PasanganData["groom"];
  shortName: string;
  photoUrl?: string;
  /** Which lush cluster drapes the top corner (groom vs bride get mirrored sets). */
  side: "left" | "right";
};

function parentsLine(person: PasanganData["groom"]): string | null {
  const parents = [
    person.fatherName ? `Bapak ${person.fatherName}` : null,
    person.motherName ? `Ibu ${person.motherName}` : null,
  ]
    .filter(Boolean)
    .join(" & ");
  if (!person.childOrder && !parents) return null;
  return [person.childOrder, parents].filter(Boolean).join(" ");
}

function PersonCard({ person, shortName, photoUrl, side }: PersonCardProps) {
  const displayName = person.fullName || shortName;
  const parents = parentsLine(person);
  const initial = displayName.trim().charAt(0).toUpperCase();
  const left = side === "left";

  return (
    <div className="text-center">
      <Reveal variant="zoom-in" className="relative mx-auto w-[200px]">
        {/* photo masked into the arch opening */}
        <div className="absolute inset-x-[9%] bottom-[6%] top-[7%] overflow-hidden rounded-t-[92px] bg-[#e8e1d1]">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL; next/image would break the short-lived signature
            <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center [font-family:var(--font-pinyon)] text-[52px] text-[#700f06]/70">
              {initial}
            </div>
          )}
        </div>
        <ScarletImg name={FRAME_ARCH} className="relative z-10 w-full" />
        {/* lush red rose/peony clusters draping the arch (mirrored per side) */}
        <ScarletImg
          name={FLORAL.burgundyCluster}
          mirrored={!left}
          className={
            left
              ? "absolute -left-14 -top-5 z-20 w-28 -rotate-6"
              : "absolute -right-14 -top-5 z-20 w-28 rotate-6"
          }
          sway
          swayOrigin={left ? "origin-top-right" : "origin-top-left"}
        />
        <ScarletImg
          name={FLORAL.redRoses}
          mirrored={left}
          className={
            left
              ? "absolute -right-12 -bottom-3 z-20 w-24"
              : "absolute -left-12 -bottom-3 z-20 w-24"
          }
          sway
          swayOrigin={left ? "origin-bottom-left" : "origin-bottom-right"}
        />
      </Reveal>

      <h3 className="mt-6 [font-family:var(--font-pinyon)] text-[40px] leading-none text-[#700f06]">
        {displayName}
      </h3>

      {parents && (
        <p className="mx-auto mt-3 max-w-[280px] [font-family:var(--font-cormorant)] text-[15px] leading-relaxed text-[#6f6253]">
          {parents}
        </p>
      )}

      {person.instagram && (
        <a
          href={`https://instagram.com/${person.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#cdbb9a] bg-[#fcf9f4] px-4 py-1.5 font-body text-[11px] font-medium tracking-[0.06em] text-[#700f06] transition hover:border-[#700f06]"
        >
          <Icon name="external" size={12} />@{person.instagram}
        </a>
      )}
    </div>
  );
}

export function FolkCouple({ pasangan, groomName, brideName, couplePhotoUrls }: FolkCoupleProps) {
  return (
    <section className="px-5 pb-12">
      <div className="overflow-hidden rounded-[28px] bg-[#f5f2e4] px-7 py-12 text-center">
        <Reveal className="relative flex items-center justify-center gap-3">
          <ScarletImg name={SHIELD_RED} className="w-11 shrink-0" />
          <div>
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.36em] text-[#8a643c]">
              Mempelai
            </p>
            <h2 className="mt-2 [font-family:var(--font-pinyon)] text-[34px] leading-tight text-[#2a221c]">
              Dengan restu Tuhan
            </h2>
          </div>
          <ScarletImg name={SHIELD_RED} mirrored className="w-11 shrink-0" />
        </Reveal>
        <p className="mx-auto mt-4 max-w-[320px] [font-family:var(--font-cormorant)] text-[15px] leading-relaxed text-[#6f6253]">
          Kami bermaksud menyelenggarakan pernikahan putra-putri kami:
        </p>

        <div className="mt-12 space-y-12">
          <PersonCard
            person={pasangan.groom}
            shortName={groomName}
            photoUrl={couplePhotoUrls.groom}
            side="left"
          />
          <div
            aria-hidden="true"
            className="[font-family:var(--font-pinyon)] text-[52px] leading-none text-[#a98534]"
          >
            &amp;
          </div>
          <PersonCard
            person={pasangan.bride}
            shortName={brideName}
            photoUrl={couplePhotoUrls.bride}
            side="right"
          />
        </div>

        <ScarletImg name={DIVIDER_GOLD} className="mx-auto mt-14 w-48" />
      </div>
    </section>
  );
}

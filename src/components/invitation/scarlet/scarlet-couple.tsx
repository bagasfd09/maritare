// Couple profiles — groom first, then bride, split by a gold ampersand.
// Each portrait sits in the warm-brown arch frame, draped with botanical
// clusters; the heading is flanked by deep-maroon megamendung shields.

import { Icon } from "@/components/atoms/icon";
import type { PasanganData } from "@/lib/invitation/sections";
import type { InvitationView } from "@/server/queries/invitation";

import {
  DIVIDER_GOLD,
  FLORAL,
  FRAME_ARCH,
  ScarletImg,
  SHIELD_RED,
} from "./scarlet-ornaments";
import { Reveal } from "../flora/reveal";

type ScarletCoupleProps = {
  pasangan: PasanganData;
  groomName: string;
  brideName: string;
  couplePhotoUrls: InvitationView["couplePhotoUrls"];
};

type PersonCardProps = {
  person: PasanganData["groom"];
  shortName: string;
  photoUrl?: string;
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

function PersonCard({ person, shortName, photoUrl }: PersonCardProps) {
  const displayName = person.fullName || shortName;
  const parents = parentsLine(person);
  const initial = displayName.trim().charAt(0).toUpperCase();

  return (
    <div className="text-center">
      <Reveal variant="zoom-in" className="relative mx-auto w-[200px]">
        <div className="absolute inset-x-[9%] bottom-[6%] top-[7%] overflow-hidden rounded-t-[92px] bg-[#e8e1d1]">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL; next/image would break the short-lived signature
            <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center [font-family:var(--font-cormorant)] text-[40px] italic text-[#700f06]/70">
              {initial}
            </div>
          )}
        </div>
        <ScarletImg name={FRAME_ARCH} className="relative z-10 w-full" />
        <ScarletImg name={FLORAL.burgundyCluster} className="absolute -left-14 -top-5 z-20 w-28 -rotate-6" sway swayOrigin="origin-top-right" />
        <ScarletImg name={FLORAL.redRoses} mirrored className="absolute -right-12 -bottom-3 z-20 w-24" sway swayOrigin="origin-bottom-left" />
      </Reveal>

      <h3 className="mt-7 [font-family:var(--font-cormorant)] text-[27px] font-medium uppercase leading-tight tracking-[0.04em] text-[#700f06]">
        {displayName}
      </h3>

      {parents && (
        <p className="mx-auto mt-3 max-w-[280px] text-[12.5px] leading-relaxed text-[#6f6253]">
          {parents}
        </p>
      )}

      {person.instagram && (
        <a
          href={`https://instagram.com/${person.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#cdbb9a] bg-[#fcf9f4] px-4 py-1.5 text-[11px] font-medium tracking-[0.06em] text-[#700f06] transition hover:border-[#700f06]"
        >
          <Icon name="external" size={12} />@{person.instagram}
        </a>
      )}
    </div>
  );
}

export function ScarletCouple({
  pasangan,
  groomName,
  brideName,
  couplePhotoUrls,
}: ScarletCoupleProps) {
  return (
    <section className="relative overflow-hidden bg-[#f5f2e4] px-8 py-20 text-center">
      <div className="relative flex items-center justify-center gap-4">
        <ScarletImg name={SHIELD_RED} className="w-12 shrink-0" />
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-[#8a643c]">
            Mempelai
          </p>
          <h2 className="mt-3 [font-family:var(--font-cormorant)] text-[30px] font-light leading-tight text-[#2a221c]">
            Dengan <span className="italic text-[#700f06]">restu</span> Tuhan
          </h2>
        </div>
        <ScarletImg name={SHIELD_RED} mirrored className="w-12 shrink-0" />
      </div>
      <p className="mx-auto mt-5 max-w-[320px] text-[12.5px] leading-relaxed text-[#6f6253]">
        Kami bermaksud menyelenggarakan pernikahan putra-putri kami:
      </p>

      <div className="mt-14 space-y-12">
        <PersonCard person={pasangan.groom} shortName={groomName} photoUrl={couplePhotoUrls.groom} />
        <div
          aria-hidden="true"
          className="[font-family:var(--font-cormorant)] text-[46px] italic leading-none text-[#a98534]"
        >
          &amp;
        </div>
        <PersonCard person={pasangan.bride} shortName={brideName} photoUrl={couplePhotoUrls.bride} />
      </div>

      <ScarletImg name={DIVIDER_GOLD} className="mx-auto mt-16 w-48" />
    </section>
  );
}

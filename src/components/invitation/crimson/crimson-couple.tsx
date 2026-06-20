// Couple profiles — groom first, then bride, separated by an italic ampersand.
// Each portrait sits inside a tall gold arch hairline frame with a maroon-rose
// cluster draped over the top corner; cards zoom in on reveal. The section is
// crowned by a gold ornament, flanked by sage greenery, and grounded by a dense
// rose bank along the bottom.

import { Icon } from "@/components/atoms/icon";
import type { PasanganData } from "@/lib/invitation/sections";
import type { InvitationView } from "@/server/queries/invitation";

import { Reveal } from "../flora/reveal";
import { CrimsonFloralImg } from "./crimson-florals";
import { CrimsonArchFrame, CrimsonDivider } from "./crimson-ornaments";

type CrimsonCoupleProps = {
  pasangan: PasanganData;
  groomName: string;
  brideName: string;
  couplePhotoUrls: InvitationView["couplePhotoUrls"];
};

type PersonCardProps = {
  person: PasanganData["groom"];
  /** Short display name fallback when fullName is empty. */
  shortName: string;
  photoUrl?: string;
  /** Which top corner the hanging cluster drapes over (groom: left, bride: right). */
  ornamentSide: "left" | "right";
};

function parentsLine(person: PasanganData["groom"]): string | null {
  const parents = [
    person.fatherName ? `Bpk. ${person.fatherName}` : null,
    person.motherName ? `Ibu ${person.motherName}` : null,
  ]
    .filter(Boolean)
    .join(" & ");
  if (!person.childOrder && !parents) return null;
  return [person.childOrder, parents].filter(Boolean).join(" ");
}

function PersonCard({ person, shortName, photoUrl, ornamentSide }: PersonCardProps) {
  const displayName = person.fullName || shortName;
  const parents = parentsLine(person);
  const initial = displayName.trim().charAt(0).toUpperCase();

  return (
    <div className="text-center">
      <div className="relative mx-auto w-[180px]">
        <Reveal variant="zoom-in">
          <div className="relative px-2 pt-2">
            <CrimsonArchFrame className="pointer-events-none absolute inset-0 h-full w-full text-[#C9A24B]" />
            {photoUrl ? (
              <div className="aspect-[3/3.7] overflow-hidden rounded-t-[90px] bg-[#EFE3CC]">
                {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL with query string; next/image would re-proxy and break the short-lived signature */}
                <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex aspect-[3/3.7] flex-col items-center justify-center gap-2 rounded-t-[90px] bg-[#EFE3CC]">
                <span className="[font-family:var(--font-cormorant)] text-[44px] font-light italic text-[#8B1E2D]/70">
                  {initial}
                </span>
              </div>
            )}
          </div>
        </Reveal>

        {/* maroon rose cluster draped over one top corner of the frame */}
        <Reveal
          variant="fade-down"
          delay={240}
          className={
            ornamentSide === "left"
              ? "pointer-events-none absolute -left-16 -top-12 w-36"
              : "pointer-events-none absolute -right-16 -top-12 w-36"
          }
        >
          <CrimsonFloralImg
            asset="burgundy-roses"
            mirrored={ornamentSide === "right"}
            className={ornamentSide === "left" ? "rotate-[8deg]" : "-rotate-[8deg]"}
            sway
            swayOrigin={ornamentSide === "left" ? "origin-top-right" : "origin-top-left"}
          />
        </Reveal>
      </div>

      <h3 className="mt-6 [font-family:var(--font-cormorant)] text-[30px] font-normal leading-snug tracking-[0.01em] text-[#8B1E2D]">
        {displayName}
      </h3>

      {parents && (
        <p className="mx-auto mt-3 max-w-[290px] font-body text-[13px] leading-relaxed text-[#7C7E5E]">
          {parents}
        </p>
      )}

      {person.instagram && (
        <a
          href={`https://instagram.com/${person.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#C9A24B] bg-[#F4ECDC] px-4 py-1.5 font-body text-[11px] font-medium tracking-[0.06em] text-[#8B1E2D] transition hover:bg-[#8B1E2D] hover:text-[#F4ECDC]"
        >
          <Icon name="external" size={12} />@{person.instagram}
        </a>
      )}
    </div>
  );
}

export function CrimsonCouple({
  pasangan,
  groomName,
  brideName,
  couplePhotoUrls,
}: CrimsonCoupleProps) {
  return (
    <section className="relative overflow-hidden px-8 py-16 text-center">
      {/* hanging gold ornament crowning the section */}
      <Reveal variant="fade-down" className="pointer-events-none absolute left-1/2 -top-2 w-16 -translate-x-1/2">
        <CrimsonFloralImg asset="gold-ornament" sway swayOrigin="origin-top" />
      </Reveal>

      {/* sage greenery filling the upper corners */}
      <CrimsonFloralImg
        asset="green-leaves"
        className="pointer-events-none absolute -left-14 top-16 w-36 rotate-[8deg] opacity-80"
        sway
        swayOrigin="origin-top-left"
      />
      <CrimsonFloralImg
        asset="green-leaves"
        mirrored
        className="pointer-events-none absolute -right-14 top-16 w-36 -rotate-[8deg] opacity-80"
        sway
        swayOrigin="origin-top-right"
      />

      {/* dense rose bank grounding the lower corners */}
      <CrimsonFloralImg
        asset="burgundy-roses"
        className="pointer-events-none absolute -bottom-10 -left-20 w-56 rotate-[12deg]"
        sway
        swayOrigin="origin-bottom-left"
      />
      <CrimsonFloralImg
        asset="burgundy-roses"
        mirrored
        className="pointer-events-none absolute -bottom-10 -right-20 w-56 -rotate-[12deg]"
        sway
        swayOrigin="origin-bottom-right"
      />

      <p className="relative mt-8 font-body text-[10px] font-semibold uppercase tracking-[0.34em] text-[#7C7E5E]">
        Mempelai
      </p>
      <h2 className="relative mt-4 [font-family:var(--font-cormorant)] text-[34px] font-normal tracking-[0.01em] text-[#8B1E2D]">
        Dengan memohon{" "}
        <span className="italic text-[#C9A24B]">rahmat &amp; ridho</span> Tuhan
      </h2>
      <p className="relative mx-auto mt-4 max-w-[320px] font-body text-[13px] leading-relaxed text-[#7C7E5E]">
        Kami bermaksud menyelenggarakan pernikahan putra-putri kami:
      </p>

      <div className="relative mt-12 space-y-12">
        <PersonCard
          person={pasangan.groom}
          shortName={groomName}
          photoUrl={couplePhotoUrls.groom}
          ornamentSide="left"
        />
        <div
          aria-hidden="true"
          className="[font-family:var(--font-cormorant)] text-[46px] font-light italic leading-none text-[#C9A24B]"
        >
          &amp;
        </div>
        <PersonCard
          person={pasangan.bride}
          shortName={brideName}
          photoUrl={couplePhotoUrls.bride}
          ornamentSide="right"
        />
      </div>

      <CrimsonDivider className="relative mx-auto mt-16 w-52 text-[#C9A24B]" />
    </section>
  );
}

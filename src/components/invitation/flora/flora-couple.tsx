// Couple profiles — groom first, then bride, separated by an italic ampersand.

import { Icon } from "@/components/atoms/icon";
import type { PasanganData } from "@/lib/invitation/sections";
import type { InvitationView } from "@/server/queries/invitation";

import { FloraBloom, FloraDivider, OrnamentImg } from "./flora-ornaments";
import { Reveal } from "./reveal";

type FloraCoupleProps = {
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
      <div className="relative mx-auto w-[170px]">
        <Reveal variant="zoom-in">
          <div className="rounded-t-full border border-rule p-2">
            {photoUrl ? (
              <div className="aspect-[3/3.6] overflow-hidden rounded-t-full bg-beige">
                {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL with query string; next/image would re-proxy and break the short-lived signature */}
                <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex aspect-[3/3.6] flex-col items-center justify-center gap-3 rounded-t-full bg-cream">
                <FloraBloom className="w-10 text-burgundy/40" />
                <span className="font-display text-[34px] font-medium italic text-burgundy/70">
                  {initial}
                </span>
              </div>
            )}
          </div>
        </Reveal>

        {/* hanging cluster draped over one top corner of the frame */}
        <Reveal
          variant="fade-down"
          delay={240}
          className={
            ornamentSide === "left"
              ? "pointer-events-none absolute -left-14 -top-10 w-32"
              : "pointer-events-none absolute -right-14 -top-10 w-32"
          }
        >
          <OrnamentImg
            asset="anemone-red"
            mirrored={ornamentSide === "right"}
            className={ornamentSide === "left" ? "rotate-[8deg]" : "-rotate-[8deg]"}
            sway
            swayOrigin={ornamentSide === "left" ? "origin-top-right" : "origin-top-left"}
          />
        </Reveal>
      </div>

      <h3 className="mt-6 font-display text-[24px] font-bold leading-snug tracking-[-0.02em] text-charcoal [font-variation-settings:'opsz'_96]">
        {displayName}
      </h3>

      {parents && (
        <p className="mx-auto mt-3 max-w-[280px] font-body text-[13px] leading-relaxed text-muted-ink">
          {parents}
        </p>
      )}

      {person.instagram && (
        <a
          href={`https://instagram.com/${person.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-ivory px-4 py-1.5 font-body text-[11px] font-medium tracking-[0.06em] text-burgundy transition hover:border-burgundy"
        >
          <Icon name="external" size={12} />@{person.instagram}
        </a>
      )}
    </div>
  );
}

export function FloraCouple({ pasangan, groomName, brideName, couplePhotoUrls }: FloraCoupleProps) {
  return (
    <section className="relative overflow-hidden px-8 py-16 text-center">
      <p className="font-body text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-ink">
        Mempelai
      </p>
      <h2 className="mt-4 font-display text-[28px] font-bold tracking-[-0.02em] text-charcoal [font-variation-settings:'opsz'_96]">
        Dengan memohon <span className="font-normal italic text-burgundy">rahmat &amp; ridho</span>{" "}
        Tuhan
      </h2>
      <p className="mx-auto mt-4 max-w-[320px] font-body text-[13px] leading-relaxed text-muted-ink">
        Kami bermaksud menyelenggarakan pernikahan putra-putri kami:
      </p>

      <div className="mt-12 space-y-12">
        <PersonCard
          person={pasangan.groom}
          shortName={groomName}
          photoUrl={couplePhotoUrls.groom}
          ornamentSide="left"
        />
        <div
          aria-hidden="true"
          className="font-display text-[40px] font-normal italic leading-none text-terracotta"
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

      <FloraDivider className="mx-auto mt-16 w-48 text-rule" />
    </section>
  );
}

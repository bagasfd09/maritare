// Folk hero (below cover) — a magenta card whose opening visual is the couple
// illustration/photo shown FULL-BLEED (edge to edge). The names/date/venue text
// block underneath is optional: `sections.pasangan.showHeroText` toggles it off
// for covers whose artwork already has the names baked in (set in the editor).

import type { InvitationView } from "@/server/queries/invitation";

import { Reveal } from "../flora/reveal";
import { formatFullDateId } from "./format";
import { FolkGarland } from "./folk-ornaments";

type FolkHeroProps = {
  data: InvitationView;
  /** Couple illustration/photo shown full-bleed at the top of the opening card. */
  imageUrl: string;
};

export function FolkHero({ data, imageUrl }: FolkHeroProps) {
  const dateSource = data.sections.acara.events[0]?.date ?? data.eventDate;
  const locationLabel = [data.venue, data.city].filter(Boolean).join(", ");
  const showText = data.sections.pasangan.showHeroText;

  return (
    <section className="relative pb-10">
      {/* Couple illustration — TRULY full-bleed: no side padding, no rounding,
          edge to edge across the column / viewport. */}
      <Reveal variant="zoom-in">
        {/* eslint-disable-next-line @next/next/no-img-element -- couple illustration/photo; plain img keeps it off the optimizer */}
        <img
          src={imageUrl}
          alt={`${data.groomName} & ${data.brideName}`}
          loading="lazy"
          className="block w-full object-cover"
        />
      </Reveal>

      {showText && (
        <Reveal variant="fade-up" className="px-5 pt-8 text-center">
          <h2 className="font-display text-[36px] font-extrabold leading-[1.04] tracking-[-0.02em] text-[#F5EFE0] [font-variation-settings:'opsz'_96]">
            {data.groomName}
            <span className="mx-2 [font-family:var(--font-caveat)] text-[28px] font-bold text-[#E8A33D]">
              &amp;
            </span>
            {data.brideName}
          </h2>

          {dateSource && (
            <p className="mt-4 [font-family:var(--font-caveat)] text-[24px] font-semibold text-[#F5EFE0]">
              {formatFullDateId(dateSource)}
            </p>
          )}
          {locationLabel && (
            <p className="mt-1 font-body text-[12px] tracking-[0.04em] text-[#F5EFE0]/75">
              {locationLabel}
            </p>
          )}

          <FolkGarland className="mx-auto mt-6 w-52" />
        </Reveal>
      )}
    </section>
  );
}

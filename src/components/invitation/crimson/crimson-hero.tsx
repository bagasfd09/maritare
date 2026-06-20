// Opening section: a hanging gold ornament crown, couple names in Cormorant
// Upright, full Bahasa date, an arch-framed cover photo inside a gold hairline
// frame. Flanked by dense maroon-rose clusters entering from the top corners and
// a red lily + greenery draped over the frame.

import type { InvitationView } from "@/server/queries/invitation";

import { Reveal } from "../flora/reveal";
import { CrimsonFloralImg } from "./crimson-florals";
import { CrimsonArchFrame, CrimsonDivider, CrimsonMonogram } from "./crimson-ornaments";
import { formatFullDateId } from "./format";

type CrimsonHeroProps = {
  data: InvitationView;
};

export function CrimsonHero({ data }: CrimsonHeroProps) {
  const coverPhoto = data.photos.find((p) => p.isCover) ?? data.photos[0];
  const dateSource = data.sections.acara.events[0]?.date ?? data.eventDate;
  const locationLabel = [data.venue, data.city].filter(Boolean).join(", ");
  const groomInitial = data.groomName.trim().charAt(0).toUpperCase() || "M";
  const brideInitial = data.brideName.trim().charAt(0).toUpperCase() || "P";

  return (
    <section className="relative overflow-hidden px-8 pb-16 pt-20 text-center">
      {/* dense maroon rose clusters hugging the top corners */}
      <Reveal variant="fade-right" className="pointer-events-none absolute -left-20 -top-10 w-52">
        <CrimsonFloralImg asset="burgundy-roses" className="rotate-[16deg]" sway swayOrigin="origin-bottom-right" />
      </Reveal>
      <Reveal variant="fade-left" className="pointer-events-none absolute -right-20 -top-10 w-52">
        <CrimsonFloralImg
          asset="burgundy-roses"
          mirrored
          className="-rotate-[16deg]"
          sway
          swayOrigin="origin-bottom-left"
        />
      </Reveal>

      {/* hanging gold Javanese ornament crowning the section */}
      <Reveal variant="fade-down" className="pointer-events-none absolute left-1/2 -top-2 w-16 -translate-x-1/2">
        <CrimsonFloralImg asset="gold-ornament" sway swayOrigin="origin-top" />
      </Reveal>

      <div className="relative">
        <Reveal>
          <CrimsonMonogram
            left={groomInitial}
            right={brideInitial}
            className="mx-auto mt-10 w-16 text-[#C9A24B]"
          />
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-5 font-body text-[10px] font-semibold uppercase tracking-[0.34em] text-[#7C7E5E]">
            Undangan Pernikahan
          </p>
        </Reveal>

        <Reveal delay={240}>
          <h2 className="mt-5 [font-family:var(--font-cormorant)] text-[58px] font-light leading-[1.0] tracking-[0.01em] text-[#8B1E2D]">
            {data.groomName}
            <span className="block text-[34px] font-light italic text-[#C9A24B]">&amp;</span>
            {data.brideName}
          </h2>
        </Reveal>

        <Reveal delay={360}>
          {dateSource && (
            <p className="mt-5 font-body text-[12px] font-medium uppercase tracking-[0.2em] text-[#6E1622]">
              {formatFullDateId(dateSource)}
            </p>
          )}
          {locationLabel && (
            <p className="mt-2 font-body text-[12px] text-[#7C7E5E]">{locationLabel}</p>
          )}
        </Reveal>

        {/* arch-framed cover photo inside a gold hairline frame */}
        <div className="relative mx-auto mt-12 w-[268px]">
          <Reveal variant="zoom-in" delay={120}>
            <div className="relative px-2.5 pt-2.5">
              <CrimsonArchFrame className="pointer-events-none absolute inset-0 h-full w-full text-[#C9A24B]" />
              {coverPhoto ? (
                <div className="aspect-[3/4.2] overflow-hidden rounded-t-[120px] bg-[#EFE3CC]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL with query string; next/image would re-proxy and break the short-lived signature */}
                  <img
                    src={coverPhoto.url}
                    alt={coverPhoto.label ?? `Foto ${data.groomName} & ${data.brideName}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-[3/4.2] items-center justify-center rounded-t-[120px] bg-[#EFE3CC]">
                  <CrimsonMonogram
                    left={groomInitial}
                    right={brideInitial}
                    className="w-24 text-[#C9A24B]/70"
                  />
                </div>
              )}
            </div>
          </Reveal>

          {/* red lily draped over the arch's top-right + mirrored rose sprig left */}
          <Reveal
            variant="fade-down"
            delay={360}
            className="pointer-events-none absolute -right-16 -top-14 w-32"
          >
            <CrimsonFloralImg
              asset="lily-red"
              className="rotate-[14deg]"
              sway
              swayOrigin="origin-top-left"
            />
          </Reveal>
          <Reveal
            variant="fade-down"
            delay={480}
            className="pointer-events-none absolute -left-14 -top-8 w-28"
          >
            <CrimsonFloralImg
              asset="burgundy-roses"
              mirrored
              className="-rotate-[12deg]"
              sway
              swayOrigin="origin-top-right"
            />
          </Reveal>
        </div>

        <CrimsonDivider className="mx-auto mt-14 w-52 text-[#C9A24B]" />
      </div>
    </section>
  );
}

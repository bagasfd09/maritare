// Opening section: couple names, full Bahasa date, arch-framed cover photo.
// Flanked top corners (rose-white pair) + a blush cluster draped over the
// arch's top-right corner, katsudoto-style. Reveals stagger on open.

import type { InvitationView } from "@/server/queries/invitation";

import { FloraBloom, FloraDivider, OrnamentImg } from "./flora-ornaments";
import { formatFullDateId } from "./format";
import { Reveal } from "./reveal";

type FloraHeroProps = {
  data: InvitationView;
};

export function FloraHero({ data }: FloraHeroProps) {
  const coverPhoto = data.photos.find((p) => p.isCover) ?? data.photos[0];
  const dateSource = data.sections.acara.events[0]?.date ?? data.eventDate;
  const locationLabel = [data.venue, data.city].filter(Boolean).join(", ");

  return (
    <section className="relative overflow-hidden px-8 pb-16 pt-20 text-center">
      {/* flanking clusters hugging the section's top corners */}
      <Reveal variant="fade-right" className="pointer-events-none absolute -left-14 -top-10 w-40">
        <OrnamentImg asset="rose-white" className="rotate-[18deg]" sway swayOrigin="origin-bottom-right" />
      </Reveal>
      <Reveal
        variant="fade-left"
        className="pointer-events-none absolute -right-14 -top-10 w-40"
      >
        <OrnamentImg
          asset="rose-white"
          mirrored
          className="-rotate-[18deg]"
          sway
          swayOrigin="origin-bottom-left"
        />
      </Reveal>

      <div className="relative">
        <Reveal>
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-ink">
            Undangan Pernikahan
          </p>
        </Reveal>

        <Reveal delay={120}>
          <h2 className="mt-6 font-display text-[52px] font-extrabold leading-[1.02] tracking-[-0.03em] text-charcoal [font-variation-settings:'opsz'_96]">
            {data.groomName}
            <span className="block font-display text-[38px] font-normal italic text-terracotta">&amp;</span>
            {data.brideName}
          </h2>
        </Reveal>

        <Reveal delay={240}>
          {dateSource && (
            <p className="mt-6 font-body text-[12px] font-medium uppercase tracking-[0.2em] text-burgundy">
              {formatFullDateId(dateSource)}
            </p>
          )}
          {locationLabel && (
            <p className="mt-2 font-body text-[12px] text-muted-ink">{locationLabel}</p>
          )}
        </Reveal>

        {/* arch-framed cover photo (ornament-only fallback when no photos) */}
        <div className="relative mx-auto mt-12 w-[260px]">
          <Reveal variant="zoom-in" delay={120}>
            <div className="rounded-t-full border border-rule p-2.5">
              {coverPhoto ? (
                <div className="aspect-[3/4.2] overflow-hidden rounded-t-full bg-beige">
                  {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL with query string; next/image would re-proxy and break the short-lived signature */}
                  <img
                    src={coverPhoto.url}
                    alt={coverPhoto.label ?? `Foto ${data.groomName} & ${data.brideName}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-[3/4.2] items-center justify-center rounded-t-full bg-cream">
                  <FloraBloom className="w-20 text-burgundy/40" />
                </div>
              )}
            </div>
          </Reveal>

          {/* cluster draped over the arch's top-right + small mirrored sprig left */}
          <Reveal
            variant="fade-down"
            delay={360}
            className="pointer-events-none absolute -right-16 -top-12 w-36"
          >
            <OrnamentImg
              asset="bouquet-blush"
              className="rotate-[10deg]"
              sway
              swayOrigin="origin-top-left"
            />
          </Reveal>
          <Reveal
            variant="fade-down"
            delay={480}
            className="pointer-events-none absolute -left-12 -top-6 w-24"
          >
            <OrnamentImg
              asset="bouquet-blush"
              mirrored
              className="-rotate-[12deg]"
              sway
              swayOrigin="origin-top-right"
            />
          </Reveal>
        </div>

        <FloraDivider className="mx-auto mt-14 w-48 text-rule" />
      </div>
    </section>
  );
}

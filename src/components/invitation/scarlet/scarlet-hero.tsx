// Opening masthead — couple names in deep-maroon Cormorant Upright, full Bahasa
// date + location, the cover portrait inside the warm-brown arch frame, flanked
// by botanical clusters, over a faint misty temple engraving.

import type { InvitationView } from "@/server/queries/invitation";

import { formatFullDateId } from "./format";
import {
  BG_SECTION,
  DIVIDER_GOLD,
  FLORAL,
  FRAME_ARCH,
  ScarletImg,
} from "./scarlet-ornaments";
import { Reveal } from "../flora/reveal";

type ScarletHeroProps = {
  data: InvitationView;
};

export function ScarletHero({ data }: ScarletHeroProps) {
  const coverPhoto = data.photos.find((p) => p.isCover) ?? data.photos[0];
  const dateSource = data.sections.acara.events[0]?.date ?? data.eventDate;
  const locationLabel = [data.venue, data.city].filter(Boolean).join(", ");
  const initials =
    (data.groomName.trim().charAt(0) + data.brideName.trim().charAt(0)).toUpperCase() || "MP";

  return (
    <section className="relative overflow-hidden bg-[#f5f2e4] px-8 pb-14 pt-16 text-center">
      <ScarletImg
        name={BG_SECTION}
        className="absolute inset-x-0 top-0 z-0 w-full opacity-[0.12] [&>img]:h-[420px] [&>img]:object-cover"
      />

      <div className="relative z-10">
        <Reveal>
          <p className="text-[10px] font-medium uppercase tracking-[0.42em] text-[#8a643c]">
            Undangan Pernikahan
          </p>
        </Reveal>

        <Reveal delay={120}>
          <h2 className="mt-6 [font-family:var(--font-cormorant)] text-[58px] font-medium uppercase leading-[0.9] tracking-[0.03em] text-[#700f06]">
            {data.groomName}
            <span className="my-1 block text-[32px] normal-case italic tracking-normal text-[#a98534]">
              &amp;
            </span>
            {data.brideName}
          </h2>
        </Reveal>

        <Reveal delay={240}>
          {dateSource && (
            <p className="mt-6 text-[12px] font-medium uppercase tracking-[0.24em] text-[#5b4636]">
              {formatFullDateId(dateSource)}
            </p>
          )}
          {locationLabel && (
            <p className="mt-2 text-[12px] tracking-[0.04em] text-[#6f6253]">{locationLabel}</p>
          )}
        </Reveal>

        <Reveal variant="zoom-in" delay={120} className="relative mx-auto mt-11 w-[230px]">
          <div className="absolute inset-x-[9%] bottom-[6%] top-[7%] overflow-hidden rounded-t-[104px] bg-[#e8e1d1]">
            {coverPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL; next/image would break the short-lived signature
              <img
                src={coverPhoto.url}
                alt={coverPhoto.label ?? `Foto ${data.groomName} & ${data.brideName}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center [font-family:var(--font-cormorant)] text-[44px] italic text-[#700f06]/70">
                {initials}
              </div>
            )}
          </div>
          <ScarletImg name={FRAME_ARCH} className="relative z-10 w-full" />
          <ScarletImg name={FLORAL.roseClusterA} className="absolute -left-16 -top-6 z-20 w-32 -rotate-6" sway swayOrigin="origin-top-right" />
          <ScarletImg name={FLORAL.burgundyCluster} mirrored className="absolute -right-16 -top-6 z-20 w-32 rotate-6" sway swayOrigin="origin-top-left" />
          <ScarletImg name={FLORAL.redRosesSm} className="absolute -bottom-4 -left-10 z-20 w-24 rotate-6" sway swayOrigin="origin-bottom-right" />
          <ScarletImg name={FLORAL.peony} mirrored className="absolute -bottom-4 -right-10 z-20 w-20 -rotate-6" sway swayOrigin="origin-bottom-left" />
        </Reveal>

        <ScarletImg name={DIVIDER_GOLD} className="mx-auto mt-12 w-48" />
      </div>
    </section>
  );
}

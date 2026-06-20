// Opening quote — renders nothing when the couple set no quote at all.
// Crowned by a hanging gold ornament; flanked by mirrored soft-pink peonies
// entering from their own sides.

import type { PasanganData } from "@/lib/invitation/sections";

import { Reveal } from "../flora/reveal";
import { CrimsonFloralImg } from "./crimson-florals";
import { CrimsonDivider } from "./crimson-ornaments";

type CrimsonQuoteProps = {
  quote: PasanganData["quote"];
};

export function CrimsonQuote({ quote }: CrimsonQuoteProps) {
  const arabic = quote?.arabic?.trim();
  const text = quote?.text?.trim();
  const source = quote?.source?.trim();
  if (!arabic && !text) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[#EFE3CC]/70 px-9 py-16 text-center">
      <Reveal
        variant="fade-right"
        className="pointer-events-none absolute -left-12 top-1/2 w-28 -translate-y-1/2"
      >
        <CrimsonFloralImg asset="peony-pink" className="rotate-[14deg]" sway swayOrigin="origin-bottom" />
      </Reveal>
      <Reveal
        variant="fade-left"
        className="pointer-events-none absolute -right-12 top-1/2 w-28 -translate-y-1/2"
      >
        <CrimsonFloralImg
          asset="peony-pink"
          mirrored
          className="-rotate-[14deg]"
          sway
          swayOrigin="origin-bottom"
        />
      </Reveal>

      {/* hanging gold ornament crowning the quote */}
      <Reveal variant="fade-down" className="pointer-events-none absolute left-1/2 -top-2 w-14 -translate-x-1/2">
        <CrimsonFloralImg asset="gold-ornament" sway swayOrigin="origin-top" />
      </Reveal>

      <Reveal className="relative mx-auto mt-8 max-w-[310px]">
        <CrimsonDivider className="mx-auto mb-7 w-32 text-[#C9A24B]" />
        {arabic && (
          <p
            dir="rtl"
            lang="ar"
            className="[font-family:var(--font-cormorant)] text-[28px] leading-[2] text-[#2A2320]"
          >
            {arabic}
          </p>
        )}
        {text && (
          <p className="mt-5 [font-family:var(--font-ovo)] text-[17px] italic leading-relaxed text-[#6E1622]">
            &ldquo;{text}&rdquo;
          </p>
        )}
        {source && (
          <p className="mt-5 font-body text-[10px] font-semibold uppercase tracking-[0.26em] text-[#7C7E5E]">
            {source}
          </p>
        )}
      </Reveal>
    </section>
  );
}

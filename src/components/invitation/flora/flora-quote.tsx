// Opening quote — renders nothing when the couple set no quote at all.
// Flanked by mirrored lily sprigs entering from their own sides.

import type { PasanganData } from "@/lib/invitation/sections";

import { OrnamentImg } from "./flora-ornaments";
import { Reveal } from "./reveal";

type FloraQuoteProps = {
  quote: PasanganData["quote"];
};

export function FloraQuote({ quote }: FloraQuoteProps) {
  const arabic = quote?.arabic?.trim();
  const text = quote?.text?.trim();
  const source = quote?.source?.trim();
  if (!arabic && !text) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-cream/60 px-9 py-14 text-center">
      <Reveal
        variant="fade-right"
        className="pointer-events-none absolute -left-12 top-1/2 w-32 -translate-y-1/2"
      >
        <OrnamentImg asset="lily-white" className="rotate-[14deg]" sway swayOrigin="origin-bottom" />
      </Reveal>
      <Reveal
        variant="fade-left"
        className="pointer-events-none absolute -right-12 top-1/2 w-32 -translate-y-1/2"
      >
        <OrnamentImg
          asset="lily-white"
          mirrored
          className="-rotate-[14deg]"
          sway
          swayOrigin="origin-bottom"
        />
      </Reveal>

      <Reveal className="relative mx-auto max-w-[300px]">
        {arabic && (
          <p dir="rtl" lang="ar" className="font-display text-[26px] leading-[2] text-charcoal">
            {arabic}
          </p>
        )}
        {text && (
          <p className="mt-5 font-display text-[16px] font-normal italic leading-relaxed text-muted-ink">
            &ldquo;{text}&rdquo;
          </p>
        )}
        {source && (
          <p className="mt-5 font-body text-[10px] font-semibold uppercase tracking-[0.24em] text-burgundy">
            {source}
          </p>
        )}
      </Reveal>
    </section>
  );
}

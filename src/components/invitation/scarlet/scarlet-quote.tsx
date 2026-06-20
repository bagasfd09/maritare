// Opening quote — renders nothing when the couple set no quote at all.
// Crowned by a gold baroque scroll, set in Cormorant on warm cream.

import type { PasanganData } from "@/lib/invitation/sections";

import { DIVIDER_GOLD, FRAME_SCROLL, ScarletImg } from "./scarlet-ornaments";
import { Reveal } from "../flora/reveal";

type ScarletQuoteProps = {
  quote: PasanganData["quote"];
};

export function ScarletQuote({ quote }: ScarletQuoteProps) {
  const arabic = quote?.arabic?.trim();
  const text = quote?.text?.trim();
  const source = quote?.source?.trim();
  if (!arabic && !text) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[#fcf9f4] px-10 py-20 text-center">
      <Reveal className="relative mx-auto max-w-[320px]">
        <ScarletImg name={FRAME_SCROLL} className="mx-auto mb-8 w-56" />

        {arabic && (
          <p
            dir="rtl"
            lang="ar"
            className="[font-family:var(--font-cormorant)] text-[27px] leading-[2.1] text-[#2a221c]"
          >
            {arabic}
          </p>
        )}
        {text && (
          <p className="mt-6 [font-family:var(--font-cormorant)] text-[20px] font-light italic leading-[1.7] text-[#6f6253]">
            &ldquo;{text}&rdquo;
          </p>
        )}
        {source && (
          <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.3em] text-[#700f06]">
            {source}
          </p>
        )}

        <ScarletImg name={DIVIDER_GOLD} className="mx-auto mt-9 w-40" />
      </Reveal>
    </section>
  );
}

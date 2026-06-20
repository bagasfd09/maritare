// Opening quote on a cream/parchment card, framed by lush watercolor florals:
// a peony-alstroemeria spray drapes across the top and a burgundy-roses cluster
// anchors a bottom corner. Hidden when there is no quote at all.

import { Reveal } from "../flora/reveal";
import type { PasanganData } from "@/lib/invitation/sections";

import { FolkFloral } from "./folk-ornaments";

type FolkQuoteProps = {
  quote: PasanganData["quote"];
};

export function FolkQuote({ quote }: FolkQuoteProps) {
  const arabic = quote?.arabic?.trim();
  const text = quote?.text?.trim();
  const source = quote?.source?.trim();
  if (!arabic && !text) {
    return null;
  }

  return (
    <section className="px-5 pb-12">
      <Reveal variant="zoom-in">
        <div className="relative overflow-hidden rounded-[28px] border border-[#E0D6BE] bg-[#F5EFE0] px-7 pb-12 pt-14 text-center shadow-[0_18px_38px_-26px_rgba(0,0,0,0.45)]">
          {/* horizontal peony-alstroemeria spray draped across the top edge */}
          <FolkFloral
            name="peony-alstroemeria-bouquet"
            className="pointer-events-none absolute -top-3 left-1/2 w-[260px] max-w-[88%] -translate-x-1/2 select-none opacity-95"
          />
          {/* burgundy-roses anchoring the bottom-left corner, bleeding off-edge */}
          <FolkFloral
            name="burgundy-roses-bouquet"
            className="pointer-events-none absolute -bottom-11 -left-14 w-[128px] -rotate-6 select-none opacity-95"
          />

          <div className="relative mt-10">
            {arabic && (
              <p dir="rtl" lang="ar" className="font-display text-[24px] leading-[2] text-[#3C471F]">
                {arabic}
              </p>
            )}
            {text && (
              <p className="relative mx-auto mt-4 max-w-[300px] font-display text-[16px] italic leading-relaxed text-[#52602F]">
                &ldquo;{text}&rdquo;
              </p>
            )}
            {source && (
              <p className="mt-5 [font-family:var(--font-caveat)] text-[19px] font-semibold text-[#9E2B62]">
                {source}
              </p>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

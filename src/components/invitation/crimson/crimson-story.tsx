// "Cerita kami" — free-text story section; hidden entirely when body is empty.
// Crowned by a gold ornament, framed by gold corner scrolls and soft watercolor
// florals (pastel chrysanthemum + white umbel) drifting in diagonally.

import { Reveal } from "../flora/reveal";
import { CrimsonFloralImg } from "./crimson-florals";
import { CrimsonCornerScroll } from "./crimson-ornaments";

type CrimsonStoryProps = {
  title?: string;
  body?: string;
};

export function CrimsonStory({ title, body }: CrimsonStoryProps) {
  const trimmed = body?.trim();
  if (!trimmed) {
    return null;
  }
  const paragraphs = trimmed.split(/\n{2,}/);

  return (
    <section className="relative overflow-hidden bg-[#EFE3CC]/70 px-9 py-16 text-center">
      {/* gold corner scrolls top-left + bottom-right */}
      <CrimsonCornerScroll className="pointer-events-none absolute -left-2 -top-2 w-20 text-[#C9A24B]/50" />
      <CrimsonCornerScroll className="pointer-events-none absolute -right-2 -bottom-2 w-20 rotate-180 text-[#C9A24B]/50" />

      {/* hanging gold ornament crowning the section */}
      <Reveal variant="fade-down" className="pointer-events-none absolute left-1/2 -top-2 w-14 -translate-x-1/2">
        <CrimsonFloralImg asset="gold-ornament" sway swayOrigin="origin-top" />
      </Reveal>

      {/* soft painted florals flanking diagonally */}
      <Reveal variant="fade-right" className="pointer-events-none absolute -left-12 top-8 w-32">
        <CrimsonFloralImg asset="pastel-chrysanthemum" className="rotate-[10deg]" sway swayOrigin="origin-bottom-right" />
      </Reveal>
      <Reveal variant="fade-left" className="pointer-events-none absolute -bottom-10 -right-12 w-32">
        <CrimsonFloralImg
          asset="white-umbel"
          mirrored
          className="rotate-[170deg]"
          sway
          swayOrigin="origin-top-left"
        />
      </Reveal>

      <div className="relative mt-8">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.34em] text-[#7C7E5E]">
          Cerita Kami
        </p>
        <h2 className="mt-4 [font-family:var(--font-cormorant)] text-[34px] font-normal italic tracking-[0.01em] text-[#8B1E2D]">
          {title?.trim() || "Perjalanan kami"}
        </h2>

        <div className="mx-auto mt-8 max-w-[330px] space-y-5 text-left">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="font-body text-[13.5px] leading-[1.85] text-[#2A2320]/85">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

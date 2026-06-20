// "Cerita kami" — free-text story section; hidden entirely when body is empty.

import { FloraSprig, OrnamentImg } from "./flora-ornaments";
import { Reveal } from "./reveal";

type FloraStoryProps = {
  title?: string;
  body?: string;
};

export function FloraStory({ title, body }: FloraStoryProps) {
  const trimmed = body?.trim();
  if (!trimmed) {
    return null;
  }
  const paragraphs = trimmed.split(/\n{2,}/);

  return (
    <section className="relative overflow-hidden bg-cream/60 px-9 py-16 text-center">
      <FloraSprig className="absolute -left-4 top-6 w-20 rotate-12 -scale-x-100 text-burgundy/20" />

      {/* painted corner sprigs — peony top-left, mirrored bottom-right */}
      <Reveal
        variant="fade-right"
        className="pointer-events-none absolute -left-14 -top-10 w-36"
      >
        <OrnamentImg asset="peony-blush" className="rotate-[20deg]" sway swayOrigin="origin-bottom-right" />
      </Reveal>
      <Reveal
        variant="fade-left"
        className="pointer-events-none absolute -bottom-12 -right-14 w-36"
      >
        <OrnamentImg
          asset="peony-blush"
          mirrored
          className="rotate-[160deg]"
          sway
          swayOrigin="origin-top-left"
        />
      </Reveal>

      <div className="relative">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-ink">
          Cerita Kami
        </p>
        <h2 className="mt-4 font-display text-[28px] font-bold italic tracking-[-0.02em] text-burgundy [font-variation-settings:'opsz'_96]">
          {title?.trim() || "Perjalanan kami"}
        </h2>

        <div className="mx-auto mt-8 max-w-[330px] space-y-5 text-left">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="font-body text-[13.5px] leading-[1.8] text-muted-ink">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

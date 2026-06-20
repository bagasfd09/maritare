// "Cerita kami" — free-text story section; hidden entirely when body is empty.

import { DIVIDER_GOLD, SHIELD_RED, ScarletImg } from "./scarlet-ornaments";
import { Reveal } from "../flora/reveal";

type ScarletStoryProps = {
  title?: string;
  body?: string;
};

export function ScarletStory({ title, body }: ScarletStoryProps) {
  const trimmed = body?.trim();
  if (!trimmed) {
    return null;
  }
  const paragraphs = trimmed.split(/\n{2,}/);

  return (
    <section className="relative overflow-hidden bg-[#fcf9f4] px-10 py-20 text-center">
      <Reveal className="relative">
        <ScarletImg name={SHIELD_RED} className="mx-auto mb-5 w-11" />
        <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-[#8a643c]">
          Cerita Kami
        </p>
        <h2 className="mt-4 [font-family:var(--font-cormorant)] text-[34px] font-light italic leading-tight text-[#700f06] break-words">
          {title?.trim() || "Perjalanan kami"}
        </h2>

        <div className="mx-auto mt-9 max-w-[330px] space-y-5 text-left">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="text-[13.5px] leading-[1.9] text-[#6f6253] break-words">
              {paragraph}
            </p>
          ))}
        </div>

        <ScarletImg name={DIVIDER_GOLD} className="mx-auto mt-12 w-40" />
      </Reveal>
    </section>
  );
}

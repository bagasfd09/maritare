// "Cerita kami" — cream card framed with soft green foliage (white-umbel
// cluster top-left, leafy branch bottom-right). Hidden when body empty.

import { Reveal } from "../flora/reveal";
import { FolkFloral } from "./folk-ornaments";

type FolkStoryProps = {
  title?: string;
  body?: string;
};

export function FolkStory({ title, body }: FolkStoryProps) {
  const trimmed = body?.trim();
  if (!trimmed) {
    return null;
  }
  const paragraphs = trimmed.split(/\n{2,}/);

  return (
    <section className="px-5 pb-12">
      <Reveal variant="zoom-in">
        <div className="relative overflow-hidden rounded-[28px] border border-[#E0D6BE] bg-[#F5EFE0] px-7 pb-11 pt-10 shadow-[0_18px_38px_-26px_rgba(0,0,0,0.45)]">
          {/* soft green umbel cluster at the top-left, leafy branch bottom-right */}
          <FolkFloral
            name="white-umbel-cluster"
            className="pointer-events-none absolute -left-8 -top-8 w-[120px] -rotate-6 select-none opacity-90"
          />
          <FolkFloral
            name="green-leaves-branch"
            className="pointer-events-none absolute -bottom-6 -right-9 w-[130px] select-none opacity-85"
          />

          <div className="relative text-center">
            <FolkFloral name="gold-ornament" className="mx-auto mb-2 h-11 w-auto opacity-90" />
            <p className="[font-family:var(--font-caveat)] text-[22px] font-semibold text-[#E8A33D]">
              Cerita Kami
            </p>
            <h2 className="mt-1 font-display text-[26px] font-bold italic tracking-[-0.02em] text-[#9E2B62] [font-variation-settings:'opsz'_96]">
              {title?.trim() || "Perjalanan kami"}
            </h2>
          </div>

          <div className="relative mx-auto mt-7 max-w-[330px] space-y-4 text-left">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="font-body text-[13.5px] leading-[1.8] text-[#52602F]">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// Folk "Momen" — a customizable title + a single uploaded illustration (e.g. a
// hand-drawn map of the two hometowns, the Screenshot_71 reference), shown right
// after the couple. Transparent background so it sits on the template's own
// parchment (no card), like ScarletStory. Hidden entirely when title AND image
// are both empty.

import { Reveal } from "../flora/reveal";
import { InvImage } from "../scarlet/inv-image";

type FolkMomenProps = {
  title?: string;
  imageUrl?: string;
};

export function FolkMomen({ title, imageUrl }: FolkMomenProps) {
  const heading = title?.trim();
  if (!heading && !imageUrl) {
    return null;
  }

  return (
    <section className="px-7 pb-14 pt-4 text-center">
      <Reveal variant="zoom-in">
        {heading && (
          <h2 className="mx-auto max-w-[320px] [font-family:var(--font-caveat)] text-[26px] font-semibold uppercase leading-[1.25] tracking-[0.01em] text-[#52602F] break-words">
            {heading}
          </h2>
        )}
        {imageUrl && (
          <InvImage
            src={imageUrl}
            alt={heading || "Momen"}
            className={`mx-auto block w-full max-w-[300px] object-contain ${heading ? "mt-9" : ""}`}
          />
        )}
      </Reveal>
    </section>
  );
}

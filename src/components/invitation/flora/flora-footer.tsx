// Closing section — thank-you note, couple signature, Maritare credit.
// Dark burgundy surface: multiply-blended watercolor scans would tint here,
// so the ornament layer stays line-art SVG only (peach strokes).

import { FloralCorner, FloraBloom, FloraDivider } from "./flora-ornaments";

type FloraFooterProps = {
  groomName: string;
  brideName: string;
};

export function FloraFooter({ groomName, brideName }: FloraFooterProps) {
  return (
    <footer className="relative overflow-hidden bg-burgundy px-9 pb-12 pt-16 text-center text-ivory">
      <FloralCorner className="pointer-events-none absolute -left-6 -top-6 w-40 text-peach/15" />
      <FloralCorner className="pointer-events-none absolute -bottom-6 -right-6 w-40 rotate-180 text-peach/15" />

      <FloraBloom className="relative mx-auto w-10 text-peach/80" />

      <p className="mx-auto mt-7 max-w-[320px] font-body text-[13px] leading-[1.85] text-ivory/85">
        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan
        hadir dan memberikan doa restu di hari bahagia kami.
      </p>

      <p className="mt-9 font-body text-[10px] font-semibold uppercase tracking-[0.32em] text-peach/80">
        Kami yang berbahagia
      </p>
      <p className="mt-3 font-display text-[30px] font-medium italic leading-snug text-ivory [font-variation-settings:'opsz'_96]">
        {groomName} &amp; {brideName}
      </p>

      <FloraDivider className="mx-auto mt-10 w-44 text-peach/50" />

      <p className="mt-8 font-body text-[9.5px] font-medium uppercase tracking-[0.24em] text-ivory/60">
        Dibuat dengan <span className="text-blush">♥</span> di Maritare
      </p>
    </footer>
  );
}

// Closing section — thank-you note, couple signature, Maritare credit.
// Solid deep-crimson surface with gold line-art ornaments (monogram + corner
// scrolls + divider) plus the couple's own watercolor florals: a hanging gold
// ornament crown and a deep-maroon rose bank along the foot. All assets are
// alpha-keyed so they composite cleanly on the dark burgundy surface.

import { CrimsonFloralImg } from "./crimson-florals";
import { CrimsonCornerScroll, CrimsonDivider, CrimsonMonogram } from "./crimson-ornaments";

type CrimsonFooterProps = {
  groomName: string;
  brideName: string;
};

export function CrimsonFooter({ groomName, brideName }: CrimsonFooterProps) {
  const groomInitial = groomName.trim().charAt(0).toUpperCase() || "M";
  const brideInitial = brideName.trim().charAt(0).toUpperCase() || "P";

  return (
    <footer className="relative overflow-hidden bg-[#8B1E2D] px-9 pb-16 pt-16 text-center text-[#F4ECDC]">
      {/* subtler darker wash at the foot for depth */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(110,22,34,0.6)_100%)]" />

      <CrimsonCornerScroll className="pointer-events-none absolute -left-3 -top-3 w-28 text-[#C9A24B]/40" />
      <CrimsonCornerScroll className="pointer-events-none absolute -bottom-3 -right-3 w-28 rotate-180 text-[#C9A24B]/40" />

      {/* hanging gold ornament crowning the close */}
      <CrimsonFloralImg
        asset="gold-ornament"
        className="pointer-events-none absolute left-1/2 -top-1 w-14 -translate-x-1/2"
        sway
        swayOrigin="origin-top"
      />

      <CrimsonMonogram
        left={groomInitial}
        right={brideInitial}
        className="relative mx-auto mt-10 w-20 text-[#D9BE86]"
      />

      <p className="relative mx-auto mt-7 max-w-[320px] font-body text-[13px] leading-[1.9] text-[#F4ECDC]/85">
        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan
        hadir dan memberikan doa restu di hari bahagia kami.
      </p>

      <p className="relative mt-9 font-body text-[10px] font-semibold uppercase tracking-[0.32em] text-[#D9BE86]">
        Kami yang berbahagia
      </p>
      <p className="relative mt-3 [font-family:var(--font-cormorant)] text-[36px] font-light italic leading-snug text-[#F4ECDC]">
        {groomName} &amp; {brideName}
      </p>

      <CrimsonDivider className="relative mx-auto mt-10 w-48 text-[#D9BE86]/70" />

      {/* deep-maroon rose bank grounding the very foot */}
      <CrimsonFloralImg
        asset="burgundy-roses"
        className="pointer-events-none absolute -bottom-10 -left-16 w-48 rotate-[12deg] opacity-90"
        sway
        swayOrigin="origin-bottom-left"
      />
      <CrimsonFloralImg
        asset="burgundy-roses"
        mirrored
        className="pointer-events-none absolute -bottom-10 -right-16 w-48 -rotate-[12deg] opacity-90"
        sway
        swayOrigin="origin-bottom-right"
      />

      <p className="relative mt-8 font-body text-[9.5px] font-medium uppercase tracking-[0.24em] text-[#F4ECDC]/60">
        Dibuat dengan <span className="text-[#D9BE86]">♥</span> di Maritare
      </p>
    </footer>
  );
}

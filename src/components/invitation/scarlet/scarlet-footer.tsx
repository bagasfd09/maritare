// Closing section — thank-you note, couple signature, Maritare credit, on a deep
// maroon ground with a faint temple engraving, gold divider and hummingbirds.

import { BG_SECTION, BIRD_1, BIRD_2, DIVIDER_GOLD, ScarletImg } from "./scarlet-ornaments";

type ScarletFooterProps = {
  groomName: string;
  brideName: string;
};

export function ScarletFooter({ groomName, brideName }: ScarletFooterProps) {
  return (
    <footer className="relative overflow-hidden bg-[#700f06] px-9 pb-12 pt-20 text-center text-[#f5f2e4]">
      <ScarletImg
        name={BG_SECTION}
        className="absolute inset-0 z-0 w-full opacity-[0.08] [&>img]:h-full [&>img]:object-cover"
      />
      <ScarletImg name={BIRD_1} className="absolute left-2 top-6 z-0 w-16 opacity-70" sway swayOrigin="origin-top-left" />
      <ScarletImg name={BIRD_2} mirrored className="absolute right-2 top-8 z-0 w-14 opacity-70" sway swayOrigin="origin-top-right" />

      <div className="relative z-10">
        <ScarletImg name={DIVIDER_GOLD} className="mx-auto w-40 [filter:brightness(1.6)_sepia(0.3)]" />

        <p className="mx-auto mt-8 max-w-[320px] text-[13px] leading-[1.9] text-[#f5f2e4]/85">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan
          hadir dan memberikan doa restu di hari bahagia kami.
        </p>

        <p className="mt-9 text-[10px] font-medium uppercase tracking-[0.36em] text-[#e8c98a]">
          Kami yang berbahagia
        </p>
        <p className="mt-4 [font-family:var(--font-cormorant)] text-[40px] font-medium uppercase leading-tight tracking-[0.04em] text-[#f5f2e4]">
          {groomName}
          <span className="mx-2 text-[28px] normal-case italic tracking-normal text-[#e8c98a]">
            &amp;
          </span>
          {brideName}
        </p>

        <ScarletImg name={DIVIDER_GOLD} className="mx-auto mt-10 w-40 [filter:brightness(1.6)_sepia(0.3)]" />

        <p className="mt-8 text-[9.5px] font-medium uppercase tracking-[0.26em] text-[#f5f2e4]/55">
          Dibuat dengan <span className="text-[#e8c98a]">♥</span> di Maritare
        </p>
      </div>
    </footer>
  );
}

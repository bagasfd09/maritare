// Closing section — deep-magenta panel crowned by the hanging gold ornament,
// the tagline in Caveat, couple signature, a grass-border running along the
// bottom edge, and the Maritare credit.

import { FolkFloral } from "./folk-ornaments";

type FolkFooterProps = {
  groomName: string;
  brideName: string;
};

export function FolkFooter({ groomName, brideName }: FolkFooterProps) {
  return (
    <footer className="relative overflow-hidden bg-[#7A1E48] px-8 pb-24 pt-14 text-center text-[#F5EFE0]">
      <FolkFloral name="gold-ornament" className="relative mx-auto h-16 w-auto opacity-95" />

      <p className="relative mt-4 [font-family:var(--font-caveat)] text-[26px] font-semibold leading-snug text-[#E8A0B8]">
        Finding you wokeas like coming home
      </p>

      <p className="relative mx-auto mt-5 max-w-[320px] font-body text-[13px] leading-[1.85] text-[#F5EFE0]/85">
        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan
        hadir dan memberikan doa restu di hari bahagia kami.
      </p>

      <p className="relative mt-8 [font-family:var(--font-caveat)] text-[20px] font-semibold text-[#E8A33D]">
        Kami yang berbahagia
      </p>
      <p className="relative mt-1 font-display text-[30px] font-medium italic leading-snug text-[#F5EFE0] [font-variation-settings:'opsz'_96]">
        {groomName} &amp; {brideName}
      </p>

      <FolkFloral name="burgundy-roses-bouquet" className="relative mx-auto mt-8 w-[150px] opacity-95" />

      {/* grass running along the very bottom edge — a low strip behind the
          credit (height-capped so its tips stay below the text) */}
      <FolkFloral
        name="grass-border"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[72px] w-full select-none object-cover opacity-70"
      />

      <p className="relative z-10 mt-7 font-body text-[9.5px] font-medium uppercase tracking-[0.24em] text-[#F5EFE0]/70 [text-shadow:0_1px_4px_rgba(60,30,46,0.9)]">
        Dibuat dengan <span className="text-[#E8A0B8]">♥</span> di Maritare
      </p>
    </footer>
  );
}

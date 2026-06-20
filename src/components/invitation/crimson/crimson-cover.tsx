// Crimson Pavilion opening overlay. Stays mounted after opening and slides away
// so the 700ms exit transition can play; pointer events release immediately.
//
// Composition (recreating the Javanese-heritage reference with our OWN licensed
// assets): a gold monogram emblem at the top flanked by two hanging gold
// Javanese ornaments, couple names in a tall Cormorant Upright display serif, a
// gold line-art joglo pavilion centred over a faint misty-mountain landscape,
// and — the signature — a DENSE oval border of deep-maroon watercolor roses,
// red hibiscus/peony, lilies and sage greenery banked heavily along the BOTTOM
// and climbing up BOTH lower side edges, framing the misty centre. Red petals
// drift; a crimson "Buka Undangan" pill with a gold border sits low-centre.

import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

import { FallingPetals } from "../flora/flora-ornaments";
import { CrimsonFloralImg } from "./crimson-florals";
import { CrimsonJoglo, CrimsonMonogram } from "./crimson-ornaments";

type CrimsonCoverProps = {
  groomName: string;
  brideName: string;
  /** Pre-formatted full Bahasa date, e.g. "Sabtu, 13 Juni 2026". */
  dateLabel?: string;
  guestName?: string;
  opened: boolean;
  onOpen: () => void;
};

export function CrimsonCover({
  groomName,
  brideName,
  dateLabel,
  guestName,
  opened,
  onOpen,
}: CrimsonCoverProps) {
  const groomInitial = groomName.trim().charAt(0).toUpperCase() || "M";
  const brideInitial = brideName.trim().charAt(0).toUpperCase() || "P";

  return (
    <div
      aria-hidden={opened}
      className={cn(
        "fixed inset-0 z-50 overflow-hidden transition-all duration-700 ease-in-out",
        opened && "pointer-events-none -translate-y-[6%] opacity-0",
      )}
    >
      {/* misty Javanese landscape backdrop: cream sky → sage-grey mist → parchment */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#eef0e6_0%,#dfe2d2_14%,#c3c7b1_32%,#b1b39a_46%,#cabf9d_62%,#e6d8b6_80%,#f4ecdc_100%)]" />
      {/* faint layered mountain ridges behind the pavilion */}
      <div className="absolute inset-x-0 top-[26%] h-[34%] bg-[radial-gradient(120%_90%_at_30%_100%,rgba(120,128,104,0.4)_0%,transparent_55%),radial-gradient(120%_90%_at_72%_100%,rgba(108,118,96,0.38)_0%,transparent_55%)] blur-[3px]" />
      {/* deep crimson vignette pooling at the edges (behind the rose frame) */}
      <div className="absolute inset-0 bg-[radial-gradient(125%_82%_at_50%_42%,transparent_36%,rgba(110,22,34,0.16)_76%,rgba(110,22,34,0.4)_100%)]" />
      {/* top-center warm glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_52%_at_50%_-8%,rgba(255,250,235,0.92)_0%,rgba(255,250,235,0.3)_46%,transparent_72%)]" />
      {/* low parchment mist the pavilion stands on */}
      <div className="absolute inset-x-0 bottom-0 h-[44%] bg-[radial-gradient(ellipse_150%_100%_at_50%_118%,#f4ecdc_28%,rgba(244,236,220,0.5)_60%,transparent_88%)]" />

      {/* ---- the dense rose OVAL FRAME (back layer → front layer) ---- */}

      {/* hanging gold Javanese ornaments at the top corners (the reference crests) */}
      <CrimsonFloralImg
        asset="gold-ornament"
        className="absolute -left-2 -top-3 w-24 rotate-[10deg] opacity-95 sm:w-28"
        sway
        swayOrigin="origin-top-left"
      />
      <CrimsonFloralImg
        asset="gold-ornament"
        mirrored
        className="absolute -right-2 -top-3 w-24 -rotate-[10deg] opacity-95 sm:w-28"
        sway
        swayOrigin="origin-top-right"
      />

      {/* roses climbing HIGH up the LEFT edge — upper sprig, mid bank, draping in.
          Three stacked clusters complete the tall oval frame of the reference. */}
      <CrimsonFloralImg
        asset="burgundy-roses"
        className="absolute -left-24 top-[16%] w-44 rotate-[28deg] opacity-95 sm:w-52"
        sway
        swayOrigin="origin-bottom-right"
      />
      <CrimsonFloralImg
        asset="burgundy-roses"
        className="absolute -left-20 top-[38%] w-56 rotate-[16deg] sm:w-64"
        sway
        swayOrigin="origin-bottom-right"
      />
      <CrimsonFloralImg
        asset="lily-red"
        className="absolute -left-10 top-[30%] w-28 rotate-[8deg] opacity-95 sm:w-32"
        sway
        swayOrigin="origin-bottom-right"
      />
      {/* roses climbing HIGH up the RIGHT edge (mirrored) */}
      <CrimsonFloralImg
        asset="burgundy-roses"
        mirrored
        className="absolute -right-24 top-[16%] w-44 -rotate-[28deg] opacity-95 sm:w-52"
        sway
        swayOrigin="origin-bottom-left"
      />
      <CrimsonFloralImg
        asset="burgundy-roses"
        mirrored
        className="absolute -right-20 top-[38%] w-56 -rotate-[16deg] sm:w-64"
        sway
        swayOrigin="origin-bottom-left"
      />
      <CrimsonFloralImg
        asset="lily-red"
        mirrored
        className="absolute -right-10 top-[30%] w-28 -rotate-[8deg] opacity-95 sm:w-32"
        sway
        swayOrigin="origin-bottom-left"
      />

      {/* DENSE banked clusters anchoring the BOTTOM — layered roses + hibiscus bank */}
      <CrimsonFloralImg
        asset="hibiscus-peony"
        className="absolute -bottom-2 -left-12 w-[78%] rotate-[2deg]"
        sway
        swayOrigin="origin-bottom-left"
      />
      <CrimsonFloralImg
        asset="hibiscus-peony"
        mirrored
        className="absolute -bottom-2 -right-12 w-[78%] -rotate-[2deg]"
        sway
        swayOrigin="origin-bottom-right"
      />
      <CrimsonFloralImg
        asset="burgundy-roses"
        className="absolute -bottom-12 -left-24 w-72 rotate-[10deg] sm:w-80"
        sway
        swayOrigin="origin-bottom-left"
      />
      <CrimsonFloralImg
        asset="burgundy-roses"
        mirrored
        className="absolute -bottom-12 -right-24 w-72 -rotate-[10deg] sm:w-80"
        sway
        swayOrigin="origin-bottom-right"
      />
      {/* centre-bottom crown of roses tying the bank together */}
      <CrimsonFloralImg
        asset="burgundy-roses"
        className="absolute -bottom-10 left-1/2 w-56 -translate-x-1/2 rotate-[2deg] sm:w-64"
      />

      {/* falling red petals — sky already full on load (negative delays) */}
      <FallingPetals variant="cover" />

      <div className="relative z-10 mx-auto flex h-full max-w-[440px] flex-col items-center px-8 pt-14 text-center">
        {/* gold monogram emblem */}
        <div className="animate-inv-fade-down">
          <CrimsonMonogram
            left={groomInitial}
            right={brideInitial}
            className="mx-auto w-24 text-[#C9A24B] drop-shadow-[0_1px_3px_rgba(110,22,34,0.25)]"
          />
        </div>

        <p className="mt-4 animate-inv-fade-up font-body text-[10px] font-medium uppercase tracking-[0.34em] text-[#6E1622] [animation-delay:120ms]">
          The Wedding Of
        </p>

        <h1 className="mt-3 animate-inv-fade-up [animation-delay:240ms] [font-family:var(--font-cormorant)] text-[52px] font-light leading-[1.04] tracking-[0.01em] text-[#8B1E2D]">
          {groomName}
          <span className="my-0.5 block text-[30px] font-light italic text-[#C9A24B]">&amp;</span>
          {brideName}
        </h1>

        {dateLabel && (
          <p className="mt-4 animate-inv-fade-up font-body text-[11px] font-medium uppercase tracking-[0.22em] text-[#6E1622] [animation-delay:360ms]">
            {dateLabel}
          </p>
        )}

        {/* the gold joglo pavilion landmark, centred over the misty landscape */}
        <div className="mt-5 w-full max-w-[290px] animate-inv-fade-up [animation-delay:420ms]">
          <CrimsonJoglo className="mx-auto w-full text-[#C9A24B] drop-shadow-[0_3px_8px_rgba(201,162,75,0.4)]" />
        </div>

        <div className="mt-auto mb-3 w-full animate-inv-fade-up [animation-delay:520ms]">
          <p className="font-body text-[9.5px] font-medium uppercase tracking-[0.3em] text-[#6E1622]/70">
            Kepada Yth.
          </p>
          <p className="mt-2 [font-family:var(--font-ovo)] text-[20px] italic leading-snug text-[#2A2320]">
            {guestName ?? "Bapak/Ibu/Saudara/i"}
          </p>

          <div className="animate-inv-fade-up [animation-delay:620ms]">
            <button
              type="button"
              onClick={onOpen}
              className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-[#C9A24B] bg-[#8B1E2D] px-8 py-3.5 font-body text-[12px] font-medium uppercase tracking-[0.18em] text-[#F4ECDC] shadow-[0_12px_28px_-10px_rgba(110,22,34,0.7)] transition hover:-translate-y-0.5 hover:bg-[#6E1622]"
            >
              <Icon name="envelope" size={15} />
              Buka Undangan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

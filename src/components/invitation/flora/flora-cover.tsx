// Full-screen opening overlay. Stays mounted after opening and slides away so
// the 700ms exit transition can play; pointer events are released immediately.
//
// Visual treatment (katsudoto-style painterly scene, approximated with CSS):
// misty blue-grey sky fading to cream, soft god-rays from top center, lush
// watercolor clusters anchoring the bottom corners, red petals drifting
// continuously. Entrance staggers play on load via animate-inv-* ('both' fill).

import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

import { FallingPetals, FloraArch, OrnamentImg } from "./flora-ornaments";

type FloraCoverProps = {
  groomName: string;
  brideName: string;
  /** Pre-formatted full Bahasa date, e.g. "Sabtu, 13 Juni 2026". */
  dateLabel?: string;
  guestName?: string;
  opened: boolean;
  onOpen: () => void;
};

export function FloraCover({
  groomName,
  brideName,
  dateLabel,
  guestName,
  opened,
  onOpen,
}: FloraCoverProps) {
  return (
    <div
      aria-hidden={opened}
      className={cn(
        "fixed inset-0 z-50 overflow-hidden transition-all duration-700 ease-in-out",
        opened && "pointer-events-none -translate-y-[6%] opacity-0",
      )}
    >
      {/* painterly backdrop: misty blue-grey sky → cream */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#9aabb5_0%,#aebbc2_18%,#c9cfc9_38%,#e7e0d0_62%,#f6f0e3_80%,#faf6f1_100%)]" />
      {/* top-center glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_55%_at_50%_-8%,rgba(255,251,238,0.85)_0%,rgba(255,251,238,0.25)_45%,transparent_70%)]" />
      {/* god-rays fanning down from top center */}
      <div className="absolute -inset-x-1/4 -top-[10%] bottom-1/3 bg-[conic-gradient(from_158deg_at_50%_-12%,transparent_0deg,rgba(255,250,236,0.55)_5deg,transparent_10deg,transparent_15deg,rgba(255,250,236,0.4)_20deg,transparent_25deg,transparent_30deg,rgba(255,250,236,0.5)_35deg,transparent_40deg,transparent_44deg)] opacity-70 blur-[2px]" />
      {/* low cream mist pooling at the bottom */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[radial-gradient(ellipse_140%_100%_at_50%_110%,#faf6f1_30%,rgba(250,246,241,0.6)_60%,transparent_85%)]" />

      {/* misty foliage on the upper side edges */}
      <OrnamentImg
        asset="lily-white"
        className="absolute -left-14 top-[8%] w-36 rotate-[24deg] opacity-50 sm:w-44"
        sway
        swayOrigin="origin-bottom-left"
      />
      <OrnamentImg
        asset="lily-white"
        mirrored
        className="absolute -right-14 top-[8%] w-36 -rotate-[24deg] opacity-50 sm:w-44"
        sway
        swayOrigin="origin-bottom-right"
      />

      {/* lush clusters anchoring the bottom corners */}
      <OrnamentImg
        asset="rose-red"
        className="absolute -bottom-8 left-[14%] w-40 rotate-[6deg] opacity-80 sm:w-48"
      />
      <OrnamentImg
        asset="rose-red"
        mirrored
        className="absolute -bottom-8 right-[14%] w-40 -rotate-[6deg] opacity-80 sm:w-48"
      />
      <OrnamentImg
        asset="anemone-red"
        className="absolute -bottom-12 -left-16 w-60 rotate-[8deg] sm:w-72"
        sway
        swayOrigin="origin-bottom-left"
      />
      <OrnamentImg
        asset="anemone-red"
        mirrored
        className="absolute -bottom-12 -right-16 w-60 -rotate-[8deg] sm:w-72"
        sway
        swayOrigin="origin-bottom-right"
      />

      {/* falling red petals — sky already full on load (negative delays) */}
      <FallingPetals variant="cover" />

      <div className="relative z-10 mx-auto flex h-full max-w-[430px] flex-col items-center justify-center px-8 text-center">
        <div className="animate-inv-fade-down">
          <FloraArch className="mb-6 w-36 text-burgundy/60" />
        </div>

        <p className="animate-inv-fade-up font-body text-[11px] font-medium uppercase tracking-[0.32em] text-muted-ink [animation-delay:120ms]">
          The Wedding of
        </p>

        <h1 className="mt-4 animate-inv-fade-up font-display text-[44px] font-extrabold leading-[1.05] tracking-[-0.025em] text-burgundy [animation-delay:240ms] [font-variation-settings:'opsz'_96]">
          {groomName}
          <span className="mx-2 font-display text-[34px] font-normal italic text-terracotta">&amp;</span>
          {brideName}
        </h1>

        {dateLabel && (
          <p className="mt-4 animate-inv-fade-up font-body text-[12px] font-medium uppercase tracking-[0.22em] text-muted-ink [animation-delay:360ms]">
            {dateLabel}
          </p>
        )}

        <div className="mt-12 w-full animate-inv-fade-up border-t border-burgundy/15 pt-8 [animation-delay:480ms]">
          <p className="font-body text-[10px] font-medium uppercase tracking-[0.28em] text-faint">
            Kepada Yth.
          </p>
          <p className="mt-3 font-display text-[24px] font-medium italic leading-snug text-charcoal">
            {guestName ?? "Bapak/Ibu/Saudara/i"}
          </p>
        </div>

        <div className="animate-inv-fade-up [animation-delay:600ms]">
          <button
            type="button"
            onClick={onOpen}
            className="mt-10 inline-flex items-center gap-2.5 rounded-full bg-burgundy px-8 py-3.5 font-body text-[12px] font-medium uppercase tracking-[0.18em] text-ivory shadow-[0_10px_24px_-10px_rgba(124,45,45,0.55)] transition hover:-translate-y-0.5 hover:bg-burgundy-deep"
          >
            <Icon name="envelope" size={15} />
            Buka Undangan
          </button>
        </div>
      </div>
    </div>
  );
}

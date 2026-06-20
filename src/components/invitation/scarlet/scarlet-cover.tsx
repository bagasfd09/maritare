// Scarlet opening overlay — a tribute to the Katsudoto "Anselma & Alvaro" cover.
// Stays mounted after opening and slides away so the 700ms exit can play.
//
// Composition: a faint misty-mountain engraving fills the screen on warm cream;
// the couple portrait sits inside a warm-brown arch frame; deep-maroon Cormorant
// names, a gold filigree divider, flanking botanical clusters + hummingbirds, and
// a maroon "Buka Undangan" pill complete it.

import { cn } from "@/lib/utils";

import {
  BG_COVER,
  BIRD_1,
  BIRD_2,
  DIVIDER_GOLD,
  FLORAL,
  FRAME_ARCH,
  ScarletImg,
} from "./scarlet-ornaments";

type ScarletCoverProps = {
  groomName: string;
  brideName: string;
  /** Pre-formatted full Bahasa date, e.g. "Sabtu, 13 Juni 2026". */
  dateLabel?: string;
  guestName?: string;
  /** Presigned cover photo URL; absent → monogram inside the arch. */
  coverPhotoUrl?: string;
  opened: boolean;
  onOpen: () => void;
};

export function ScarletCover({
  groomName,
  brideName,
  dateLabel,
  guestName,
  coverPhotoUrl,
  opened,
  onOpen,
}: ScarletCoverProps) {
  const initials =
    (groomName.trim().charAt(0) + brideName.trim().charAt(0)).toUpperCase() || "MP";

  return (
    <div
      aria-hidden={opened}
      className={cn(
        "fixed inset-0 z-50 overflow-hidden bg-[#f5f2e4] transition-all duration-700 ease-in-out",
        opened && "pointer-events-none -translate-y-[6%] opacity-0",
      )}
    >
      {/* misty mountain engraving backdrop */}
      <ScarletImg name={BG_COVER} className="absolute inset-0 h-full w-full [&>img]:h-full [&>img]:object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(245,242,228,0.7)_0%,rgba(245,242,228,0.15)_30%,rgba(245,242,228,0.2)_60%,rgba(245,242,228,0.85)_100%)]" />

      {/* hummingbirds drifting in the upper corners */}
      <ScarletImg name={BIRD_1} className="absolute left-3 top-[12%] w-20 -rotate-6 sm:w-24" sway swayOrigin="origin-top-left" />
      <ScarletImg name={BIRD_2} mirrored className="absolute right-3 top-[15%] w-16 rotate-6 sm:w-20" sway swayOrigin="origin-top-right" />

      <div className="relative z-10 mx-auto flex h-full max-w-[430px] flex-col items-center px-8 pb-12 pt-14 text-center text-[#2a221c]">
        <p className="animate-inv-fade-down text-[10px] font-medium uppercase tracking-[0.42em] text-[#8a643c]">
          The Wedding Of
        </p>

        <h1 className="mt-4 animate-inv-fade-up [animation-delay:120ms] [font-family:var(--font-cormorant)] text-[56px] font-medium uppercase leading-[0.92] tracking-[0.03em] text-[#700f06]">
          {groomName}
          <span className="my-0.5 block text-[30px] normal-case italic tracking-normal text-[#a98534]">
            &amp;
          </span>
          {brideName}
        </h1>

        {dateLabel && (
          <p className="mt-4 animate-inv-fade-up text-[11px] font-medium uppercase tracking-[0.26em] text-[#5b4636] [animation-delay:240ms]">
            {dateLabel}
          </p>
        )}

        {/* portrait inside the warm-brown arch frame */}
        <div className="relative mx-auto mt-7 w-[210px] animate-inv-fade-up [animation-delay:340ms]">
          <div className="absolute inset-x-[9%] bottom-[6%] top-[7%] overflow-hidden rounded-t-[96px] bg-[#e8e1d1]">
            {coverPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL; next/image would break the short-lived signature
              <img src={coverPhotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center [font-family:var(--font-cormorant)] text-[40px] italic text-[#700f06]/70">
                {initials}
              </div>
            )}
          </div>
          <ScarletImg name={FRAME_ARCH} className="relative z-10 w-full" />
          {/* lush burgundy rose/peony clusters draping the arch corners */}
          <ScarletImg name={FLORAL.burgundyCluster} className="absolute -left-16 -top-8 z-20 w-32 -rotate-6" sway swayOrigin="origin-top-right" />
          <ScarletImg name={FLORAL.roseClusterA} mirrored className="absolute -right-16 -top-8 z-20 w-32 rotate-6" sway swayOrigin="origin-top-left" />
          <ScarletImg name={FLORAL.redRoses} className="absolute -bottom-6 -left-12 z-20 w-28 rotate-6" sway swayOrigin="origin-bottom-right" />
          <ScarletImg name={FLORAL.roseClusterB} mirrored className="absolute -bottom-6 -right-12 z-20 w-28 -rotate-6" sway swayOrigin="origin-bottom-left" />
        </div>

        <ScarletImg name={DIVIDER_GOLD} className="mx-auto mt-7 w-44 animate-inv-fade-up [animation-delay:440ms]" />

        <div className="mt-auto w-full animate-inv-fade-up [animation-delay:540ms]">
          <p className="text-[9.5px] font-medium uppercase tracking-[0.34em] text-[#9c8f7c]">
            Kepada Yth.
          </p>
          <p className="mt-2 [font-family:var(--font-cormorant)] text-[24px] italic leading-snug text-[#2a221c]">
            {guestName ?? "Bapak/Ibu/Saudara/i"}
          </p>

          <button
            type="button"
            onClick={onOpen}
            className="mt-5 inline-flex animate-inv-fade-up items-center gap-2.5 rounded-full border border-[#a98534] bg-[#700f06] px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[#f5f2e4] shadow-[0_12px_28px_-12px_rgba(112,15,6,0.7)] transition [animation-delay:640ms] hover:-translate-y-0.5 hover:bg-[#560b04]"
          >
            Buka Undangan
          </button>
        </div>
      </div>
    </div>
  );
}

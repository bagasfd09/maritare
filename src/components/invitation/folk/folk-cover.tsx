// Folk Garden opening overlay.
//
// The cover is a full-bleed motion intro: the wedding's cover video plays
// (muted, looping), or the hand-illustrated artwork as a fallback. The couple's
// names live in the media itself, so no names heading is overlaid.
//
// The WHOLE cover is one big tap target — instead of a hard button there is a
// breathing white wash plus an expanding ripple around an envelope cue, which
// reads as "tap me". Stays mounted after opening and slides up for the exit.

import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

import { FallingPetals } from "../flora/flora-ornaments";

type FolkCoverProps = {
  /** Cover artwork URL — wedding's cover photo, else the baked-in illustration. */
  coverUrl: string;
  /** Cover video URL (autoplay/muted/loop). When set it replaces the still art. */
  videoUrl?: string;
  guestName?: string;
  opened: boolean;
  onOpen: () => void;
};

export function FolkCover({ coverUrl, videoUrl, opened, onOpen }: FolkCoverProps) {
  return (
    <div
      aria-hidden={opened}
      className={cn(
        "fixed inset-0 z-50 overflow-hidden bg-[#52602F] transition-all duration-700 ease-in-out",
        opened && "pointer-events-none -translate-y-[6%] opacity-0",
      )}
    >
      {/* full-bleed motion intro (video), with the illustration as poster/fallback */}
      {videoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl}
          poster={coverUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- cover may be a presigned R2 URL; next/image would re-proxy and break the short-lived signature
        <img
          src={coverUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      )}

      {/* gentle bottom scrim so the cue stays legible over the art */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(180deg,transparent_0%,rgba(60,71,31,0.15)_40%,rgba(60,71,31,0.7)_100%)]" />

      {/* magenta/gold petals drifting over the art */}
      <FallingPetals variant="cover" />

      {/* The entire cover is the tap target. */}
      <button
        type="button"
        onClick={(e) => {
          // Drop focus before the overlay gets aria-hidden, else AT users get a
          // "focus retained inside aria-hidden" warning.
          e.currentTarget.blur();
          onOpen();
        }}
        aria-label="Ketuk untuk membuka undangan"
        className="group absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-end pb-14 focus:outline-none"
      >
        {/* faint white wash that breathes — hints the surface is interactive */}
        <span className="pointer-events-none absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_82%,rgba(255,255,255,0.16),transparent_55%)]" />

        {/* expanding ripple around an envelope — the "tap me" affordance */}
        <span className="relative mb-3 flex h-[68px] w-[68px] items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F5EFE0]/40" />
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F5EFE0]/30 [animation-delay:700ms]" />
          <span className="absolute inline-flex h-[58px] w-[58px] rounded-full border border-[#F5EFE0]/60" />
          <span className="relative inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#F5EFE0]/90 text-[#9E2B62] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.6)] backdrop-blur-sm transition group-hover:scale-105">
            <Icon name="envelope" size={22} />
          </span>
        </span>

        <span className="[font-family:var(--font-caveat)] text-[22px] font-semibold leading-none text-[#F5EFE0] [text-shadow:0_2px_8px_rgba(0,0,0,0.5)]">
          Ketuk untuk membuka
        </span>
      </button>
    </div>
  );
}

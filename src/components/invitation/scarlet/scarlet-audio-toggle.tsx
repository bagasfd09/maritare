"use client";

// Floating audio control. The actual <audio>/YouTube element lives in
// ScarletAudio (scarlet-audio.tsx, shared by both the Scarlet and Folk
// templates) — this component is purely the visible toggle button.

import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

type ScarletAudioToggleProps = {
  /** False when musik disabled, no track chosen, editorPreview, or load error. */
  available: boolean;
  playing: boolean;
  onToggle: () => void;
};

export function ScarletAudioToggle({ available, playing, onToggle }: ScarletAudioToggleProps) {
  if (!available) {
    return null;
  }

  return (
    <button
      type="button"
      data-music-toggle
      onClick={onToggle}
      aria-label={playing ? "Jeda musik" : "Putar musik"}
      aria-pressed={playing}
      className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[#a98534] bg-[#f5f2e4]/90 text-[#700f06] shadow-[0_8px_20px_-8px_rgba(60,30,10,0.35)] backdrop-blur transition hover:border-[#700f06]"
    >
      <span
        className={cn(
          "relative flex items-center justify-center",
          playing ? "animate-gb-spin-slow" : "opacity-50",
        )}
      >
        <Icon name="music" size={17} />
        {!playing && (
          <span aria-hidden="true" className="absolute h-px w-6 -rotate-45 rounded-full bg-[#700f06]" />
        )}
      </span>
    </button>
  );
}

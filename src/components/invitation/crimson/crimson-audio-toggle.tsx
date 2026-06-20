"use client";

// Floating audio control. The <audio> element itself lives in crimson-template
// (so the cover's open handler can call play() inside the click gesture) —
// this component is purely the visible toggle button.

import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

type CrimsonAudioToggleProps = {
  /** False when musik disabled, no track chosen, editorPreview, or load error. */
  available: boolean;
  playing: boolean;
  onToggle: () => void;
};

export function CrimsonAudioToggle({ available, playing, onToggle }: CrimsonAudioToggleProps) {
  if (!available) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? "Jeda musik" : "Putar musik"}
      aria-pressed={playing}
      className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[#C9A24B] bg-[#8B1E2D]/90 text-[#F4ECDC] shadow-[0_8px_20px_-8px_rgba(110,22,34,0.55)] backdrop-blur transition hover:bg-[#6E1622]"
    >
      <span
        className={cn(
          "relative flex items-center justify-center",
          playing ? "animate-gb-spin-slow" : "opacity-60",
        )}
      >
        <Icon name="music" size={17} />
        {!playing && (
          <span
            aria-hidden="true"
            className="absolute h-px w-6 -rotate-45 rounded-full bg-[#F4ECDC]"
          />
        )}
      </span>
    </button>
  );
}

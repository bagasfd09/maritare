"use client";

// Floating audio control. The <audio> element itself lives in folk-template
// (so the cover's open handler can call play() inside the click gesture) —
// this component is purely the visible toggle button.

import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

type FolkAudioToggleProps = {
  /** False when musik disabled, no track chosen, editorPreview, or load error. */
  available: boolean;
  playing: boolean;
  onToggle: () => void;
};

export function FolkAudioToggle({ available, playing, onToggle }: FolkAudioToggleProps) {
  if (!available) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? "Jeda musik" : "Putar musik"}
      aria-pressed={playing}
      className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#9E2B62] text-[#F5EFE0] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)] transition hover:bg-[#7A1E48]"
    >
      <span
        className={cn(
          "relative flex items-center justify-center",
          playing ? "animate-gb-spin-slow" : "opacity-70",
        )}
      >
        <Icon name="music" size={17} />
        {!playing && (
          <span
            aria-hidden="true"
            className="absolute h-px w-6 -rotate-45 rounded-full bg-[#F5EFE0]"
          />
        )}
      </span>
    </button>
  );
}

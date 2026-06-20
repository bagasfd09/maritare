"use client";

// Floating audio control. The <audio> element itself lives in flora-template
// (so the cover's open handler can call play() inside the click gesture) —
// this component is purely the visible toggle button.

import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

type FloraAudioToggleProps = {
  /** False when musik disabled, no track chosen, editorPreview, or load error. */
  available: boolean;
  playing: boolean;
  onToggle: () => void;
};

export function FloraAudioToggle({ available, playing, onToggle }: FloraAudioToggleProps) {
  if (!available) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? "Jeda musik" : "Putar musik"}
      aria-pressed={playing}
      className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-rule bg-paper/90 text-burgundy shadow-[0_8px_20px_-8px_rgba(60,30,10,0.4)] backdrop-blur transition hover:border-burgundy"
    >
      <span
        className={cn(
          "relative flex items-center justify-center",
          playing ? "animate-gb-spin-slow" : "opacity-50",
        )}
      >
        <Icon name="music" size={17} />
        {!playing && (
          <span
            aria-hidden="true"
            className="absolute h-px w-6 -rotate-45 rounded-full bg-burgundy"
          />
        )}
      </span>
    </button>
  );
}

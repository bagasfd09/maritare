"use client";

// Folk Garden — full-bleed hero cover VIDEO. Plays muted + looped + inline so it
// autoplays on mobile (browsers block unmuted autoplay). `muted` is also forced
// via the ref because React can miss the prop on the SSR'd element, and we nudge
// play() once mounted in case the attribute alone isn't enough.

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  /** Optional still shown until the first frame paints (the hero image, if any). */
  poster?: string;
};

export function FolkHeroVideo({ src, poster }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {
      // Autoplay can still be blocked (e.g. data-saver) — the poster stays up.
    });
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      className="block w-full"
    />
  );
}

"use client";

import { useEffect, useRef } from "react";

// Autoplaying closing video. Why a client component: React doesn't reliably
// serialize the `muted` attribute into the SSR HTML, so Safari (esp. iOS) sees
// `autoplay` WITHOUT `muted` and blocks it. Here we force the muted PROPERTY +
// playsinline before calling play(), and retry on `canplay` — the combination
// Safari needs for muted inline autoplay. (Won't override iOS Low Power Mode,
// which disables autoplay system-wide.)
export function FootnoteVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    v.setAttribute("webkit-playsinline", "true"); // older iOS
    const play = () => {
      const p = v.play();
      if (p) p.catch(() => {});
    };
    play();
    v.addEventListener("canplay", play, { once: true });
    v.addEventListener("loadeddata", play, { once: true });
    return () => {
      v.removeEventListener("canplay", play);
      v.removeEventListener("loadeddata", play);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      style={{ width: "100%", display: "block", objectFit: "cover" }}
    />
  );
}

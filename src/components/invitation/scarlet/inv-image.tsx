"use client";

// Drop-in <img> for USER photos in the invitation (cover, couple, gallery, hero).
// Renders a SINGLE <img> (no wrapper) so the Scarlet theme's element-targeted CSS
// keeps working, while adding: decoding="async", loading/fetchPriority by role,
// and a seamless fade-in on load (over whatever sits behind — gallery cells and
// cover frames already have a tonal background). Presigned/public R2 URLs stay as
// raw <img> (next/image would re-proxy and break short-lived signatures).

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** Above-the-fold hero/cover → eager + high priority. */
  priority?: boolean;
};

export function InvImage({ src, alt, className, priority = false }: Props) {
  const ref = useRef<HTMLImageElement | null>(null);
  // `dim` is only ever set client-side, and only for an image that hasn't loaded
  // yet at hydration — so SSR / no-JS renders fully visible (the whole invitation
  // is JS-gated anyway), and a cached/already-painted image never flashes.
  const [dim, setDim] = useState(false);

  useEffect(() => {
    const img = ref.current;
    if (!img || img.complete) return; // cached/painted → keep visible, no flash
    // Not loaded yet: dim now (the element has no pixels, so it's invisible
    // regardless) then fade in on load. Deferred to keep the effect setState-free.
    const t = setTimeout(() => setDim(true), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- presigned/public R2 URL; next/image would re-proxy and break the short-lived signature
    <img
      ref={ref}
      src={src}
      alt={alt}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "low"}
      onLoad={() => setDim(false)}
      onError={() => setDim(false)}
      className={cn(
        "transition-opacity duration-700 ease-out motion-reduce:transition-none",
        dim ? "opacity-0" : "opacity-100",
        className,
      )}
    />
  );
}

"use client";

// Scroll-reveal wrapper: plays one of the `animate-inv-*` keyframes once when
// the element first enters the viewport (AOS-style). Variants mirror the
// reference vocabulary: content=fade-up, photos/frames=zoom-in, left ornament
// =fade-right (enters FROM the left), right ornament=fade-left, hanging
// ornament=fade-down. `delay` staggers siblings (0/120/240ms…).

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type RevealVariant = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom-in";

const VARIANT_CLASS: Record<RevealVariant, string> = {
  "fade-up": "animate-inv-fade-up",
  "fade-down": "animate-inv-fade-down",
  "fade-left": "animate-inv-fade-left",
  "fade-right": "animate-inv-fade-right",
  "zoom-in": "animate-inv-zoom-in",
};

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Which animate-inv-* keyframe to play. Defaults to fade-up. */
  variant?: RevealVariant;
  /** Stagger delay in ms (animation-delay; keyframes use 'both' fill). */
  delay?: number;
};

export function Reveal({ children, className, variant = "fade-up", delay }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // Ancient browsers: never hide content (deferred to keep the effect
      // body setState-free).
      const fallback = setTimeout(() => setShown(true), 0);
      return () => clearTimeout(fallback);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
      className={cn(shown ? VARIANT_CLASS[variant] : "opacity-0", className)}
    >
      {children}
    </div>
  );
}

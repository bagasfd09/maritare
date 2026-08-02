"use client";

// Scroll-reveal primitives, ported verbatim from the Onyx reference's own
// `useReveal` + `<Reveal>` (App.tsx). Kept as the reference wrote them rather
// than swapped for the Katsudoto-port `[data-aos]` observer: this template's
// design already ships its own mechanism, and porting it means the sections
// stay SERVER components — `<Reveal>` is the only client boundary they need.
//
// Reveal-once (the observer disconnects on first intersection), matching the
// reference. No-JS / no-IntersectionObserver renders fully visible.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export function useOnyxReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  // Starts visible when there's no observer to drive it, so a failed/absent JS
  // runtime never leaves the invitation blank.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // Deferred so the effect body stays setState-free (same trick InvImage
      // uses); nothing is painted differently in the intervening tick.
      const t = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(t);
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

export function OnyxReveal({ children, delay = 0, className = "", style = {} }: RevealProps) {
  const { ref, visible } = useOnyxReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

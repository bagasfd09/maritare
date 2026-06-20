"use client";

import { useEffect } from "react";

// Ports the design's global reveals() IIFE: observes every .reveal /
// .reveal-stagger element on the page and adds .in once it scrolls into view,
// then stops observing it. Mounted once at the page root so the server-rendered
// section components can stay server components and just use the marker classes.
export function RevealInit() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal, .reveal-stagger");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}

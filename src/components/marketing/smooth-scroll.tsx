"use client";

import { useEffect } from "react";

// Smooth-scrolls in-page anchor links (e.g. the nav "Harga" → #harga) instead
// of the instant jump. Delegated at the document level so it covers every
// in-page link across the desktop and mobile trees without each component
// wiring its own handler. Scoped to the landing (mounted only here) so route
// navigations elsewhere in the app keep their default instant scroll. Honors
// prefers-reduced-motion. Offset is handled by scroll-margin-top in globals.css.
export function SmoothScroll() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const href = link?.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.getElementById(decodeURIComponent(href.slice(1)));
      if (!target) return;
      e.preventDefault();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // explicit offset for the fixed nav (mnav 58px on mobile, ~96px desktop).
      // window.scrollTo lands precisely even though scrollIntoView ignores
      // scroll-margin-top here (an overflow:clip ancestor swallows it).
      const offset = window.matchMedia("(max-width: 768px)").matches ? 64 : 96;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
      history.pushState(null, "", href);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}

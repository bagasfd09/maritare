"use client";

import { useEffect } from "react";

// Guests sometimes land mid-page: the browser restores the previous scroll
// position (reload, or back/forward via bfcache) behind the opening gate, so
// revealing the gate shows the middle of the invitation. Force every /inv view
// to start at the very top and stop the browser from auto-restoring scroll. One
// mount in the shared /inv layout covers every template.
export function ScrollTopOnLoad() {
  useEffect(() => {
    const prev = "scrollRestoration" in history ? history.scrollRestoration : undefined;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    // bfcache restore re-shows the page WITHOUT remounting React, so this effect
    // won't re-run — pin scroll to top on the pageshow event instead.
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.scrollTo(0, 0);
    };
    window.addEventListener("pageshow", onShow);
    return () => {
      window.removeEventListener("pageshow", onShow);
      if (prev) history.scrollRestoration = prev;
    };
  }, []);
  return null;
}

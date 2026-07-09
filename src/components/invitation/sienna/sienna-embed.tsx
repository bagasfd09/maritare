"use client";

// Shared shell for the Sienna (Katsudoto "Syakira" / Filan & Agung) port.
// Mirrors IvoryEmbed: injects the scoped theme CSS + scroll-reveal CSS and drives
// the reveal with an IntersectionObserver over [data-aos] nodes — reproducing
// Syakira's TWO-PANE skeleton (the theme CSS positions everything against it):
//   kat-page__side-to-side
//     ├ primary-pane   → decorative side panel (bg ornaments + "The Wedding Of"
//     │                  intro + cover pane); fed via the `primary` slot.
//     └ secondary-pane → the scrolling invitation (the section components);
//                        fed via `children`.
//
// Reveal mirrors IvoryEmbed exactly: hidden state gated behind `.aos-on` (only
// JS adds it) so the page stays visible if JS never runs; replays on scroll-back.
// Unlike Ivory, Sienna needs no extra stylesheet — the single scoped theme CSS
// (0358663c.css) already carries the form / bank / comment / quote rules.

import { useEffect, useRef } from "react";

import { SIENNA_THEME_CSS } from "./sienna-theme";

const SIENNA_AOS_CSS = `
.sienna-inv.aos-on [data-aos]{opacity:0;transition-property:opacity,transform;transition-timing-function:cubic-bezier(.2,.7,.3,1);transition-duration:800ms;will-change:opacity,transform;}
.sienna-inv.aos-on [data-aos].aos-animate{opacity:1;transform:none;}
.sienna-inv.aos-on [data-aos="fade-up"]{transform:translate3d(0,40px,0);}
.sienna-inv.aos-on [data-aos="fade-down"]{transform:translate3d(0,-40px,0);}
.sienna-inv.aos-on [data-aos="fade-right"]{transform:translate3d(-40px,0,0);}
.sienna-inv.aos-on [data-aos="fade-left"]{transform:translate3d(40px,0,0);}
.sienna-inv.aos-on [data-aos="fade-up-right"]{transform:translate3d(-34px,34px,0);}
.sienna-inv.aos-on [data-aos="fade-up-left"]{transform:translate3d(34px,34px,0);}
.sienna-inv.aos-on [data-aos="fade-down-right"]{transform:translate3d(-34px,-34px,0);}
.sienna-inv.aos-on [data-aos="fade-down-left"]{transform:translate3d(34px,-34px,0);}
.sienna-inv.aos-on [data-aos="zoom-in"]{transform:scale(.9);}
.sienna-inv.aos-on [data-aos="zoom-in-up"]{transform:translate3d(0,32px,0) scale(.9);}
.sienna-inv.aos-on [data-aos="zoom-in-right"]{transform:translate3d(-32px,0,0) scale(.9);}
.sienna-inv.aos-on [data-aos="zoom-out"]{transform:scale(1.08);}
.sienna-inv.aos-on [data-aos="zoom-out-up"]{transform:translate3d(0,32px,0) scale(1.08);}
@media (prefers-reduced-motion: reduce){
.sienna-inv.aos-on [data-aos]{opacity:1!important;transform:none!important;transition:none!important;}
}
/* Folk-standard gated gift reveal. Fallback colors because the ported Syakira
   CSS never defines the --button-* palette vars (its preset stylesheet wasn't
   part of the main theme file). */
.sienna-inv .wedding-gift-reveal-btn{border:none;outline:none;box-shadow:none;display:flex;align-items:center;justify-content:center;width:fit-content;padding:12px 32px;margin:24px auto;border-radius:999px;font-family:var(--body-text-family);font-size:var(--body-text-size);letter-spacing:0.02em;background-color:var(--button-background-primary,#d6a191);color:var(--button-text-primary,#fff8f0);cursor:pointer;transition-duration:.25s;transition-property:background-color;}
.sienna-inv .wedding-gift-reveal-btn:hover{background-color:var(--button-background-secondary,#cb3a31);color:var(--button-text-secondary,#fff8f0);}
`;

type SiennaEmbedProps = {
  /** Decorative left pane — bg ornaments + the "The Wedding Of" intro + cover. */
  primary?: React.ReactNode;
  /** The scrolling invitation sections (the secondary pane). */
  children: React.ReactNode;
};

export function SiennaEmbed({ primary, children }: SiennaEmbedProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // No IntersectionObserver → leave content fully visible (never add aos-on).
    if (typeof IntersectionObserver === "undefined") return;

    root.classList.add("aos-on");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("aos-animate", entry.isIntersecting);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" },
    );

    // Observe every [data-aos] node — including ones added AFTER mount (editor
    // data changes), mirroring IvoryEmbed.
    const seen = new WeakSet<Element>();
    const scan = () => {
      for (const el of root.querySelectorAll<HTMLElement>("[data-aos]")) {
        if (seen.has(el)) continue;
        seen.add(el);
        const dur = el.getAttribute("data-aos-duration");
        const delay = el.getAttribute("data-aos-delay");
        if (dur) el.style.transitionDuration = `${dur}ms`;
        if (delay) el.style.transitionDelay = `${delay}ms`;
        io.observe(el);
      }
    };
    scan();

    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    // The original Syakira <body class="syakira original preset-original"> —
    // `syakira` is folded into `.sienna-inv` by the CSS scoping, so the remaining
    // preset classes must live on the root or the palette rules scoped to
    // `.sienna-inv.original` (--quaterly-clr, button colors, frame masks, …) never
    // match and the color scheme falls back to browser defaults.
    <div className="sienna-inv original preset-original" ref={rootRef}>
      <style dangerouslySetInnerHTML={{ __html: SIENNA_THEME_CSS }} />
      <style dangerouslySetInnerHTML={{ __html: SIENNA_AOS_CSS }} />
      <section className="kat-page__side-to-side">
        <section className="primary-pane">
          <div className="inner">{primary}</div>
        </section>
        <section className="secondary-pane">{children}</section>
      </section>
    </div>
  );
}

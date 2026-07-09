"use client";

// Shared shell for the Plum (Katsudoto "Kinanti" / Arvi & Aditya) port. Mirrors
// SiennaEmbed: injects the scoped theme CSS + scroll-reveal CSS and drives the
// reveal with an IntersectionObserver over [data-aos] nodes — reproducing
// Kinanti's TWO-PANE skeleton (the theme CSS positions everything against it):
//   kat-page__side-to-side
//     ├ primary-pane   → decorative side panel (forest bg + stacked names +
//     │                  greeting); fed via the `primary` slot.
//     └ secondary-pane → the scrolling invitation (the section components);
//                        fed via `children`.
//
// Reveal mirrors SiennaEmbed exactly: hidden state gated behind `.aos-on` (only
// JS adds it) so the page stays visible if JS never runs; replays on scroll-back.
// Like Sienna, the single scoped theme CSS already carries the form / bank /
// comment / quote rules — no extra stylesheet needed.

import { useEffect, useRef } from "react";

import { PLUM_THEME_CSS } from "./plum-theme";

const PLUM_AOS_CSS = `
.plum-inv.aos-on [data-aos]{opacity:0;transition-property:opacity,transform;transition-timing-function:cubic-bezier(.2,.7,.3,1);transition-duration:800ms;will-change:opacity,transform;}
.plum-inv.aos-on [data-aos].aos-animate{opacity:1;transform:none;}
.plum-inv.aos-on [data-aos="fade-up"]{transform:translate3d(0,40px,0);}
.plum-inv.aos-on [data-aos="fade-down"]{transform:translate3d(0,-40px,0);}
.plum-inv.aos-on [data-aos="fade-right"]{transform:translate3d(-40px,0,0);}
.plum-inv.aos-on [data-aos="fade-left"]{transform:translate3d(40px,0,0);}
.plum-inv.aos-on [data-aos="fade-up-right"]{transform:translate3d(-34px,34px,0);}
.plum-inv.aos-on [data-aos="fade-up-left"]{transform:translate3d(34px,34px,0);}
.plum-inv.aos-on [data-aos="fade-down-right"]{transform:translate3d(-34px,-34px,0);}
.plum-inv.aos-on [data-aos="fade-down-left"]{transform:translate3d(34px,-34px,0);}
.plum-inv.aos-on [data-aos="zoom-in"]{transform:scale(.9);}
.plum-inv.aos-on [data-aos="zoom-in-up"]{transform:translate3d(0,32px,0) scale(.9);}
.plum-inv.aos-on [data-aos="zoom-in-right"]{transform:translate3d(-32px,0,0) scale(.9);}
.plum-inv.aos-on [data-aos="zoom-out"]{transform:scale(1.08);}
.plum-inv.aos-on [data-aos="zoom-out-up"]{transform:translate3d(0,32px,0) scale(1.08);}
@media (prefers-reduced-motion: reduce){
.plum-inv.aos-on [data-aos]{opacity:1!important;transform:none!important;transition:none!important;}
}
/* Folk-standard gated gift reveal. */
.plum-inv .wedding-gift-reveal-btn{border:none;outline:none;box-shadow:none;display:flex;align-items:center;justify-content:center;width:fit-content;padding:12px 32px;margin:24px auto;border-radius:999px;font-family:var(--body-text-family);font-size:var(--body-text-size);letter-spacing:0.02em;background-color:var(--button-background-primary);color:var(--button-text-primary);cursor:pointer;transition-duration:.25s;transition-property:background-color;}
.plum-inv .wedding-gift-reveal-btn:hover{background-color:var(--button-background-secondary);color:var(--button-text-secondary);}
`;

type PlumEmbedProps = {
  /** Decorative side pane — forest bg + stacked names + greeting. */
  primary?: React.ReactNode;
  /** The scrolling invitation sections (the secondary pane). */
  children: React.ReactNode;
};

export function PlumEmbed({ primary, children }: PlumEmbedProps) {
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
    // The original Kinanti <body class="kinanti original preset-original"> —
    // `kinanti` is folded into `.plum-inv` by the CSS scoping, so the remaining
    // preset classes must live on the root or the palette rules scoped to
    // `.plum-inv.original` (--background-primary, --text-primary, button colors,
    // frame masks, …) never match and the scheme falls back to browser defaults.
    <div className="plum-inv original preset-original" ref={rootRef}>
      <style dangerouslySetInnerHTML={{ __html: PLUM_THEME_CSS }} />
      <style dangerouslySetInnerHTML={{ __html: PLUM_AOS_CSS }} />
      <section className="kat-page__side-to-side">
        <section className="primary-pane">
          <div className="inner">{primary}</div>
        </section>
        <section className="secondary-pane">{children}</section>
      </section>
    </div>
  );
}

"use client";

// Shared shell for the Ivory (Katsudoto "Aulia" / Sinta & Fanny) port. Mirrors
// ScarletEmbed: injects the scoped theme CSS + scroll-reveal CSS and drives the
// reveal with an IntersectionObserver over [data-aos] nodes — but reproduces
// Aulia's TWO-PANE skeleton (the theme CSS positions everything against it):
//   kat-page__side-to-side
//     ├ primary-pane   → decorative side panel (bg ornaments + "The Wedding Of"
//     │                  intro); fed via the `primary` slot.
//     └ secondary-pane → the scrolling invitation (the section components);
//                        fed via `children`.
//
// Reveal mirrors ScarletEmbed exactly: hidden state gated behind `.aos-on` (only
// JS adds it) so the page stays visible if JS never runs; replays on scroll-back.
//
// NOTE: Katsudoto is the owner's own brand (migrating to maritare).

import { useEffect, useRef } from "react";

import { IVORY_THEME_CSS } from "./ivory-theme";
import { IVORY_EXTRA_CSS } from "./ivory-theme-extra";

const IVORY_AOS_CSS = `
.ivory-inv.aos-on [data-aos]{opacity:0;transition-property:opacity,transform;transition-timing-function:cubic-bezier(.2,.7,.3,1);transition-duration:800ms;will-change:opacity,transform;}
.ivory-inv.aos-on [data-aos].aos-animate{opacity:1;transform:none;}
.ivory-inv.aos-on [data-aos="fade-up"]{transform:translate3d(0,40px,0);}
.ivory-inv.aos-on [data-aos="fade-down"]{transform:translate3d(0,-40px,0);}
.ivory-inv.aos-on [data-aos="fade-right"]{transform:translate3d(-40px,0,0);}
.ivory-inv.aos-on [data-aos="fade-left"]{transform:translate3d(40px,0,0);}
.ivory-inv.aos-on [data-aos="fade-up-right"]{transform:translate3d(-34px,34px,0);}
.ivory-inv.aos-on [data-aos="fade-up-left"]{transform:translate3d(34px,34px,0);}
.ivory-inv.aos-on [data-aos="fade-down-right"]{transform:translate3d(-34px,-34px,0);}
.ivory-inv.aos-on [data-aos="fade-down-left"]{transform:translate3d(34px,-34px,0);}
.ivory-inv.aos-on [data-aos="zoom-in"]{transform:scale(.9);}
.ivory-inv.aos-on [data-aos="zoom-in-up"]{transform:translate3d(0,32px,0) scale(.9);}
.ivory-inv.aos-on [data-aos="zoom-in-right"]{transform:translate3d(-32px,0,0) scale(.9);}
.ivory-inv.aos-on [data-aos="zoom-out"]{transform:scale(1.08);}
.ivory-inv.aos-on [data-aos="zoom-out-up"]{transform:translate3d(0,32px,0) scale(1.08);}
@media (prefers-reduced-motion: reduce){
.ivory-inv.aos-on [data-aos]{opacity:1!important;transform:none!important;transition:none!important;}
}
`;

type IvoryEmbedProps = {
  /** Decorative left pane — bg ornaments + the "The Wedding Of" intro. */
  primary?: React.ReactNode;
  /** The scrolling invitation sections (the secondary pane). */
  children: React.ReactNode;
};

export function IvoryEmbed({ primary, children }: IvoryEmbedProps) {
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
    // data changes), mirroring ScarletEmbed.
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
    // The original Aulia <body class="aulia original preset-original"> — `aulia`
    // is folded into `.ivory-inv` by the CSS scoping, so the remaining preset
    // classes (`original preset-original`) must live on the root or the palette
    // rules scoped to `.ivory-inv.original` (--background-primary, --text-primary,
    // button colors, …) never match and the whole color scheme falls back to
    // browser defaults.
    <div className="ivory-inv original preset-original" ref={rootRef}>
      <style dangerouslySetInnerHTML={{ __html: IVORY_THEME_CSS }} />
      <style dangerouslySetInnerHTML={{ __html: IVORY_EXTRA_CSS }} />
      <style dangerouslySetInnerHTML={{ __html: IVORY_AOS_CSS }} />
      <section className="kat-page__side-to-side">
        <section className="primary-pane">
          <div className="inner">{primary}</div>
        </section>
        <section className="secondary-pane">{children}</section>
      </section>
    </div>
  );
}

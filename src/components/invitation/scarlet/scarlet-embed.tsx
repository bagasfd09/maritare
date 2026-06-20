"use client";

// Shared shell for the Katsudoto "Anselma & Alvaro" port (Scarlet + Folk):
// injects the scoped theme CSS + scroll-reveal (AOS) CSS, wraps the composed
// section components in `.scarlet-inv`, and drives the reveal with an
// IntersectionObserver over the JSX-rendered [data-aos] nodes.
//
// Reveal = mirror in/out (animate in on enter, reset on leave, replays on
// scroll-back), with progressive enhancement: the hidden state is gated behind
// `.aos-on` (only JS adds it), so if JS never runs every section stays visible.

import { useEffect, useRef } from "react";

import { SCARLET_THEME_CSS } from "./scarlet-theme";

const SCARLET_AOS_CSS = `
.scarlet-inv.aos-on [data-aos]{opacity:0;transition-property:opacity,transform;transition-timing-function:cubic-bezier(.2,.7,.3,1);transition-duration:800ms;will-change:opacity,transform;}
.scarlet-inv.aos-on [data-aos].aos-animate{opacity:1;transform:none;}
.scarlet-inv.aos-on [data-aos="fade-up"]{transform:translate3d(0,40px,0);}
.scarlet-inv.aos-on [data-aos="fade-down"]{transform:translate3d(0,-40px,0);}
.scarlet-inv.aos-on [data-aos="fade-right"]{transform:translate3d(-40px,0,0);}
.scarlet-inv.aos-on [data-aos="fade-left"]{transform:translate3d(40px,0,0);}
.scarlet-inv.aos-on [data-aos="fade-up-right"]{transform:translate3d(-34px,34px,0);}
.scarlet-inv.aos-on [data-aos="fade-up-left"]{transform:translate3d(34px,34px,0);}
.scarlet-inv.aos-on [data-aos="fade-down-right"]{transform:translate3d(-34px,-34px,0);}
.scarlet-inv.aos-on [data-aos="fade-down-left"]{transform:translate3d(34px,-34px,0);}
.scarlet-inv.aos-on [data-aos="zoom-in"]{transform:scale(.9);}
.scarlet-inv.aos-on [data-aos="zoom-in-up"]{transform:translate3d(0,32px,0) scale(.9);}
.scarlet-inv.aos-on [data-aos="zoom-in-right"]{transform:translate3d(-32px,0,0) scale(.9);}
.scarlet-inv.aos-on [data-aos="zoom-out"]{transform:scale(1.08);}
@media (prefers-reduced-motion: reduce){
.scarlet-inv.aos-on [data-aos]{opacity:1!important;transform:none!important;transition:none!important;}
}
/* Gallery — static grid (replaces the JS slick carousel) */
.scarlet-inv .photo-wrap{padding:14% 0 6%;}
.scarlet-inv .photo-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;max-width:600px;margin:0 auto;padding:6% 16px 0;}
.scarlet-inv .photo-cell{overflow:hidden;border-radius:10px;aspect-ratio:1/1;background:#e8e1d1;}
.scarlet-inv .photo-cell img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease;}
.scarlet-inv .photo-cell:hover img{transform:scale(1.04);}
/* Footer brand — Maritare logo (replaces "Powered by Katsudoto") */
.scarlet-inv section.footer .footer-inner{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;}
.scarlet-inv .footer .footer-inner .footer-brand{display:inline-flex;align-items:center;gap:9px;text-decoration:none;}
.scarlet-inv .footer .footer-inner .footer-brand .mrt-mark{width:24px;height:24px;display:block;flex-shrink:0;}
.scarlet-inv .footer .footer-inner .footer-brand .mrt-mark .mrt-petal{fill:var(--background-primary);}
.scarlet-inv .footer .footer-inner .footer-brand .mrt-mark .mrt-petal-in{fill:#e3b56a;}
.scarlet-inv .footer .footer-inner .footer-brand .mrt-mark .mrt-core{fill:#e3b56a;}
.scarlet-inv .footer .footer-inner .footer-brand span{font-family:var(--body-text-family-2);font-size:26px;font-weight:600;letter-spacing:-0.01em;line-height:1;color:var(--background-primary);}
`;

type ScarletEmbedProps = {
  children: React.ReactNode;
};

export function ScarletEmbed({ children }: ScarletEmbedProps) {
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

    // Observe every [data-aos] node — including ones added AFTER mount (e.g. an
    // Instagram badge / event / wish that appears as the editor data changes).
    // Without this, a freshly-mounted node stays at opacity:0 (never revealed).
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
    <div className="scarlet-inv" ref={rootRef}>
      <style dangerouslySetInnerHTML={{ __html: SCARLET_THEME_CSS }} />
      <style dangerouslySetInnerHTML={{ __html: SCARLET_AOS_CSS }} />
      {children}
    </div>
  );
}

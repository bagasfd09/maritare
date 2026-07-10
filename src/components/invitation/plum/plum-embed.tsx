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
.plum-inv .wedding-gift-reveal-btn{border:none;outline:none;box-shadow:none;display:flex;align-items:center;justify-content:center;width:fit-content;padding:12px 32px;border-radius:999px;font-family:var(--body-text-family);font-size:var(--body-text-size);letter-spacing:0.02em;background-color:var(--button-background-primary);color:var(--button-text-primary);cursor:pointer;transition-duration:.25s;transition-property:background-color;}
.plum-inv .wedding-gift-reveal-btn:hover{background-color:var(--button-background-secondary);color:var(--button-text-secondary);}
/* The reveal button sits inside a taller panel so the closed state keeps the
   section's visual weight (ivory/sienna parity). */
.plum-inv .wedding-gift-reveal-panel{display:flex;align-items:center;justify-content:center;min-height:200px;margin:24px 0;padding:24px;border:1px solid rgba(var(--text-primary-rgb),.25);border-radius:24px;background:rgba(var(--background-tertiary-rgb),.6);}
/* Folk gift-frame look: ONE framed box holding every account, scrolling
   internally (max-height); each account a light hairline-divided row. */
.plum-inv .plum-gift-scroll{margin:24px 0;padding:0 20px;border:1px solid rgba(var(--text-primary-rgb),.25);border-radius:24px;background:rgba(var(--background-tertiary-rgb),.6);max-height:340px;overflow-y:auto;-ms-overflow-style:none;scrollbar-width:none;}
.plum-inv .plum-gift-scroll::-webkit-scrollbar{display:none;}
.plum-inv .plum-gift-scroll .bank-item{padding:20px 0;margin:0;}
.plum-inv .plum-gift-scroll .bank-item+.bank-item{border-top:1px solid rgba(var(--text-primary-rgb),.2);}
/* Bank/e-wallet logo in place of the name text (see bank-logos.ts). */
.plum-inv .wedding-gift-bank-wrap .bank-logo{display:block;height:28px;width:auto;max-width:120px;object-fit:contain;margin:0 auto 4px;}
/* The section's drifting cloud ornaments used to float in the tall stacked
   layout's whitespace; the compact scroll box now sits where they drift, so the
   content must paint ABOVE them (clouds peek around the box instead). */
.plum-inv .wedding-gift-body-wrap .wedding-gift-body{position:relative;z-index:2;}
/* Shipping address folded into the gift section (folk-style), below the rows. */
.plum-inv .plum-gift-address{margin:0 0 24px;padding:20px;border:1px solid rgba(var(--text-primary-rgb),.25);border-radius:24px;background:rgba(var(--background-tertiary-rgb),.6);text-align:center;font-family:var(--body-text-family);}
.plum-inv .plum-gift-address-label{color:var(--text-primary);font-weight:600;margin-bottom:4px;}
.plum-inv .plum-gift-address-info{color:var(--text-secondary);line-height:1.6;}
.plum-inv .plum-copy-address{display:inline-flex;align-items:center;justify-content:center;margin-top:10px;padding:8px 20px;border:1px solid var(--button-background-primary);border-radius:100px;background:transparent;color:var(--button-background-primary);cursor:pointer;font:inherit;outline:none;}
/* Wish form: the ported CSS lacks Bootstrap's .form-control{width:100%} —
   without it inputs collapse to the browser default ~20ch — and .form-group
   has no vertical rhythm. */
.plum-inv .wedding-wish-form .form-control{width:100%;}
.plum-inv .wedding-wish-form .form-group{margin-bottom:12px;}
/* One card per wish. */
.plum-inv .comment-item{background:rgba(var(--background-tertiary-rgb),.75);border:1px solid rgba(var(--text-primary-rgb),.2);border-radius:16px;padding:14px 16px;margin-bottom:12px;}
/* Story slider: long unbroken words otherwise run sideways past the slide edge. */
.plum-inv .love-story .story-caption,.plum-inv .love-story .story-sub-title{overflow-wrap:anywhere;}
/* QR check-in section (new — no Kinanti CSS exists for it). */
.plum-inv .general-qrcode{padding:40px 20px;position:relative;width:100%;}
.plum-inv .general-qrcode .qr-inner{margin:0 auto;max-width:420px;padding:0 4px;position:relative;text-align:center;}
.plum-inv .general-qrcode .qr-orn-header{margin:0 auto 8px;width:130px;}
.plum-inv .general-qrcode .qr-orn-header img,.plum-inv .general-qrcode .qr-orn img{display:block;height:auto;width:100%;}
.plum-inv .general-qrcode .qr-title{margin-bottom:4px;}
.plum-inv .general-qrcode .qr-description{color:var(--text-secondary);font-family:var(--body-text-family);font-size:var(--body-text-size);line-height:1.6;margin:8px auto 0;max-width:320px;}
.plum-inv .general-qrcode .qr-card{background:rgba(var(--background-tertiary-rgb),.75);border:1px solid rgba(var(--text-primary-rgb),.25);border-radius:24px;margin:28px auto 0;padding:32px 24px;position:relative;}
.plum-inv .general-qrcode .qr-guest{color:var(--text-primary);font-family:var(--body-text-family);font-size:var(--body-text-size);font-weight:600;margin:0 0 12px;}
.plum-inv .general-qrcode .qr-orn{pointer-events:none;position:absolute;width:84px;z-index:0;}
.plum-inv .general-qrcode .qr-orn.tl{left:-14px;top:-16px;transform:scaleX(-1);}
.plum-inv .general-qrcode .qr-orn.br{bottom:-16px;right:-14px;}
/* The QR itself must never be covered — flourishes sit BEHIND the opaque tile. */
.plum-inv .general-qrcode .qr-guest,.plum-inv .general-qrcode .img-qrcode{position:relative;z-index:1;}
.plum-inv .general-qrcode .img-qrcode img{border-radius:10px;box-shadow:0 1px 8px rgba(0,0,0,.1);display:block;height:auto;margin:0 auto;max-width:300px;width:100%;}
/* Editor phone preview renders the template in a SCALED DIV, not an iframe, so
   the theme's desktop media queries still match and the decorative side pane
   squeezes into the phone frame. force-mobile mirrors the theme's
   max-width:960px rule regardless of the real viewport. */
.plum-inv.force-mobile .kat-page__side-to-side .primary-pane{display:none;}
.plum-inv.force-mobile .kat-page__side-to-side .secondary-pane{position:relative;width:100%;margin-left:0;}
/* Opening gate (PlumCoverGate): the decorative primary pane rendered as the
   FULL-SCREEN gate. Overrides both the desktop rule (fixed, 61% wide) and the
   mobile rule (display:none) so the pane always fills the gate overlay. */
.plum-inv.plum-gate{height:100%;width:100%;}
.plum-inv.plum-gate .kat-page__side-to-side{height:100%;}
.plum-inv.plum-gate .kat-page__side-to-side .primary-pane{display:flex;position:absolute;inset:0;width:100%;}
/* The pane's 3-line stacked couple-name sits dead-center — exactly behind the
   gate's oval portrait (it peeked out chopped around the photo). visibility (not
   display) keeps its box, so the "Kepada Yth" greeting stays put below the oval;
   the names appear on the cover right after opening. */
.plum-inv.plum-gate .primary-pane-title{visibility:hidden;}
`;

type PlumEmbedProps = {
  /** Decorative side pane — forest bg + stacked names + greeting. */
  primary?: React.ReactNode;
  /** The scrolling invitation sections (the secondary pane). */
  children: React.ReactNode;
  /** Editor phone preview: force the mobile single-pane layout (the preview is a
   *  scaled div, so the theme's own max-width media queries never trigger). */
  forceMobile?: boolean;
};

export function PlumEmbed({ primary, children, forceMobile }: PlumEmbedProps) {
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
    <div
      className={forceMobile ? "plum-inv original preset-original force-mobile" : "plum-inv original preset-original"}
      ref={rootRef}
    >
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

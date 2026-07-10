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
.sienna-inv .wedding-gift-reveal-btn{border:none;outline:none;box-shadow:none;display:flex;align-items:center;justify-content:center;width:fit-content;padding:12px 32px;border-radius:999px;font-family:var(--body-text-family);font-size:var(--body-text-size);letter-spacing:0.02em;background-color:var(--button-background-primary,#d6a191);color:var(--button-text-primary,#fff8f0);cursor:pointer;transition-duration:.25s;transition-property:background-color;}
.sienna-inv .wedding-gift-reveal-btn:hover{background-color:var(--button-background-secondary,#cb3a31);color:var(--button-text-secondary,#fff8f0);}
/* The reveal button sits inside a taller panel so the closed state keeps the
   section's visual weight (as if a card were behind it) — ivory parity. */
.sienna-inv .wedding-gift-reveal-panel{display:flex;align-items:center;justify-content:center;min-height:200px;margin:24px 0;padding:24px;border:1px solid rgba(214,161,145,.5);border-radius:24px;background:rgba(255,248,240,.6);}
/* Folk gift-frame look: ONE framed box holding every account, scrolling
   internally (max-height) so a long list doesn't feel cramped; each account a
   light row divided by a hairline. */
.sienna-inv .sienna-gift-scroll{margin:24px 0;padding:0 20px;border:1px solid rgba(214,161,145,.5);border-radius:24px;background:rgba(255,248,240,.6);max-height:340px;overflow-y:auto;-ms-overflow-style:none;scrollbar-width:none;}
.sienna-inv .sienna-gift-scroll::-webkit-scrollbar{display:none;}
.sienna-inv .sienna-gift-scroll .bank-item{padding:20px 0;margin:0;}
.sienna-inv .sienna-gift-scroll .bank-item+.bank-item{border-top:1px solid rgba(214,161,145,.4);}
/* Bank/e-wallet logo in place of the name text (see bank-logos.ts). */
.sienna-inv .wedding-gift-bank-wrap .bank-logo{display:block;height:28px;width:auto;max-width:120px;object-fit:contain;margin:0 0 4px;}
/* Shipping address folded into the gift section (folk-style), below the rows. */
.sienna-inv .sienna-gift-address{margin:0 0 24px;padding:20px;border:1px solid rgba(214,161,145,.5);border-radius:24px;background:rgba(255,248,240,.6);text-align:center;}
.sienna-inv .sienna-gift-address .wedding-gift-address-label{font-weight:600;margin-bottom:4px;}
.sienna-inv .sienna-copy-address{display:inline-flex;align-items:center;justify-content:center;margin-top:10px;padding:8px 20px;border-radius:100px;background:transparent;cursor:pointer;font:inherit;outline:none;}
/* Wish form: the ported CSS lacks Bootstrap's .form-control{width:100%} —
   without it inputs collapse to the browser default ~20ch (ivory had the same
   bug) — and .form-group has no vertical rhythm. */
.sienna-inv .wedding-wish-form .form-control{width:100%;}
.sienna-inv .wedding-wish-form .form-group{margin-bottom:12px;}
/* One card per wish (the ported list is bare text rows). */
.sienna-inv .comment-item{background:rgba(255,248,240,.75);border:1px solid rgba(214,161,145,.45);border-radius:16px;padding:14px 16px;margin-bottom:12px;}
/* Story slider: long unbroken words otherwise run sideways past the slide edge. */
.sienna-inv .love-story .story-caption,.sienna-inv .love-story .story-label{overflow-wrap:anywhere;}
/* QR check-in section (new — the Syakira theme only has an agenda-spacing rule
   for .general-qrcode, so the card is styled here). */
.sienna-inv .general-qrcode{padding:40px 20px;width:100%;}
.sienna-inv .general-qrcode .qr-inner{margin:0 auto;max-width:420px;padding:0 4px;position:relative;text-align:center;}
.sienna-inv .general-qrcode .qr-orn-header{margin:0 auto 8px;width:120px;}
.sienna-inv .general-qrcode .qr-orn-header img,.sienna-inv .general-qrcode .qr-orn img{display:block;height:auto;width:100%;}
.sienna-inv .general-qrcode .qr-title{margin-bottom:4px;}
.sienna-inv .general-qrcode .qr-description{font-family:var(--body-text-family);font-size:var(--body-text-size);line-height:1.6;margin:8px auto 0;max-width:320px;}
.sienna-inv .general-qrcode .qr-card{background:rgba(255,248,240,.75);border:1px solid rgba(214,161,145,.5);border-radius:24px;margin:28px auto 0;padding:32px 24px;position:relative;}
.sienna-inv .general-qrcode .qr-guest{font-family:var(--body-text-family);font-size:var(--body-text-size);font-weight:600;margin:0 0 12px;}
.sienna-inv .general-qrcode .qr-orn{pointer-events:none;position:absolute;width:84px;z-index:0;}
.sienna-inv .general-qrcode .qr-orn.tl{left:-16px;top:-18px;transform:scaleX(-1);}
.sienna-inv .general-qrcode .qr-orn.br{bottom:-18px;right:-16px;}
/* The QR itself must never be covered — sprigs sit BEHIND the opaque QR tile. */
.sienna-inv .general-qrcode .qr-guest,.sienna-inv .general-qrcode .img-qrcode{position:relative;z-index:1;}
.sienna-inv .general-qrcode .img-qrcode img{border-radius:10px;box-shadow:0 1px 8px rgba(0,0,0,.1);display:block;height:auto;margin:0 auto;max-width:300px;width:100%;}
/* Editor phone preview renders the template in a SCALED DIV, not an iframe, so
   the theme's desktop media queries still match and the decorative side pane
   squeezes into the phone frame. force-mobile mirrors the theme's
   max-width:960px rule regardless of the real viewport. */
.sienna-inv.force-mobile .kat-page__side-to-side .primary-pane{display:none;}
.sienna-inv.force-mobile .kat-page__side-to-side .secondary-pane{position:relative;width:100%;margin-left:0;}
/* Opening gate (SiennaCoverGate): the decorative primary pane rendered as the
   FULL-SCREEN gate. Overrides both the desktop rule (fixed, 61% wide) and the
   mobile rule (display:none) so the pane always fills the gate overlay. */
.sienna-inv.sienna-gate{height:100%;width:100%;}
.sienna-inv.sienna-gate .kat-page__side-to-side{height:100%;}
.sienna-inv.sienna-gate .kat-page__side-to-side .primary-pane{display:block;position:absolute;inset:0;width:100%;}
/* The pane's light gradient wash behind the names uses var(--light-rgb), which
   the ported Syakira CSS never defines — the wash silently no-ops and the names
   sit unreadable on the photo. Re-declare it with the cream tone. */
.sienna-inv .kat-page__side-to-side .primary-pane .inner:before{background:linear-gradient(to bottom,rgba(255,248,240,.55) 0,rgba(255,248,240,0) 45%,rgba(255,248,240,.8) 90%);}
/* Gate-only fit: keep the names/Dear clear of the Buka Undangan button, and
   tame the (desktop-tuned) name size on narrow screens. */
.sienna-inv.sienna-gate .kat-page__side-to-side .primary-pane .inner .details{margin-bottom:24%;}
@media (max-width:560px){
.sienna-inv.sienna-gate .kat-page__side-to-side .primary-pane .inner .details h1{font-size:10.5vw;}
}
`;

type SiennaEmbedProps = {
  /** Decorative left pane — bg ornaments + the "The Wedding Of" intro + cover. */
  primary?: React.ReactNode;
  /** The scrolling invitation sections (the secondary pane). */
  children: React.ReactNode;
  /** Editor phone preview: force the mobile single-pane layout (the preview is a
   *  scaled div, so the theme's own max-width media queries never trigger). */
  forceMobile?: boolean;
};

export function SiennaEmbed({ primary, children, forceMobile }: SiennaEmbedProps) {
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
    <div
      className={forceMobile ? "sienna-inv original preset-original force-mobile" : "sienna-inv original preset-original"}
      ref={rootRef}
    >
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

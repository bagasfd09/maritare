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
/* Folk-standard gated gift reveal. The button sits inside a taller panel so the
   closed state keeps the section's visual weight (as if a card were behind it). */
.ivory-inv .wedding-gift-reveal-panel{display:flex;align-items:center;justify-content:center;min-height:220px;margin:24px 0;padding:24px;border:1px solid var(--background-tertiary);border-radius:40px;background:rgba(var(--background-primary-rgb),.5);}
.ivory-inv .wedding-gift-reveal-btn{border:none;outline:none;box-shadow:none;display:flex;align-items:center;justify-content:center;width:fit-content;padding:12px 32px;border-radius:999px;font-family:var(--body-text-family);font-size:var(--body-text-size);letter-spacing:0.02em;background-color:var(--button-background-primary);color:var(--button-text-primary);cursor:pointer;transition-duration:.25s;transition-property:background-color;}
.ivory-inv .wedding-gift-reveal-btn:hover{background-color:var(--button-background-secondary);color:var(--button-text-secondary);}
/* Bootstrap's .form-control{width:100%} didn't survive the port — without it
   inputs collapse to the browser's default ~20ch width. */
.ivory-inv .wedding-wish-form .form-control{width:100%;}
.ivory-inv .wedding-wish-form .form-group{margin-bottom:12px;}
/* One card per wish (the theme's default is a single box around the whole list —
   disabled via .no-border on .comment-inner-wrapping). Same surface as the old
   wrap box, just per item. */
.ivory-inv .comment-item{background:rgba(var(--background-primary-rgb),.5);border:1px solid var(--background-tertiary);border-radius:24px;padding:16px 20px;margin-bottom:12px;}
/* Folk-style bank logo in place of the bank-name text (see bank-logos.ts). */
.ivory-inv .wedding-gift-bank-wrap .bank-logo{display:block;height:32px;width:auto;max-width:120px;object-fit:contain;margin:0 auto 4px;}
/* Folk gift-frame look: ONE framed box holding every account, scrolling
   internally (max-height) so a long list doesn't feel cramped. The heavy
   per-account box is stripped to a light row divided by a hairline. */
.ivory-inv .ivory-gift-scroll{margin:24px 0;padding:0 24px;border:1px solid var(--background-tertiary);border-radius:40px;background:rgba(var(--background-primary-rgb),.5);max-height:340px;overflow-y:auto;}
.ivory-inv .ivory-gift-scroll::-webkit-scrollbar{display:none;}
.ivory-inv .ivory-gift-scroll{-ms-overflow-style:none;scrollbar-width:none;}
.ivory-inv .ivory-gift-scroll .bank-item{background:transparent;border:none;border-radius:0;margin:0;padding:24px 0;}
.ivory-inv .ivory-gift-scroll .bank-item+.bank-item{border-top:1px solid rgba(var(--background-tertiary-rgb),.35);}
/* Shipping address folded into the gift section (folk-style), below the rows. */
.ivory-inv .ivory-gift-address{margin:24px 0;}
/* Story slider: the original slick JS sized the frame art; statically the
   frame-ls.png renders at its natural 722px and blows each slide past the
   track width (one photo spanning two snap points). Scale it to the slide. */
.ivory-inv .love-story .story-picture,.ivory-inv .love-story .story-picture .image-wrap{width:100%;}
.ivory-inv .love-story .story-picture .image-wrap img{display:block;width:100%;height:auto;}
/* Long unbroken words (no spaces) in the chapter title/story otherwise run
   sideways past the slide edge — break them anywhere. */
.ivory-inv .love-story .story-caption,.ivory-inv .love-story .story-sub-title{overflow-wrap:anywhere;}
/* Copy buttons were static <a>/<div> ports — now real <button>s. Keep the icon +
   label inline-centered and reset native button chrome so the look is unchanged. */
.ivory-inv .bank-button-wrap,.ivory-inv .wedding-gift-address-wrap .btn-hadiah-copy{display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font:inherit;outline:none;}
/* QR check-in section: FolkQr's head + framed-card presentation in ivory dress
   (the Aulia reference had only the bare QR — .img-qrcode CSS is the theme's). */
.ivory-inv .general-qrcode .qr-inner{margin:0 auto;max-width:420px;padding:0 4px;position:relative;text-align:center;}
.ivory-inv .general-qrcode .qr-orn-header{margin:0 auto 8px;width:170px;}
.ivory-inv .general-qrcode .qr-orn-header img,.ivory-inv .general-qrcode .qr-orn img,.ivory-inv .general-qrcode .qr-kupu img{display:block;height:auto;width:100%;}
.ivory-inv .general-qrcode .qr-description{color:var(--text-secondary);font-family:var(--body-text-family);font-size:var(--body-text-size);line-height:1.6;margin:8px auto 0;max-width:320px;}
.ivory-inv .general-qrcode .qr-card{background:rgba(var(--background-secondary-rgb),.6);border:1px solid var(--background-tertiary);border-radius:40px;margin:28px auto 0;padding:32px 24px;position:relative;}
.ivory-inv .general-qrcode .qr-guest{color:var(--text-primary);font-family:var(--body-text-family);font-size:var(--body-text-size);font-weight:600;margin:0 0 12px;}
.ivory-inv .general-qrcode .qr-orn{pointer-events:none;position:absolute;width:72px;z-index:0;}
.ivory-inv .general-qrcode .qr-orn.tl{left:-18px;top:-20px;transform:scaleX(-1);}
.ivory-inv .general-qrcode .qr-orn.br{bottom:-20px;right:-18px;}
.ivory-inv .general-qrcode .qr-kupu{pointer-events:none;position:absolute;right:9%;top:-22px;width:44px;z-index:0;}
/* The QR itself must never be covered — florals sit BEHIND it (they peek out
   around the opaque QR tile instead of lying on top of the code). */
.ivory-inv .general-qrcode .qr-guest,.ivory-inv .general-qrcode .img-qrcode{position:relative;z-index:1;}
/* Cover + couple photos are clipped by bitmap masks (mask-cover.png /
   mask-couple.png) that 403'd on the Katsudoto CDN and were never copied — a
   broken mask-image clips the element to nothing in Chrome/Safari, so both
   photos rendered blank. Drop the missing masks and clip to an ellipse in CSS
   instead (both shapes are ovals), restoring the photos. */
.ivory-inv section.cover .inner .body .cover-frame{-webkit-mask-image:none;mask-image:none;border-radius:50%;overflow:hidden;}
.ivory-inv .couple-picture-wrap{-webkit-mask-image:none;mask-image:none;border-radius:50%;overflow:hidden;}
/* Editor phone preview renders the template in a SCALED DIV, not an iframe, so
   the theme's desktop media queries still match and the decorative side pane
   squeezes into the phone frame. force-mobile mirrors the theme's
   max-width:960px rule regardless of the real viewport. */
.ivory-inv.force-mobile .kat-page__side-to-side .primary-pane{display:none;}
.ivory-inv.force-mobile .kat-page__side-to-side .secondary-pane{position:relative;width:100%;}
/* Opening gate (IvoryCoverGate): the decorative primary pane rendered as the
   FULL-SCREEN gate. Overrides both the desktop rule (fixed, 61% wide) and the
   mobile rule (display:none) so the pane always fills the gate overlay. */
.ivory-inv.ivory-gate{height:100%;width:100%;}
.ivory-inv.ivory-gate .kat-page__side-to-side{height:100%;}
.ivory-inv.ivory-gate .kat-page__side-to-side .primary-pane{display:block;position:absolute;inset:0;width:100%;}
`;

type IvoryEmbedProps = {
  /** Decorative left pane — bg ornaments + the "The Wedding Of" intro. */
  primary?: React.ReactNode;
  /** The scrolling invitation sections (the secondary pane). */
  children: React.ReactNode;
  /** Editor phone preview: force the mobile single-pane layout (the preview is a
   *  scaled div, so the theme's own max-width media queries never trigger). */
  forceMobile?: boolean;
};

export function IvoryEmbed({ primary, children, forceMobile }: IvoryEmbedProps) {
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
    <div
      className={forceMobile ? "ivory-inv original preset-original force-mobile" : "ivory-inv original preset-original"}
      ref={rootRef}
    >
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

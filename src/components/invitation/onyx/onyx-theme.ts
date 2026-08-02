// Onyx design tokens + scoped global CSS.
//
// Unlike the Katsudoto ports (ivory/sienna/plum), the Onyx reference is a
// React/Vite project whose design lives in INLINE style objects, not a
// stylesheet — so there's no vendor CSS to scope. What the reference does keep
// in `index.css` is a handful of GLOBALS (font import, the fadeUp keyframe, a
// hidden scrollbar, smooth scrolling, a champagne ::selection). Those are
// reproduced below, every rule scoped under `.onyx-inv` so nothing leaks into
// the surrounding maritare app. The reference's `body{background:#F7F7F5}` is
// deliberately NOT ported — it's a leftover from the template's light-theme
// ancestor and the design renders all-dark (see onyx-backdrop).

/** Shared palette + font stacks — the reference's `G` object, verbatim. */
export const ONYX = {
  font: {
    display: "'Cormorant Garamond', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
  },
  color: {
    warmWhite: "#F7F7F5",
    charcoal: "#171717",
    darkGray: "#2A2A2A",
    midGray: "#6B6B6B",
    lightGray: "#E8E8E6",
    champagne: "#C9A96E",
  },
} as const;

/** Champagne at an arbitrary alpha — the reference writes these as literals. */
export const gold = (alpha: number) => `rgba(201,169,110,${alpha})`;
/** Warm white at an arbitrary alpha (body copy, captions, dividers). */
export const warm = (alpha: number) => `rgba(247,247,245,${alpha})`;

export const ONYX_THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Inter:wght@300;400;500;600&display=swap');

.onyx-inv{
  font-family:'Inter',system-ui,sans-serif;
  color:${ONYX.color.warmWhite};
  background-color:#0D0D0D;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  position:relative;
}
/* The reference hides the scrollbar globally; scoped here so only the
   invitation's own scroll containers lose theirs. */
.onyx-inv ::-webkit-scrollbar{width:0;height:0;}
.onyx-inv *{scrollbar-width:none;}
.onyx-inv ::selection{background-color:rgba(201,169,110,0.25);color:${ONYX.color.warmWhite};}

.onyx-inv h1,.onyx-inv h2,.onyx-inv h3{margin:0;font-weight:300;}
.onyx-inv p{margin:0;}
.onyx-inv a{color:inherit;}
.onyx-inv img{max-width:100%;}

/* Slow zoom on hover for framed photos (couple portraits, gallery cells). CSS
   rather than the reference's onMouseEnter handlers, so those sections stay
   server components. */
.onyx-inv .onyx-zoom img{transition:transform 0.8s cubic-bezier(0.16,1,0.3,1);}
.onyx-inv .onyx-zoom:hover img{transform:scale(1.06);}
.onyx-inv .onyx-zoom-lg:hover img{transform:scale(1.07);}

@keyframes onyxFadeUp{
  from{opacity:0;transform:translateY(32px);}
  to{opacity:1;transform:translateY(0);}
}

/* Anchor offset for the floating nav (which scrolls with scrollIntoView, so no
   global scroll-behavior rule is needed — .onyx-inv isn't the scroller anyway). */
.onyx-inv section[id]{scroll-margin-top:72px;}

@media (prefers-reduced-motion: reduce){
  .onyx-inv *{animation:none!important;transition:none!important;}
}
`;

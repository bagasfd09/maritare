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

/**
 * Corner radius for the template's BOXY surfaces (cards, panels, framed photos,
 * inputs, buttons). The reference was all sharp corners; softened on request.
 * The circles (`borderRadius: "50%"` — portraits, ghost rings, badges, the
 * back-to-top dot) are a different element of the design and keep their own.
 */
export const RADIUS = "10px";

/**
 * The name Onyx sets in display type (cover gate, hero, couple cards, footer
 * initials, nav monogram).
 *
 * The wedding's own `groomName`/`brideName` IS the couple's nickname (ivory
 * passes it as `nickname` for the same reason), so it wins — "Muhammad Ihsan
 * Pratama" with nickname "Ihsan" must read Ihsan, not Muhammad. Only with no
 * nickname stored does this fall back to the full name's first word.
 *
 * Lives here (not onyx-atoms) so the check in onyx-theme.test.ts can import it
 * without Node having to strip JSX.
 */
export function shortName(fullName: string | undefined, nickname: string): string {
  const nick = nickname.trim();
  if (nick) return nick;
  return (fullName ?? "").trim().split(/\s+/)[0] || "";
}

/** Champagne at an arbitrary alpha — the reference writes these as literals. */
export const gold = (alpha: number) => `rgba(201,169,110,${alpha})`;
/** Warm white at an arbitrary alpha (body copy, captions, dividers). */
export const warm = (alpha: number) => `rgba(247,247,245,${alpha})`;

export const ONYX_THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Inter:wght@300;400;500;600&display=swap');

/* Viewport-unit basis.
   This design is fluid — nearly every size is a clamp() driven by vw. But the
   editor preview renders the template inside a 390x844 canvas scaled by 0.692,
   and REAL viewport units there resolve against the browser window (1440px on a
   desktop), so the invitation came out at desktop scale inside a phone frame and
   overflowed. Every vw/vh/vmin in the components is therefore expressed as
   calc(N * var(--onyx-*)), and the embed swaps the basis to the canvas's own
   dimensions by adding .onyx-boxed. Same problem the vh trap causes; same fix.
   Both the embed root and the (separately mounted) cover gate carry these. */
.onyx-inv,.onyx-gate{--onyx-vw:1vw;--onyx-vh:1svh;--onyx-vmin:1vmin;}
.onyx-inv.onyx-boxed,.onyx-gate.onyx-boxed{--onyx-vw:3.9px;--onyx-vh:8.44px;--onyx-vmin:3.9px;}

/* Tailwind's md:/lg: breakpoints test the REAL viewport too, so on a desktop
   editor the phone frame would get the DESKTOP nav (six links, overflowing the
   390px canvas) and the couple section's desktop-only ampersand column. Force
   the mobile arrangement inside the frame — the same job sienna's .force-mobile
   does for its ported media queries. */
.onyx-inv.onyx-boxed .onyx-nav-desktop{display:none!important;}
.onyx-inv.onyx-boxed .onyx-nav-burger{display:flex!important;}
.onyx-inv.onyx-boxed .onyx-amp{display:none!important;}

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

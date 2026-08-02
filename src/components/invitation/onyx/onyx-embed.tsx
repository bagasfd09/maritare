// Shared shell for the Onyx template. Injects the scoped theme CSS, mounts the
// fixed cinematic backdrop, and stacks the scrolling sections above it.
//
// Unlike the Katsudoto-port embeds (ivory/sienna/plum) this is a SERVER
// component and carries no IntersectionObserver: Onyx reveals through its own
// `<OnyxReveal>` primitive (onyx-reveal.tsx), which is the client boundary. It
// also needs no preset/palette classes on the root — the palette lives in the
// inline style objects the reference itself uses, not in CSS variables that
// only match a `body.<preset>` selector.

import type { InvitationView } from "@/server/queries/invitation";

import { OnyxBackdrop } from "./onyx-backdrop";
import { ONYX_THEME_CSS } from "./onyx-theme";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  children: React.ReactNode;
};

export function OnyxEmbed({ data, mode, children }: Props) {
  return (
    // `onyx-boxed` rebases the --onyx-vw/vh/vmin custom properties from real
    // viewport units to the editor canvas's fixed 390x844 — without it this
    // fluid design renders at DESKTOP scale inside the phone frame and spills
    // out of it (see the basis block in onyx-theme).
    <div className={mode === "editorPreview" ? "onyx-inv onyx-boxed" : "onyx-inv"}>
      <style dangerouslySetInnerHTML={{ __html: ONYX_THEME_CSS }} />
      <OnyxBackdrop data={data} />
      {/* Explicit z-index so sections always paint ABOVE the fixed backdrop —
          see the stacking note in onyx-backdrop. */}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

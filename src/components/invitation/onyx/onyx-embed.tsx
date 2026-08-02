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
  children: React.ReactNode;
};

export function OnyxEmbed({ data, children }: Props) {
  return (
    <div className="onyx-inv">
      <style dangerouslySetInnerHTML={{ __html: ONYX_THEME_CSS }} />
      <OnyxBackdrop data={data} />
      {/* Explicit z-index so sections always paint ABOVE the fixed backdrop —
          see the stacking note in onyx-backdrop. */}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

// Onyx shared micro-elements — the reference's `Label` and `GoldLine`
// primitives (App.tsx), verbatim. Server-safe (pure markup + inline styles), so
// sections importing them stay server components.

import type { ReactNode } from "react";

import { ONYX, gold } from "./onyx-theme";

/** Wide-tracked champagne micro-caps that head every section. */
export function OnyxLabel({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: ONYX.font.body,
        fontSize: "0.62rem",
        letterSpacing: "0.38em",
        textTransform: "uppercase",
        color: ONYX.color.champagne,
        marginBottom: "1rem",
        fontWeight: 500,
      }}
    >
      {children}
    </p>
  );
}

/** Hairline champagne rule — horizontal by default, vertical as a section drop. */
export function OnyxGoldLine({ vertical = false }: { vertical?: boolean }) {
  if (vertical) {
    return (
      <div
        style={{
          width: "1px",
          height: "56px",
          background: `linear-gradient(to bottom, transparent, ${gold(0.33)}, transparent)`,
          margin: "0 auto",
        }}
      />
    );
  }
  return (
    <div
      style={{
        height: "1px",
        background: `linear-gradient(to right, transparent, ${gold(0.33)}, transparent)`,
        margin: "1.5rem 0",
      }}
    />
  );
}

/** The section heading: thin Cormorant display type, warm white. */
export function OnyxHeading({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: ONYX.font.display,
        fontSize: "clamp(2rem, 5vw, 3.5rem)",
        fontWeight: 300,
        color: ONYX.color.warmWhite,
        letterSpacing: "-0.01em",
        margin: 0,
      }}
    >
      {children}
    </h2>
  );
}

/** Standard section padding rhythm used by every Onyx band. */
export const SECTION_PAD = "clamp(5rem, 10vw, 10rem) clamp(1.5rem, 5vw, 5rem)";

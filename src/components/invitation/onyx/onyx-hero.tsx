// Onyx hero — the reference's `HeroSection`: a full-viewport opening frame over
// the fixed backdrop, with the names centred, a hairline-flanked date line and a
// "Scroll" cue pinned to the bottom. Entrance uses the `onyxFadeUp` keyframe
// (onyx-theme) rather than the scroll observer, exactly as the reference does —
// this section is already in view on load.
//
// Height is one screen — `calc(100 * var(--onyx-vh))`. The var, not a raw `svh`,
// because the editor preview is a SCALED DIV rather than an iframe: real
// viewport units there resolve against the whole browser window, so the hero
// would tower over the phone frame. `.onyx-boxed` rebases the var to the
// canvas's own 844px (see onyx-theme).

import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

import type { InvitationView } from "@/server/queries/invitation";

import { ONYX, gold, shortName, warm } from "./onyx-theme";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

export function OnyxHero({ data }: Props) {
  const { pasangan } = data.sections;
  const groom = shortName(pasangan.groom.fullName, data.groomName);
  const bride = shortName(pasangan.bride.fullName, data.brideName);

  const eventDate = data.sections.acara.events[0]?.date ?? data.eventDate;
  // No weekday here: the reference's hero meta is a single hairline-flanked
  // line, and "Sabtu · 01 Agustus 2026 · Yogyakarta" wraps to two at 430px.
  // The weekday still shows in full on the event cards.
  const metaLine = [
    eventDate ? format(parseISO(eventDate), "dd MMMM yyyy", { locale: id }) : null,
    data.city,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section
      id="onyx-hero"
      style={{
        position: "relative",
        minHeight: "calc(100 * var(--onyx-vh))",
        display: "flex",
        alignItems: "flex-end",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "1400px",
          margin: "auto",
          padding: "clamp(4rem, calc(8 * var(--onyx-vw)), 8rem) clamp(1.5rem, calc(5 * var(--onyx-vw)), 5rem)",
          paddingTop: "8rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: ONYX.font.body,
            fontSize: "0.6rem",
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: ONYX.color.champagne,
            marginBottom: "1.5rem",
            animation: "onyxFadeUp 1s ease 0.3s both",
          }}
        >
          The Wedding of
        </p>

        <h1
          style={{
            fontFamily: ONYX.font.display,
            fontSize: "clamp(3.2rem, calc(9 * var(--onyx-vw)), 8rem)",
            fontWeight: 300,
            color: ONYX.color.warmWhite,
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
            // The tagline that used to sit here carried the gap down to the
            // date line; with it gone the names hold that spacing themselves.
            margin: "0 0 3.1rem",
            animation: "onyxFadeUp 1s ease 0.5s both",
          }}
        >
          {/* Bride first — swapped on request, matching the couple section. */}
          {bride} &amp; {groom}
        </h1>

        {metaLine && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "1.25rem",
              animation: "onyxFadeUp 1s ease 0.9s both",
            }}
          >
            <div style={{ height: "1px", width: "36px", background: gold(0.5) }} />
            <p
              style={{
                fontFamily: ONYX.font.body,
                fontSize: "0.6rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: warm(0.45),
                margin: 0,
              }}
            >
              {metaLine}
            </p>
            <div style={{ height: "1px", width: "36px", background: gold(0.5) }} />
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: 0,
          width: "100%",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          animation: "onyxFadeUp 1s ease 1.3s both",
        }}
      >
        <p
          style={{
            fontFamily: ONYX.font.body,
            fontSize: "0.52rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: warm(0.28),
            margin: 0,
          }}
        >
          Scroll
        </p>
        <div
          style={{
            width: "1px",
            height: "36px",
            background: `linear-gradient(to bottom, ${warm(0.3)}, transparent)`,
          }}
        />
      </div>
    </section>
  );
}

// Onyx events — the reference's `EventsSection`: one dark card per event, each
// lit by a champagne spotlight from the top edge, with the details as
// label/value rows under a hairline.
//
// The reference hard-coded two events with a "Dress" row and a closing note;
// maritare's acara schema has neither field, so those rows are dropped rather
// than invented. The reference's separate Venue section is folded in here as the
// per-event "Open in Maps" link — it otherwise duplicated the same venue,
// address and map link twice on one page.

import { formatFullDateId, formatTimeRangeId } from "../flora/format";
import { OnyxLabel, SECTION_PAD } from "./onyx-atoms";
import { OnyxReveal } from "./onyx-reveal";
import { ONYX, gold, warm } from "./onyx-theme";

import type { InvitationView } from "@/server/queries/invitation";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

// Editorial card labels in the reference's voice. Cycled by index — acara caps
// at 4 events, so every card gets one.
const CARD_LABELS = ["The Sacred Vow", "The Celebration", "The Gathering", "The Occasion"];

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
      <span
        style={{
          fontFamily: ONYX.font.body,
          fontSize: "0.58rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: ONYX.color.champagne,
          flexShrink: 0,
          width: "54px",
          paddingTop: "2px",
          fontWeight: 500,
        }}
      >
        {k}
      </span>
      <span
        style={{
          fontFamily: ONYX.font.body,
          fontSize: "0.84rem",
          color: warm(0.65),
          lineHeight: 1.55,
          fontWeight: 300,
        }}
      >
        {v}
      </span>
    </div>
  );
}

export function OnyxAgenda({ data }: Props) {
  const { acara } = data.sections;
  const events = acara.events;
  if (events.length === 0) {
    return null;
  }

  return (
    <section id="onyx-events" style={{ padding: SECTION_PAD }}>
      <OnyxReveal style={{ textAlign: "center", marginBottom: "clamp(3rem, calc(6 * var(--onyx-vw)), 5rem)" }}>
        <OnyxLabel>Save the Date</OnyxLabel>
        <h2
          style={{
            fontFamily: ONYX.font.display,
            fontSize: "clamp(2rem, calc(5 * var(--onyx-vw)), 3.5rem)",
            fontWeight: 300,
            color: ONYX.color.warmWhite,
            letterSpacing: "-0.01em",
            margin: 0,
          }}
        >
          {acara.title?.trim() || "Wedding Events"}
        </h2>
        {acara.subtitle?.trim() && (
          <p
            style={{
              fontFamily: ONYX.font.body,
              fontSize: "clamp(0.84rem, calc(2 * var(--onyx-vw)), 0.95rem)",
              lineHeight: 1.85,
              color: warm(0.45),
              fontWeight: 300,
              maxWidth: "520px",
              margin: "1.25rem auto 0",
            }}
          >
            {acara.subtitle}
          </p>
        )}
      </OnyxReveal>

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))",
          gap: "clamp(1.25rem, calc(3 * var(--onyx-vw)), 2.5rem)",
        }}
      >
        {events.map((evt, i) => (
          <OnyxReveal key={i} delay={i * 120}>
            <div
              style={{
                backgroundColor: "rgba(23,23,23,0.82)",
                border: `1px solid ${gold(0.12)}`,
                padding: "clamp(2rem, calc(5 * var(--onyx-vw)), 3.5rem)",
                position: "relative",
                overflow: "hidden",
                height: "100%",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-40%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "150%",
                  height: "150%",
                  background: `radial-gradient(ellipse 50% 38% at 50% 0%, ${gold(0.07)} 0%, transparent 60%)`,
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative" }}>
                <OnyxLabel>{CARD_LABELS[i % CARD_LABELS.length]}</OnyxLabel>
                <h3
                  style={{
                    fontFamily: ONYX.font.display,
                    fontSize: "clamp(1.8rem, calc(4 * var(--onyx-vw)), 2.8rem)",
                    fontWeight: 300,
                    color: ONYX.color.warmWhite,
                    marginBottom: "2rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {evt.name}
                </h3>
                <div
                  style={{
                    borderTop: `1px solid ${warm(0.07)}`,
                    paddingTop: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.9rem",
                  }}
                >
                  <Row k="Date" v={formatFullDateId(evt.date)} />
                  <Row k="Time" v={formatTimeRangeId(evt.timeStart, evt.timeEnd)} />
                  {evt.venue && <Row k="Venue" v={evt.venue} />}
                  {evt.address && <Row k="Address" v={evt.address} />}
                </div>

                {evt.mapsUrl && (
                  <a
                    href={evt.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: "2rem",
                      fontFamily: ONYX.font.body,
                      fontSize: "0.6rem",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: ONYX.color.champagne,
                      textDecoration: "none",
                      borderBottom: `1px solid ${gold(0.5)}`,
                      paddingBottom: "2px",
                    }}
                  >
                    Open in Maps →
                  </a>
                )}
              </div>
            </div>
          </OnyxReveal>
        ))}
      </div>
    </section>
  );
}

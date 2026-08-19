/* eslint-disable @next/next/no-img-element -- built-in sample map art + presigned R2 srcs use raw <img> by design */

// Onyx venue — the reference's `VenueSection`, restored: a desaturated map panel
// with a floating pin and city chip on the left, and the venue details stacked
// on the right (label, name, address, "Open in Maps →"), separated by hairlines.
//
// This deliberately repeats venue/address/map info that the event cards also
// carry — that duplication is the reference's own composition, kept on request.
//
// Bound to acara.events: each event supplies the label (its name), the venue,
// the address and the map link. Events with no venue are skipped; the whole
// section hides when none is left. The map panel art is the reference's own
// cityscape (ONYX_SAMPLE.venue) — it's decorative backdrop, not a real map.

import type { InvitationView } from "@/server/queries/invitation";

import { OnyxLabel, SECTION_PAD } from "./onyx-atoms";
import { OnyxReveal } from "./onyx-reveal";
import { ONYX_SAMPLE } from "./onyx-sample";
import { ONYX, RADIUS, gold, warm } from "./onyx-theme";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

export function OnyxVenue({ data }: Props) {
  const venues = data.sections.acara.events.filter((e) => e.venue?.trim());
  if (venues.length === 0) {
    return null;
  }

  return (
    <section id="onyx-venue" style={{ padding: SECTION_PAD }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <OnyxReveal style={{ textAlign: "center", marginBottom: "clamp(3rem, calc(6 * var(--onyx-vw)), 5rem)" }}>
          <OnyxLabel>Venue</OnyxLabel>
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
            Where It Happens
          </h2>
        </OnyxReveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))",
            gap: "clamp(2.5rem, calc(5 * var(--onyx-vw)), 6rem)",
            alignItems: "center",
          }}
        >
          <OnyxReveal>
            <div
              style={{
                position: "relative",
                height: "clamp(260px, calc(40 * var(--onyx-vw)), 460px)",
                backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: RADIUS,
                overflow: "hidden",
              }}
            >
              <img
                src={ONYX_SAMPLE.venue}
                alt=""
                loading="lazy"
                decoding="async"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.55,
                  filter: "grayscale(30%)",
                }}
              />
              <div style={{ position: "absolute", inset: 0, background: "rgba(13,13,13,0.35)" }} />

              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%,-50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: ONYX.color.charcoal,
                    border: `1px solid ${gold(0.4)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
                  }}
                >
                  <span style={{ color: ONYX.color.champagne, fontSize: "1.1rem" }}>◉</span>
                </div>
                {data.city && (
                  <div
                    style={{
                      backgroundColor: "rgba(23,23,23,0.92)",
                      backdropFilter: "blur(8px)",
                      borderRadius: RADIUS,
                      padding: "4px 12px",
                      fontFamily: ONYX.font.body,
                      fontSize: "0.6rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: ONYX.color.warmWhite,
                    }}
                  >
                    {data.city}
                  </div>
                )}
              </div>
            </div>
          </OnyxReveal>

          <OnyxReveal delay={120}>
            <div>
              {venues.map((venue, i) => (
                <div
                  key={i}
                  style={
                    i > 0
                      ? {
                          borderTop: `1px solid ${warm(0.08)}`,
                          paddingTop: "2.5rem",
                          marginTop: "2.5rem",
                        }
                      : undefined
                  }
                >
                  <p
                    style={{
                      fontFamily: ONYX.font.body,
                      fontSize: "0.58rem",
                      letterSpacing: "0.32em",
                      textTransform: "uppercase",
                      color: ONYX.color.champagne,
                      marginBottom: "0.6rem",
                    }}
                  >
                    {venue.name}
                  </p>
                  <h3
                    style={{
                      fontFamily: ONYX.font.display,
                      fontSize: "clamp(1.4rem, calc(3 * var(--onyx-vw)), 2rem)",
                      fontWeight: 300,
                      color: ONYX.color.warmWhite,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {venue.venue}
                  </h3>
                  {venue.address && (
                    <p
                      style={{
                        fontFamily: ONYX.font.body,
                        fontSize: "0.84rem",
                        color: warm(0.45),
                        lineHeight: 1.7,
                        fontWeight: 300,
                        marginBottom: "1.25rem",
                      }}
                    >
                      {venue.address}
                    </p>
                  )}
                  {venue.mapsUrl && (
                    <a
                      href={venue.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        fontFamily: ONYX.font.body,
                        fontSize: "0.6rem",
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        color: ONYX.color.warmWhite,
                        textDecoration: "none",
                        borderBottom: `1px solid ${gold(0.5)}`,
                        paddingBottom: "2px",
                      }}
                    >
                      Open in Maps →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </OnyxReveal>
        </div>
      </div>
    </section>
  );
}

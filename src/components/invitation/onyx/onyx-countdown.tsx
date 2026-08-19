"use client";

// Onyx countdown — the reference's `CountdownSection`: a tinted band with the
// four units set in huge thin display type, each over a hairline and a champagne
// caps label.
//
// Hydration-safe (the pattern sienna-savedate established): state starts at
// zero and every Date computation happens inside the effect, so the server
// render and the first client render agree. The target is the first event's
// date + start time, falling back to the wedding's eventDate at midnight, and
// the diff is clamped at 0 so a past wedding shows zeros rather than negatives.

import { useEffect, useState } from "react";

import { buildGoogleCalendarUrl } from "@/lib/invitation/calendar";
import type { InvitationView } from "@/server/queries/invitation";

import { formatFullDateId } from "../flora/format";
import { OnyxLabel, SECTION_PAD } from "./onyx-atoms";
import { OnyxReveal } from "./onyx-reveal";
import { ONYX, RADIUS, gold, warm } from "./onyx-theme";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

export function OnyxCountdown({ data }: Props) {
  const event = data.sections.acara.events[0];
  const dateStr = event?.date || data.eventDate;
  const targetIso = dateStr ? `${dateStr}T${event?.timeStart || "00:00"}:00` : null;

  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!targetIso) return;
    const target = new Date(targetIso).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor(diff / 3600000) % 24,
        m: Math.floor(diff / 60000) % 60,
        s: Math.floor(diff / 1000) % 60,
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  if (!dateStr) {
    return null;
  }

  const units = [
    { label: "Days", value: time.d },
    { label: "Hours", value: time.h },
    { label: "Minutes", value: time.m },
    { label: "Seconds", value: time.s },
  ];

  const calendarUrl =
    event && event.date && event.timeStart
      ? buildGoogleCalendarUrl({
          title: event.name,
          date: event.date,
          timeStart: event.timeStart,
          timeEnd: event.timeEnd,
          venue: event.venue,
          address: event.address,
        })
      : null;

  return (
    <section
      style={{
        backgroundColor: "rgba(23,23,23,0.72)",
        padding: SECTION_PAD,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 65% 75% at 50% 50%, ${gold(0.05)} 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative" }}>
        <OnyxReveal>
          <OnyxLabel>Counting Down</OnyxLabel>
          <h2
            style={{
              fontFamily: ONYX.font.display,
              fontSize: "clamp(2rem, calc(5 * var(--onyx-vw)), 3.5rem)",
              fontWeight: 300,
              color: ONYX.color.warmWhite,
              letterSpacing: "-0.01em",
              marginBottom: "0.75rem",
            }}
          >
            The Moment Awaits
          </h2>
          <p
            style={{
              fontFamily: ONYX.font.display,
              fontStyle: "italic",
              fontSize: "clamp(0.9rem, calc(2 * var(--onyx-vw)), 1.2rem)",
              color: warm(0.38),
              marginBottom: "clamp(3rem, calc(6 * var(--onyx-vw)), 5rem)",
            }}
          >
            {formatFullDateId(dateStr)}
          </p>
        </OnyxReveal>

        <OnyxReveal delay={150}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "clamp(1.5rem, calc(5 * var(--onyx-vw)), 5rem)",
              flexWrap: "wrap",
            }}
          >
            {units.map((u) => (
              <div
                key={u.label}
                style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                <span
                  style={{
                    fontFamily: ONYX.font.display,
                    fontSize: "clamp(3rem, calc(9 * var(--onyx-vw)), 7.5rem)",
                    fontWeight: 300,
                    color: ONYX.color.warmWhite,
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    display: "block",
                    minWidth: "clamp(56px, calc(10 * var(--onyx-vw)), 115px)",
                  }}
                >
                  {String(u.value).padStart(2, "0")}
                </span>
                <div
                  style={{
                    width: "100%",
                    height: "1px",
                    background: gold(0.2),
                    margin: "0.75rem 0",
                  }}
                />
                <span
                  style={{
                    fontFamily: ONYX.font.body,
                    fontSize: "0.58rem",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: ONYX.color.champagne,
                  }}
                >
                  {u.label}
                </span>
              </div>
            ))}
          </div>
        </OnyxReveal>

        {calendarUrl && (
          <OnyxReveal delay={250}>
            <a
              href={calendarUrl}
              target="_blank"
              rel="nofollow noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: "clamp(2.5rem, calc(5 * var(--onyx-vw)), 4rem)",
                border: `1px solid ${gold(0.45)}`,
                borderRadius: RADIUS,
                color: ONYX.color.warmWhite,
                fontFamily: ONYX.font.body,
                fontSize: "0.6rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                padding: "0.9rem 2.5rem",
                textDecoration: "none",
              }}
            >
              Add to Calendar
            </a>
          </OnyxReveal>
        )}
      </div>
    </section>
  );
}

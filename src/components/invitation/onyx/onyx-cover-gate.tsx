"use client";

// Onyx opening gate — the reference's `CoverScreen`: two ghost champagne rings,
// "The Wedding Of", the two names stacked around an italic gold ampersand, a
// hairline-flanked date line, and the outlined "Open Invitation" button. The
// reference's "Two Souls. One Light. One Forever." tagline is dropped (same as
// on the hero) on request.
//
// Wired to the maritare gate contract (folk/sienna parity): tapping the button
// dispatches "maritare:open-invitation" synchronously inside the click — that's
// the user gesture ScarletAudio needs to start the music — then fades the gate
// out and unmounts it. Page scroll is locked while the gate is up (skipped in
// editorPreview, where locking document.body would freeze the dashboard).
//
// The gate is transparent: OnyxBackdrop is already fixed behind everything, so
// the cover sits on the same cinematic frame the invitation scrolls over.

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";

import type { InvitationView } from "@/server/queries/invitation";

import { ONYX_SAMPLE } from "./onyx-sample";
import { ONYX, RADIUS, gold, shortName, warm } from "./onyx-theme";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** Sanitized guest name (?g= guest, else ?to=) — greeted above the open button. */
  guestName?: string;
};

const EXIT_MS = 1100;

/** "2026-10-18" → "18 · 10 · 2026" (the reference's dotted cover date). */
export function dottedDate(date: string): string {
  return format(parseISO(date), "dd · MM · yyyy");
}

export function OnyxCoverGate({ data, mode, guestName }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [closing, setClosing] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (hidden || mode === "editorPreview") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [hidden, mode]);

  if (hidden) return null;

  const groom = shortName(data.sections.pasangan.groom.fullName, data.groomName);
  const bride = shortName(data.sections.pasangan.bride.fullName, data.brideName);
  const eventDate = data.sections.acara.events[0]?.date ?? data.eventDate;
  const metaLine = [eventDate ? dottedDate(eventDate) : null, data.city]
    .filter(Boolean)
    .join(" · ");

  const handleOpen = () => {
    if (closing) return;
    // Synchronous inside the click — browsers only count that as the gesture.
    window.dispatchEvent(new Event("maritare:open-invitation"));
    window.scrollTo({ top: 0, behavior: "smooth" });
    setClosing(true);
    window.setTimeout(() => setHidden(true), EXIT_MS);
  };

  return (
    <div
      // The gate mounts OUTSIDE the .onyx-inv embed, so it needs its own copy of
      // the viewport-unit basis (`onyx-gate`) and the editor rebase
      // (`onyx-boxed`) — its type is the most vw-driven in the whole template.
      className={mode === "editorPreview" ? "onyx-gate onyx-boxed" : "onyx-gate"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0D0D0D",
        opacity: closing ? 0 : 1,
        pointerEvents: closing ? "none" : "auto",
        transition: "opacity 1.1s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* The backdrop again, inside the gate — the gate is its own fixed layer,
          so it needs its own copy of the cinematic frame behind the type. */}
      <OnyxGateBackdrop data={data} />

      {/* Ghost champagne rings */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          width: "min(700px, calc(90 * var(--onyx-vmin)))",
          height: "min(700px, calc(90 * var(--onyx-vmin)))",
          border: `1px solid ${gold(0.07)}`,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          width: "min(560px, calc(72 * var(--onyx-vmin)))",
          height: "min(560px, calc(72 * var(--onyx-vmin)))",
          border: `1px solid ${gold(0.05)}`,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "0 clamp(1.5rem, calc(5 * var(--onyx-vw)), 4rem)",
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(24px)",
          transition:
            "opacity 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s, transform 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s",
        }}
      >
        <p
          style={{
            fontFamily: ONYX.font.body,
            fontSize: "0.62rem",
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: ONYX.color.champagne,
            marginBottom: "2.5rem",
          }}
        >
          The Wedding of
        </p>

        <div style={{ lineHeight: 0.92 }}>
          <h1
            style={{
              fontFamily: ONYX.font.display,
              fontSize: "clamp(4.5rem, calc(14 * var(--onyx-vw)), 10rem)",
              fontWeight: 300,
              color: ONYX.color.warmWhite,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            {groom}
          </h1>
          <p
            style={{
              fontFamily: ONYX.font.display,
              fontSize: "clamp(1.8rem, calc(5 * var(--onyx-vw)), 3.5rem)",
              fontWeight: 300,
              color: ONYX.color.champagne,
              margin: "0.2rem 0",
              letterSpacing: "0.15em",
              fontStyle: "italic",
            }}
          >
            &amp;
          </p>
          <h1
            style={{
              fontFamily: ONYX.font.display,
              fontSize: "clamp(4.5rem, calc(14 * var(--onyx-vw)), 10rem)",
              fontWeight: 300,
              color: ONYX.color.warmWhite,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            {bride}
          </h1>
        </div>

        {metaLine && (
          <div
            style={{
              margin: "2.5rem 0 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.25rem",
            }}
          >
            <div style={{ height: "1px", width: "40px", background: gold(0.35) }} />
            <p
              style={{
                fontFamily: ONYX.font.body,
                fontSize: "0.6rem",
                letterSpacing: "0.35em",
                color: warm(0.4),
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              {metaLine}
            </p>
            <div style={{ height: "1px", width: "40px", background: gold(0.35) }} />
          </div>
        )}

        {guestName && (
          <div style={{ marginTop: "1.5rem" }}>
            <p
              style={{
                fontFamily: ONYX.font.body,
                fontSize: "0.55rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: warm(0.35),
                marginBottom: "0.4rem",
              }}
            >
              Kepada Yth.
            </p>
            <p
              style={{
                fontFamily: ONYX.font.display,
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(1rem, calc(3 * var(--onyx-vw)), 1.4rem)",
                color: warm(0.85),
              }}
            >
              {guestName}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleOpen}
          style={{
            // The dropped tagline used to hold this gap open; the guest block,
            // when present, already fills part of it.
            marginTop: guestName ? "1.75rem" : "3rem",
            border: `1px solid ${gold(0.45)}`,
            borderRadius: RADIUS,
            color: ONYX.color.warmWhite,
            fontFamily: ONYX.font.body,
            fontSize: "0.62rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            padding: "1rem 3rem",
            background: "transparent",
            cursor: "pointer",
            transition: "all 0.4s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = ONYX.color.champagne;
            e.currentTarget.style.borderColor = ONYX.color.champagne;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = gold(0.45);
          }}
        >
          Buka Undangan
        </button>
      </div>
    </div>
  );
}

function OnyxGateBackdrop({ data }: { data: InvitationView }) {
  // The opening screen is ALWAYS video: the couple's own upload if they have
  // one, otherwise the reference trailer. Unlike OnyxBackdrop (which still
  // honours an uploaded still), a photo never replaces it here — the moving
  // frame behind the names is what the gate is.
  const videoUrl = data.sections.hero.videoUrl ?? ONYX_SAMPLE.video;
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <video
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)" }} />
    </div>
  );
}

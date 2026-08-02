/* eslint-disable @next/next/no-img-element -- presigned R2 srcs use raw <img> by design (next/image would re-proxy and break the short-lived signature) */

// Onyx closing + footer — the reference's `ClosingSection` and `Footer`, kept
// together the way sienna-footnote is (one closing band, one credit strip).
//
// The closing band washes a photo behind a champagne-to-black radial gradient at
// low opacity: the dedicated closing photo (isClosing) when the couple set one,
// otherwise the cover. The names, thank-you copy and dotted date are bound; the
// reference's brand credit line is dropped (ivory/sienna parity).

import { format, parseISO } from "date-fns";

import type { InvitationView } from "@/server/queries/invitation";

import { OnyxGoldLine } from "./onyx-atoms";
import { ONYX_SAMPLE } from "./onyx-sample";
import { OnyxReveal } from "./onyx-reveal";
import { ONYX, gold, warm } from "./onyx-theme";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

function firstName(fullName: string | undefined, fallback: string): string {
  const n = (fullName ?? "").trim() || fallback;
  return n.split(/\s+/)[0] || fallback;
}

export function OnyxFootnote({ data }: Props) {
  const { pasangan } = data.sections;
  const groom = firstName(pasangan.groom.fullName, data.groomName);
  const bride = firstName(pasangan.bride.fullName, data.brideName);

  const closingVideoUrl = data.sections.hero.closingVideoUrl;
  // Dedicated closing photo → cover photo → the reference's own closing wash.
  const closingUrl =
    (data.photos.find((p) => p.isClosing) ?? data.photos.find((p) => p.isCover))?.url ??
    ONYX_SAMPLE.closing;
  const eventDate = data.sections.acara.events[0]?.date ?? data.eventDate;
  const dotted = eventDate ? format(parseISO(eventDate), "dd · MM · yyyy") : null;
  const longDate = eventDate ? format(parseISO(eventDate), "dd MMMM yyyy") : null;
  const initials = `${groom.charAt(0)} & ${bride.charAt(0)}`;

  return (
    <>
      <section
        style={{
          padding: "clamp(5rem, 12vw, 12rem) clamp(1.5rem, 5vw, 5rem)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {/* The Sampul form's closing slot accepts a photo OR a video, so both
              are honoured here. The reference washed a stock image at 0.14; a
              customer's own closing media is raised to 0.32 so uploading one
              visibly changes the band (still a wash, not a showcase). */}
          {closingVideoUrl ? (
            <video
              src={closingVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.32 }}
            />
          ) : (
            <img
              src={closingUrl}
              alt=""
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.32 }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse 65% 75% at 50% 50%, ${gold(0.06)} 0%, rgba(23,23,23,0.88) 60%)`,
            }}
          />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: "700px", margin: "0 auto" }}>
          <OnyxReveal>
            <OnyxGoldLine vertical />
            <h2
              style={{
                fontFamily: ONYX.font.display,
                fontSize: "clamp(2.5rem, 8vw, 6rem)",
                fontWeight: 300,
                color: ONYX.color.warmWhite,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                margin: "1.5rem 0 2rem",
              }}
            >
              {groom} &amp; {bride}
            </h2>
            <p
              style={{
                fontFamily: ONYX.font.display,
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(0.95rem, 2.5vw, 1.35rem)",
                color: warm(0.5),
                lineHeight: 1.85,
                marginBottom: "3rem",
              }}
            >
              Terima kasih sudah menjadi bagian dari cerita kami. Kehadiran, doa, dan restumu
              berarti sangat besar buat kami berdua.
            </p>
            {dotted && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1.5rem",
                }}
              >
                <div
                  style={{ height: "1px", flex: 1, maxWidth: "70px", background: gold(0.28) }}
                />
                <p
                  style={{
                    fontFamily: ONYX.font.display,
                    fontStyle: "italic",
                    fontSize: "0.95rem",
                    color: ONYX.color.champagne,
                    fontWeight: 300,
                    margin: 0,
                  }}
                >
                  {dotted}
                </p>
                <div
                  style={{ height: "1px", flex: 1, maxWidth: "70px", background: gold(0.28) }}
                />
              </div>
            )}
          </OnyxReveal>
        </div>
      </section>

      <footer
        style={{
          position: "relative",
          backgroundColor: "rgba(13,13,13,0.92)",
          padding: "clamp(2rem, 4vw, 3rem) clamp(1.5rem, 5vw, 5rem)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <p
          style={{
            fontFamily: ONYX.font.display,
            fontSize: "1.15rem",
            fontWeight: 300,
            color: warm(0.55),
            letterSpacing: "0.1em",
            margin: 0,
          }}
        >
          {initials}
        </p>
        {(longDate || data.city) && (
          <p
            style={{
              fontFamily: ONYX.font.body,
              fontSize: "0.58rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: warm(0.2),
              margin: 0,
              textAlign: "center",
            }}
          >
            {[longDate, data.city].filter(Boolean).join(" · ")}
          </p>
        )}
        <p
          style={{
            fontFamily: ONYX.font.body,
            fontSize: "0.58rem",
            color: warm(0.12),
            marginTop: "0.4rem",
            textAlign: "center",
          }}
        >
          The Wedding of {groom} &amp; {bride}
        </p>
      </footer>
    </>
  );
}

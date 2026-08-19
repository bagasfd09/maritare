// Onyx love story — the reference's `LoveStorySection`: a tinted charcoal band
// with an ambient champagne spotlight, and the chapters laid out as a vertical
// timeline (hairline rail, gold dots, a gutter marker beside each entry).
//
// The reference's gutter held a hard-coded year. maritare's story chapters carry
// no year field (adding one is a schema change), so the gutter renders the
// chapter NUMBER instead — it keeps the design's rhythm and always has a value.
// A chapter photo, when the couple attached one, renders as a slim framed strip
// under the caption so uploaded content is never silently dropped.

import type { InvitationView } from "@/server/queries/invitation";

import { parseStoryChapters } from "../folk/folk-story-parse";
import { InvImage } from "../scarlet/inv-image";
import { OnyxGoldLine, OnyxLabel, SECTION_PAD } from "./onyx-atoms";
import { OnyxReveal } from "./onyx-reveal";
import { ONYX, RADIUS, gold, warm } from "./onyx-theme";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

type Chapter = { photoUrl?: string; title?: string; body: string };

export function OnyxStory({ data }: Props) {
  const cerita = data.sections.cerita;
  const byId = new Map(data.photos.map((p) => [p.id, p]));

  // Structured chapters first; fall back to parsing the legacy free-text body.
  const chapters: Chapter[] = cerita.items?.length
    ? cerita.items.map((it) => ({
        photoUrl: it.photoId ? byId.get(it.photoId)?.url : undefined,
        title: it.title,
        body: it.body ?? "",
      }))
    : parseStoryChapters(cerita.body ?? "").map((c) => ({ title: c.title, body: c.body }));

  const visible = chapters.filter((c) => c.title?.trim() || c.body.trim() || c.photoUrl);
  if (visible.length === 0) {
    return null;
  }

  const heading = cerita.title?.trim() || "How It All Began";

  return (
    <section
      id="onyx-story"
      style={{
        backgroundColor: "rgba(23,23,23,0.72)",
        padding: SECTION_PAD,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          transform: "translate(-50%,-50%)",
          width: "min(900px, calc(90 * var(--onyx-vw)))",
          height: "min(900px, calc(90 * var(--onyx-vw)))",
          background: `radial-gradient(circle, ${gold(0.04)} 0%, transparent 65%)`,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "860px", margin: "0 auto", position: "relative" }}>
        <OnyxReveal style={{ textAlign: "center", marginBottom: "clamp(3.5rem, calc(7 * var(--onyx-vw)), 5.5rem)" }}>
          <OnyxLabel>Our Story</OnyxLabel>
          <OnyxGoldLine vertical />
          <h2
            style={{
              fontFamily: ONYX.font.display,
              fontSize: "clamp(2rem, calc(5 * var(--onyx-vw)), 3.5rem)",
              fontWeight: 300,
              color: ONYX.color.warmWhite,
              letterSpacing: "-0.01em",
              margin: "1.5rem 0 0",
            }}
          >
            {heading}
          </h2>
        </OnyxReveal>

        <div style={{ position: "relative", paddingLeft: "clamp(1.5rem, calc(4 * var(--onyx-vw)), 2.5rem)" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "6px",
              bottom: "6px",
              width: "1px",
              background: `linear-gradient(to bottom, transparent, ${gold(0.28)} 8%, ${gold(0.28)} 92%, transparent)`,
            }}
          />

          {visible.map((item, i) => (
            <OnyxReveal
              key={i}
              delay={i * 80}
              style={{ position: "relative", marginBottom: "clamp(2.5rem, calc(5 * var(--onyx-vw)), 4rem)" }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "calc(-1 * clamp(1.5rem, calc(4 * var(--onyx-vw)), 2.5rem) - 3.5px)",
                  top: "5px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: ONYX.color.champagne,
                  border: `2px solid ${ONYX.color.charcoal}`,
                  outline: `1px solid ${gold(0.3)}`,
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontFamily: ONYX.font.display,
                    fontStyle: "italic",
                    fontSize: "0.9rem",
                    color: ONYX.color.champagne,
                    fontWeight: 300,
                    flexShrink: 0,
                    minWidth: "36px",
                    paddingTop: "2px",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  {item.title?.trim() && (
                    <h3
                      style={{
                        fontFamily: ONYX.font.display,
                        fontSize: "clamp(1.3rem, calc(3 * var(--onyx-vw)), 1.9rem)",
                        fontWeight: 400,
                        color: ONYX.color.warmWhite,
                        marginBottom: "0.6rem",
                        letterSpacing: "-0.01em",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.title}
                    </h3>
                  )}
                  {item.body.trim() && (
                    <p
                      style={{
                        fontFamily: ONYX.font.body,
                        fontSize: "clamp(0.84rem, calc(1.8 * var(--onyx-vw)), 0.94rem)",
                        lineHeight: 1.85,
                        color: warm(0.5),
                        fontWeight: 300,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.body}
                    </p>
                  )}
                  {item.photoUrl && (
                    <div
                      className="onyx-zoom"
                      style={{
                        marginTop: "1.25rem",
                        overflow: "hidden",
                        borderRadius: RADIUS,
                        border: `1px solid ${gold(0.18)}`,
                        backgroundColor: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <InvImage
                        src={item.photoUrl}
                        alt={item.title?.trim() || `${data.groomName} & ${data.brideName}`}
                        // Explicit ratio: a lazy image with no reserved box
                        // collapses inside a reveal wrapper on iOS Safari.
                        className="block aspect-[16/10] w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </OnyxReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

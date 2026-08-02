"use client";

// Onyx gallery — the reference's `GallerySection`: a CSS-columns masonry with a
// full-screen lightbox (click to open, Esc or backdrop click to close).
//
// The reference hard-coded an aspect ratio per photo to build the masonry
// rhythm. Real invitations upload arbitrary photos, so the ratio cycles through
// the reference's own pattern by index — deterministic (identical on server and
// client, so it hydrates cleanly) and, unlike leaving the ratio unset, it
// reserves a box so lazy images can't collapse the section on iOS Safari.
//
// Photos are the OWNER-CURATED selection, in the owner's order (mirrors
// sienna-/ivory-gallery): walk selectedPhotoIds, resolve each, skip
// cover/closing and any stale id. Empty selection → the section self-hides.

import { useEffect, useState } from "react";

import type { InvitationPhoto, InvitationView } from "@/server/queries/invitation";

import { InvImage } from "../scarlet/inv-image";
import { OnyxLabel } from "./onyx-atoms";
import { ONYX_SAMPLE_GALLERY } from "./onyx-sample";
import { OnyxReveal } from "./onyx-reveal";
import { ONYX, warm } from "./onyx-theme";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

/** A gallery cell — either a curated upload or a built-in sample image. */
type Cell = { key: string; full: string; thumb: string; label: string };

// The reference's masonry rhythm, cycled by index (indexed to match the order
// of ONYX_SAMPLE_GALLERY, which is the reference's own sequence).
const ASPECTS = ["3/4", "4/3", "3/4", "1/1", "4/3", "3/4", "4/3", "3/4"] as const;

export function OnyxGallery({ data }: Props) {
  const [lightbox, setLightbox] = useState<Cell | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const byId = new Map(data.photos.map((p) => [p.id, p]));
  const curated = data.sections.galeri.selectedPhotoIds
    .map((id) => byId.get(id))
    .filter((p): p is InvitationPhoto => !!p && !p.isCover && !p.isClosing);

  // Curated photos win outright; with none picked yet the reference's own eight
  // photos stand in, so the section is never an empty hole. Both shapes are
  // normalized to one list so the markup below doesn't branch.
  const photos: Cell[] =
    curated.length > 0
      ? curated.map((p) => ({
          key: p.id,
          full: p.url,
          thumb: p.thumbUrl,
          label: p.label ?? "",
        }))
      : ONYX_SAMPLE_GALLERY.map((s) => ({
          key: s.id,
          full: s.url,
          thumb: s.url,
          label: s.alt,
        }));

  return (
    <section
      id="onyx-gallery"
      style={{ padding: "clamp(5rem, 10vw, 10rem) clamp(1rem, 3vw, 3rem)" }}
    >
      <OnyxReveal
        style={{ textAlign: "center", marginBottom: "clamp(3rem, 6vw, 5rem)", padding: "0 1rem" }}
      >
        <OnyxLabel>Gallery</OnyxLabel>
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
          Moments in Light
        </h2>
      </OnyxReveal>

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          columns: "clamp(180px, 28vw, 340px)",
          columnGap: "clamp(0.5rem, 1.2vw, 1.2rem)",
        }}
      >
        {photos.map((photo, i) => (
          <OnyxReveal
            key={photo.key}
            delay={i * 50}
            style={{
              breakInside: "avoid",
              marginBottom: "clamp(0.5rem, 1.2vw, 1.2rem)",
              display: "block",
            }}
          >
            <button
              type="button"
              onClick={() => setLightbox(photo)}
              aria-label={photo.label || "Buka foto"}
              className="onyx-zoom onyx-zoom-lg"
              style={{
                display: "block",
                width: "100%",
                padding: 0,
                border: "none",
                overflow: "hidden",
                cursor: "pointer",
                background: "rgba(255,255,255,0.04)",
                aspectRatio: ASPECTS[i % ASPECTS.length],
              }}
            >
              <InvImage
                src={photo.thumb}
                alt={photo.label}
                className="block h-full w-full object-cover"
              />
            </button>
          </OnyxReveal>
        ))}
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            backgroundColor: "rgba(23,23,23,0.97)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(1rem, 4vw, 3rem)",
            animation: "onyxFadeUp 0.25s ease",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 src; next/image would re-proxy and break the signature */}
          <img
            src={lightbox.full}
            alt={lightbox.label}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "100%", maxHeight: "90svh", objectFit: "contain" }}
          />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Tutup"
            style={{
              position: "absolute",
              top: "1.25rem",
              right: "1.25rem",
              background: "none",
              border: `1px solid ${warm(0.2)}`,
              color: ONYX.color.warmWhite,
              fontSize: "0.85rem",
              cursor: "pointer",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              opacity: 0.7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
          {lightbox.label && (
            <p
              style={{
                position: "absolute",
                bottom: "1.5rem",
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: ONYX.font.body,
                fontSize: "0.58rem",
                letterSpacing: "0.28em",
                color: warm(0.35),
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {lightbox.label}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

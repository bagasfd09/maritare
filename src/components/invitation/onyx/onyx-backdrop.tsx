/* eslint-disable @next/next/no-img-element -- presigned R2 srcs use raw <img> by design (next/image would re-proxy and break the short-lived signature) */

// Onyx backdrop — the template's defining element: a FIXED, full-viewport piece
// of media under a heavy black scrim, which every section then scrolls over.
// This is what makes the whole invitation read as one continuous cinematic
// frame instead of a stack of cards.
//
// Source, in order of preference:
//   1. hero.videoUrl   — an uploaded background video,
//   2. hero.imageUrl   — an uploaded hero still,
//   3. the isCover photo,
//   4. the reference's own trailer (ONYX_SAMPLE.video) — so a draft that has
//      uploaded nothing still looks exactly like the sample design.
//
// NOTE on stacking: the reference relied on painting order (a fixed backdrop
// over static sections) and its section background colors never showed as a
// result. Here the layering is explicit — backdrop at z-index 0, content at
// z-index 1 in onyx-embed — so the same all-dark result is deterministic
// instead of accidental.

import type { InvitationView } from "@/server/queries/invitation";

import { ONYX_SAMPLE } from "./onyx-sample";

type Props = { data: InvitationView };

export function OnyxBackdrop({ data }: Props) {
  const { hero } = data.sections;
  const uploadedImage = hero.imageUrl ?? data.photos.find((p) => p.isCover)?.url;
  // The sample trailer only steps in when the couple supplied no backdrop of
  // their own — an uploaded still still beats it.
  const videoUrl = hero.videoUrl ?? (uploadedImage ? undefined : ONYX_SAMPLE.video);
  const imageUrl = uploadedImage;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        backgroundColor: "#0D0D0D",
        pointerEvents: "none",
      }}
    >
      {videoUrl ? (
        <video
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : imageUrl ? (
        // Structural (not decorative) — eager + an explicit box so it can never
        // collapse the way a lazy image in a hidden wrapper does on iOS.
        <img
          src={imageUrl}
          alt=""
          loading="eager"
          decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : null}

      {/* The scrim: the reference's rgba(0,0,0,0.85) over the media, which is
          what turns any photo into the template's near-black canvas. */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)" }} />
    </div>
  );
}

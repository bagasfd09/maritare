import { ImageResponse } from "next/og";

// Branded link-preview card for the marketing site (maritare.id). Scoped to the
// (marketing) route group ONLY — customer invitation pages live under app/inv/*
// and set their own openGraph.images in generateMetadata, so this never
// overrides an invitation's own preview image.
export const alt = "Maritare — Undangan website & buku tamu digital";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The Maritare flower mark, rendered as an SVG data URI (Satori rasterizes the
// SVG natively, so the petal rotations render correctly).
const PETAL = "M 0 -36 C 14 -36 18 -14 0 -2 C -18 -14 -14 -36 0 -36 Z";
const FLOWER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100">${[0, 72, 144, 216, 288]
  .map((d) => `<path d="${PETAL}" fill="#B66B4D" transform="rotate(${d})"/>`)
  .join("")}<circle r="9" fill="#7C2D2D"/><circle r="2" cy="-3" fill="#EAD3C2"/></svg>`;
const FLOWER_URI = `data:image/svg+xml;base64,${Buffer.from(FLOWER).toString("base64")}`;

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(1100px 700px at 85% 12%, rgba(182,107,77,0.18), transparent 60%), #F5EFE6",
          padding: "76px 84px",
          color: "#1A1A1A",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: "sans-serif",
            fontSize: 24,
            letterSpacing: 5,
            color: "#5C5852",
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: 999, background: "#B66B4D" }} />
          <span>UNDANGAN WEBSITE · BUKU TAMU DIGITAL</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <span style={{ fontSize: 148, fontWeight: 700, letterSpacing: -5, lineHeight: 1 }}>
              maritare
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FLOWER_URI} width={64} height={64} alt="" />
          </div>
          <span style={{ fontSize: 44, color: "#7C2D2D", marginTop: 22, maxWidth: 880, lineHeight: 1.25 }}>
            Pernikahanmu adalah karya yang layak diceritakan.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "sans-serif",
            fontSize: 26,
            color: "#5C5852",
          }}
        >
          <span style={{ fontWeight: 600, color: "#1A1A1A" }}>maritare.id</span>
          <span>Bikin undangan pertama dalam 5 menit</span>
        </div>
      </div>
    ),
    size,
  );
}

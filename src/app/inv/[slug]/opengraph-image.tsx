import { ImageResponse } from "next/og";
import sharp from "sharp";

import { getInvitationBySlug } from "@/server/queries/invitation";

// Dynamic per wedding (uncached DB read + presigned source) — never prerender.
export const dynamic = "force-dynamic";
// Node runtime: sharp is a native module and can't run on the edge. We need it
// because uploaded photos are stored as WebP (see lib/upload.ts), which next/og's
// Satori renderer can't embed in an <img>. sharp transcodes WebP→JPEG and crops
// the portrait source to a 1200×630 landscape card so WhatsApp/social render the
// LARGE link preview instead of a tiny side-thumbnail.
export const runtime = "nodejs";

export const alt = "Undangan Pernikahan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lookup = await getInvitationBySlug(slug);
  const data = lookup.kind === "notFound" ? null : lookup.data;

  // Crop the cover/share photo into the landscape card. sharp handles any source
  // format (WebP/JPEG/PNG); "attention" gravity keeps faces in frame.
  if (data?.ogImageUrl) {
    try {
      const res = await fetch(data.ogImageUrl, { cache: "no-store" });
      if (res.ok) {
        const input = Buffer.from(await res.arrayBuffer());
        const jpeg = await sharp(input)
          .rotate() // honor EXIF orientation before cropping
          .resize(size.width, size.height, { fit: "cover", position: "attention" })
          .jpeg({ quality: 82 })
          .toBuffer();
        return new Response(new Uint8Array(jpeg), {
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      }
    } catch {
      // fetch/transcode failed — fall through to the branded text card.
    }
  }

  // Fallback (no cover photo, or the source failed): a simple branded card so the
  // link still previews as a large card. ImageResponse uses a bundled font, so it
  // renders reliably without a system font. (PNG here; the og:image:type hint
  // stays jpeg — harmless, the real Content-Type header is correct.)
  // ponytail: cosmetic type mismatch on the rare fallback; not worth a re-encode.
  const names = data ? `${data.groomName} & ${data.brideName}` : "Undangan Pernikahan";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(900px 600px at 80% 15%, rgba(182,107,77,0.18), transparent 60%), #F5EFE6",
          color: "#7C2D2D",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 38, letterSpacing: 8, color: "#5C5852", marginBottom: 28 }}>
          THE WEDDING OF
        </div>
        <div
          style={{
            fontSize: 104,
            fontWeight: 700,
            textAlign: "center",
            padding: "0 80px",
            lineHeight: 1.1,
          }}
        >
          {names}
        </div>
      </div>
    ),
    size,
  );
}

// POST /api/uploads/sign — presigned-PUT signing for gallery photo uploads.
//
// Route Handlers are the AGENTS.md-sanctioned home for presigned-URL signing
// (webhooks + presigned URLs live in route handlers; form mutations live in
// Server Actions). The browser PUTs file bytes directly to R2 using the URL we
// return here — we never proxy bytes through the server.
//
// Hard rules honored:
// - Ownership is derived from the session (resolveEditorUserId), never trusted
//   from the client.
// - All external input is validated with Zod at the boundary.
// - R2 secret signing happens server-side only (see src/lib/r2).
// - User-facing errors are Bahasa Indonesia; internals are logged in English
//   and never leaked to the client.

import { type NextRequest } from "next/server";
import { and, count, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { packages, photos, weddings } from "@/lib/db/schema";
import { getUploadUrl } from "@/lib/r2";
import { resolveMemberWeddingId } from "@/server/queries/wedding";

// Allowed content types → file extension used in the object key, per kind.
const IMAGE_TYPE_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};
const AUDIO_TYPE_EXT: Record<string, string> = {
  "audio/mpeg": ".mp3",
  "audio/mp4": ".m4a",
  "audio/x-m4a": ".m4a",
  "audio/aac": ".aac",
  "audio/ogg": ".ogg",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/webm": ".weba",
};
const VIDEO_TYPE_EXT: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

const MAX_IMAGE_BYTES = 10_000_000; // 10 MB.
const MAX_AUDIO_BYTES = 15_000_000; // 15 MB — a long MP3 at high bitrate.
const MAX_VIDEO_BYTES = 50_000_000; // 50 MB — a short looping cover clip.

const signRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string().min(1).max(100),
  size: z.number().int().positive(),
  // "photo" (gallery, quota-checked); "audio" (background music), "video",
  // "hero-image" (folk hero cover), "share-image" (link-preview/OG image), and
  // "momen-image" (folk Momen illustration) are single section assets — no quota.
  kind: z
    .enum(["photo", "audio", "video", "hero-image", "share-image", "momen-image"])
    .default("photo"),
});

type SignResponse =
  | { ok: true; uploadUrl: string; objectKey: string }
  | { ok: false; error: string };

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // 1. Parse + validate the JSON body at the boundary.
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "Permintaan tidak valid." }, 400);
    }

    const parsed = signRequestSchema.safeParse(body);
    if (!parsed.success) {
      return json(
        { ok: false, error: "Data upload tidak valid. Periksa lagi filenya." },
        400,
      );
    }
    const { contentType, size, kind } = parsed.data;

    // 1b. Validate the content type + size against the rules for this kind.
    const extMap =
      kind === "audio" ? AUDIO_TYPE_EXT : kind === "video" ? VIDEO_TYPE_EXT : IMAGE_TYPE_EXT;
    const ext = extMap[contentType];
    if (!ext) {
      return json(
        {
          ok: false,
          error:
            kind === "audio"
              ? "Format audio tidak didukung. Pakai MP3, M4A, OGG, atau WAV ya."
              : kind === "video"
                ? "Format video tidak didukung. Pakai MP4, WebM, atau MOV ya."
                : "Format gambar tidak didukung.",
        },
        400,
      );
    }
    const maxBytes =
      kind === "audio" ? MAX_AUDIO_BYTES : kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (size > maxBytes) {
      return json(
        { ok: false, error: `File kegedean (maks ${Math.round(maxBytes / 1_000_000)} MB).` },
        400,
      );
    }

    // 2. Derive ownership from the session — never trust a client wedding id.
    const memberWeddingId = await resolveMemberWeddingId();
    if (!memberWeddingId) {
      return json(
        { ok: false, error: "Kamu harus masuk dulu untuk mengunggah." },
        401,
      );
    }

    // 3. Resolve the member's wedding together with its package photo limit.
    const wedding = await db
      .select({
        weddingId: weddings.id,
        photoLimit: packages.photoLimit,
      })
      .from(weddings)
      .leftJoin(packages, eq(weddings.packageId, packages.id))
      .where(and(eq(weddings.id, memberWeddingId), isNull(weddings.deletedAt)))
      .limit(1)
      .then((rows) => rows[0]);

    if (!wedding) {
      return json({ ok: false, error: "Undangan tidak ditemukan." }, 404);
    }

    // 4. Enforce the package photo quota for gallery photos (null = unlimited).
    //    Audio (a single background track) is not quota-limited.
    if (kind === "photo" && wedding.photoLimit !== null) {
      const [{ used }] = await db
        .select({ used: count() })
        .from(photos)
        .where(
          and(
            eq(photos.weddingId, wedding.weddingId),
            isNull(photos.deletedAt),
          ),
        );

      if (used >= wedding.photoLimit) {
        return json(
          { ok: false, error: "Kuota foto paketmu sudah penuh." },
          403,
        );
      }
    }

    // 5. Build a collision-free object key under this wedding's namespace. The
    //    hero image lives in its own "hero" folder so it never reads as a gallery
    //    photo (and skips the quota above, like audio/video).
    const folder =
      kind === "audio"
        ? "audio"
        : kind === "video"
          ? "videos"
          : kind === "hero-image"
            ? "hero"
            : kind === "share-image"
              ? "share"
              : kind === "momen-image"
                ? "momen"
                : "photos";
    const objectKey = `weddings/${wedding.weddingId}/${folder}/${crypto.randomUUID()}${ext}`;

    // 6. Sign a short-lived PUT URL (Content-Type + Content-Length signed).
    const uploadUrl = await getUploadUrl({
      key: objectKey,
      contentType,
      contentLength: size,
    });

    return json({ ok: true, uploadUrl, objectKey }, 200);
  } catch (error) {
    // Never leak internals; log server-side in English.
    console.error("POST /api/uploads/sign failed", error);
    return json(
      { ok: false, error: "Gagal menyiapkan upload. Coba lagi." },
      500,
    );
  }
}

function json(payload: SignResponse, status: number): Response {
  return Response.json(payload, { status });
}

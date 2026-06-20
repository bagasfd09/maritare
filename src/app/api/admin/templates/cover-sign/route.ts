// POST /api/admin/templates/cover-sign — presigned-PUT signing for a template
// cover image. Admin-only. The browser PUTs bytes straight to R2 (we never proxy
// file bytes); the returned objectKey is then stored via setTemplateCover.
//
// Hard rules: admin-gated via the session role (never a client claim); input
// validated with Zod; R2 signing is server-side only; Bahasa errors, English logs.

import { type NextRequest } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { getUploadUrl } from "@/lib/r2";

const CONTENT_TYPE_EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
} as const;

const MAX_COVER_BYTES = 5_000_000; // 5 MB.

const signSchema = z.object({
  templateId: z.uuid(),
  contentType: z.enum(Object.keys(CONTENT_TYPE_EXT) as [keyof typeof CONTENT_TYPE_EXT]),
  size: z.number().int().positive().max(MAX_COVER_BYTES),
});

type SignResponse =
  | { ok: true; uploadUrl: string; objectKey: string }
  | { ok: false; error: string };

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return json({ ok: false, error: "Akses ditolak." }, 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "Permintaan tidak valid." }, 400);
    }

    const parsed = signSchema.safeParse(body);
    if (!parsed.success) {
      return json(
        { ok: false, error: "Data upload tidak valid. Periksa lagi filenya." },
        400,
      );
    }
    const { templateId, contentType, size } = parsed.data;

    // The template must exist (and not be deleted) before we accept a cover.
    const tpl = await db.query.templates.findFirst({
      columns: { id: true },
      where: and(eq(templates.id, templateId), isNull(templates.deletedAt)),
    });
    if (!tpl) {
      return json({ ok: false, error: "Template tidak ditemukan." }, 404);
    }

    const ext = CONTENT_TYPE_EXT[contentType];
    const objectKey = `templates/${templateId}/cover-${crypto.randomUUID()}${ext}`;
    const uploadUrl = await getUploadUrl({ key: objectKey, contentType, contentLength: size });

    return json({ ok: true, uploadUrl, objectKey }, 200);
  } catch (error) {
    console.error("POST /api/admin/templates/cover-sign failed", error);
    return json({ ok: false, error: "Gagal menyiapkan upload. Coba lagi." }, 500);
  }
}

function json(payload: SignResponse, status: number): Response {
  return Response.json(payload, { status });
}

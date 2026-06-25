// GET /api/guests/export — download the current wedding's guest list as CSV.
//
// Route Handler (not a Server Action) because this streams a file download
// directly to the browser. Ownership is derived from the session; we only ever
// export the resolved wedding's own, non-deleted guests.
//
// Hard rules honored:
// - Ownership is derived from the session (resolveEditorUserId), never trusted
//   from the client (no client-supplied wedding id is accepted).
// - User-facing errors are Bahasa Indonesia (informal); internals are logged in
//   English server-side and never leaked to the client.

import { and, asc, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { guests, weddings } from "@/lib/db/schema";
import { toCsv } from "@/lib/csv";
import { GUEST_CSV_HEADERS, guestToCsvCells } from "@/lib/guests-csv";
import { resolveMemberWeddingId } from "@/server/queries/wedding";

type ExportErrorResponse = { ok: false; error: string };

export async function GET(): Promise<Response> {
  try {
    // 1. Derive ownership from the session — never trust a client wedding id.
    const memberWeddingId = await resolveMemberWeddingId();
    if (!memberWeddingId) {
      return json({ ok: false, error: "Kamu harus masuk dulu." }, 401);
    }

    // 2. Resolve the member's non-deleted wedding (same pattern as sign).
    const wedding = await db
      .select({ weddingId: weddings.id })
      .from(weddings)
      .where(and(eq(weddings.id, memberWeddingId), isNull(weddings.deletedAt)))
      .limit(1)
      .then((rows) => rows[0]);

    if (!wedding) {
      return json({ ok: false, error: "Undangan tidak ditemukan." }, 404);
    }

    // 3. Load this wedding's non-deleted guests, oldest first.
    const rows = await db
      .select({
        name: guests.name,
        phone: guests.phone,
        group: guests.group,
        side: guests.side,
        partySize: guests.partySize,
        foodChoice: guests.foodChoice,
        note: guests.note,
      })
      .from(guests)
      .where(
        and(eq(guests.weddingId, wedding.weddingId), isNull(guests.deletedAt)),
      )
      .orderBy(asc(guests.createdAt));

    // 4. Build the CSV with a UTF-8 BOM so Excel reads it as UTF-8.
    const csv =
      "﻿" +
      toCsv([[...GUEST_CSV_HEADERS], ...rows.map(guestToCsvCells)]);

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="tamu-export.csv"',
      },
    });
  } catch (error) {
    // Never leak internals; log server-side in English.
    console.error("GET /api/guests/export failed", error);
    return json({ ok: false, error: "Gagal mengekspor. Coba lagi." }, 500);
  }
}

function json(payload: ExportErrorResponse, status: number): Response {
  return Response.json(payload, { status });
}

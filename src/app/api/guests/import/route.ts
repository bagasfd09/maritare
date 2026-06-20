// POST /api/guests/import — bulk-import guests from an uploaded CSV file.
//
// Route Handlers are the AGENTS.md-sanctioned home for file-bytes intake that
// is not a presigned R2 upload (this CSV is small, parsed server-side, and
// never persisted to object storage). The browser POSTs a multipart form with
// a single `file` field; we parse, validate every row, batch-insert the valid
// ones, and — when some rows fail — return a ZIP containing an error log plus a
// CSV of only the failed rows so the customer can fix and re-upload.
//
// Hard rules honored:
// - Ownership is derived from the session (resolveEditorUserId), never trusted
//   from the client (no client-supplied wedding id is accepted).
// - All external input is validated at the boundary (file shape/size + per-row
//   validation via parseGuestImportRow which uses Zod).
// - User-facing errors are Bahasa Indonesia (informal); internals are logged in
//   English server-side and never leaked to the client.

import { type NextRequest } from "next/server";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { weddings } from "@/lib/db/schema";
import { insertGuestsWithCode } from "@/lib/guest-code";
import { parseCsv, toCsv } from "@/lib/csv";
import { createZip } from "@/lib/zip";
import {
  GUEST_CSV_HEADERS,
  parseGuestImportRow,
  type GuestImportData,
} from "@/lib/guests-csv";
import { resolveEditorUserId } from "@/server/queries/wedding";

const MAX_IMPORT_BYTES = 2_000_000; // 2 MB.
const MAX_DATA_ROWS = 1000;

type ImportErrorResponse = { ok: false; error: string };
type ImportSuccessResponse = { ok: true; inserted: number };

/** A row that failed validation, paired with its original cells (rectangular). */
interface ImportFailure {
  cells: string[];
  message: string;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // 1. Derive ownership from the session — never trust a client wedding id.
    const userId = await resolveEditorUserId();
    if (!userId) {
      return json({ ok: false, error: "Kamu harus masuk dulu." }, 401);
    }

    // 2. Resolve the user's first non-deleted wedding (same pattern as sign).
    const wedding = await db
      .select({ weddingId: weddings.id })
      .from(weddings)
      .where(and(eq(weddings.userId, userId), isNull(weddings.deletedAt)))
      .orderBy(weddings.createdAt)
      .limit(1)
      .then((rows) => rows[0]);

    if (!wedding) {
      return json({ ok: false, error: "Undangan tidak ditemukan." }, 404);
    }
    const weddingId = wedding.weddingId;

    // 3. Read + validate the uploaded file at the boundary.
    const form = await request.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > MAX_IMPORT_BYTES
    ) {
      return json(
        { ok: false, error: "File tidak valid atau terlalu besar (maks 2MB)." },
        400,
      );
    }

    // 4. Parse the CSV text into rows.
    const text = await file.text();
    const rows = parseCsv(text);

    // 5. Require a header row whose first cell is "nama" (trimmed,
    //    case-insensitive) and at least one data row after it.
    const header = rows[0];
    const hasHeader =
      header !== undefined &&
      (header[0] ?? "").trim().toLowerCase() === "nama";
    if (!hasHeader || rows.length < 2) {
      return json(
        {
          ok: false,
          error:
            "File kosong atau format kolom tidak sesuai. Unduh template dulu.",
        },
        400,
      );
    }
    const dataRows = rows.slice(1);

    // 6. Cap the number of data rows per import.
    if (dataRows.length > MAX_DATA_ROWS) {
      return json(
        { ok: false, error: "Maksimal 1000 baris per impor." },
        400,
      );
    }

    // 7. Validate every data row, preserving original order.
    const valid: GuestImportData[] = [];
    const failures: ImportFailure[] = [];
    for (const cells of dataRows) {
      const result = parseGuestImportRow(cells);
      if (result.ok) {
        valid.push(result.value);
      } else {
        // Normalize the failed row to GUEST_CSV_HEADERS width so the failure
        // CSV stays rectangular (pad short rows, trim overlong ones).
        failures.push({
          cells: normalizeCells(cells),
          message: result.message,
        });
      }
    }

    // 8. Insert all valid rows in ONE batch. status/invitationStatus use schema
    //    defaults — do not set them here.
    try {
      if (valid.length > 0) {
        await insertGuestsWithCode(
          valid.map((v) => ({
            weddingId,
            name: v.name,
            phone: v.phone,
            group: v.group,
            side: v.side,
            partySize: v.partySize,
            foodChoice: v.foodChoice,
            note: v.note,
          })),
        );
      }
    } catch (error) {
      console.error("POST /api/guests/import insert failed", error);
      return json({ ok: false, error: "Gagal menyimpan. Coba lagi." }, 500);
    }

    // 9a. All rows valid → simple JSON success.
    if (failures.length === 0) {
      return json({ ok: true, inserted: valid.length }, 200);
    }

    // 9b. Some rows failed → return a ZIP with an error log + a CSV of only the
    //     failed rows (header + each failed row's original, rectangular cells).
    //     The log's [1], [2], … line up with the data rows in the failure CSV.
    const failureCsv = toCsv([
      [...GUEST_CSV_HEADERS],
      ...failures.map((f) => f.cells),
    ]);
    const errorLog = failures
      .map((f, i) => "[" + (i + 1) + "] " + f.message)
      .join("\r\n");
    const failureFileName = safeCsvBasename(file.name);
    const zip = createZip([
      { name: "history_error_log.txt", content: errorLog },
      { name: failureFileName, content: failureCsv },
    ]);

    // Wrap the bytes in a Blob — a Uint8Array isn't a BodyInit under the DOM lib
    // types, but a Blob is, and it carries the content type cleanly.
    return new Response(new Blob([zip], { type: "application/zip" }), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="import-error.zip"',
        "X-Import-Inserted": String(valid.length),
        "X-Import-Failed": String(failures.length),
      },
    });
  } catch (error) {
    // Never leak internals; log server-side in English.
    console.error("POST /api/guests/import failed", error);
    return json({ ok: false, error: "Gagal mengimpor. Coba lagi." }, 500);
  }
}

/** Pad/trim a row to exactly GUEST_CSV_HEADERS.length cells (rectangular CSV). */
function normalizeCells(cells: string[]): string[] {
  const width = GUEST_CSV_HEADERS.length;
  const out = cells.slice(0, width);
  while (out.length < width) {
    out.push("");
  }
  return out;
}

/**
 * Reduce an uploaded filename to a safe `.csv` basename: strip any directory
 * components, drop characters outside a conservative allowlist, and guarantee a
 * `.csv` extension. Falls back to "tamu.csv" when nothing usable remains.
 */
function safeCsvBasename(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "";
  const withoutExt = base.replace(/\.[^.]*$/, "");
  const cleaned = withoutExt.replace(/[^A-Za-z0-9._-]/g, "_").replace(/^\.+/, "");
  if (cleaned.length === 0) {
    return "tamu.csv";
  }
  return cleaned + ".csv";
}

function json(
  payload: ImportErrorResponse | ImportSuccessResponse,
  status: number,
): Response {
  return Response.json(payload, { status });
}

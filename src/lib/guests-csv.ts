// Shared guest CSV column spec + per-row import validator + export/template
// helpers. Used by BOTH server code (import/export endpoints) and client
// components (template download, client-side preview), so this file imports
// ONLY `zod` and `toCsv` — no DB/schema/Node-only imports.
//
// User-facing strings are in Bahasa Indonesia (informal). Validation messages
// returned by `parseGuestImportRow` already start with "Data Tidak Masuk Karena ".

import { z } from "zod";
import { toCsv } from "@/lib/csv";

// Column order used by both import and export. Header row of the CSV.
export const GUEST_CSV_HEADERS = [
  "Nama",
  "Nomor",
  "Grup",
  "Sisi",
  "Jumlah",
  "Makanan",
  "Catatan",
] as const;

export type GuestSide = "groom" | "bride" | "both";

export type GuestImportData = {
  name: string;
  phone: string | null;
  group: string | null;
  side: string; // canonical GuestSide or a custom value; default "both"
  partySize: number | null;
  foodChoice: string | null;
  note: string | null;
};

// Display labels for the canonical sides (used by export cells; custom sides
// export as-is).
export const SIDE_LABELS: Record<GuestSide, string> = {
  groom: "Pria",
  bride: "Wanita",
  both: "Bersama",
};

/** Bahasa label for a side value — canonical trio mapped, custom passed through. */
export function sideDisplayLabel(side: string): string {
  return SIDE_LABELS[side as GuestSide] ?? side;
}

/** Distinct non-canonical side values, in first-seen order. */
export function customSides(sides: Iterable<string>): string[] {
  const seen = new Set<string>(["groom", "bride", "both"]);
  const out: string[] = [];
  for (const s of sides) {
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Template: header row + one example data row, as CSV text.
// ---------------------------------------------------------------------------

const GUEST_CSV_EXAMPLE_ROW = [
  "Budi Santoso",
  "+62 812-3456-7890",
  "Keluarga",
  "Pria",
  "2",
  "Reguler",
  "Teman ayah",
];

export const GUEST_CSV_TEMPLATE: string = toCsv([
  [...GUEST_CSV_HEADERS],
  GUEST_CSV_EXAMPLE_ROW,
]);

// ---------------------------------------------------------------------------
// Export: map a guest record to display cells in GUEST_CSV_HEADERS order.
// ---------------------------------------------------------------------------

/**
 * Convert a guest record into CSV cells (header order), mapping the `side` enum
 * to its Bahasa label and nulls to empty strings.
 */
export function guestToCsvCells(g: {
  name: string;
  phone: string | null;
  group: string | null;
  side: string;
  partySize: number | null;
  foodChoice: string | null;
  note: string | null;
}): string[] {
  return [
    g.name,
    g.phone ?? "",
    g.group ?? "",
    sideDisplayLabel(g.side),
    g.partySize === null ? "" : String(g.partySize),
    g.foodChoice ?? "",
    g.note ?? "",
  ];
}

// ---------------------------------------------------------------------------
// Import: validate one row.
// ---------------------------------------------------------------------------

const ERR_PREFIX = "Data Tidak Masuk Karena ";

// Accepted spellings for the `side` column (compared case-insensitively).
const SIDE_ALIASES: Record<string, GuestSide> = {
  pria: "groom",
  "pengantin pria": "groom",
  groom: "groom",
  wanita: "bride",
  "pengantin wanita": "bride",
  bride: "bride",
  bersama: "both",
  both: "both",
};

// Zod schemas for the simple length-bounded optional text fields. We only use
// these to enforce max-length; the friendly Bahasa message is supplied by the
// caller (we never leak raw zod error text).
const nameSchema = z.string().min(1).max(120);
const phoneSchema = z.string().max(30);
const groupSchema = z.string().max(80);
const foodSchema = z.string().max(80);
const noteSchema = z.string().max(300);

/**
 * Validate ONE imported data row (cells in GUEST_CSV_HEADERS order). Every cell
 * is trimmed first; missing cells are treated as "".
 *
 * On success returns `{ ok: true, value }` with insertable data.
 * On failure returns `{ ok: false, message }` where `message` already starts
 * with "Data Tidak Masuk Karena ".
 */
export function parseGuestImportRow(
  cells: string[],
): { ok: true; value: GuestImportData } | { ok: false; message: string } {
  // Trim every cell; treat missing cells as empty strings.
  const get = (i: number): string => (cells[i] ?? "").trim();

  const nameRaw = get(0);
  const phoneRaw = get(1);
  const groupRaw = get(2);
  const sideRaw = get(3);
  const partyRaw = get(4);
  const foodRaw = get(5);
  const noteRaw = get(6);

  // --- Nama (required, 1..120) ---
  if (nameRaw.length === 0) {
    return { ok: false, message: ERR_PREFIX + "nama wajib diisi" };
  }
  if (!nameSchema.safeParse(nameRaw).success) {
    return {
      ok: false,
      message: ERR_PREFIX + "nama terlalu panjang (maks 120 karakter)",
    };
  }

  // --- Nomor (optional, max 30) ---
  let phone: string | null = null;
  if (phoneRaw.length > 0) {
    if (!phoneSchema.safeParse(phoneRaw).success) {
      return { ok: false, message: ERR_PREFIX + "nomor terlalu panjang" };
    }
    phone = phoneRaw;
  }

  // --- Grup (optional, max 80) ---
  let group: string | null = null;
  if (groupRaw.length > 0) {
    if (!groupSchema.safeParse(groupRaw).success) {
      return { ok: false, message: ERR_PREFIX + "grup terlalu panjang" };
    }
    group = groupRaw;
  }

  // --- Sisi (optional; default "both") ---
  // Known labels map to the canonical values; anything else imports as a
  // custom side (length-bounded to match the guest actions).
  let side: string = "both";
  if (sideRaw.length > 0) {
    const mapped = SIDE_ALIASES[sideRaw.toLowerCase()];
    if (mapped !== undefined) {
      side = mapped;
    } else if (sideRaw.length > 40) {
      return {
        ok: false,
        message: ERR_PREFIX + "sisi terlalu panjang (maks 40 karakter)",
      };
    } else {
      side = sideRaw;
    }
  }

  // --- Jumlah (optional; non-negative integer, 0..20) ---
  let partySize: number | null = null;
  if (partyRaw.length > 0) {
    // Must be a plain non-negative integer (no decimals, signs, or junk).
    if (!/^\d+$/.test(partyRaw)) {
      return { ok: false, message: ERR_PREFIX + "jumlah harus berupa angka" };
    }
    const n = Number(partyRaw);
    if (!Number.isInteger(n) || n < 0 || n > 20) {
      return {
        ok: false,
        message: ERR_PREFIX + "jumlah harus antara 0 dan 20",
      };
    }
    partySize = n;
  }

  // --- Makanan (optional, max 80) ---
  let foodChoice: string | null = null;
  if (foodRaw.length > 0) {
    if (!foodSchema.safeParse(foodRaw).success) {
      return { ok: false, message: ERR_PREFIX + "makanan terlalu panjang" };
    }
    foodChoice = foodRaw;
  }

  // --- Catatan (optional, max 300) ---
  let note: string | null = null;
  if (noteRaw.length > 0) {
    if (!noteSchema.safeParse(noteRaw).success) {
      return { ok: false, message: ERR_PREFIX + "catatan terlalu panjang" };
    }
    note = noteRaw;
  }

  return {
    ok: true,
    value: { name: nameRaw, phone, group, side, partySize, foodChoice, note },
  };
}

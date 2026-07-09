// Server-only data access for the check-in kiosk (guestbook).
//
// Every getter resolves the wedding from the kiosk TOKEN session via
// `resolveKiosk()` (never a client-supplied id, and never the dashboard login —
// the guestbook is token-only per the product rules) and returns `null` when
// there is no valid token (missing / revoked / kicked).
//
// `getKioskGuest` additionally accepts a guest id read from the kiosk URL. It is
// safe to read a client-supplied guest id here because the lookup is scoped to
// the token's wedding in the WHERE clause: a foreign id resolves to `null` and
// never leaks another wedding's guest. Mutations re-derive the wedding the same
// way.
//
// This module must only ever be imported from Server Components / Server Actions.

import { and, asc, eq, gte, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { guests, weddings } from "@/lib/db/schema";
import { resolveKiosk } from "@/server/guestbook-resolve";

// ─────────────────────────────────────────────────────────────────
// Public contract types (locked — build to these exactly)
// ─────────────────────────────────────────────────────────────────

export type KioskGuest = {
  id: string;
  name: string;
  group: string | null;
  /** "groom" | "bride" | "both" or a customer-defined custom side. */
  side: string;
  status: "pending" | "confirmed" | "declined";
  partySize: number | null;
  foodChoice: string | null;
  invitationStatus: "none" | "sent" | "opened";
  isWalkIn: boolean;
  checkedInAt: Date | null;
  checkedInPartySize: number | null;
};

export type KioskHeader = {
  groomName: string;
  brideName: string;
  dateLabel: string | null;
  venueLabel: string | null;
  // "Penjaga" label: the signed-in token's label. Null when none on record →
  // the UI shows a neutral label.
  attendantName: string | null;
  // Always true — the kiosk is token-only. Drives the shell's attendant logout.
  viaToken: boolean;
  stats: {
    invited: number;
    checkedIn: number;
    walkIns: number;
    // Guests checked in within the last 15 minutes (live throughput).
    lastFifteenMin: number;
  };
};

type WeddingRow = typeof weddings.$inferSelect;

// Resolved wedding + the attendant label (the signed-in token's label).
type ResolvedWedding = {
  wedding: WeddingRow;
  attendantName: string | null;
  viaToken: boolean;
};

// ─────────────────────────────────────────────────────────────────
// Shared wedding resolution
// ─────────────────────────────────────────────────────────────────

/**
 * Resolve the kiosk's wedding from the token session (`resolveKiosk()`), plus
 * the attendant label (the token's label). Returns `null` when there is no valid
 * token or its wedding is gone.
 */
async function resolveWedding(): Promise<ResolvedWedding | null> {
  const k = await resolveKiosk();
  if (!k) {
    return null;
  }
  const wedding = await db.query.weddings.findFirst({
    where: and(eq(weddings.id, k.weddingId), isNull(weddings.deletedAt)),
  });
  if (!wedding) {
    return null;
  }
  return { wedding, attendantName: k.attendantLabel, viaToken: k.viaToken };
}

// ─────────────────────────────────────────────────────────────────
// Date / label helpers (mirrors dashboard.ts formatting)
// ─────────────────────────────────────────────────────────────────

// `eventDate` is a Drizzle `date` column → returned as a "YYYY-MM-DD" string.
const dateLabelFmt = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Parse a "YYYY-MM-DD" date string into a local midnight Date, or null. */
function parseEventDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) {
    return null;
  }
  return new Date(y, m - 1, d);
}

/** "Sabtu · 14 Juni 2026" from the event date, or null when unset. */
function formatDateLabel(eventDate: Date | null): string | null {
  if (!eventDate) {
    return null;
  }
  // id-ID gives "Sabtu, 14 Juni 2026"; swap the comma for the dot separator.
  return dateLabelFmt.format(eventDate).replace(", ", " · ");
}

/** "Pendopo Kayon · Yogyakarta" from venue + city; null when neither is set. */
function formatVenueLabel(
  venue: string | null,
  city: string | null,
): string | null {
  const parts = [venue?.trim(), city?.trim()].filter(
    (p): p is string => Boolean(p),
  );
  return parts.length > 0 ? parts.join(" · ") : null;
}

// ─────────────────────────────────────────────────────────────────
// Header assembly (couple + date/venue + live check-in stats)
// ─────────────────────────────────────────────────────────────────

// Throughput window — guests checked in within the last 15 minutes feed the
// "Per 15 menit" attendant stat.
const THROUGHPUT_WINDOW_MS = 15 * 60 * 1000;

/**
 * Build the kiosk header for a resolved wedding: couple names, date/venue
 * labels, attendant name, and the live check-in stats computed in a single
 * round-trip (invited = guest count, checkedIn = count where checkedInAt is
 * set, walkIns = count where isWalkIn, lastFifteenMin = count where checkedInAt
 * is within the last 15 minutes). Kept private so the only way to obtain a
 * `KioskHeader` is through a getter that has verified ownership.
 */
async function buildHeader(resolved: ResolvedWedding): Promise<KioskHeader> {
  const { wedding, attendantName } = resolved;
  const since = new Date(Date.now() - THROUGHPUT_WINDOW_MS);

  const [statRow] = await db
    .select({
      invited: sql<number>`count(*)::int`,
      checkedIn: sql<number>`count(*) filter (where ${guests.checkedInAt} is not null)::int`,
      walkIns: sql<number>`count(*) filter (where ${guests.isWalkIn})::int`,
      lastFifteenMin: sql<number>`count(*) filter (where ${gte(
        guests.checkedInAt,
        since,
      )})::int`,
    })
    .from(guests)
    .where(and(eq(guests.weddingId, wedding.id), isNull(guests.deletedAt)));

  const eventDate = parseEventDate(wedding.eventDate);

  return {
    groomName: wedding.groomName,
    brideName: wedding.brideName,
    dateLabel: formatDateLabel(eventDate),
    venueLabel: formatVenueLabel(wedding.venue, wedding.city),
    attendantName: attendantName?.trim() ? attendantName.trim() : null,
    viaToken: resolved.viaToken,
    stats: {
      invited: statRow?.invited ?? 0,
      checkedIn: statRow?.checkedIn ?? 0,
      walkIns: statRow?.walkIns ?? 0,
      lastFifteenMin: statRow?.lastFifteenMin ?? 0,
    },
  };
}

/** Map a guest DB row onto the locked `KioskGuest` shape. */
function toKioskGuest(row: {
  id: string;
  name: string;
  group: string | null;
  side: string;
  status: "pending" | "confirmed" | "declined";
  partySize: number | null;
  foodChoice: string | null;
  invitationStatus: "none" | "sent" | "opened";
  isWalkIn: boolean;
  checkedInAt: Date | null;
  checkedInPartySize: number | null;
}): KioskGuest {
  return {
    id: row.id,
    name: row.name,
    group: row.group,
    side: row.side,
    status: row.status,
    partySize: row.partySize,
    foodChoice: row.foodChoice,
    invitationStatus: row.invitationStatus,
    isWalkIn: row.isWalkIn,
    checkedInAt: row.checkedInAt,
    checkedInPartySize: row.checkedInPartySize,
  };
}

const guestColumns = {
  id: guests.id,
  name: guests.name,
  group: guests.group,
  side: guests.side,
  status: guests.status,
  partySize: guests.partySize,
  foodChoice: guests.foodChoice,
  invitationStatus: guests.invitationStatus,
  isWalkIn: guests.isWalkIn,
  checkedInAt: guests.checkedInAt,
  checkedInPartySize: guests.checkedInPartySize,
} as const;

// ─────────────────────────────────────────────────────────────────
// Getters
// ─────────────────────────────────────────────────────────────────

/**
 * Full kiosk payload: the header (couple + live stats) plus every non-deleted
 * guest of the session-owned wedding, ordered by name. Returns `null` when
 * there is no resolvable user or no owned wedding.
 */
export async function getKioskData(): Promise<{
  header: KioskHeader;
  guests: KioskGuest[];
} | null> {
  const resolved = await resolveWedding();
  if (!resolved) {
    return null;
  }

  const rows = await db
    .select(guestColumns)
    .from(guests)
    .where(and(eq(guests.weddingId, resolved.wedding.id), isNull(guests.deletedAt)))
    .orderBy(asc(guests.name));

  const header = await buildHeader(resolved);

  return { header, guests: rows.map(toKioskGuest) };
}

// Defensive: the guest id arrives from the kiosk URL. Validate the uuid shape
// INSIDE so a malformed value short-circuits to null before hitting the DB.
const guestIdSchema = z.uuid();

/**
 * One guest by id, scoped to the session-owned wedding, plus the kiosk header.
 *
 * Ownership is enforced in the WHERE clause: the guest is matched only when it
 * belongs to the owned wedding, so a foreign / forged id resolves to `null` and
 * never leaks another wedding's guest. Returns `null` when there is no owned
 * wedding, the id is malformed, or the guest does not belong to this wedding.
 */
export async function getKioskGuest(guestId: string): Promise<{
  header: KioskHeader;
  guest: KioskGuest;
} | null> {
  const parsed = guestIdSchema.safeParse(guestId);
  if (!parsed.success) {
    return null;
  }

  const resolved = await resolveWedding();
  if (!resolved) {
    return null;
  }

  const [row] = await db
    .select(guestColumns)
    .from(guests)
    .where(
      and(
        eq(guests.id, parsed.data),
        eq(guests.weddingId, resolved.wedding.id),
        isNull(guests.deletedAt),
      ),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  const header = await buildHeader(resolved);

  return { header, guest: toKioskGuest(row) };
}

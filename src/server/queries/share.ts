// Server-only data access for the family "quick send" feature.
//
// Getters:
//  - getShareAccessData(): OWNER-scoped list of share tokens for the
//    /dashboard/akses-keluarga management page (never a client-supplied id).
//  - getShareSendData(): SHARE-SESSION-scoped guest list for the public /kirim
//    send page — only guests whose side is in the token's `sides`.
//  - getShareGuestsData(): view-scoped projection of the above for the
//    read-only /kirim/tamu dashboard (no phones/codes/slug/template).

import { and, asc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { guests, shareTokens, weddings } from "@/lib/db/schema";
import { relativeTimeId } from "@/lib/datetime";
import { customSides } from "@/lib/guests-csv";
import { normalizePhoneIntl } from "@/lib/phone";
import { resolveShareSession, type ShareResolution } from "@/server/share-resolve";
import { resolveMemberWeddingId } from "@/server/queries/wedding";
import {
  getDashboardChrome,
  likePattern,
  type DashboardChrome,
} from "@/server/queries/dashboard";

// ─────────────────────────────────────────────────────────────────
// Owner: management page
// ─────────────────────────────────────────────────────────────────

export type ShareAccessToken = {
  id: string;
  label: string;
  code: string;
  sides: string[];
  /** "unused" = never logged in; "active" = inside the 1-hour window. */
  status: "unused" | "active" | "expired";
  /** End of the window (ms epoch) — null until first login. */
  expiresAtMs: number | null;
  /** Minutes left in an active window — computed server-side (hydration-safe). */
  remainingMinutes: number | null;
  /** How many live guests the token's sides currently match — 0 means the
   *  sides drifted (renamed/removed) and the sender would see an empty list. */
  matchCount: number;
  lastDevice: string | null;
  lastSeenLabel: string | null;
};

export type ShareAccessData = {
  chrome: DashboardChrome | null;
  tokens: ShareAccessToken[];
  /** Side values offered by the create form: canonical trio + customs in use. */
  availableSides: string[];
};

export async function getShareAccessData(): Promise<ShareAccessData | null> {
  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) {
    return null;
  }

  const rows = await db
    .select({
      id: shareTokens.id,
      label: shareTokens.label,
      code: shareTokens.code,
      sides: shareTokens.sides,
      expiresAt: shareTokens.expiresAt,
      lastSeenAt: shareTokens.lastSeenAt,
      lastDevice: shareTokens.lastDevice,
    })
    .from(shareTokens)
    .where(and(eq(shareTokens.weddingId, weddingId), isNull(shareTokens.deletedAt)))
    .orderBy(asc(shareTokens.createdAt));

  const sideRows = await db
    .select({ side: guests.side, n: sql<number>`count(*)::int` })
    .from(guests)
    .where(and(eq(guests.weddingId, weddingId), isNull(guests.deletedAt)))
    .groupBy(guests.side)
    .orderBy(asc(guests.side));

  const chrome = await getDashboardChrome();
  const now = Date.now();
  const countBySide = new Map(sideRows.map((s) => [s.side, s.n]));

  return {
    chrome,
    tokens: rows.map((r) => {
      const active = r.expiresAt !== null && r.expiresAt.getTime() > now;
      return {
        id: r.id,
        label: r.label,
        code: r.code,
        sides: r.sides,
        status: r.expiresAt === null ? ("unused" as const) : active ? ("active" as const) : ("expired" as const),
        expiresAtMs: r.expiresAt?.getTime() ?? null,
        remainingMinutes: active
          ? Math.max(1, Math.round((r.expiresAt!.getTime() - now) / 60_000))
          : null,
        matchCount: r.sides.reduce((sum, s) => sum + (countBySide.get(s) ?? 0), 0),
        lastDevice: r.lastDevice,
        lastSeenLabel: r.lastSeenAt ? relativeTimeId(r.lastSeenAt) : null,
      };
    }),
    availableSides: ["both", "groom", "bride", ...customSides(sideRows.map((s) => s.side))],
  };
}

// ─────────────────────────────────────────────────────────────────
// Family pages (share session) — server-paged guest feed
// ─────────────────────────────────────────────────────────────────

/** Rows per keyset page for the family pages' infinite scroll. */
export const SHARE_PAGE_SIZE = 30;

/** Keyset cursor: the last row of the previous page (ordered name, id). */
export type ShareGuestCursor = { name: string; id: string };

// SQL mirror of normalizePhoneIntl(): strip non-digits, apply the Indonesian
// prefix rules (0→62, 8→628, collapse 620→62), then bound to a 9–15 digit
// MSISDN. Keeps the aggregate counts in exact agreement with the per-row
// Kirim buttons, which use the JS function on the loaded rows.
const sendableSql = sql`length(
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(coalesce(${guests.phone}, ''), '[^0-9]', '', 'g'),
        '^0', '62'),
      '^8', '628'),
    '^620', '62')
) between 9 and 15`;

export type ShareSendGuest = {
  id: string;
  name: string;
  code: string | null;
  group: string | null;
  phone: string | null;
  side: string;
  /** RSVP status — shown read-only on the family guest dashboard. */
  status: "pending" | "confirmed" | "declined";
  invitationStatus: "none" | "sent" | "opened";
};

function shareGuestWhere(
  session: ShareResolution,
  query: string,
  cursor: ShareGuestCursor | null,
) {
  const conds = [
    eq(guests.weddingId, session.weddingId),
    inArray(guests.side, session.sides),
    isNull(guests.deletedAt),
  ];
  const q = query.trim();
  if (q) {
    const pat = likePattern(q);
    conds.push(or(ilike(guests.name, pat), ilike(guests.group, pat))!);
  }
  if (cursor) {
    // Row-wise comparison matches the (name, id) ORDER BY exactly, so pages
    // never skip or duplicate rows when guests are added mid-scroll.
    conds.push(sql`(${guests.name}, ${guests.id}) > (${cursor.name}, ${cursor.id}::uuid)`);
  }
  return and(...conds);
}

/** One keyset page of the session's guests. Shared by the /kirim first render
 *  and the loadShare* actions that feed the infinite scroll. */
export async function fetchShareGuestPage(
  session: ShareResolution,
  opts: { query: string; cursor: ShareGuestCursor | null },
): Promise<{ rows: ShareSendGuest[]; nextCursor: ShareGuestCursor | null }> {
  const rows = await db
    .select({
      id: guests.id,
      name: guests.name,
      code: guests.code,
      group: guests.group,
      phone: guests.phone,
      side: guests.side,
      status: guests.status,
      invitationStatus: guests.invitationStatus,
    })
    .from(guests)
    .where(shareGuestWhere(session, opts.query, opts.cursor))
    .orderBy(asc(guests.name), asc(guests.id))
    .limit(SHARE_PAGE_SIZE + 1);

  const hasMore = rows.length > SHARE_PAGE_SIZE;
  const page = hasMore ? rows.slice(0, SHARE_PAGE_SIZE) : rows;
  const last = page[page.length - 1];
  return {
    rows: page,
    nextCursor: hasMore && last ? { name: last.name, id: last.id } : null,
  };
}

/** Wedding-wide aggregates over the session's sides (never paged). */
async function shareGuestStats(session: ShareResolution) {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      sent: sql<number>`count(*) filter (where ${guests.invitationStatus} <> 'none')::int`,
      opened: sql<number>`count(*) filter (where ${guests.invitationStatus} = 'opened')::int`,
      confirmed: sql<number>`count(*) filter (where ${guests.status} = 'confirmed')::int`,
      sendable: sql<number>`count(*) filter (where ${sendableSql})::int`,
      sendableSent: sql<number>`count(*) filter (where ${sendableSql} and ${guests.invitationStatus} <> 'none')::int`,
    })
    .from(guests)
    .where(
      and(
        eq(guests.weddingId, session.weddingId),
        inArray(guests.side, session.sides),
        isNull(guests.deletedAt),
      ),
    );
  return (
    row ?? { total: 0, sent: 0, opened: 0, confirmed: 0, sendable: 0, sendableSent: 0 }
  );
}

// ─────────────────────────────────────────────────────────────────
// Family: quick-send page (/kirim)
// ─────────────────────────────────────────────────────────────────

export type ShareSendData = {
  /** Sender identity from the token label, e.g. "Ibu Pengantin Pria". */
  senderLabel: string;
  /** End of the 1-hour window (ms epoch) for the client countdown. */
  expiresAtMs: number;
  weddingSlug: string;
  groomName: string;
  brideName: string;
  /** Guest side values this sender holds — shown as category chips. */
  sides: string[];
  /** The sender's saved WA template ({nama}/{link}); null = use the default. */
  savedTemplate: string | null;
  /** First page — more pages stream in via loadShareSendGuests(). */
  guests: ShareSendGuest[];
  nextCursor: ShareGuestCursor | null;
  /** Aggregates over ALL the session's guests (the list itself is paged). */
  counts: { sendable: number; sendableSent: number; noPhone: number };
};

export async function getShareSendData(): Promise<ShareSendData | null> {
  const session = await resolveShareSession();
  if (!session) {
    return null;
  }

  const [wedding] = await db
    .select({ slug: weddings.slug, groomName: weddings.groomName, brideName: weddings.brideName })
    .from(weddings)
    .where(and(eq(weddings.id, session.weddingId), isNull(weddings.deletedAt)))
    .limit(1);
  if (!wedding) {
    return null;
  }

  const [page, stats] = await Promise.all([
    fetchShareGuestPage(session, { query: "", cursor: null }),
    shareGuestStats(session),
  ]);

  return {
    senderLabel: session.label,
    expiresAtMs: session.expiresAt.getTime(),
    weddingSlug: wedding.slug,
    groomName: wedding.groomName,
    brideName: wedding.brideName,
    sides: session.sides,
    savedTemplate: session.template,
    guests: page.rows,
    nextCursor: page.nextCursor,
    counts: {
      sendable: stats.sendable,
      sendableSent: stats.sendableSent,
      noPhone: stats.total - stats.sendable,
    },
  };
}

// ─────────────────────────────────────────────────────────────────
// Family: guest dashboard (/kirim/tamu)
// ─────────────────────────────────────────────────────────────────

export type ShareGuestRow = {
  id: string;
  name: string;
  group: string | null;
  side: string;
  status: "pending" | "confirmed" | "declined";
  invitationStatus: "none" | "sent" | "opened";
  /** Whether the Kirim tab can actually send to this guest (usable phone). */
  hasPhone: boolean;
};

/** Strip phone/code from a fetched row — the read-only dashboard must not
 *  ship PII it never renders. */
export function toShareGuestRow(g: ShareSendGuest): ShareGuestRow {
  return {
    id: g.id,
    name: g.name,
    group: g.group,
    side: g.side,
    status: g.status,
    invitationStatus: g.invitationStatus,
    hasPhone: normalizePhoneIntl(g.phone) !== null,
  };
}

export type ShareGuestsData = {
  senderLabel: string;
  expiresAtMs: number;
  groomName: string;
  brideName: string;
  sides: string[];
  /** First page — more pages stream in via loadShareGuestRows(). */
  guests: ShareGuestRow[];
  nextCursor: ShareGuestCursor | null;
  /** Aggregates over ALL the session's guests (the list itself is paged). */
  stats: { total: number; sent: number; opened: number; confirmed: number; unsent: number };
};

export async function getShareGuestsData(): Promise<ShareGuestsData | null> {
  const session = await resolveShareSession();
  if (!session) {
    return null;
  }

  const [wedding] = await db
    .select({ groomName: weddings.groomName, brideName: weddings.brideName })
    .from(weddings)
    .where(and(eq(weddings.id, session.weddingId), isNull(weddings.deletedAt)))
    .limit(1);
  if (!wedding) {
    return null;
  }

  const [page, stats] = await Promise.all([
    fetchShareGuestPage(session, { query: "", cursor: null }),
    shareGuestStats(session),
  ]);

  return {
    senderLabel: session.label,
    expiresAtMs: session.expiresAt.getTime(),
    groomName: wedding.groomName,
    brideName: wedding.brideName,
    sides: session.sides,
    guests: page.rows.map(toShareGuestRow),
    nextCursor: page.nextCursor,
    stats: {
      total: stats.total,
      sent: stats.sent,
      opened: stats.opened,
      confirmed: stats.confirmed,
      // Only guests the Kirim tab can actually send to.
      unsent: stats.sendable - stats.sendableSent,
    },
  };
}

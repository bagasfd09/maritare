// Server-only data access for the family "quick send" feature.
//
// Two getters:
//  - getShareAccessData(): OWNER-scoped list of share tokens for the
//    /dashboard/akses-keluarga management page (never a client-supplied id).
//  - getShareSendData(): SHARE-SESSION-scoped guest list for the public /kirim
//    page — only guests whose side is in the token's `sides`.

import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { guests, shareTokens, weddings } from "@/lib/db/schema";
import { relativeTimeId } from "@/lib/datetime";
import { customSides } from "@/lib/guests-csv";
import { resolveShareSession } from "@/server/share-resolve";
import { resolveMemberWeddingId } from "@/server/queries/wedding";
import {
  getDashboardChrome,
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
// Family: quick-send page (share session)
// ─────────────────────────────────────────────────────────────────

export type ShareSendGuest = {
  id: string;
  name: string;
  code: string | null;
  group: string | null;
  phone: string | null;
  side: string;
  invitationStatus: "none" | "sent" | "opened";
};

export type ShareSendData = {
  /** Sender identity from the token label, e.g. "Ibu Pengantin Pria". */
  senderLabel: string;
  /** End of the 1-hour window (ms epoch) for the client countdown. */
  expiresAtMs: number;
  weddingSlug: string;
  groomName: string;
  brideName: string;
  /** The sender's saved WA template ({nama}/{link}); null = use the default. */
  savedTemplate: string | null;
  guests: ShareSendGuest[];
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

  const rows = await db
    .select({
      id: guests.id,
      name: guests.name,
      code: guests.code,
      group: guests.group,
      phone: guests.phone,
      side: guests.side,
      invitationStatus: guests.invitationStatus,
    })
    .from(guests)
    .where(
      and(
        eq(guests.weddingId, session.weddingId),
        inArray(guests.side, session.sides),
        isNull(guests.deletedAt),
      ),
    )
    .orderBy(asc(guests.name));

  return {
    senderLabel: session.label,
    expiresAtMs: session.expiresAt.getTime(),
    weddingSlug: wedding.slug,
    groomName: wedding.groomName,
    brideName: wedding.brideName,
    savedTemplate: session.template,
    guests: rows,
  };
}

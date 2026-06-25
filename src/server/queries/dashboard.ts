// Server-only data access for the authenticated customer dashboard.
//
// Every getter resolves the wedding from the session via `resolveEditorUserId()`
// (never a client-supplied id — ownership is derived from the session per
// AGENTS.md hard rules) and returns `null` when there is no resolvable user
// (unauthenticated in production) or the user has no wedding yet.
//
// All getters share `buildChrome(weddingRow, userRow)` so the sidebar header is
// assembled identically everywhere. This module must only ever be imported from
// Server Components / Server Actions.

import { and, asc, desc, eq, gt, isNull, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  guests,
  orders,
  packages,
  photos,
  rsvps,
  templates,
  users,
  weddingMembers,
  weddings,
  wishes,
} from "@/lib/db/schema";
import { relativeTimeId } from "@/lib/datetime";
import { parseSectionData } from "@/lib/invitation/sections";
import { getViewUrl } from "@/lib/r2";
import {
  normalizeNotificationPrefs,
  type NotificationPrefs,
} from "@/lib/notifications";
import { resolveEditorUserId } from "@/server/queries/wedding";

// ─────────────────────────────────────────────────────────────────
// Chrome (sidebar header) — shared by every getter
// ─────────────────────────────────────────────────────────────────

export type DashboardChrome = {
  coupleLabel: string;
  groomName: string;
  brideName: string;
  status: "draft" | "pending" | "live" | "expired";
  packageName: string | null;
  userName: string;
  userInitials: string;
  pendingWishes: number;
};

type WeddingRow = typeof weddings.$inferSelect;
type UserRow = typeof users.$inferSelect;

/**
 * Two uppercased initials from a display name: the first letter of each of the
 * first two whitespace-separated words. Falls back to a single letter for a
 * one-word name, and "?" when there is nothing usable.
 */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  return parts
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

/**
 * Assemble the sidebar chrome from a resolved wedding + its owner, plus the
 * package name and the count of pending wishes. Kept private so the only way to
 * obtain a `DashboardChrome` is through a getter that has verified ownership.
 */
function buildChrome(
  weddingRow: Pick<WeddingRow, "groomName" | "brideName" | "status">,
  userRow: Pick<UserRow, "name" | "email">,
  packageName: string | null,
  pendingWishes: number,
): DashboardChrome {
  const userName = userRow.name?.trim() || userRow.email;
  return {
    // Bride-first by convention (e.g. "Kiki & Bagas").
    coupleLabel: `${weddingRow.brideName} & ${weddingRow.groomName}`,
    groomName: weddingRow.groomName,
    brideName: weddingRow.brideName,
    status: weddingRow.status,
    packageName,
    userName,
    userInitials: initialsOf(userName),
    pendingWishes,
  };
}

// ─────────────────────────────────────────────────────────────────
// Shared wedding resolution
// ─────────────────────────────────────────────────────────────────

type ResolvedWedding = {
  wedding: WeddingRow;
  /** The SIGNED-IN member (groom or bride) — drives the sidebar/profile identity. */
  user: Pick<UserRow, "name" | "email">;
  /** The wedding's creator (weddings.userId) — the billing contact. */
  creator: Pick<UserRow, "name" | "email">;
  /** The signed-in member's own user id (for per-user settings + member list). */
  userId: string;
  packageName: string | null;
  photoLimit: number | null;
};

/**
 * Resolve the wedding the signed-in user is a MEMBER of, joined to its creator +
 * package. `user` is the signed-in member (so the sidebar shows the logged-in
 * partner's identity, not the creator's); `creator` is weddings.userId (billing
 * contact). Returns `null` when unauthenticated or the user has no membership.
 */
async function resolveWedding(): Promise<ResolvedWedding | null> {
  const userId = await resolveEditorUserId();
  if (!userId) {
    return null;
  }
  const membership = await db.query.weddingMembers.findFirst({
    columns: { weddingId: true },
    where: eq(weddingMembers.userId, userId),
  });
  if (!membership) {
    return null;
  }

  const [row] = await db
    .select({
      wedding: weddings,
      creatorName: users.name,
      creatorEmail: users.email,
      packageName: packages.name,
      photoLimit: packages.photoLimit,
    })
    .from(weddings)
    .innerJoin(users, eq(weddings.userId, users.id))
    .leftJoin(packages, eq(weddings.packageId, packages.id))
    .where(and(eq(weddings.id, membership.weddingId), isNull(weddings.deletedAt)))
    .limit(1);

  if (!row) {
    return null;
  }

  // The signed-in member's own profile (may be the partner, not the creator).
  const me = await db.query.users.findFirst({
    columns: { name: true, email: true },
    where: eq(users.id, userId),
  });
  const creator = { name: row.creatorName, email: row.creatorEmail };

  return {
    wedding: row.wedding,
    user: me ?? creator,
    creator,
    userId,
    packageName: row.packageName ?? null,
    photoLimit: row.photoLimit,
  };
}

/** Count pending wishes for a wedding (for the sidebar badge). */
async function countPendingWishes(weddingId: string): Promise<number> {
  const [row] = await db
    .select({ pending: sql<number>`count(*)::int` })
    .from(wishes)
    .where(
      and(
        eq(wishes.weddingId, weddingId),
        isNull(wishes.deletedAt),
        eq(wishes.status, "pending"),
      ),
    );
  return row?.pending ?? 0;
}

// ─────────────────────────────────────────────────────────────────
// Activity feed (synthesized from real events — there is no activity_log table)
// ─────────────────────────────────────────────────────────────────

export type ActivityKind = "rsvp_yes" | "rsvp_no" | "wish" | "photo";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  /** Guest/wisher name; empty for photo events. */
  name: string;
  /** Preformatted relative time, e.g. "3 jam lalu". */
  timeLabel: string;
};

/**
 * Recent activity for the overview, merged from the only real event sources:
 * RSVP submissions (rsvps), guestbook wishes, and gallery uploads — newest
 * first, capped. Empty when nothing has happened yet (no mock fallback).
 */
async function getRecentActivity(weddingId: string): Promise<ActivityItem[]> {
  const [rsvpRows, wishRows, photoRows] = await Promise.all([
    db
      .select({ name: guests.name, attending: rsvps.attending, at: rsvps.createdAt })
      .from(rsvps)
      .leftJoin(guests, eq(rsvps.guestId, guests.id))
      .where(and(eq(rsvps.weddingId, weddingId), isNull(rsvps.deletedAt)))
      .orderBy(desc(rsvps.createdAt))
      .limit(6),
    db
      .select({ name: wishes.fromName, at: wishes.createdAt })
      .from(wishes)
      .where(and(eq(wishes.weddingId, weddingId), isNull(wishes.deletedAt)))
      .orderBy(desc(wishes.createdAt))
      .limit(6),
    db
      .select({ at: photos.createdAt })
      .from(photos)
      .where(and(eq(photos.weddingId, weddingId), isNull(photos.deletedAt)))
      .orderBy(desc(photos.createdAt))
      .limit(6),
  ]);

  const merged: Array<{ id: string; kind: ActivityKind; name: string; at: Date }> = [
    ...rsvpRows.map((r, i) => ({
      id: `rsvp-${i}-${r.at.getTime()}`,
      kind: (r.attending ? "rsvp_yes" : "rsvp_no") as ActivityKind,
      name: r.name ?? "Tamu",
      at: r.at,
    })),
    ...wishRows.map((w, i) => ({
      id: `wish-${i}-${w.at.getTime()}`,
      kind: "wish" as ActivityKind,
      name: w.name,
      at: w.at,
    })),
    ...photoRows.map((p, i) => ({
      id: `photo-${i}-${p.at.getTime()}`,
      kind: "photo" as ActivityKind,
      name: "",
      at: p.at,
    })),
  ];

  merged.sort((a, b) => b.at.getTime() - a.at.getTime());

  return merged.slice(0, 6).map((m) => ({
    id: m.id,
    kind: m.kind,
    name: m.name,
    timeLabel: relativeTimeId(m.at),
  }));
}

// ─────────────────────────────────────────────────────────────────
// RSVP breakdown by guest group (real aggregation; no mock)
// ─────────────────────────────────────────────────────────────────

export type RsvpGroup = { label: string; confirmed: number; total: number; pct: number };

async function getRsvpByGroup(weddingId: string): Promise<RsvpGroup[]> {
  const rows = await db
    .select({
      group: guests.group,
      total: sql<number>`count(*)::int`,
      confirmed: sql<number>`count(*) filter (where ${guests.status} = 'confirmed')::int`,
    })
    .from(guests)
    .where(and(eq(guests.weddingId, weddingId), isNull(guests.deletedAt)))
    .groupBy(guests.group)
    .orderBy(desc(sql`count(*)`))
    .limit(4);

  return rows.map((r) => ({
    label: r.group?.trim() || "Lainnya",
    confirmed: r.confirmed,
    total: r.total,
    pct: r.total > 0 ? Math.round((r.confirmed / r.total) * 100) : 0,
  }));
}

/**
 * Deterministic publish-readiness % from the wedding's filled fields + section
 * `done` flags (no separate completion store). Drives the "hampir siap" card.
 */
function completionPercent(wedding: WeddingRow, photosUsed: number): number {
  const sections = wedding.sections ?? {};
  const checks = [
    Boolean(wedding.eventDate),
    Boolean(wedding.venue),
    Boolean(wedding.templateId),
    photosUsed > 0,
    Boolean(sections.pasangan?.done),
    Boolean(sections.acara?.done),
    Boolean(sections.amplop?.done),
    Boolean(sections.rsvp?.done),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ─────────────────────────────────────────────────────────────────
// Date / label helpers
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

/** Whole days from local-midnight-today to the event date; null when unset. */
function daysUntil(eventDate: Date | null): number | null {
  if (!eventDate) {
    return null;
  }
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((eventDate.getTime() - today.getTime()) / 86_400_000);
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
function formatVenueLabel(venue: string | null, city: string | null): string | null {
  const parts = [venue?.trim(), city?.trim()].filter(
    (p): p is string => Boolean(p),
  );
  return parts.length > 0 ? parts.join(" · ") : null;
}

// ─────────────────────────────────────────────────────────────────
// Chrome-only getter
// ─────────────────────────────────────────────────────────────────

export async function getDashboardChrome(): Promise<DashboardChrome | null> {
  const resolved = await resolveWedding();
  if (!resolved) {
    return null;
  }
  const pendingWishes = await countPendingWishes(resolved.wedding.id);
  return buildChrome(
    resolved.wedding,
    resolved.user,
    resolved.packageName,
    pendingWishes,
  );
}

// ─────────────────────────────────────────────────────────────────
// Overview
// ─────────────────────────────────────────────────────────────────

export type OverviewData = {
  chrome: DashboardChrome | null;
  /** Wedding slug — for the public link + the Publish control. */
  slug: string;
  daysLeft: number | null;
  dateLabel: string | null;
  venueLabel: string | null;
  /** Publish-readiness %, computed from filled fields + section done flags. */
  completionPct: number;
  rsvp: {
    confirmed: number;
    declined: number;
    pending: number;
    invited: number;
    respondedPct: number;
  };
  /** Per-group RSVP breakdown (top groups), real aggregation. */
  rsvpByGroup: RsvpGroup[];
  wishes: { total: number; pending: number };
  photos: { used: number; limit: number | null };
  visits: number;
  /** Recent real events for the activity feed (may be empty). */
  activity: ActivityItem[];
};

export async function getOverviewData(): Promise<OverviewData | null> {
  const resolved = await resolveWedding();
  if (!resolved) {
    return null;
  }
  const { wedding } = resolved;

  // Guest status tallies in one round-trip via FILTER aggregates.
  const [guestRow] = await db
    .select({
      invited: sql<number>`count(*)::int`,
      confirmed: sql<number>`count(*) filter (where ${guests.status} = 'confirmed')::int`,
      pending: sql<number>`count(*) filter (where ${guests.status} = 'pending')::int`,
      declined: sql<number>`count(*) filter (where ${guests.status} = 'declined')::int`,
    })
    .from(guests)
    .where(and(eq(guests.weddingId, wedding.id), isNull(guests.deletedAt)));

  const invited = guestRow?.invited ?? 0;
  const confirmed = guestRow?.confirmed ?? 0;
  const pending = guestRow?.pending ?? 0;
  const declined = guestRow?.declined ?? 0;
  const respondedPct =
    invited > 0 ? Math.round(((confirmed + declined) / invited) * 100) : 0;

  // Wish tallies (total + pending) in one round-trip.
  const [wishRow] = await db
    .select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where ${wishes.status} = 'pending')::int`,
    })
    .from(wishes)
    .where(and(eq(wishes.weddingId, wedding.id), isNull(wishes.deletedAt)));

  const wishTotal = wishRow?.total ?? 0;
  const wishPending = wishRow?.pending ?? 0;

  // Photo usage (count vs package limit; null limit = unlimited).
  const photosUsed = await countPhotos(wedding.id);

  const [rsvpByGroup, activity] = await Promise.all([
    getRsvpByGroup(wedding.id),
    getRecentActivity(wedding.id),
  ]);

  const eventDate = parseEventDate(wedding.eventDate);

  return {
    chrome: buildChrome(
      wedding,
      resolved.user,
      resolved.packageName,
      wishPending,
    ),
    slug: wedding.slug,
    daysLeft: daysUntil(eventDate),
    dateLabel: formatDateLabel(eventDate),
    venueLabel: formatVenueLabel(wedding.venue, wedding.city),
    completionPct: completionPercent(wedding, photosUsed),
    rsvp: { confirmed, declined, pending, invited, respondedPct },
    rsvpByGroup,
    wishes: { total: wishTotal, pending: wishPending },
    photos: { used: photosUsed, limit: resolved.photoLimit },
    visits: wedding.visitCount,
    activity,
  };
}

/** Count non-deleted photos for a wedding (matches the gallery count in photos.ts). */
async function countPhotos(weddingId: string): Promise<number> {
  const [row] = await db
    .select({ used: sql<number>`count(*)::int` })
    .from(photos)
    .where(and(eq(photos.weddingId, weddingId), isNull(photos.deletedAt)));
  return row?.used ?? 0;
}

// ─────────────────────────────────────────────────────────────────
// Guests
// ─────────────────────────────────────────────────────────────────

export type GuestsData = {
  chrome: DashboardChrome | null;
  guests: Array<{
    id: string;
    name: string;
    code: string | null;
    group: string | null;
    phone: string | null;
    side: "groom" | "bride" | "both";
    status: "pending" | "confirmed" | "declined";
    partySize: number | null;
    foodChoice: string | null;
    invitationStatus: "none" | "sent" | "opened";
  }>;
  stats: { invited: number; confirmed: number; pending: number; declined: number };
  /** For building the per-guest WhatsApp invite link client-side. */
  weddingSlug: string;
};

export async function getGuestsData(): Promise<GuestsData | null> {
  const resolved = await resolveWedding();
  if (!resolved) {
    return null;
  }
  const { wedding } = resolved;

  const rows = await db
    .select({
      id: guests.id,
      name: guests.name,
      code: guests.code,
      group: guests.group,
      phone: guests.phone,
      side: guests.side,
      status: guests.status,
      partySize: guests.partySize,
      foodChoice: guests.foodChoice,
      invitationStatus: guests.invitationStatus,
    })
    .from(guests)
    .where(and(eq(guests.weddingId, wedding.id), isNull(guests.deletedAt)))
    .orderBy(asc(guests.createdAt));

  const stats = { invited: rows.length, confirmed: 0, pending: 0, declined: 0 };
  for (const g of rows) {
    stats[g.status] += 1;
  }

  const pendingWishes = await countPendingWishes(wedding.id);

  return {
    chrome: buildChrome(wedding, resolved.user, resolved.packageName, pendingWishes),
    guests: rows,
    stats,
    weddingSlug: wedding.slug,
  };
}

// ─────────────────────────────────────────────────────────────────
// Sebar Undangan WhatsApp (manual, one-at-a-time wa.me sender)
// ─────────────────────────────────────────────────────────────────

export type WaBlastData = {
  chrome: DashboardChrome | null;
  guests: GuestsData["guests"];
  /** For building the per-guest WhatsApp invite link client-side. */
  weddingSlug: string;
  groomName: string;
  brideName: string;
  /** "Sabtu · 14 Juni 2026" — seeds the default message template. */
  dateLabel: string | null;
  /** "Pendopo Kayon · Yogyakarta" — seeds the default message template. */
  venueLabel: string | null;
};

export async function getWaBlastData(): Promise<WaBlastData | null> {
  const resolved = await resolveWedding();
  if (!resolved) {
    return null;
  }
  const { wedding } = resolved;

  const rows = await db
    .select({
      id: guests.id,
      name: guests.name,
      code: guests.code,
      group: guests.group,
      phone: guests.phone,
      side: guests.side,
      status: guests.status,
      partySize: guests.partySize,
      foodChoice: guests.foodChoice,
      invitationStatus: guests.invitationStatus,
    })
    .from(guests)
    .where(and(eq(guests.weddingId, wedding.id), isNull(guests.deletedAt)))
    .orderBy(asc(guests.createdAt));

  const pendingWishes = await countPendingWishes(wedding.id);
  const eventDate = parseEventDate(wedding.eventDate);

  return {
    chrome: buildChrome(wedding, resolved.user, resolved.packageName, pendingWishes),
    guests: rows,
    weddingSlug: wedding.slug,
    groomName: wedding.groomName,
    brideName: wedding.brideName,
    dateLabel: formatDateLabel(eventDate),
    venueLabel: formatVenueLabel(wedding.venue, wedding.city),
  };
}

// ─────────────────────────────────────────────────────────────────
// Wishes
// ─────────────────────────────────────────────────────────────────

export type WishesData = {
  chrome: DashboardChrome | null;
  wishes: Array<{
    id: string;
    fromName: string;
    body: string;
    attending: boolean | null;
    status: "pending" | "approved" | "hidden";
    pinned: boolean;
    createdAt: Date;
  }>;
  counts: { total: number; pending: number; approved: number };
};

export async function getWishesData(): Promise<WishesData | null> {
  const resolved = await resolveWedding();
  if (!resolved) {
    return null;
  }
  const { wedding } = resolved;

  // Pinned first, then newest. Approved-then-pending ordering is left to the UI.
  const rows = await db
    .select({
      id: wishes.id,
      fromName: wishes.fromName,
      body: wishes.body,
      attending: wishes.attending,
      status: wishes.status,
      pinned: wishes.pinned,
      createdAt: wishes.createdAt,
    })
    .from(wishes)
    .where(and(eq(wishes.weddingId, wedding.id), isNull(wishes.deletedAt)))
    .orderBy(desc(wishes.pinned), desc(wishes.createdAt));

  const counts = { total: rows.length, pending: 0, approved: 0 };
  for (const w of rows) {
    if (w.status === "pending") {
      counts.pending += 1;
    } else if (w.status === "approved") {
      counts.approved += 1;
    }
  }

  return {
    chrome: buildChrome(
      wedding,
      resolved.user,
      resolved.packageName,
      counts.pending,
    ),
    wishes: rows,
    counts,
  };
}

// ─────────────────────────────────────────────────────────────────
// Billing
// ─────────────────────────────────────────────────────────────────

export type BillingData = {
  chrome: DashboardChrome | null;
  packageName: string | null;
  packagePrice: number | null;
  /** Current plan details + active-period stats for the plan hero card. */
  plan: {
    durationDays: number | null;
    guestLimit: number | null; // null = unlimited
    guestCount: number; // current guest-list size (for the quota stat)
    perks: string[];
    tagline: string | null;
    expiresAt: Date | null;
    publishedAt: Date | null;
    status: "draft" | "pending" | "live" | "expired";
  };
  /** Next tier up (by sortOrder) for the upgrade nudge; null when already top. */
  upgrade: { name: string; price: number; priceDiff: number; perks: string[] } | null;
  /** Billing contact (the account owner). NPWP isn't modeled yet. */
  billingContact: { name: string; email: string };
  orders: Array<{
    id: string;
    invoiceNo: string;
    createdAt: Date;
    description: string | null;
    amount: number;
    status: "pending" | "paid" | "failed" | "refunded";
    method: string | null;
  }>;
};

export async function getBillingData(): Promise<BillingData | null> {
  const resolved = await resolveWedding();
  if (!resolved) {
    return null;
  }
  const { wedding, user, creator } = resolved;

  // Current package details (price + limits + perks) for the plan card. Joined
  // separately so packageName from resolveWedding stays the single source of
  // truth for the display name.
  const [pkgRow] = wedding.packageId
    ? await db
        .select({
          price: packages.price,
          durationDays: packages.durationDays,
          guestLimit: packages.guestLimit,
          perks: packages.perks,
          tagline: packages.tagline,
          sortOrder: packages.sortOrder,
        })
        .from(packages)
        .where(eq(packages.id, wedding.packageId))
        .limit(1)
    : [];

  // Next tier up (the first active package ranked above the current one). When
  // the user is already on the top package this resolves to nothing.
  const [upgradeRow] = pkgRow
    ? await db
        .select({ name: packages.name, price: packages.price, perks: packages.perks })
        .from(packages)
        .where(and(eq(packages.active, true), gt(packages.sortOrder, pkgRow.sortOrder)))
        .orderBy(asc(packages.sortOrder))
        .limit(1)
    : [];

  // Guest-list size (non-deleted) for the "Quota tamu" stat.
  const [guestCountRow] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(guests)
    .where(and(eq(guests.weddingId, wedding.id), isNull(guests.deletedAt)));

  // Orders belong to the user (ownership already verified on the wedding).
  const orderRows = await db
    .select({
      id: orders.id,
      invoiceNo: orders.invoiceNo,
      createdAt: orders.createdAt,
      description: orders.description,
      amount: orders.amount,
      status: orders.status,
      method: orders.method,
    })
    .from(orders)
    .where(eq(orders.userId, wedding.userId))
    .orderBy(desc(orders.createdAt));

  const pendingWishes = await countPendingWishes(wedding.id);

  return {
    chrome: buildChrome(wedding, user, resolved.packageName, pendingWishes),
    packageName: resolved.packageName,
    packagePrice: pkgRow?.price ?? null,
    plan: {
      durationDays: pkgRow?.durationDays ?? null,
      guestLimit: pkgRow?.guestLimit ?? null,
      guestCount: guestCountRow?.n ?? 0,
      perks: pkgRow?.perks ?? [],
      tagline: pkgRow?.tagline ?? null,
      expiresAt: wedding.expiresAt,
      publishedAt: wedding.publishedAt,
      status: wedding.status,
    },
    upgrade: upgradeRow
      ? {
          name: upgradeRow.name,
          price: upgradeRow.price,
          priceDiff: upgradeRow.price - (pkgRow?.price ?? 0),
          perks: upgradeRow.perks,
        }
      : null,
    // Billing is anchored to the wedding's creator (orders.userId), so the
    // contact shown is the creator — even when the signed-in viewer is the partner.
    billingContact: { name: creator.name?.trim() ?? "", email: creator.email },
    orders: orderRows,
  };
}

// ─────────────────────────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────────────────────────

export type CatalogTemplate = {
  id: string;
  slug: string;
  name: string;
  style: string | null;
  category: string | null;
  palette: string[];
  featured: boolean;
  isNew: boolean;
  /** Presigned GET URL for an admin-uploaded cover, or null (use static thumb). */
  coverUrl: string | null;
};

export type TemplatesData = {
  chrome: DashboardChrome | null;
  templates: CatalogTemplate[];
  currentTemplateSlug: string | null;
  weddingSlug: string | null;
};

/**
 * The global, published template catalog (the same list for every customer —
 * NOT scoped to any wedding). Used by the templates gallery and the onboarding
 * picker. Only published, non-deleted templates are selectable by a customer.
 */
export async function getPublishedTemplates(): Promise<CatalogTemplate[]> {
  const rows = await db
    .select({
      id: templates.id,
      slug: templates.slug,
      name: templates.name,
      style: templates.style,
      category: templates.category,
      palette: templates.palette,
      featured: templates.featured,
      isNew: templates.isNew,
      coverKey: templates.coverKey,
    })
    .from(templates)
    .where(and(eq(templates.status, "published"), isNull(templates.deletedAt)))
    .orderBy(desc(templates.featured), desc(templates.isNew), asc(templates.name));

  // Sign a presigned GET per uploaded cover (in parallel).
  return Promise.all(
    rows.map(async ({ coverKey, ...t }) => ({
      ...t,
      coverUrl: coverKey ? await getViewUrl(coverKey) : null,
    })),
  );
}

export async function getTemplatesData(): Promise<TemplatesData | null> {
  const resolved = await resolveWedding();
  if (!resolved) {
    return null;
  }
  const { wedding } = resolved;

  const rows = await getPublishedTemplates();

  // Resolve the wedding's current template slug (set-null on template delete).
  const [currentRow] = wedding.templateId
    ? await db
        .select({ slug: templates.slug })
        .from(templates)
        .where(eq(templates.id, wedding.templateId))
        .limit(1)
    : [];

  const pendingWishes = await countPendingWishes(wedding.id);

  return {
    chrome: buildChrome(wedding, resolved.user, resolved.packageName, pendingWishes),
    templates: rows,
    currentTemplateSlug: currentRow?.slug ?? null,
    weddingSlug: wedding.slug,
  };
}

// ─────────────────────────────────────────────────────────────────
// Settings
// ─────────────────────────────────────────────────────────────────

export type SettingsData = {
  chrome: DashboardChrome;
  profile: {
    name: string;
    email: string;
    phone: string | null;
    initials: string;
  };
  weddingSlug: string;
  /** Core wedding details (editable in the "Detail undangan" settings section). */
  wedding: {
    groomName: string;
    brideName: string;
    eventDate: string | null; // "YYYY-MM-DD"
    venue: string | null;
    city: string | null;
  };
  /** Shareable code a partner enters at onboarding to co-own this wedding. */
  inviteCode: string | null;
  /** Current owners (1 or 2). `isMe` = the signed-in viewer; `isCreator` = account owner. */
  members: { userId: string; name: string; email: string; isCreator: boolean; isMe: boolean }[];
  notificationPrefs: NotificationPrefs;
};

/**
 * Settings screen data: the signed-in user's real profile (name/email/phone),
 * their invitation slug, and notification preferences — all session-scoped.
 * Returns `null` when there is no resolvable wedding (the page redirects to
 * onboarding) so the settings form never shows another user's data.
 */
export async function getSettingsData(): Promise<SettingsData | null> {
  const resolved = await resolveWedding();
  if (!resolved) {
    return null;
  }
  const { wedding } = resolved;

  // The settings profile is the SIGNED-IN member's own (phone + prefs are
  // per-user), not the creator's — resolved.userId is the session user.
  const userRow = await db.query.users.findFirst({
    columns: { name: true, email: true, phone: true, notificationPrefs: true },
    where: eq(users.id, resolved.userId),
  });
  if (!userRow) {
    return null;
  }

  // Current owners of this wedding (1 or 2), creator first.
  const memberRows = await db
    .select({ userId: weddingMembers.userId, name: users.name, email: users.email })
    .from(weddingMembers)
    .innerJoin(users, eq(weddingMembers.userId, users.id))
    .where(eq(weddingMembers.weddingId, wedding.id))
    .orderBy(asc(weddingMembers.createdAt));
  const members = memberRows.map((m) => ({
    userId: m.userId,
    name: m.name?.trim() || m.email,
    email: m.email,
    isCreator: m.userId === wedding.userId,
    isMe: m.userId === resolved.userId,
  }));

  const pendingWishes = await countPendingWishes(wedding.id);
  const displayName = userRow.name?.trim() || userRow.email;

  return {
    chrome: buildChrome(wedding, resolved.user, resolved.packageName, pendingWishes),
    profile: {
      name: userRow.name ?? "",
      email: userRow.email,
      phone: userRow.phone,
      initials: initialsOf(displayName),
    },
    weddingSlug: wedding.slug,
    wedding: {
      groomName: wedding.groomName,
      brideName: wedding.brideName,
      eventDate: wedding.eventDate,
      venue: wedding.venue,
      city: wedding.city,
    },
    inviteCode: wedding.inviteCode,
    members,
    notificationPrefs: normalizeNotificationPrefs(userRow.notificationPrefs),
  };
}

// ─────────────────────────────────────────────────────────────────
// Envelope (Amplop)
// ─────────────────────────────────────────────────────────────────

export type EnvelopeData = {
  chrome: DashboardChrome;
  /** Configured bank accounts (real, from the editor's Amplop section). */
  accounts: { bank: string; number: string; holder: string }[];
  /** Configured e-wallets (real). */
  ewallets: { provider: string; number: string; holder: string }[];
  /** Physical gift shipping address, or null. */
  giftAddress: string | null;
  /**
   * Received gift contributions. Always empty for now — there is NO contributions
   * table in the schema, so guest gift tracking is not yet recorded. The UI shows
   * an empty state instead of mock entries.
   */
  receivedGifts: never[];
  totals: { total: number; count: number; largest: number; average: number };
};

/**
 * Envelope screen data: the wedding's configured payment destinations (read from
 * `weddings.sections.amplop`) plus a genuine empty received-gifts state. Returns
 * `null` when no wedding (page redirects to onboarding).
 */
export async function getEnvelopeData(): Promise<EnvelopeData | null> {
  const resolved = await resolveWedding();
  if (!resolved) {
    return null;
  }
  const { wedding } = resolved;

  const amplop = parseSectionData("amplop", wedding.sections?.amplop?.data);
  const pendingWishes = await countPendingWishes(wedding.id);

  return {
    chrome: buildChrome(wedding, resolved.user, resolved.packageName, pendingWishes),
    accounts: amplop.accounts,
    ewallets: amplop.ewallets,
    giftAddress: amplop.giftAddress ?? null,
    receivedGifts: [],
    totals: { total: 0, count: 0, largest: 0, average: 0 },
  };
}

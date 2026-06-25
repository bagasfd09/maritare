// Server-only data access for the admin area.
//
// These getters return REAL data from the database, shaped to mirror the mock
// arrays in `src/lib/admin-data.ts` so the admin screens can be switched over
// with minimal changes. They never trust client-supplied ids — the (admin)
// layout already gates `role === 'admin'`, and every getter here additionally
// resolves the session via `requireAdmin()` (defense-in-depth) and returns an
// empty/neutral value when the caller is not an admin.
//
// This module imports the db + auth and must only ever be imported from Server
// Components / Server Actions. Patterns (drizzle imports, sql FILTER aggregates,
// single round-trips, `relativeTimeId`) mirror `dashboard.ts`.

import { and, desc, eq, gte, isNull, sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  orders,
  packages,
  promos,
  teamInvites,
  templates,
  users,
  weddings,
} from "@/lib/db/schema";
import { relativeTimeId } from "@/lib/datetime";
import { rupiah } from "@/lib/format";
import { getViewUrl } from "@/lib/r2";

// ─────────────────────────────────────────────────────────────────
// Admin gate (defense-in-depth)
// ─────────────────────────────────────────────────────────────────

/** The minimal admin identity every getter needs from the session. */
type AdminSessionUser = {
  id: string;
  name: string | null;
  email: string;
};

/**
 * Resolve the signed-in admin from the session, or `null` when there is no
 * session or the user is not an admin. The (admin) layout is the authoritative
 * gate; this is a second, in-module guard so a getter imported elsewhere can
 * never leak admin data to a non-admin.
 */
async function requireAdmin(): Promise<AdminSessionUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || user.role !== "admin" || !user.email) {
    return null;
  }
  return { id: user.id, name: user.name ?? null, email: user.email };
}

// ─────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────

/**
 * Up to two uppercased initials: the first letter of each of the first two
 * whitespace-separated words. Falls back to the first letter(s) of the email's
 * local part, then "?".
 */
function initialsOf(name: string | null, email: string): string {
  const source = name?.trim() || email.split("@")[0] || "";
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  return parts
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

// `eventDate` is a Drizzle `date` column → returned as a "YYYY-MM-DD" string.
// Indonesian short date, e.g. "14 Jun 2026" (mirrors the AdminWedding `date`).
const shortDateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "14 Jun 2026" from a "YYYY-MM-DD" date string, or "—" when unset/invalid. */
function formatEventDate(value: string | null): string {
  if (!value) {
    return "—";
  }
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) {
    return "—";
  }
  return shortDateFmt.format(new Date(y, m - 1, d));
}

/** "14 Jun 2026" from a Date (for promos.validUntil, a timestamptz), or "—". */
function formatTimestampDate(value: Date | null): string {
  if (!value) {
    return "—";
  }
  return shortDateFmt.format(value);
}

/** Pad a palette to exactly three colors so the UI's fixed 3-swatch row is safe. */
function paletteTriple(palette: string[]): [string, string, string] {
  const fallback = "#1B1F18";
  return [palette[0] ?? fallback, palette[1] ?? fallback, palette[2] ?? fallback];
}

// ─────────────────────────────────────────────────────────────────
// 1 · Admin user (from the session)
// ─────────────────────────────────────────────────────────────────

export type AdminUser = {
  name: string;
  email: string;
  roleLabel: string;
  initials: string;
};

/**
 * The signed-in admin's identity for the shell header. Returns `null` when the
 * caller is not an admin. `name` falls back to the email when unset.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const admin = await requireAdmin();
  if (!admin) {
    return null;
  }
  return {
    name: admin.name?.trim() || admin.email,
    email: admin.email,
    roleLabel: "Super Admin",
    initials: initialsOf(admin.name, admin.email),
  };
}

// ─────────────────────────────────────────────────────────────────
// 3 · Weddings (AdminWedding-shaped)
// ─────────────────────────────────────────────────────────────────

// The mock `AdminWedding` types `id: number` and narrow `pkg`/`status` unions;
// real rows use the wedding's uuid string and a free package name, so this row
// shape widens those two fields. Everything else matches the mock 1:1.
export type AdminWeddingRow = {
  id: string;
  couple: string;
  slug: string;
  pkg: string;
  status: "draft" | "pending" | "live" | "expired";
  date: string;
  paid: number;
  customer: string;
  city: string;
  template: string;
};

/**
 * All non-deleted weddings joined to owner + package + template, newest first.
 * `paid` is the sum of that wedding's PAID orders (rupiah int). Empty when the
 * caller is not an admin.
 */
export async function getAdminWeddings(): Promise<AdminWeddingRow[]> {
  const admin = await requireAdmin();
  if (!admin) {
    return [];
  }

  const rows = await db
    .select({
      id: weddings.id,
      groomName: weddings.groomName,
      brideName: weddings.brideName,
      slug: weddings.slug,
      status: weddings.status,
      eventDate: weddings.eventDate,
      city: weddings.city,
      customer: users.email,
      pkg: packages.name,
      template: templates.name,
      // Paid total per wedding via a correlated FILTER aggregate sub-select on
      // orders (avoids fanning the row out across multiple order joins).
      paid: sql<number>`coalesce((
        select sum(${orders.amount})
        from ${orders}
        where ${orders.weddingId} = ${weddings.id}
          and ${orders.status} = 'paid'
      ), 0)::int`,
    })
    .from(weddings)
    .innerJoin(users, eq(weddings.userId, users.id))
    .leftJoin(packages, eq(weddings.packageId, packages.id))
    .leftJoin(templates, eq(weddings.templateId, templates.id))
    .where(isNull(weddings.deletedAt))
    .orderBy(desc(weddings.createdAt));

  return rows.map((r) => ({
    id: r.id,
    couple: `${r.groomName} & ${r.brideName}`,
    slug: r.slug,
    pkg: r.pkg ?? "—",
    status: r.status,
    date: formatEventDate(r.eventDate),
    paid: r.paid ?? 0,
    customer: r.customer,
    city: r.city?.trim() || "—",
    template: r.template ?? "—",
  }));
}

// ─────────────────────────────────────────────────────────────────
// 3b · Users (customers) — account-centric, complements the weddings table
// ─────────────────────────────────────────────────────────────────

// One row per CUSTOMER account (role = 'customer'). Includes deactivated
// accounts (deletedAt set) so the admin can see + restore them; `active`
// distinguishes them. `weddings` = non-deleted weddings owned; `spent` = sum of
// that user's PAID orders (rupiah int).
export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** Relative Indonesian signup label, e.g. "3 hari lalu". */
  joined: string;
  weddings: number;
  spent: number;
  /** false when the account is soft-deleted (deactivated). */
  active: boolean;
  initials: string;
};

/**
 * All customer accounts (incl. deactivated), newest first, each with their
 * wedding count + total paid. Empty when the caller is not an admin.
 */
export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const admin = await requireAdmin();
  if (!admin) {
    return [];
  }

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      createdAt: users.createdAt,
      deletedAt: users.deletedAt,
      // Non-deleted weddings owned by this user.
      weddings: sql<number>`coalesce((
        select count(*)
        from ${weddings}
        where ${weddings.userId} = ${users.id}
          and ${weddings.deletedAt} is null
      ), 0)::int`,
      // Sum of this user's PAID orders.
      spent: sql<number>`coalesce((
        select sum(${orders.amount})
        from ${orders}
        where ${orders.userId} = ${users.id}
          and ${orders.status} = 'paid'
      ), 0)::int`,
    })
    .from(users)
    .where(eq(users.role, "customer"))
    .orderBy(desc(users.createdAt));

  return rows.map((r) => ({
    id: r.id,
    name: r.name?.trim() || r.email,
    email: r.email,
    phone: r.phone?.trim() || "—",
    joined: relativeTimeId(r.createdAt),
    weddings: r.weddings ?? 0,
    spent: r.spent ?? 0,
    active: r.deletedAt == null,
    initials: initialsOf(r.name, r.email),
  }));
}

// ─────────────────────────────────────────────────────────────────
// 4 · Orders (AdminTransaction-shaped)
// ─────────────────────────────────────────────────────────────────

// Mirrors the mock `AdminTransaction`. `id` is the invoice number (display).
// `rowId` is the real `orders.id` UUID — required by adminSetOrderStatus.
export type AdminTransactionRow = {
  rowId: string;
  id: string;
  customer: string;
  couple: string;
  pkg: string;
  amount: number;
  method: string;
  status: "pending" | "paid" | "failed" | "refunded";
  time: string;
};

/**
 * All orders joined to the buyer + (optional) wedding + package, newest first.
 * `time` is a relative Indonesian label. Empty when not an admin.
 */
export async function getAdminOrders(): Promise<AdminTransactionRow[]> {
  const admin = await requireAdmin();
  if (!admin) {
    return [];
  }

  const rows = await db
    .select({
      rowId: orders.id,
      invoiceNo: orders.invoiceNo,
      customer: users.name,
      customerEmail: users.email,
      groomName: weddings.groomName,
      brideName: weddings.brideName,
      pkg: packages.name,
      amount: orders.amount,
      method: orders.method,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .leftJoin(weddings, eq(orders.weddingId, weddings.id))
    .leftJoin(packages, eq(orders.packageId, packages.id))
    .orderBy(desc(orders.createdAt));

  return rows.map((r) => ({
    rowId: r.rowId,
    id: r.invoiceNo,
    customer: r.customer?.trim() || r.customerEmail,
    couple: r.groomName && r.brideName ? `${r.groomName} & ${r.brideName}` : "—",
    pkg: r.pkg ?? "—",
    amount: r.amount,
    method: r.method?.trim() || "—",
    status: r.status,
    time: relativeTimeId(r.createdAt),
  }));
}

// ─────────────────────────────────────────────────────────────────
// 5 · Templates (AdminTemplate-shaped)
// ─────────────────────────────────────────────────────────────────

// Mirrors the mock `AdminTemplate`. `id` is the slug; `category` is widened to
// `string` since the DB column is free text (the mock uses a 4-value union).
export type AdminTemplateRow = {
  /** Slug — also the MiniInvite palette key + React key. */
  id: string;
  /** Real UUID — required by the edit / set-cover actions. */
  templateId: string;
  name: string;
  style: string;
  category: string;
  uses: number;
  status: "published" | "draft";
  featured: boolean;
  new: boolean;
  palette: [string, string, string];
  /** Presigned GET URL for the admin-uploaded cover, or null (use static thumb). */
  coverUrl: string | null;
};

/**
 * All non-deleted templates (incl. drafts), with `uses` = count of non-deleted
 * weddings referencing each. Featured first, then new, then name. Empty when
 * not an admin.
 */
export async function getAdminTemplates(): Promise<AdminTemplateRow[]> {
  const admin = await requireAdmin();
  if (!admin) {
    return [];
  }

  const rows = await db
    .select({
      id: templates.id,
      slug: templates.slug,
      name: templates.name,
      style: templates.style,
      category: templates.category,
      status: templates.status,
      featured: templates.featured,
      isNew: templates.isNew,
      palette: templates.palette,
      coverKey: templates.coverKey,
      uses: sql<number>`coalesce((
        select count(*)
        from ${weddings}
        where ${weddings.templateId} = ${templates.id}
          and ${weddings.deletedAt} is null
      ), 0)::int`,
    })
    .from(templates)
    .where(isNull(templates.deletedAt))
    .orderBy(desc(templates.featured), desc(templates.isNew), templates.name);

  // Sign a presigned GET per uploaded cover (in parallel).
  return Promise.all(
    rows.map(async (r) => ({
      id: r.slug,
      templateId: r.id,
      name: r.name,
      style: r.style?.trim() || "",
      category: r.category?.trim() || "",
      uses: r.uses ?? 0,
      status: r.status,
      featured: r.featured,
      new: r.isNew,
      palette: paletteTriple(r.palette),
      coverUrl: r.coverKey ? await getViewUrl(r.coverKey) : null,
    })),
  );
}

// ─────────────────────────────────────────────────────────────────
// 6 · Packages (AdminPackage-shaped)
// ─────────────────────────────────────────────────────────────────

// Mirrors the mock `AdminPackage`. `id` is the slug; `name` is widened to
// `string`. `guests = -1` means unlimited (matches the mock convention).
export type AdminPackageRow = {
  id: string;
  /** Real UUID — required by the create/edit/toggle package actions. */
  packageId: string;
  /** Real slug — locked on edit; equal to `id` (kept distinct for clarity). */
  slug: string;
  name: string;
  price: number;
  days: number;
  /** Guest limit; `-1` means unlimited (matches the mock display convention). */
  guests: number;
  /** Photo limit; `null` means unlimited (raw DB value, for the edit form). */
  photoLimit: number | null;
  tagline: string;
  active: boolean;
  featured: boolean;
  sold: number;
  perks: string[];
};

/**
 * All packages, with `sold` = count of non-deleted weddings on each. Ordered by
 * the catalog `sortOrder`. Empty when not an admin.
 */
export async function getAdminPackages(): Promise<AdminPackageRow[]> {
  const admin = await requireAdmin();
  if (!admin) {
    return [];
  }

  const rows = await db
    .select({
      id: packages.id,
      slug: packages.slug,
      name: packages.name,
      price: packages.price,
      durationDays: packages.durationDays,
      guestLimit: packages.guestLimit,
      photoLimit: packages.photoLimit,
      tagline: packages.tagline,
      active: packages.active,
      featured: packages.featured,
      perks: packages.perks,
      sold: sql<number>`coalesce((
        select count(*)
        from ${weddings}
        where ${weddings.packageId} = ${packages.id}
          and ${weddings.deletedAt} is null
      ), 0)::int`,
    })
    .from(packages)
    .orderBy(packages.sortOrder);

  return rows.map((r) => ({
    id: r.slug,
    packageId: r.id,
    slug: r.slug,
    name: r.name,
    price: r.price,
    days: r.durationDays,
    guests: r.guestLimit ?? -1,
    photoLimit: r.photoLimit,
    tagline: r.tagline?.trim() || "",
    active: r.active,
    featured: r.featured,
    sold: r.sold ?? 0,
    perks: r.perks,
  }));
}

// ─────────────────────────────────────────────────────────────────
// 7 · Team (AdminTeamMember-shaped)
// ─────────────────────────────────────────────────────────────────

// Mirrors the mock `AdminTeamMember`. There is NO last-active tracking in the
// schema, so `lastActive` is always "—" (never faked). `userId` is the real
// uuid (required by updateAdminRole); `adminRole` is the raw enum value (drives
// the inline role <select>); `roleLabel` is the display name.
export type AdminSubRole = "super_admin" | "support" | "finance" | "designer";

export type AdminTeamRow = {
  userId: string;
  name: string;
  email: string;
  adminRole: AdminSubRole;
  /** Display label for `adminRole` (e.g. "Super Admin"). */
  role: string;
  lastActive: string;
  you: boolean;
};

// Single source of truth for sub-role → Indonesian display label.
const ADMIN_ROLE_LABEL: Record<AdminSubRole, string> = {
  super_admin: "Super Admin",
  support: "Support",
  finance: "Finance",
  designer: "Designer",
};

/** Map a nullable adminRole column to its label; null defaults to Super Admin. */
function roleLabelOf(role: AdminSubRole | null): string {
  return ADMIN_ROLE_LABEL[role ?? "super_admin"];
}

/**
 * All non-deleted admin users. `you` marks the signed-in admin's own row.
 * `lastActive` is "—" (no real source exists). A null `adminRole` (legacy admins
 * pre-RBAC) is treated as super_admin. Empty when not an admin.
 */
export async function getAdminTeam(): Promise<AdminTeamRow[]> {
  const admin = await requireAdmin();
  if (!admin) {
    return [];
  }

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      adminRole: users.adminRole,
    })
    .from(users)
    .where(and(eq(users.role, "admin"), isNull(users.deletedAt)))
    .orderBy(users.createdAt);

  return rows.map((r) => {
    const adminRole = (r.adminRole ?? "super_admin") as AdminSubRole;
    return {
      userId: r.id,
      name: r.name?.trim() || r.email,
      email: r.email,
      adminRole,
      role: ADMIN_ROLE_LABEL[adminRole],
      lastActive: "—",
      you: r.email === admin.email,
    };
  });
}

// ─────────────────────────────────────────────────────────────────
// 7b · Pending team invites
// ─────────────────────────────────────────────────────────────────

export type TeamInviteRow = {
  id: string;
  email: string;
  roleLabel: string;
  /** "14 Jun 2026" — when the invite expires. */
  expiresAt: string;
  /** Accept link (AUTH_URL + token) for the copy button. */
  inviteUrl: string;
};

/**
 * Pending invites only (status = "pending"), newest first. `inviteUrl` is built
 * from AUTH_URL + token so the UI can re-copy the link. Empty when not an admin.
 */
export async function getTeamInvites(): Promise<TeamInviteRow[]> {
  const admin = await requireAdmin();
  if (!admin) {
    return [];
  }

  const rows = await db
    .select({
      id: teamInvites.id,
      email: teamInvites.email,
      adminRole: teamInvites.adminRole,
      token: teamInvites.token,
      expiresAt: teamInvites.expiresAt,
    })
    .from(teamInvites)
    .where(eq(teamInvites.status, "pending"))
    .orderBy(desc(teamInvites.createdAt));

  const base = process.env.AUTH_URL ?? "";

  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    roleLabel: roleLabelOf(r.adminRole),
    expiresAt: formatTimestampDate(r.expiresAt),
    inviteUrl: `${base}/invite/${r.token}`,
  }));
}

// ─────────────────────────────────────────────────────────────────
// 8 · Promos (AdminPromo-shaped, with EFFECTIVE status computed at read time)
// ─────────────────────────────────────────────────────────────────

// The effective promo status the UI renders (AdminStatus supports all four).
// Note: this widens the mock `PromoStatus` ("active" | "exhausted" | "draft")
// to add "expired", which the auto-expiry timer can produce.
export type EffectivePromoStatus = "active" | "exhausted" | "expired" | "draft";

// Mirrors the mock `AdminPromo`, EXTENDED with the raw `id` (so the UI can
// toggle/delete) and a widened `status`. `quota` is `number | null` (null =
// unlimited) — the mock used `number`, but real promos can be unlimited; the
// UI-swap step renders unlimited explicitly instead of dividing by it.
export type AdminPromoRow = {
  id: string;
  code: string;
  off: string;
  scope: string;
  used: number;
  quota: number | null;
  until: string;
  status: EffectivePromoStatus;
};

/**
 * All non-deleted promos, newest first, each with its EFFECTIVE status:
 *   - !active                        → "draft"
 *   - validUntil != null && < now    → "expired"
 *   - quota != null && used >= quota → "exhausted"
 *   - otherwise                      → "active"
 * Empty when not an admin.
 */
export async function getAdminPromos(): Promise<AdminPromoRow[]> {
  const admin = await requireAdmin();
  if (!admin) {
    return [];
  }

  const rows = await db
    .select({
      id: promos.id,
      code: promos.code,
      discountType: promos.discountType,
      discountValue: promos.discountValue,
      scope: promos.scope,
      quota: promos.quota,
      used: promos.used,
      validUntil: promos.validUntil,
      active: promos.active,
    })
    .from(promos)
    .where(isNull(promos.deletedAt))
    .orderBy(desc(promos.createdAt));

  const now = Date.now();

  return rows.map((r) => {
    const status: EffectivePromoStatus = !r.active
      ? "draft"
      : r.validUntil && r.validUntil.getTime() < now
        ? "expired"
        : r.quota != null && r.used >= r.quota
          ? "exhausted"
          : "active";

    const off =
      r.discountType === "percent" ? `${r.discountValue}%` : rupiah(r.discountValue);

    return {
      id: r.id,
      code: r.code,
      off,
      scope: r.scope?.trim() || "Semua paket",
      used: r.used,
      quota: r.quota,
      until: formatTimestampDate(r.validUntil),
      status,
    };
  });
}

// ─────────────────────────────────────────────────────────────────
// 2 · Overview KPIs + recent panels
// ─────────────────────────────────────────────────────────────────

export type AdminOverview = {
  /** Sum of orders.amount paid within the current calendar month (rupiah int). */
  revenueThisMonth: number;
  /** Non-deleted weddings with status 'live'. */
  weddingsLive: number;
  /** All non-deleted weddings. */
  weddingsTotal: number;
  /** Non-deleted users created in the last 7 days. */
  signupsThisWeek: number;
  /** round(weddingsLive / weddingsTotal * 100); 0 when there are no weddings. */
  conversionPct: number;
  /** No real source (no ticketing system) → always 0, never a mock number. */
  supportOpen: number;
  /** Recent weddings for the overview's "Undangan baru" panel (top 5). */
  recentWeddings: AdminWeddingRow[];
  /** Recent transactions for the overview's "Transaksi terakhir" panel (top 5). */
  recentTransactions: AdminTransactionRow[];
  /** Today's paid revenue (rupiah int) — drives the "Hari ini" total. */
  revenueToday: number;
};

/**
 * Overview KPIs + the recent-weddings / recent-transactions panels, all from
 * real data. Reuses the weddings/orders getters for the recent panels (already
 * admin-gated). Returns `null` when the caller is not an admin.
 */
export async function getAdminOverview(): Promise<AdminOverview | null> {
  const admin = await requireAdmin();
  if (!admin) {
    return null;
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);

  // KPI aggregates in single round-trips (FILTER aggregates where helpful).
  const [revenueRows, weddingRows, signupRows, recentWeddings, recentOrders] =
    await Promise.all([
      db
        .select({
          month: sql<number>`coalesce(sum(${orders.amount}) filter (where ${orders.createdAt} >= ${monthStart}), 0)::int`,
          today: sql<number>`coalesce(sum(${orders.amount}) filter (where ${orders.createdAt} >= ${dayStart}), 0)::int`,
        })
        .from(orders)
        .where(eq(orders.status, "paid")),
      db
        .select({
          total: sql<number>`count(*)::int`,
          live: sql<number>`count(*) filter (where ${weddings.status} = 'live')::int`,
        })
        .from(weddings)
        .where(isNull(weddings.deletedAt)),
      db
        .select({ signups: sql<number>`count(*)::int` })
        .from(users)
        .where(and(isNull(users.deletedAt), gte(users.createdAt, weekAgo))),
      getAdminWeddings(),
      getAdminOrders(),
    ]);

  const revenueThisMonth = revenueRows[0]?.month ?? 0;
  const revenueToday = revenueRows[0]?.today ?? 0;
  const weddingsTotal = weddingRows[0]?.total ?? 0;
  const weddingsLive = weddingRows[0]?.live ?? 0;
  const signupsThisWeek = signupRows[0]?.signups ?? 0;
  const conversionPct =
    weddingsTotal > 0 ? Math.round((weddingsLive / weddingsTotal) * 100) : 0;

  return {
    revenueThisMonth,
    weddingsLive,
    weddingsTotal,
    signupsThisWeek,
    conversionPct,
    supportOpen: 0,
    recentWeddings: recentWeddings.slice(0, 5),
    recentTransactions: recentOrders.slice(0, 5),
    revenueToday,
  };
}

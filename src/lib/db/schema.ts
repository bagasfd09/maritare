import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// Type-only imports (erased at runtime) so the seed script can run under Node's
// TS type-stripping, which doesn't resolve path aliases for runtime imports.
import type { TemplateManifest } from "@/lib/invitation/manifest";
import type { NotificationPrefs } from "@/lib/notifications";

// ─────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────

export const userRole = pgEnum("user_role", ["customer", "admin"]);
export const weddingStatus = pgEnum("wedding_status", ["draft", "pending", "live", "expired"]);
export const guestStatus = pgEnum("guest_status", ["pending", "confirmed", "declined"]);
export const invitationStatus = pgEnum("invitation_status", ["none", "sent", "opened"]);
export const wishStatus = pgEnum("wish_status", ["pending", "approved", "hidden"]);
export const orderStatus = pgEnum("order_status", ["pending", "paid", "failed", "refunded"]);
export const templateStatus = pgEnum("template_status", ["draft", "published"]);
export const promoDiscountType = pgEnum("promo_discount_type", ["percent", "fixed"]);
// Admin sub-roles (RBAC). Only meaningful for users whose `role` is "admin".
export const adminRole = pgEnum("admin_role", ["super_admin", "support", "finance", "designer"]);
export const inviteStatus = pgEnum("invite_status", ["pending", "accepted", "revoked"]);
export const ticketStatus = pgEnum("ticket_status", ["open", "closed"]);
// Role of a user within a wedding. Single value for now (both partners are equal
// owners); extend with editor/viewer later if delegation is ever needed.
export const weddingMemberRole = pgEnum("wedding_member_role", ["owner"]);

// ─────────────────────────────────────────────────────────────────
// Auth.js tables (DrizzleAdapter)
// ─────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true, mode: "date" }),
  image: text("image"),
  // Scrypt password hash for email+password login (null for OAuth-only users).
  passwordHash: text("password_hash"),
  role: userRole("role").default("customer").notNull(),
  // Admin sub-role (RBAC) — null for non-admins; admins default to super_admin.
  adminRole: adminRole("admin_role"),
  phone: text("phone"),
  // Account-level email/WhatsApp notification preferences (per kind).
  // Default literal kept in sync with DEFAULT_NOTIFICATION_PREFS in
  // src/lib/notifications.ts (inlined so schema.ts has no runtime alias import).
  notificationPrefs: jsonb("notification_prefs")
    .$type<NotificationPrefs>()
    .default({
      rsvp: { email: true, wa: true },
      wishes: { email: true, wa: false },
      gift: { email: true, wa: true },
      reminder: { email: true, wa: true },
      tips: { email: false, wa: false },
    })
    .notNull(),
  // Per-user WhatsApp invite template edits, keyed by wedding id then template
  // id ("undangan" | "reminder" | "terimakasih"). Only texts that diverge from
  // the generated defaults are stored.
  waTemplates: jsonb("wa_templates")
    .$type<Record<string, Record<string, string>>>()
    .default({})
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true, mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

// ─────────────────────────────────────────────────────────────────
// Catalog: packages & templates (admin-managed, public-readable)
// ─────────────────────────────────────────────────────────────────

export const packages = pgTable("packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(), // "silver" | "gold" | "platinum"
  name: text("name").notNull(),
  // Money in IDR as integers (rupiah, no decimals) per project convention.
  price: integer("price").notNull(),
  durationDays: integer("duration_days").notNull(),
  guestLimit: integer("guest_limit"), // null = unlimited
  photoLimit: integer("photo_limit"), // null = unlimited
  // How many reception/kiosk attendant tokens this package allows.
  guestbookLimit: integer("guestbook_limit").default(1).notNull(),
  tagline: text("tagline"),
  perks: jsonb("perks").$type<string[]>().default([]).notNull(),
  featured: boolean("featured").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(), // "garden", "oxblood", …
  name: text("name").notNull(),
  style: text("style"),
  category: text("category"), // Editorial | Romantic | Rustic | Minimal
  palette: jsonb("palette").$type<string[]>().default([]).notNull(),
  status: templateStatus("status").default("draft").notNull(),
  featured: boolean("featured").default(false).notNull(),
  isNew: boolean("is_new").default(false).notNull(),
  // Declares which editor form groups + photo slots this template exposes.
  // Authoritative source; renderer/editor fall back to DEFAULT_MANIFEST if empty.
  manifest: jsonb("manifest")
    .$type<TemplateManifest>()
    .default({ formGroups: [], photoSlots: [] })
    .notNull(),
  // R2 object key for an admin-uploaded cover/thumbnail (null = use the baked-in
  // static thumbnail). Rendered via a short-lived presigned GET URL.
  coverKey: text("cover_key"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─────────────────────────────────────────────────────────────────
// Weddings — the core entity. Editor section content lives in a
// jsonb document keyed by section id ("pasangan", "acara", "cerita",
// "galeri", "amplop", "musik", "rsvp") so the 7-chapter editor maps
// 1:1 without extra tables.
// ─────────────────────────────────────────────────────────────────

export type WeddingSections = Record<
  string,
  {
    title?: string;
    body?: string;
    done?: boolean;
    /** section-specific extras (timeline events, bank accounts, song url, …) */
    data?: Record<string, unknown>;
  }
>;

export const weddings = pgTable(
  "weddings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // The CREATOR / billing contact (the account that first made this wedding).
    // Authorization is NOT derived from this column — it lives in wedding_members
    // (a wedding can have two equal owners). Kept for billing (orders.userId) and
    // as the immutable creator pointer.
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Shareable code a partner enters at onboarding to join as the 2nd owner.
    // Unambiguous 6-char code (see generateGuestCode); nullable only for backfill.
    inviteCode: text("invite_code").unique(),
    slug: text("slug").notNull(),
    groomName: text("groom_name").notNull(),
    brideName: text("bride_name").notNull(),
    eventDate: date("event_date"),
    venue: text("venue"),
    city: text("city"),
    templateId: uuid("template_id").references(() => templates.id, { onDelete: "set null" }),
    packageId: uuid("package_id").references(() => packages.id, { onDelete: "set null" }),
    status: weddingStatus("status").default("draft").notNull(),
    sections: jsonb("sections").$type<WeddingSections>().default({}).notNull(),
    // Publish is an explicit customer action gated by paid status — never automatic.
    publishedAt: timestamp("published_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    visitCount: integer("visit_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("weddings_slug_unique").on(t.slug)],
);

// Membership join: which users may manage a wedding. The product allows TWO
// equal owners (groom + bride); authorization is derived from a row here, never
// from weddings.userId directly. Hard-deleted on "remove partner" (internal join
// row; the wedding + creator pointer survive), so the unique index stays simple.
export const weddingMembers = pgTable(
  "wedding_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: weddingMemberRole("role").default("owner").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("wedding_members_wedding_user_unique").on(t.weddingId, t.userId)],
);

// ─────────────────────────────────────────────────────────────────
// Guests & RSVP
// ─────────────────────────────────────────────────────────────────

export const guests = pgTable("guests", {
  id: uuid("id").primaryKey().defaultRandom(),
  weddingId: uuid("wedding_id")
    .notNull()
    .references(() => weddings.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // Short, URL-friendly per-guest code for the personalized invite link
  // (/inv/<slug>?g=<code>). Globally unique so it resolves to exactly one guest;
  // the in-invitation check-in QR still encodes the guest UUID, not this code.
  // Nullable only to allow the backfill migration; every insert path populates it.
  code: text("code").unique(),
  group: text("group"),
  phone: text("phone"),
  // Free-text side: "groom" | "bride" | "both" are canonical (drive labels,
  // gift filtering, petugas scoping); customers may add custom values.
  side: text("side").default("both").notNull(),
  status: guestStatus("status").default("pending").notNull(),
  // pax the guest is expected/confirmed to bring (incl. themselves)
  partySize: integer("party_size"),
  foodChoice: text("food_choice"),
  invitationStatus: invitationStatus("invitation_status").default("none").notNull(),
  isWalkIn: boolean("is_walk_in").default(false).notNull(),
  note: text("note"),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
  checkedInPartySize: integer("checked_in_party_size"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// Individual RSVP responses (a guest can re-submit; latest wins in app logic).
export const rsvps = pgTable("rsvps", {
  id: uuid("id").primaryKey().defaultRandom(),
  weddingId: uuid("wedding_id")
    .notNull()
    .references(() => weddings.id, { onDelete: "cascade" }),
  guestId: uuid("guest_id").references(() => guests.id, { onDelete: "set null" }),
  attending: boolean("attending").notNull(),
  partySize: integer("party_size").default(1).notNull(),
  foodChoice: text("food_choice"),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─────────────────────────────────────────────────────────────────
// Wishes (buku ucapan)
// ─────────────────────────────────────────────────────────────────

export const wishes = pgTable("wishes", {
  id: uuid("id").primaryKey().defaultRandom(),
  weddingId: uuid("wedding_id")
    .notNull()
    .references(() => weddings.id, { onDelete: "cascade" }),
  guestId: uuid("guest_id").references(() => guests.id, { onDelete: "set null" }),
  fromName: text("from_name").notNull(),
  body: text("body").notNull(),
  attending: boolean("attending"),
  status: wishStatus("status").default("pending").notNull(),
  pinned: boolean("pinned").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─────────────────────────────────────────────────────────────────
// Photos (gallery; bytes live in R2, we store the object key)
// ─────────────────────────────────────────────────────────────────

export const photos = pgTable("photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  weddingId: uuid("wedding_id")
    .notNull()
    .references(() => weddings.id, { onDelete: "cascade" }),
  objectKey: text("object_key").notNull(),
  label: text("label"),
  isCover: boolean("is_cover").default(false).notNull(),
  // Dedicated "closing" photo shown in the footnote/closing section. Like
  // isCover, at most one per wedding; when unset the closing section falls back
  // to the cover photo. Kept out of the gallery grid (same as the cover).
  isClosing: boolean("is_closing").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─────────────────────────────────────────────────────────────────
// Orders (Midtrans payments; money = integer rupiah)
// ─────────────────────────────────────────────────────────────────

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceNo: text("invoice_no").notNull().unique(), // "MTR-2026-0287"
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  weddingId: uuid("wedding_id").references(() => weddings.id, { onDelete: "set null" }),
  packageId: uuid("package_id").references(() => packages.id, { onDelete: "set null" }),
  description: text("description"),
  amount: integer("amount").notNull(),
  method: text("method"), // "Midtrans · BCA VA", "Manual · Mandiri", …
  status: orderStatus("status").default("pending").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────
// Promos (discount codes; admin-managed). Auto-expire via `validUntil`:
// the EFFECTIVE status (draft/active/expired/exhausted) is derived at read time
// from `active` + `validUntil` + `used`/`quota`, so a promo "dies" on its own
// once the timer passes — no cron needed.
// ─────────────────────────────────────────────────────────────────

export const promos = pgTable("promos", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(), // uppercase coupon code, e.g. "MARIT2026"
  discountType: promoDiscountType("discount_type").notNull(), // percent | fixed
  // percent: 1–100 ; fixed: rupiah amount (integer, no decimals)
  discountValue: integer("discount_value").notNull(),
  scope: text("scope"), // human label, e.g. "Semua paket" / "Gold + Platinum"
  quota: integer("quota"), // max redemptions; null = unlimited
  used: integer("used").default(0).notNull(),
  // The timer: after this instant the promo is automatically expired. null = no expiry.
  validUntil: timestamp("valid_until", { withTimezone: true }),
  // Manual on/off. false = draft (not yet live). Effective status also factors timer/quota.
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─────────────────────────────────────────────────────────────────
// Admin platform: team invites, audit log, support tickets, settings
// ─────────────────────────────────────────────────────────────────

// Pending invitations to join the admin team. Accepting (via /invite/<token>)
// creates/promotes the user with the assigned adminRole.
export const teamInvites = pgTable("team_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  adminRole: adminRole("admin_role").notNull(),
  token: text("token").notNull().unique(),
  status: inviteStatus("status").default("pending").notNull(),
  invitedByUserId: uuid("invited_by_user_id").references(() => users.id, { onDelete: "set null" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Append-only admin action log (who did what, when). Internal — hard-deleteable.
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  actorEmail: text("actor_email"),
  action: text("action").notNull(), // e.g. "order.status", "wedding.delete"
  targetType: text("target_type"), // e.g. "order", "wedding", "template"
  targetId: text("target_id"),
  summary: text("summary").notNull(), // human line, Bahasa
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Customer support tickets (created from the customer dashboard; managed in /admin/support).
export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  fromName: text("from_name").notNull(),
  fromEmail: text("from_email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: ticketStatus("status").default("open").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Reception/kiosk attendant access tokens. Each token lets a "Petugas Resepsi"
// run the guestbook kiosk WITHOUT a dashboard account — auth is the token code,
// scoped to the wedding. Single active device per token: `sessionNonce` holds
// the current device's session secret; a login elsewhere overwrites it, which
// kicks the previous device (its cookie nonce no longer matches).
export const guestbookTokens = pgTable("guestbook_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  weddingId: uuid("wedding_id")
    .notNull()
    .references(() => weddings.id, { onDelete: "cascade" }),
  label: text("label").notNull(), // e.g. "Meja Depan"
  code: text("code").notNull().unique(), // login code given to the attendant
  sessionNonce: text("session_nonce"), // current active device's session secret (null = logged out)
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  lastDevice: text("last_device"), // short user-agent label of the active device
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }), // revoke = soft delete
});

// Singleton app/admin settings (one row; keyed by a fixed id).
export const appSettings = pgTable("app_settings", {
  id: text("id").primaryKey().default("singleton"),
  brandName: text("brand_name"),
  supportEmail: text("support_email"),
  supportWhatsapp: text("support_whatsapp"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

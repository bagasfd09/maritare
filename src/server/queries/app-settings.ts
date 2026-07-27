// Server-only data access for the singleton app/admin settings row.
//
// Reads the single `app_settings` row (id = "singleton"). Admin-gated with the
// same in-module `requireAdmin()` guard used across the admin getters
// (defense-in-depth on top of the (admin) layout's session/role gate). Returns
// `null` ONLY when the caller is not an admin; when admin-but-no-row-yet it
// returns the defaults so the settings form always has something to render.
//
// This module imports the db + auth and must only ever be imported from Server
// Components / Server Actions.

import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";

// ─────────────────────────────────────────────────────────────────
// Admin gate (defense-in-depth) — copied from src/server/queries/admin.ts
// ─────────────────────────────────────────────────────────────────

/** The minimal admin identity every getter needs from the session. */
type AdminSessionUser = {
  id: string;
  name: string | null;
  email: string;
};

/**
 * Resolve the signed-in admin from the session, or `null` when there is no
 * session or the user is not an admin.
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

export type AppSettings = {
  brandName: string;
  supportEmail: string;
  supportWhatsapp: string;
  /** Payment channel ids switched off at checkout. */
  disabledChannels: string[];
};

/** Defaults when the singleton row does not exist yet. */
const DEFAULTS: AppSettings = {
  brandName: "Maritare",
  supportEmail: "",
  supportWhatsapp: "",
  disabledChannels: [],
};

/**
 * Payment channels the admin has switched off — read by the CUSTOMER checkout
 * path, so deliberately NOT admin-gated (unlike `getAppSettings` below, whose
 * `null` is the not-an-admin signal). Nothing here is sensitive: it is the same
 * set of choices the picker renders.
 */
export async function getDisabledPaymentChannels(): Promise<string[]> {
  const row = await db.query.appSettings.findFirst({
    columns: { disabledPaymentChannels: true },
    where: eq(appSettings.id, "singleton"),
  });
  return row?.disabledPaymentChannels ?? [];
}

/**
 * The current platform settings for the admin Settings screen. Returns `null`
 * only when the caller is not an admin. When admin but the singleton row is
 * absent, returns the defaults; nullable columns are mapped to "".
 */
export async function getAppSettings(): Promise<AppSettings | null> {
  const admin = await requireAdmin();
  if (!admin) {
    return null;
  }

  const row = await db.query.appSettings.findFirst({
    where: eq(appSettings.id, "singleton"),
  });
  if (!row) {
    return DEFAULTS;
  }

  return {
    brandName: row.brandName ?? DEFAULTS.brandName,
    supportEmail: row.supportEmail ?? "",
    supportWhatsapp: row.supportWhatsapp ?? "",
    disabledChannels: row.disabledPaymentChannels ?? [],
  };
}

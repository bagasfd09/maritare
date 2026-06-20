// Server-only data access for the admin audit log.
//
// Mirrors `src/server/queries/admin.ts`: every getter resolves the session via
// `requireAdmin()` (defense-in-depth on top of the (admin) layout's role gate)
// and returns a neutral value (here: `null`) when the caller is not an admin.
// Read-only; this module imports db + auth and must only be imported from
// Server Components / Server Actions.

import { desc } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import { relativeTimeId } from "@/lib/datetime";

// ─────────────────────────────────────────────────────────────────
// Admin gate (defense-in-depth) — copied from queries/admin.ts
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
 * gate; this is a second, in-module guard so this getter can never leak admin
 * data to a non-admin.
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
// Audit log entries
// ─────────────────────────────────────────────────────────────────

// One row of the audit feed, shaped for the admin screen. `actorEmail`,
// `targetType` and `targetId` are nullable (the column allows nulls, e.g. a
// missing session at write time or an action with no specific target).
export type AuditEntry = {
  id: string;
  actorEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  summary: string;
  /** Relative Indonesian label, e.g. "5 mnt lalu" / "kemarin" / "14 Jun". */
  time: string;
};

/**
 * The 100 most recent audit entries, newest first. Returns `null` when the
 * caller is not an admin.
 */
export async function getAuditLog(): Promise<AuditEntry[] | null> {
  const admin = await requireAdmin();
  if (!admin) {
    return null;
  }

  const rows = await db
    .select({
      id: auditLog.id,
      actorEmail: auditLog.actorEmail,
      action: auditLog.action,
      targetType: auditLog.targetType,
      targetId: auditLog.targetId,
      summary: auditLog.summary,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(100);

  return rows.map((r) => ({
    id: r.id,
    actorEmail: r.actorEmail,
    action: r.action,
    targetType: r.targetType,
    targetId: r.targetId,
    summary: r.summary,
    time: relativeTimeId(r.createdAt),
  }));
}

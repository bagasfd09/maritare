// Server-only data access for the wedding editor.
//
// This module reads the authenticated user's session and resolves the wedding
// they own. It must only ever be imported from Server Components / Server
// Actions — it never accepts a client-supplied wedding id (ownership is always
// derived from the session per AGENTS.md hard rules).

import { and, asc, eq, isNull } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { templates, users, weddings } from "@/lib/db/schema";
import { DEFAULT_MANIFEST, type TemplateManifest } from "@/lib/invitation/manifest";

/** A non-deleted wedding row, including its `sections` jsonb document. */
export type WeddingRow = typeof weddings.$inferSelect;

// Local dev fallback when no session exists. The demo wedding was transferred
// to the owner's real account (2026-06-13). NEVER used in production.
const DEV_FALLBACK_EMAIL = "mbgsfadillah09@gmail.com";

/**
 * Resolve the user id whose wedding the editor should operate on.
 *
 * - With a live session: the signed-in user's id.
 * - Without a session in non-production: the seeded demo user, so the editor
 *   works locally before auth providers are wired up.
 * - Without a session in production: `null` (caller must treat as unauthorized).
 *
 * Shared by `getMyWedding()` and the `saveWeddingSection` server action so both
 * derive ownership identically and never trust a client-supplied id.
 */
export async function resolveEditorUserId(): Promise<string | null> {
  const session = await auth();

  if (session?.user?.id) {
    return session.user.id;
  }

  // DEV FALLBACK: no session yet. Only outside production, resolve the seeded
  // demo user by email so the editor is usable before OAuth/Resend are set up.
  if (!session && process.env.NODE_ENV !== "production") {
    const demoUser = await db.query.users.findFirst({
      columns: { id: true },
      where: and(eq(users.email, DEV_FALLBACK_EMAIL), isNull(users.deletedAt)),
    });
    return demoUser?.id ?? null;
  }

  // Production with no session → unauthorized.
  return null;
}

/**
 * Get the current user's wedding for the editor: the first non-deleted wedding
 * owned by the resolved user, ordered by `createdAt`. Returns `null` when there
 * is no resolvable user (unauthenticated in production) or no wedding exists.
 */
export async function getMyWedding(): Promise<WeddingRow | null> {
  const userId = await resolveEditorUserId();
  if (!userId) {
    return null;
  }

  const wedding = await db.query.weddings.findFirst({
    where: and(eq(weddings.userId, userId), isNull(weddings.deletedAt)),
    orderBy: [asc(weddings.createdAt)],
  });

  return wedding ?? null;
}

/**
 * Resolve a wedding's selected template (slug + manifest) for the editor. Falls
 * back to DEFAULT_MANIFEST when no/retired template so the editor stays usable.
 */
export async function getWeddingTemplateMeta(
  templateId: string | null,
): Promise<{ slug: string | null; manifest: TemplateManifest }> {
  if (!templateId) {
    return { slug: null, manifest: DEFAULT_MANIFEST };
  }
  const tpl = await db.query.templates.findFirst({
    columns: { slug: true, manifest: true },
    where: and(eq(templates.id, templateId), isNull(templates.deletedAt)),
  });
  if (!tpl) {
    return { slug: null, manifest: DEFAULT_MANIFEST };
  }
  const manifest =
    tpl.manifest && tpl.manifest.formGroups.length > 0 ? tpl.manifest : DEFAULT_MANIFEST;
  return { slug: tpl.slug, manifest };
}

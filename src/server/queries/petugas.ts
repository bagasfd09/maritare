// Server-only data access for the "Petugas Resepsi" (reception attendant) menu.
//
// Owner-scoped: resolves the owned wedding from the session (never a
// client-supplied id, per AGENTS.md) and lists that wedding's guestbook tokens
// plus the package quota. A token is "online" when it holds a live session
// nonce (a device is currently signed in). Must only be imported from Server
// Components / Server Actions.

import { and, asc, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { guestbookTokens, packages, weddings } from "@/lib/db/schema";
import { relativeTimeId } from "@/lib/datetime";
import { resolveEditorUserId } from "@/server/queries/wedding";
import {
  getDashboardChrome,
  type DashboardChrome,
} from "@/server/queries/dashboard";

export type PetugasToken = {
  id: string;
  label: string;
  code: string;
  /** A device is currently signed in with this token. */
  online: boolean;
  /** Last device label, e.g. "Chrome · Android". Null until first login. */
  lastDevice: string | null;
  /** Preformatted relative time, e.g. "3 jam lalu". Null until first login. */
  lastSeenLabel: string | null;
};

export type PetugasData = {
  chrome: DashboardChrome | null;
  tokens: PetugasToken[];
  // Monetization: more attendant tokens require a bigger package.
  quota: { used: number; limit: number; packageName: string | null };
};

/**
 * Tokens + quota for the owner's first wedding. Returns `null` when there is no
 * resolvable user (unauthenticated in production) or no owned wedding yet (the
 * page redirects to onboarding in that case).
 */
export async function getPetugasData(): Promise<PetugasData | null> {
  const userId = await resolveEditorUserId();
  if (!userId) {
    return null;
  }

  const [wedding] = await db
    .select({
      id: weddings.id,
      packageName: packages.name,
      limit: packages.guestbookLimit,
    })
    .from(weddings)
    .leftJoin(packages, eq(weddings.packageId, packages.id))
    .where(and(eq(weddings.userId, userId), isNull(weddings.deletedAt)))
    .orderBy(asc(weddings.createdAt))
    .limit(1);

  if (!wedding) {
    return null;
  }

  const rows = await db
    .select({
      id: guestbookTokens.id,
      label: guestbookTokens.label,
      code: guestbookTokens.code,
      sessionNonce: guestbookTokens.sessionNonce,
      lastSeenAt: guestbookTokens.lastSeenAt,
      lastDevice: guestbookTokens.lastDevice,
    })
    .from(guestbookTokens)
    .where(
      and(
        eq(guestbookTokens.weddingId, wedding.id),
        isNull(guestbookTokens.deletedAt),
      ),
    )
    .orderBy(asc(guestbookTokens.createdAt));

  const chrome = await getDashboardChrome();

  const tokens: PetugasToken[] = rows.map((r) => ({
    id: r.id,
    label: r.label,
    code: r.code,
    online: r.sessionNonce !== null,
    lastDevice: r.lastDevice,
    lastSeenLabel: r.lastSeenAt ? relativeTimeId(r.lastSeenAt) : null,
  }));

  return {
    chrome,
    tokens,
    quota: {
      used: tokens.length,
      limit: wedding.limit ?? 1,
      packageName: wedding.packageName ?? null,
    },
  };
}

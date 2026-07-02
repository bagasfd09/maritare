// Server-only data access for the "Grup Tamu" (guest groups) menu.
//
// Owner-scoped: resolves the owned wedding from the session (never a
// client-supplied id, per AGENTS.md). Groups are the DISTINCT free-text
// guests.group labels; the guest_groups table only decorates them with an
// uploaded badge icon. Must only be imported from Server Components / Actions.

import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { guestGroups, guests } from "@/lib/db/schema";
import { publicImageUrl } from "@/lib/image-url";
import { getViewUrl } from "@/lib/r2";
import { resolveMemberWeddingId } from "@/server/queries/wedding";
import {
  getDashboardChrome,
  type DashboardChrome,
} from "@/server/queries/dashboard";

export type GuestGroupRow = {
  name: string;
  guestCount: number;
  /** Display URL for the badge icon; null when the group has none. */
  iconUrl: string | null;
  /** Where the badge renders; only meaningful when iconUrl is set. */
  iconStyle: "name" | "avatar";
};

export type GuestGroupsData = {
  chrome: DashboardChrome | null;
  groups: GuestGroupRow[];
};

/**
 * Distinct guest groups (with member counts) merged with their badge config.
 * A configured group whose label no longer matches any guest is still listed
 * (count 0) so its icon can be removed. Returns `null` when there is no
 * resolvable user or no owned wedding yet.
 */
export async function getGuestGroupsData(): Promise<GuestGroupsData | null> {
  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) {
    return null;
  }

  const [counts, iconRows, chrome] = await Promise.all([
    db
      .select({ name: guests.group, guestCount: sql<number>`count(*)::int` })
      .from(guests)
      .where(
        and(
          eq(guests.weddingId, weddingId),
          isNull(guests.deletedAt),
          sql`${guests.group} is not null and ${guests.group} <> ''`,
        ),
      )
      .groupBy(guests.group),
    db
      .select({
        name: guestGroups.name,
        iconKey: guestGroups.iconKey,
        iconStyle: guestGroups.iconStyle,
      })
      .from(guestGroups)
      .where(eq(guestGroups.weddingId, weddingId)),
    getDashboardChrome(),
  ]);

  const byName = new Map<string, GuestGroupRow>();
  for (const c of counts) {
    if (!c.name) continue;
    byName.set(c.name, {
      name: c.name,
      guestCount: c.guestCount,
      iconUrl: null,
      iconStyle: "name",
    });
  }
  for (const row of iconRows) {
    const entry =
      byName.get(row.name) ??
      ({ name: row.name, guestCount: 0, iconUrl: null, iconStyle: "name" } as GuestGroupRow);
    // Public CDN URL when a custom domain is configured; else a presigned GET.
    entry.iconUrl = publicImageUrl(row.iconKey, { width: 96 }) ?? (await getViewUrl(row.iconKey));
    entry.iconStyle = row.iconStyle;
    byName.set(row.name, entry);
  }

  const groups = [...byName.values()].sort(
    (a, b) => b.guestCount - a.guestCount || a.name.localeCompare(b.name, "id"),
  );

  return { chrome, groups };
}

// Server-only data access for the wedding photo gallery.
//
// Reads the authenticated user's session, resolves the wedding they own (never
// trusting a client-supplied id — ownership is derived from the session per
// AGENTS.md hard rules), and lists its non-deleted photos with short-lived
// presigned GET URLs so the browser can render images straight from R2.
//
// This module imports R2 helpers from `@/lib/r2` (server-only). It must only
// ever be imported from Server Components / Server Actions.

import { and, asc, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { packages, photos, weddings } from "@/lib/db/schema";
import { publicImageUrl } from "@/lib/image-url";
import { getViewUrl } from "@/lib/r2";
import { resolveMemberWeddingId } from "@/server/queries/wedding";

export type GalleryPhoto = {
  id: string;
  label: string | null;
  objectKey: string;
  /** Short-lived presigned GET URL (expires in 1h) so the browser fetches from R2 directly. */
  viewUrl: string;
  /** Tiny CDN-resized variant (~200px) for dense grids/thumbnails so a 70px tile
   *  doesn't decode the full original. Equals `viewUrl` when no public CDN is set. */
  thumbUrl: string;
  isCover: boolean;
  isClosing: boolean;
  sortOrder: number;
  createdAt: Date;
};

export type Gallery = {
  photos: GalleryPhoto[];
  /** Number of non-deleted photos currently stored. */
  used: number;
  /** Package photo limit; `null` means unlimited. */
  limit: number | null;
  /** Package display name, or `null` when the wedding has no package. */
  packageName: string | null;
};

const EMPTY_GALLERY: Gallery = {
  photos: [],
  used: 0,
  limit: null,
  packageName: null,
};

/**
 * Get the current user's gallery: every non-deleted photo of the wedding they
 * own (ordered by `sortOrder`), each with a fresh presigned GET URL, plus the
 * package quota context (`used` / `limit` / `packageName`).
 *
 * The wedding is resolved from the session exactly like the upload sign route
 * and the photo actions — the caller never supplies a wedding id. When there is
 * no resolvable user (unauthenticated in production) or no wedding exists, an
 * empty gallery is returned so callers can render a neutral empty state.
 */
export async function getMyGallery(): Promise<Gallery> {
  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) {
    return EMPTY_GALLERY;
  }

  // Resolve the member's wedding joined to its package (left join: packageId is
  // nullable / set-null on package delete). Ownership comes from membership.
  const [owned] = await db
    .select({
      weddingId: weddings.id,
      photoLimit: packages.photoLimit,
      packageName: packages.name,
    })
    .from(weddings)
    .leftJoin(packages, eq(weddings.packageId, packages.id))
    .where(and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)))
    .limit(1);

  if (!owned) {
    return EMPTY_GALLERY;
  }

  const rows = await db
    .select({
      id: photos.id,
      label: photos.label,
      objectKey: photos.objectKey,
      isCover: photos.isCover,
      isClosing: photos.isClosing,
      sortOrder: photos.sortOrder,
      createdAt: photos.createdAt,
    })
    .from(photos)
    .where(and(eq(photos.weddingId, owned.weddingId), isNull(photos.deletedAt)))
    .orderBy(asc(photos.sortOrder));

  // Sign a presigned GET URL per photo (expires in 1h). Done in parallel so the
  // gallery does not serialize one network round-trip per image.
  const gallery = await Promise.all(
    rows.map(async (row) => {
      const viewUrl = await getViewUrl(row.objectKey);
      return {
        id: row.id,
        label: row.label,
        objectKey: row.objectKey,
        viewUrl,
        // Light thumbnail for the editor's dense grids; falls back to the full
        // presigned URL when no public CDN is configured (e.g. local dev).
        thumbUrl: publicImageUrl(row.objectKey, { width: 200 }) ?? viewUrl,
        isCover: row.isCover,
        isClosing: row.isClosing,
        sortOrder: row.sortOrder,
        createdAt: row.createdAt,
      };
    }),
  );

  return {
    photos: gallery,
    used: gallery.length,
    limit: owned.photoLimit,
    packageName: owned.packageName ?? null,
  };
}

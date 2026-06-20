// Server-only data access for the public invitation page (/inv/[slug]).
//
// Unlike every other query module, the wedding here is located by its PUBLIC
// slug (the URL path), not by session ownership — guests are anonymous. The
// gate instead lives in the view kind:
//   - status 'live'  → "public" (anyone can view),
//   - anything else  → "ownerPreview" ONLY when the session user owns it
//                      (draft invitations must never leak),
//   - otherwise      → "notFound".
// This module never flips a wedding's status — publish stays an explicit,
// paid-gated customer action.

import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { photos, templates, weddings, wishes } from "@/lib/db/schema";
import {
  parseSectionData,
  type AcaraData,
  type AmplopData,
  type GaleriData,
  type HeroData,
  type MusikData,
  type PasanganData,
  type RsvpData,
} from "@/lib/invitation/sections";
import { publicImageUrl } from "@/lib/image-url";
import { getViewUrl } from "@/lib/r2";
import { resolveEditorUserId } from "@/server/queries/wedding";

export type InvitationPhoto = {
  id: string;
  url: string;
  label: string | null;
  isCover: boolean;
  /** Dedicated closing-section photo (falls back to the cover when none set). */
  isClosing: boolean;
};

export type InvitationView = {
  slug: string;
  groomName: string;
  brideName: string;
  eventDate: string | null;
  venue: string | null;
  city: string | null;
  status: "draft" | "pending" | "live" | "expired";
  templateSlug: string | null;
  sections: {
    pasangan: PasanganData;
    acara: AcaraData;
    cerita: { title?: string; body?: string };
    galeri: GaleriData;
    amplop: AmplopData;
    musik: MusikData;
    rsvp: RsvpData;
    hero: HeroData;
  };
  /** Non-deleted gallery photos with short-lived presigned GET URLs (1h). */
  photos: InvitationPhoto[];
  /** Profile photos resolved from pasangan.photoId against THIS wedding only. */
  couplePhotoUrls: { groom?: string; bride?: string };
  /** Approved wishes only (pinned first, newest next), capped at 60. */
  wishes: { fromName: string; body: string; createdAt: string }[];
  /**
   * Absolute URL for the link-share preview (Open Graph / WhatsApp), or
   * undefined when there's nothing to show. Source: the editable "Bagikan"
   * image, falling back to the cover photo. Live invitations use the stable
   * public CDN URL (when R2_PUBLIC_URL is set); drafts stay presigned/private.
   * NOTE: the presigned fallback (no public CDN configured) is short-lived — a
   * crawler that fetches the page then the image immediately is fine, but a
   * platform that re-fetches a cached link card past the TTL can 403. Production
   * should set R2_PUBLIC_URL so og:image resolves to the non-expiring CDN URL.
   */
  ogImageUrl?: string;
};

export type InvitationLookup =
  | { kind: "public"; data: InvitationView }
  | { kind: "ownerPreview"; data: InvitationView }
  | { kind: "notFound" };

/**
 * Resolve an invitation by public slug. Live weddings render for anyone;
 * non-live weddings render only for their owner (preview), else not found.
 */
export async function getInvitationBySlug(slug: string): Promise<InvitationLookup> {
  const [wedding] = await db
    .select({
      id: weddings.id,
      userId: weddings.userId,
      slug: weddings.slug,
      groomName: weddings.groomName,
      brideName: weddings.brideName,
      eventDate: weddings.eventDate,
      venue: weddings.venue,
      city: weddings.city,
      status: weddings.status,
      sections: weddings.sections,
      templateSlug: templates.slug,
    })
    .from(weddings)
    .leftJoin(templates, eq(weddings.templateId, templates.id))
    .where(and(eq(weddings.slug, slug), isNull(weddings.deletedAt)))
    .limit(1);

  if (!wedding) {
    return { kind: "notFound" };
  }

  let kind: "public" | "ownerPreview";
  if (wedding.status === "live") {
    kind = "public";
  } else {
    // Draft/pending/expired: visible only to the owner as a preview.
    const userId = await resolveEditorUserId();
    if (!userId || userId !== wedding.userId) {
      return { kind: "notFound" };
    }
    kind = "ownerPreview";
  }

  const raw = wedding.sections ?? {};
  const pasangan = parseSectionData("pasangan", raw.pasangan?.data);

  // Background music: presign the uploaded audio so the player receives a
  // short-lived GET URL (same pattern as gallery photos). Non-upload sources
  // (youtube / preset) need no presigned URL.
  const musik = parseSectionData("musik", raw.musik?.data);
  musik.audioUrl =
    musik.source === "upload" && musik.audioKey ? await getViewUrl(musik.audioKey) : undefined;

  // Folk hero cover asset (a dedicated image or video, separate from the gate's
  // cover photo) — resolved to short-lived presigned GET URLs, like the music.
  const hero = parseSectionData("hero", raw.hero?.data);
  hero.imageUrl = hero.imageKey ? await getViewUrl(hero.imageKey) : undefined;
  hero.videoUrl = hero.videoKey ? await getViewUrl(hero.videoKey) : undefined;

  const [photoRows, wishRows] = await Promise.all([
    db
      .select({
        id: photos.id,
        objectKey: photos.objectKey,
        label: photos.label,
        isCover: photos.isCover,
        isClosing: photos.isClosing,
      })
      .from(photos)
      .where(and(eq(photos.weddingId, wedding.id), isNull(photos.deletedAt)))
      .orderBy(asc(photos.sortOrder)),
    db
      .select({
        fromName: wishes.fromName,
        body: wishes.body,
        createdAt: wishes.createdAt,
      })
      .from(wishes)
      .where(
        and(
          eq(wishes.weddingId, wedding.id),
          eq(wishes.status, "approved"),
          isNull(wishes.deletedAt),
        ),
      )
      .orderBy(desc(wishes.pinned), desc(wishes.createdAt))
      .limit(60),
  ]);

  // Resolve every photo URL in parallel. Published (live) invitations get
  // CDN-resized public URLs (lighter, cached, AVIF/WebP) when a public domain is
  // configured; drafts (ownerPreview) — and any setup without R2_PUBLIC_URL —
  // fall back to short-lived presigned URLs (private).
  const signedPhotos: InvitationPhoto[] = await Promise.all(
    photoRows.map(async (row) => {
      const cdn = kind === "public" ? publicImageUrl(row.objectKey, { width: 1280 }) : null;
      return {
        id: row.id,
        url: cdn ?? (await getViewUrl(row.objectKey)),
        label: row.label,
        isCover: row.isCover,
        isClosing: row.isClosing,
      };
    }),
  );

  // Profile photos: pasangan.photoId only resolves against this wedding's own
  // photo set (signedPhotos is already wedding-scoped), so a stale or foreign
  // id silently yields no photo.
  const byId = new Map(signedPhotos.map((p) => [p.id, p.url]));
  const couplePhotoUrls = {
    groom: pasangan.groom.photoId ? byId.get(pasangan.groom.photoId) : undefined,
    bride: pasangan.bride.photoId ? byId.get(pasangan.bride.photoId) : undefined,
  };

  // Link-share preview image (Open Graph / WhatsApp): the dedicated "Bagikan"
  // image if set, else the cover photo. Live invitations use the stable public
  // CDN URL (mirrors gallery photos, gated on kind); drafts/owner-preview stay
  // private/presigned like the rest of the draft. The cover fallback reuses the
  // cover's already-resolved URL, so it inherits that rule and isn't signed twice.
  const bagikan = parseSectionData("bagikan", raw.bagikan?.data);
  let ogImageUrl: string | undefined;
  if (bagikan.imageKey) {
    // bagikan.imageKey passed save-time prefix validation (wedding-scoped).
    ogImageUrl =
      (kind === "public" ? publicImageUrl(bagikan.imageKey, { width: 1200, quality: 80 }) : null) ??
      (await getViewUrl(bagikan.imageKey));
  } else {
    ogImageUrl = signedPhotos.find((p) => p.isCover)?.url;
  }

  return {
    kind,
    data: {
      slug: wedding.slug,
      groomName: wedding.groomName,
      brideName: wedding.brideName,
      eventDate: wedding.eventDate,
      venue: wedding.venue,
      city: wedding.city,
      status: wedding.status,
      templateSlug: wedding.templateSlug,
      sections: {
        pasangan,
        acara: parseSectionData("acara", raw.acara?.data),
        cerita: { title: raw.cerita?.title, body: raw.cerita?.body },
        galeri: parseSectionData("galeri", raw.galeri?.data),
        amplop: parseSectionData("amplop", raw.amplop?.data),
        musik,
        rsvp: parseSectionData("rsvp", raw.rsvp?.data),
        hero,
      },
      photos: signedPhotos,
      couplePhotoUrls,
      wishes: wishRows.map((w) => ({
        fromName: w.fromName,
        body: w.body,
        createdAt: w.createdAt.toISOString(),
      })),
      ogImageUrl,
    },
  };
}

/**
 * Bump the public visit counter. Fire-and-forget from the page (public views
 * only — owner previews don't count). Bots are counted; acceptable for now.
 */
export async function incrementVisitCount(slug: string): Promise<void> {
  try {
    await db
      .update(weddings)
      .set({ visitCount: sql`${weddings.visitCount} + 1` })
      .where(and(eq(weddings.slug, slug), eq(weddings.status, "live"), isNull(weddings.deletedAt)));
  } catch (error) {
    console.error("incrementVisitCount failed", error);
  }
}

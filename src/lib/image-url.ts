// Public image delivery via a Cloudflare-fronted R2 custom domain + Image
// Resizing. When R2_PUBLIC_URL is set (a Cloudflare zone bound to the R2 bucket
// with Transformations enabled), published-invitation photos are served as
// public, CDN-cached, auto-resized (AVIF/WebP) URLs instead of full-resolution
// presigned URLs — far lighter on guests' phones.
//
// When R2_PUBLIC_URL is empty (dev / no custom domain), helpers return null so
// callers fall back to the existing presigned URLs (getViewUrl). Object keys are
// unguessable UUIDs; only PUBLISHED (live) invitations use these — drafts stay
// presigned/private.

const PUBLIC_BASE = (process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, "");

/** True when a public Cloudflare/R2 domain is configured. */
export function hasPublicCdn(): boolean {
  return PUBLIC_BASE.length > 0;
}

/**
 * Cloudflare Image Resizing URL for a public R2 object, e.g.
 *   https://media.maritare.id/cdn-cgi/image/width=1280,quality=75,format=auto/<key>
 * Returns null when no public domain is configured (caller should presign instead).
 */
export function publicImageUrl(
  objectKey: string,
  opts?: { width?: number; quality?: number },
): string | null {
  if (!PUBLIC_BASE) return null;
  const width = opts?.width ?? 1280;
  const quality = opts?.quality ?? 75;
  return `${PUBLIC_BASE}/cdn-cgi/image/width=${width},quality=${quality},format=auto/${objectKey}`;
}

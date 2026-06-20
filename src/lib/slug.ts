// Slug helpers for invitation URLs (maritare.id/<slug>).
//
// Slugs are lowercase, ASCII, hyphen-separated. Indonesian names are plain
// ASCII so a simple diacritic-strip + non-alphanumeric collapse is enough.

const MAX_SLUG_LEN = 60;

/**
 * Turn arbitrary text into a URL-safe slug fragment: lowercase, accents
 * stripped, non-alphanumerics collapsed to single hyphens, trimmed. Returns ""
 * when nothing usable remains (caller decides the fallback).
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    // Strip combining diacritics (U+0300–U+036F) so "é" → "e", not "e-".
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LEN)
    .replace(/-+$/g, "");
}

/**
 * Build a couple slug from groom + bride names ("Bagas" + "Kiki" → "bagas-kiki").
 * Falls back to "undangan" when neither name yields anything usable.
 */
export function coupleSlug(groomName: string, brideName: string): string {
  const base = [slugify(groomName), slugify(brideName)].filter(Boolean).join("-");
  return base || "undangan";
}

// A valid stored slug: lowercase alphanumerics + single hyphens, 1..60 chars.
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return slug.length >= 1 && slug.length <= MAX_SLUG_LEN && SLUG_PATTERN.test(slug);
}

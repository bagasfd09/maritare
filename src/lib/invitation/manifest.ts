// Per-template manifest — declares, for each invitation template:
//   - which editor form groups (the 7 canonical sections) apply, in what order;
//   - which photo slots the template exposes (so the editor renders the right
//     pickers and the renderer knows where each photo binds).
//
// Stored as a jsonb column on the `templates` table (mirrors the
// `weddings.sections` jsonb precedent). The DB column is authoritative; a
// code-side DEFAULT_MANIFEST provides a safe fallback when a row's manifest is
// empty. This module is server-safe (type-only import of SectionId, plain object
// literals) so `scripts/seed.ts` can import the manifests under Node's native
// TypeScript type-stripping.

import type { SectionId } from "@/lib/invitation/sections";

/** How a photo slot binds in the renderer + editor. */
export type PhotoSlotKind = "cover" | "closing" | "couple-groom" | "couple-bride" | "gallery";

export type PhotoSlot = {
  /** Stable key, e.g. "cover" | "groom" | "bride" | "gallery". */
  id: string;
  /** Bahasa label shown in the editor. */
  label: string;
  /** Binding kind — drives both the editor picker and the template wiring. */
  kind: PhotoSlotKind;
  /** Diagnostic hint of placement in the template (tooltip / docs). */
  where: string;
  /** Gallery only — max photos (omit = template default). */
  max?: number;
};

export type FormGroup = {
  /** One of the 7 canonical section ids (source of truth: sections.ts). */
  id: SectionId;
  /** Bahasa chapter label shown in the editor rail/canvas. */
  label: string;
  /** Display order in the rail. */
  order: number;
};

export type TemplateManifest = {
  formGroups: FormGroup[];
  photoSlots: PhotoSlot[];
};

/** Empty manifest — the DB column default before seeding writes the real one. */
export const EMPTY_MANIFEST: TemplateManifest = { formGroups: [], photoSlots: [] };

/**
 * Safe fallback used by the editor/renderer when a template row carries an empty
 * manifest (all 7 form groups + the 4 standard photo slots).
 */
export const DEFAULT_MANIFEST: TemplateManifest = {
  formGroups: [
    { id: "pasangan", label: "Mempelai", order: 1 },
    { id: "acara", label: "Acara", order: 2 },
    { id: "cerita", label: "Cerita", order: 3 },
    { id: "galeri", label: "Galeri", order: 4 },
    { id: "amplop", label: "Hadiah", order: 5 },
    { id: "musik", label: "Musik", order: 6 },
    { id: "rsvp", label: "RSVP", order: 7 },
    { id: "bagikan", label: "Bagikan", order: 8 },
  ],
  photoSlots: [
    { id: "cover", label: "Foto sampul", kind: "cover", where: "Cover" },
    { id: "groom", label: "Foto mempelai pria", kind: "couple-groom", where: "Couple — groom" },
    { id: "bride", label: "Foto mempelai wanita", kind: "couple-bride", where: "Couple — bride" },
    { id: "gallery", label: "Galeri foto", kind: "gallery", where: "Gallery grid", max: 20 },
  ],
};

// ─────────────────────────────────────────────────────────────────
// Per-template manifests (also written to the DB by scripts/seed.ts).
// Scarlet (Katsudoto design) has no story slot, so it omits "cerita". Folk
// includes a "Cerita" (Our Story) chapter that renders ScarletStory between the
// couple and the gallery.
// ─────────────────────────────────────────────────────────────────

// Order mirrors the invitation's top-to-bottom render (Couple → Gallery →
// Events → Gift → Music → RSVP) so the editor rail reads like the page.
const SHARED_FORM_GROUPS: FormGroup[] = [
  { id: "pasangan", label: "Mempelai", order: 1 },
  { id: "galeri", label: "Galeri", order: 2 },
  { id: "acara", label: "Acara", order: 3 },
  { id: "amplop", label: "Hadiah", order: 4 },
  { id: "musik", label: "Musik", order: 5 },
  { id: "rsvp", label: "RSVP", order: 6 },
  { id: "bagikan", label: "Bagikan", order: 7 },
];

export const FOLK_MANIFEST: TemplateManifest = {
  // Folk leads with a dedicated "Sampul" (cover) group (default illustration vs a
  // full-bleed uploaded photo; also holds the closing photo). Scarlet has no such
  // group — it uses its own ornamented cover. Order mirrors the render flow.
  formGroups: [
    { id: "hero", label: "Sampul", order: 1 },
    { id: "pasangan", label: "Mempelai", order: 2 },
    { id: "momen", label: "Momen", order: 3 },
    { id: "cerita", label: "Cerita", order: 4 },
    { id: "galeri", label: "Galeri", order: 5 },
    { id: "acara", label: "Acara", order: 6 },
    { id: "amplop", label: "Hadiah", order: 7 },
    { id: "musik", label: "Musik", order: 8 },
    { id: "rsvp", label: "RSVP", order: 9 },
    { id: "bagikan", label: "Bagikan", order: 10 },
  ],
  photoSlots: [
    { id: "cover", label: "Foto sampul (atas)", kind: "cover", where: "Folk top image" },
    { id: "closing", label: "Foto penutup (bawah)", kind: "closing", where: "Folk closing image" },
    { id: "groom", label: "Foto mempelai pria", kind: "couple-groom", where: "Couple — groom card" },
    { id: "bride", label: "Foto mempelai wanita", kind: "couple-bride", where: "Couple — bride card" },
    { id: "gallery", label: "Galeri foto", kind: "gallery", where: "Photo grid", max: 20 },
  ],
};

export const SCARLET_MANIFEST: TemplateManifest = {
  formGroups: SHARED_FORM_GROUPS,
  photoSlots: [
    { id: "cover", label: "Foto sampul", kind: "cover", where: "Cover hero" },
    { id: "groom", label: "Foto mempelai pria", kind: "couple-groom", where: "Couple — groom" },
    { id: "bride", label: "Foto mempelai wanita", kind: "couple-bride", where: "Couple — bride" },
    { id: "gallery", label: "Galeri foto", kind: "gallery", where: "Gallery grid", max: 20 },
  ],
};

// Ivory (Katsudoto "Aulia" port) — like Folk it carries a "Cerita" (love-story)
// chapter and a dedicated closing photo (footnote). Its "Sampul" group uploads
// the gate cover photo (isCover, shown in the opening-gate oval) + the closing
// photo; ivory has no full-bleed hero asset, so the editor hides that block
// (HeroForm heroAsset=false for non-folk).
export const IVORY_MANIFEST: TemplateManifest = {
  formGroups: [
    { id: "hero", label: "Sampul", order: 1 },
    { id: "pasangan", label: "Mempelai", order: 2 },
    { id: "cerita", label: "Cerita", order: 3 },
    { id: "galeri", label: "Galeri", order: 4 },
    { id: "acara", label: "Acara", order: 5 },
    { id: "amplop", label: "Hadiah", order: 6 },
    { id: "musik", label: "Musik", order: 7 },
    { id: "rsvp", label: "RSVP", order: 8 },
    { id: "bagikan", label: "Bagikan", order: 9 },
  ],
  photoSlots: [
    { id: "cover", label: "Foto sampul", kind: "cover", where: "Cover oval frame" },
    { id: "groom", label: "Foto mempelai pria", kind: "couple-groom", where: "Couple — groom" },
    { id: "bride", label: "Foto mempelai wanita", kind: "couple-bride", where: "Couple — bride" },
    { id: "closing", label: "Foto penutup", kind: "closing", where: "Footnote closing image" },
    { id: "gallery", label: "Galeri foto", kind: "gallery", where: "Photo grid", max: 20 },
  ],
};

// Sienna (Katsudoto "Syakira" port) — like Ivory it carries a "Cerita"
// (love-story) chapter, but its footnote is TEXT-ONLY, so it has NO closing
// photo slot. Its "Sampul" group uploads the gate cover photo (isCover, shown
// on the opening gate + cover); the folk-only hero-asset and closing blocks are
// hidden in the editor (HeroForm heroAsset/closingAsset flags).
export const SIENNA_MANIFEST: TemplateManifest = {
  formGroups: [
    { id: "hero", label: "Sampul", order: 1 },
    { id: "pasangan", label: "Mempelai", order: 2 },
    { id: "galeri", label: "Galeri", order: 3 },
    { id: "cerita", label: "Cerita", order: 4 },
    { id: "acara", label: "Acara", order: 5 },
    { id: "amplop", label: "Hadiah", order: 6 },
    { id: "musik", label: "Musik", order: 7 },
    { id: "rsvp", label: "RSVP", order: 8 },
    { id: "bagikan", label: "Bagikan", order: 9 },
  ],
  photoSlots: [
    { id: "cover", label: "Foto sampul", kind: "cover", where: "Cover oval frame" },
    { id: "groom", label: "Foto mempelai pria", kind: "couple-groom", where: "Couple — groom" },
    { id: "bride", label: "Foto mempelai wanita", kind: "couple-bride", where: "Couple — bride" },
    { id: "gallery", label: "Galeri foto", kind: "gallery", where: "Photo grid", max: 20 },
  ],
};

// Plum (Katsudoto "Kinanti" port) — like Sienna it carries a "Cerita"
// (love-story) chapter and a TEXT-ONLY footnote (no closing photo). Its "Sampul"
// group uploads the gate/cover photo (isCover, shown on the opening gate's oval
// portrait + cover); the folk-only hero-asset and closing blocks are hidden in
// the editor (HeroForm heroAsset/closingAsset flags). Story renders before the
// gallery.
export const PLUM_MANIFEST: TemplateManifest = {
  formGroups: [
    { id: "hero", label: "Sampul", order: 1 },
    { id: "pasangan", label: "Mempelai", order: 2 },
    { id: "cerita", label: "Cerita", order: 3 },
    { id: "galeri", label: "Galeri", order: 4 },
    { id: "acara", label: "Acara", order: 5 },
    { id: "amplop", label: "Hadiah", order: 6 },
    { id: "musik", label: "Musik", order: 7 },
    { id: "rsvp", label: "RSVP", order: 8 },
    { id: "bagikan", label: "Bagikan", order: 9 },
  ],
  photoSlots: [
    { id: "cover", label: "Foto sampul", kind: "cover", where: "Cover frame" },
    { id: "groom", label: "Foto mempelai pria", kind: "couple-groom", where: "Couple — groom" },
    { id: "bride", label: "Foto mempelai wanita", kind: "couple-bride", where: "Couple — bride" },
    { id: "gallery", label: "Galeri foto", kind: "gallery", where: "Photo carousel", max: 20 },
  ],
};

// Onyx (cinematic dark editorial port) — carries a "Cerita" (love-story) chapter
// and a closing photo (the closing band washes it behind the names). Its "Sampul"
// group is the richest of any template: besides the gate/cover photo it uses the
// folk HERO ASSET slot for the fixed background VIDEO or still that the whole
// invitation scrolls over — that backdrop IS this template's identity, so the
// hero-asset block stays enabled in the editor.
export const ONYX_MANIFEST: TemplateManifest = {
  formGroups: [
    { id: "hero", label: "Sampul", order: 1 },
    { id: "pasangan", label: "Mempelai", order: 2 },
    { id: "cerita", label: "Cerita", order: 3 },
    { id: "galeri", label: "Galeri", order: 4 },
    { id: "acara", label: "Acara", order: 5 },
    { id: "amplop", label: "Hadiah", order: 6 },
    { id: "musik", label: "Musik", order: 7 },
    { id: "rsvp", label: "RSVP", order: 8 },
    { id: "bagikan", label: "Bagikan", order: 9 },
  ],
  photoSlots: [
    { id: "cover", label: "Foto sampul", kind: "cover", where: "Backdrop + cover gate" },
    { id: "groom", label: "Foto mempelai pria", kind: "couple-groom", where: "Couple — groom" },
    { id: "bride", label: "Foto mempelai wanita", kind: "couple-bride", where: "Couple — bride" },
    { id: "closing", label: "Foto penutup", kind: "closing", where: "Closing band wash" },
    { id: "gallery", label: "Galeri foto", kind: "gallery", where: "Masonry grid", max: 20 },
  ],
};

/** Slug → manifest, for seeding and any code-side lookups. */
export const TEMPLATE_MANIFESTS: Record<string, TemplateManifest> = {
  folk: FOLK_MANIFEST,
  ivory: IVORY_MANIFEST,
  scarlet: SCARLET_MANIFEST,
  sienna: SIENNA_MANIFEST,
  plum: PLUM_MANIFEST,
  onyx: ONYX_MANIFEST,
};

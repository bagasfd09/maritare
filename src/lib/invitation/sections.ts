// Per-section data contracts for the wedding editor + invitation renderer.
//
// The `weddings.sections` jsonb document is keyed by the 7 editor section ids;
// each section may carry a `data` payload whose shape is section-specific and
// defined here. This module is the single source of truth shared by:
//   - the editor forms (client) — what fields exist per section,
//   - `saveWeddingSection` (server action) — boundary validation,
//   - `getInvitationBySlug` (server query) — tolerant reads via `parseSectionData`.
//
// Stored jsonb must NEVER be trusted to match these shapes (old rows, partial
// saves) — always read back through `parseSectionData`, which falls back to a
// safe default instead of throwing.

import { z } from "zod";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD");
const timeStr = z.string().regex(/^\d{2}:\d{2}$/, "Format jam HH:MM");

// ─────────────────────────────────────────────────────────────────
// Pasangan — couple profiles + opening quote
// ─────────────────────────────────────────────────────────────────

const personSchema = z.object({
  /** Full name incl. titles, e.g. "Andi Pratama, S.T." */
  fullName: z.string().trim().max(120).default(""),
  fatherName: z.string().trim().max(120).optional(),
  motherName: z.string().trim().max(120).optional(),
  /** e.g. "Putra pertama dari" */
  childOrder: z.string().trim().max(80).optional(),
  /** Instagram handle without the @ */
  instagram: z.string().trim().max(60).optional(),
  /** photos.id of the profile photo — must belong to the same wedding (verified server-side) */
  photoId: z.uuid().optional(),
});

// Default copy for the couple-section headline + paragraph (the romantic intro
// shown above the couple cards). Used as the render fallback AND the editor
// placeholders, so there's a single source of truth. Customers can override both
// in the Mempelai section.
export const COUPLE_INTRO_DEFAULTS = {
  title: "Two souls interwined, a live that will bind",
  description:
    "They say that some souls are simply meant to find each other. Ours did, and with each shared moment, our connection has grown into a love that will forever bind us. We are so excited to celebrate this beautiful journey with you as we exchange our vows.",
} as const;

export const pasanganDataSchema = z.object({
  groom: personSchema.default({ fullName: "" }),
  bride: personSchema.default({ fullName: "" }),
  quote: z
    .object({
      arabic: z.string().trim().max(400).optional(),
      text: z.string().trim().max(600).optional(),
      /** e.g. "Q.S. Ar-Rum: 21" */
      source: z.string().trim().max(120).optional(),
    })
    .optional(),
  /**
   * Editable couple-section intro: the headline + paragraph above the couple
   * cards (Folk/Scarlet `.couple-title` / `.couple-description`). Both optional —
   * blank fields fall back to COUPLE_INTRO_DEFAULTS at render time.
   */
  intro: z
    .object({
      title: z.string().trim().max(160).optional(),
      description: z.string().trim().max(800).optional(),
    })
    .optional(),
  /**
   * Show the names/date/venue text block on the opening hero. Templates whose
   * cover artwork already has the names baked in (e.g. Folk Garden) can turn
   * this off so the text isn't duplicated. Defaults to shown.
   */
  showHeroText: z.boolean().default(true),
});

// ─────────────────────────────────────────────────────────────────
// Acara — events (Akad, Resepsi, …)
// ─────────────────────────────────────────────────────────────────

export const acaraEventSchema = z.object({
  name: z.string().trim().min(1).max(80),
  date: dateStr,
  timeStart: timeStr,
  /** absent → "selesai" */
  timeEnd: timeStr.optional(),
  venue: z.string().trim().max(160),
  address: z.string().trim().max(300).optional(),
  mapsUrl: z.url().startsWith("https://").max(500).optional(),
});

export const acaraDataSchema = z.object({
  // Section heading + sub-line (Scarlet/Folk: "Love is Calling," / "Save the
  // Date!"). Optional — the template supplies its own default when left empty.
  title: z.string().trim().max(120).optional(),
  subtitle: z.string().trim().max(300).optional(),
  events: z.array(acaraEventSchema).max(4).default([]),
});

// ─────────────────────────────────────────────────────────────────
// Amplop — digital gifts
// ─────────────────────────────────────────────────────────────────

// Which couple's family an account belongs to. The invitation shows only the
// matching side's accounts to a guest opened via their personalized ?g= link
// (whose guests.side is groom/bride); "both" always shows. Legacy stored
// accounts have no side → default "both" (shown to everyone, as before).
export const partySideSchema = z.enum(["groom", "bride", "both"]).default("both");

export const amplopDataSchema = z.object({
  accounts: z
    .array(
      z.object({
        bank: z.string().trim().min(1).max(40),
        number: z.string().trim().min(4).max(30).regex(/^[\d\s-]+$/, "Hanya angka"),
        holder: z.string().trim().min(1).max(80),
        side: partySideSchema,
      }),
    )
    .max(4)
    .default([]),
  ewallets: z
    .array(
      z.object({
        provider: z.string().trim().min(1).max(30),
        number: z.string().trim().min(4).max(30),
        holder: z.string().trim().min(1).max(80),
        side: partySideSchema,
      }),
    )
    .max(4)
    .default([]),
  /** physical gift shipping address (optional) */
  giftAddress: z.string().trim().max(300).optional(),
});

// ─────────────────────────────────────────────────────────────────
// Musik — preset background tracks (files live in public/audio/)
// ─────────────────────────────────────────────────────────────────

export const MUSIC_TRACKS = [
  { id: "flora-theme", label: "Flora Theme · instrumental", src: "/audio/flora-theme.mp3" },
] as const;

export type MusicTrackId = (typeof MUSIC_TRACKS)[number]["id"];

const TRACK_IDS = MUSIC_TRACKS.map((t) => t.id) as [MusicTrackId, ...MusicTrackId[]];

export const musikDataSchema = z.object({
  enabled: z.boolean().default(true),
  // Where the track comes from. "preset" is kept for backward-compat with old
  // data; the editor now offers "upload" (an audio file in R2) and "youtube".
  source: z.enum(["preset", "upload", "youtube"]).default("preset"),
  track: z.enum(TRACK_IDS).optional(), // source=preset
  audioKey: z.string().max(300).optional(), // source=upload: R2 object key
  // source=youtube: strict 11-char video id (it's interpolated into the embed
  // URL, so the format is enforced server-side too, not just in the form).
  youtubeId: z
    .string()
    .regex(/^[A-Za-z0-9_-]{11}$/)
    .optional(),
  title: z.string().max(120).optional(), // display label (file/video name)
  // Trim window in seconds (Instagram-style). The background player starts at
  // startSec and loops the segment back when it reaches endSec. Both optional:
  // no startSec → start at 0; no endSec → play to the natural end then loop.
  startSec: z.number().min(0).max(36000).optional(),
  endSec: z.number().min(0).max(36000).optional(),
  // Resolved server-side (presigned GET URL) from audioKey for rendering — never
  // set by the editor; getInvitationBySlug overwrites it on every render.
  audioUrl: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────
// RSVP — public form settings
// ─────────────────────────────────────────────────────────────────

export const rsvpDataSchema = z.object({
  enabled: z.boolean().default(true),
  deadline: dateStr.optional(),
  maxPartySize: z.number().int().min(1).max(10).default(2),
});

// ─────────────────────────────────────────────────────────────────
// Hero (folk) — cover/hero display mode
// ─────────────────────────────────────────────────────────────────

export const heroDataSchema = z.object({
  /**
   * Legacy fallback: true = the cover (isCover) photo is shown FULL-BLEED at the
   * top when no dedicated hero asset is set. Kept for backward-compat; the hero
   * image/video below takes precedence.
   */
  fullSize: z.boolean().default(false),
  /**
   * Folk hero display mode for the uploaded hero asset. false (default) = show it
   * inside the ornate cover template frame (ScarletCover). true = show the
   * uploaded image/video FULL-BLEED, edge-to-edge, without the frame.
   */
  heroFullWidth: z.boolean().default(false),
  // Dedicated HERO asset — separate from the gate/cover photo (isCover). Shown
  // FULL-BLEED at the very top of the opened invitation. Either an image or a
  // video (R2 object keys, like musik.audioKey). The *Url fields are resolved
  // server-side (presigned GET) on render and never set by the editor.
  imageKey: z.string().max(300).optional(),
  imageUrl: z.string().optional(),
  videoKey: z.string().max(300).optional(),
  videoUrl: z.string().optional(),
  // Dedicated CLOSING-section VIDEO — shown in the footnote/closing section.
  // (The closing IMAGE still uses the photos table, isClosing.) Stored on the
  // hero section because the closing media is edited in the same "Sampul" form;
  // like the hero video it's an R2 object key under weddings/{id}/videos/,
  // presigned to closingVideoUrl server-side (never set by the editor).
  closingVideoKey: z.string().max(300).optional(),
  closingVideoUrl: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────
// Bagikan — link share preview (Open Graph / WhatsApp)
// ─────────────────────────────────────────────────────────────────

export const bagikanDataSchema = z.object({
  // Optional dedicated share/OG preview image (R2 object key). When unset, the
  // link preview falls back to the cover photo (isCover). `imageUrl` is the
  // server-resolved presigned URL for the EDITOR slot preview only — it's never
  // sent by the client and never persisted (recomputed on render, like hero).
  imageKey: z.string().max(300).optional(),
  imageUrl: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────
// Momen (folk) — a free "moment" section after the couple: a custom
// title + an uploaded illustration (e.g. a map of the two hometowns,
// like the Screenshot_71 reference). Both optional — the section
// self-hides when title AND image are empty.
// ─────────────────────────────────────────────────────────────────

export const momenDataSchema = z.object({
  // Free-text heading shown above the image (e.g. "Two people, raised in
  // different places, brought together by fate."). Optional.
  title: z.string().trim().max(240).optional(),
  // Uploaded illustration — a client-supplied R2 object key under THIS
  // wedding's "momen" prefix (verified server-side, like hero.imageKey).
  imageKey: z.string().max(300).optional(),
  // Resolved server-side (presigned GET / public CDN) on render — never set by
  // the editor; getInvitationBySlug overwrites it on every render.
  imageUrl: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────
// Galeri — which gallery photos appear in the invitation grid
// ─────────────────────────────────────────────────────────────────

export const galeriDataSchema = z.object({
  // Curated list of gallery photo ids shown in the invitation's gallery grid.
  // Empty/unset = NONE shown (photos must be picked first). Cover/closing photos
  // appear in their own sections regardless of this list. Ids are uuids (like
  // pasangan.photoId) so a malformed id is rejected at the boundary instead of
  // crashing the uuid-column lookup on save; ownership is verified server-side
  // (stale/foreign ids dropped). The cap is generous — well above any realistic
  // gallery — so "Pilih semua" never exceeds it, even on unlimited packages.
  selectedPhotoIds: z.array(z.uuid()).max(500).default([]),
});

// ─────────────────────────────────────────────────────────────────
// Registry — sectionId → data schema
// ─────────────────────────────────────────────────────────────────

// cerita keeps using the section's title/body fields. It accepts any object so
// future extras survive a round-trip.
const passthroughSchema = z.looseObject({});

export const SECTION_DATA_SCHEMAS = {
  pasangan: pasanganDataSchema,
  momen: momenDataSchema,
  acara: acaraDataSchema,
  cerita: passthroughSchema,
  galeri: galeriDataSchema,
  amplop: amplopDataSchema,
  musik: musikDataSchema,
  rsvp: rsvpDataSchema,
  // hero (folk only): the hero/cover image is a gallery photo flagged isCover;
  // `data.fullSize` toggles full-bleed vs the ornamented framed cover.
  hero: heroDataSchema,
  // bagikan (all templates): the WhatsApp/social link-preview image.
  bagikan: bagikanDataSchema,
} as const;

export type SectionId = keyof typeof SECTION_DATA_SCHEMAS;

export const SECTION_IDS = Object.keys(SECTION_DATA_SCHEMAS) as [SectionId, ...SectionId[]];

export type PasanganData = z.infer<typeof pasanganDataSchema>;
export type MomenData = z.infer<typeof momenDataSchema>;
export type AcaraEvent = z.infer<typeof acaraEventSchema>;
export type AcaraData = z.infer<typeof acaraDataSchema>;
export type AmplopData = z.infer<typeof amplopDataSchema>;
export type PartySide = z.infer<typeof partySideSchema>;
export type MusikData = z.infer<typeof musikDataSchema>;
export type RsvpData = z.infer<typeof rsvpDataSchema>;
export type HeroData = z.infer<typeof heroDataSchema>;
export type BagikanData = z.infer<typeof bagikanDataSchema>;
export type GaleriData = z.infer<typeof galeriDataSchema>;

export const SECTION_DATA_DEFAULTS: {
  pasangan: PasanganData;
  momen: MomenData;
  acara: AcaraData;
  galeri: GaleriData;
  amplop: AmplopData;
  musik: MusikData;
  rsvp: RsvpData;
  hero: HeroData;
  bagikan: BagikanData;
} = {
  pasangan: pasanganDataSchema.parse({}),
  momen: momenDataSchema.parse({}),
  acara: acaraDataSchema.parse({}),
  galeri: galeriDataSchema.parse({}),
  amplop: amplopDataSchema.parse({}),
  musik: musikDataSchema.parse({}),
  rsvp: rsvpDataSchema.parse({}),
  hero: heroDataSchema.parse({}),
  bagikan: bagikanDataSchema.parse({}),
};

/**
 * Tolerant read of a stored section `data` payload. Invalid / legacy / missing
 * payloads fall back to the schema's empty default — a render must never crash
 * on jsonb drift.
 */
export function parseSectionData<K extends keyof typeof SECTION_DATA_DEFAULTS>(
  sectionId: K,
  raw: unknown,
): (typeof SECTION_DATA_DEFAULTS)[K] {
  const parsed = SECTION_DATA_SCHEMAS[sectionId].safeParse(raw ?? {});
  if (parsed.success) {
    return parsed.data as (typeof SECTION_DATA_DEFAULTS)[K];
  }
  return SECTION_DATA_DEFAULTS[sectionId];
}

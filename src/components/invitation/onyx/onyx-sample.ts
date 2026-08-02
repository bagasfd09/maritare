// Onyx built-in sample assets — the reference project's own media, shipped with
// the template as DEFAULTS.
//
// Every one of these is a fallback, never an override: whenever the couple has
// uploaded their own photo / hero video / closing image, theirs wins. These only
// fill in what's still empty, so a fresh draft and the catalog preview look
// exactly like the reference design instead of showing placeholder silhouettes.
//
// Files live in public/invitation/onyx/ (see that folder's README for provenance
// and for the one asset that is deliberately NOT committed — the soundtrack).

const BASE = "/invitation/onyx";

export const ONYX_SAMPLE = {
  /** Fixed cinematic backdrop — the reference's trailer.mp4. */
  video: `${BASE}/backdrop.mp4`,
  groom: `${BASE}/groom.jpg`,
  bride: `${BASE}/bride.jpg`,
  /** Washed behind the closing band. */
  closing: `${BASE}/closing.jpg`,
  /** Map panel in the venue section. */
  venue: `${BASE}/venue.jpg`,
  /**
   * Background soundtrack. NOT committed — the reference's mp3 is 10.2 MB and
   * public/audio/README.md caps background music at 3 MB. Drop a compressed
   * (~128 kbps) version at this path to enable it; until the file exists the
   * audio toggle hides itself automatically (the <audio> onError path).
   */
  music: `${BASE}/music.mp3`,
} as const;

export type OnyxSampleImage = { id: string; url: string; alt: string };

/** The reference's 8 gallery photos, in its own order — the masonry aspect
 *  rhythm in onyx-gallery (ASPECTS) is indexed to match this sequence. */
export const ONYX_SAMPLE_GALLERY: OnyxSampleImage[] = [
  { id: "s1", url: `${BASE}/gallery-1.jpg`, alt: "Bride in studio light" },
  { id: "s2", url: `${BASE}/gallery-2.jpg`, alt: "Together in the studio" },
  { id: "s3", url: `${BASE}/gallery-3.jpg`, alt: "Editorial couple portrait" },
  { id: "s4", url: `${BASE}/gallery-4.jpg`, alt: "An intimate moment" },
  { id: "s5", url: `${BASE}/gallery-5.jpg`, alt: "Ceremony walkway" },
  { id: "s6", url: `${BASE}/gallery-6.jpg`, alt: "Bridal portrait" },
  { id: "s7", url: `${BASE}/gallery-7.jpg`, alt: "Walking together" },
  { id: "s8", url: `${BASE}/gallery-8.jpg`, alt: "Romantic silhouette" },
];

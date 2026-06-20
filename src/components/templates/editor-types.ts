// Shared, serializable shapes for the wedding editor. Imported by the server
// page (which assembles EditorData) and the client orchestrator + forms.
//
// These are plain data (they cross the server→client boundary): no Dates, no
// class instances — `eventDate` is the raw "YYYY-MM-DD" string from the column.

import type {
  AcaraData,
  AmplopData,
  BagikanData,
  GaleriData,
  HeroData,
  MusikData,
  PasanganData,
  RsvpData,
  SectionId,
} from "@/lib/invitation/sections";
import type { TemplateManifest } from "@/lib/invitation/manifest";

export type { SectionId };

// Wedding meta surfaced in the topbar/preview.
export type EditorMeta = {
  slug: string;
  groomName: string;
  brideName: string;
  eventDate: string | null;
  venue: string | null;
  city: string | null;
  status: "draft" | "pending" | "live" | "expired";
  /** Selected template slug — drives the live preview + the form-group manifest. */
  templateSlug: string | null;
};

// A gallery photo as the forms/preview consume it.
export type EditorPhoto = {
  id: string;
  url: string;
  label: string | null;
  isCover: boolean;
  /** Dedicated closing-section photo (folk only; falls back to cover when unset). */
  isClosing: boolean;
};

export type EditorGallery = {
  photos: EditorPhoto[];
  used: number;
  limit: number | null;
  packageName: string | null;
};

// Canonical per-section editor state. cerita uses title/body; the data-bearing
// sections carry their parsed `data`; every section tracks a `done` flag.
export type EditorSections = {
  pasangan: { done: boolean; data: PasanganData };
  acara: { done: boolean; data: AcaraData };
  cerita: { done: boolean; title: string; body: string };
  // galeri.data.selectedPhotoIds: which gallery photos appear in the invitation.
  galeri: { done: boolean; data: GaleriData };
  amplop: { done: boolean; data: AmplopData };
  musik: { done: boolean; data: MusikData };
  rsvp: { done: boolean; data: RsvpData };
  // hero (folk only): ornamented framed cover vs full-bleed photo (data.fullSize).
  hero: { done: boolean; data: HeroData };
  // bagikan (all templates): the WhatsApp/social link-preview image.
  bagikan: { done: boolean; data: BagikanData };
};

// Full payload the server page hands the client orchestrator.
export type EditorData = {
  meta: EditorMeta;
  sections: EditorSections;
  gallery: EditorGallery;
  /** Which form groups + photo slots the selected template exposes. */
  manifest: TemplateManifest;
};

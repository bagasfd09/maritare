import type { SectionId } from "@/lib/invitation/sections";

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

// ── topbar chapter title per section ─────────────────────────────
// Just the serif display title (the established "<word> <em>accent.</em>" form).
// The chapter NUMBER comes from the manifest-derived eyebrow, so no per-section
// number is stored here. Shared by the desktop topbar + mobile header.
export const CHAPTERS: Record<SectionId, { lead: string; accent: string }> = {
  hero: { lead: "Sampul ", accent: "undangan." },
  pasangan: { lead: "Pasangan ", accent: "kamu." },
  momen: { lead: "Momen ", accent: "spesial." },
  acara: { lead: "Hari ", accent: "bahagianya." },
  cerita: { lead: "Cerita ", accent: "kami." },
  galeri: { lead: "Galeri ", accent: "momen." },
  amplop: { lead: "Amplop ", accent: "digital." },
  musik: { lead: "Musik ", accent: "latar." },
  rsvp: { lead: "Konfirmasi ", accent: "tamu." },
  bagikan: { lead: "Bagikan ", accent: "undangan." },
};

"use client";

import { useMemo, useState } from "react";

import type { EditorSaveStatus } from "@/components/molecules/editor-canvas";
import { SECTION_DATA_DEFAULTS, type SectionId } from "@/lib/invitation/sections";
import { DEFAULT_MANIFEST } from "@/lib/invitation/manifest";
import type { FormGroup } from "@/lib/invitation/manifest";
import type {
  EditorData,
  EditorGallery,
  EditorMeta,
  EditorSections,
} from "@/components/templates/editor-types";
import type { InvitationView } from "@/server/queries/invitation";

// Empty editor state used when the user has no wedding yet (preserves a usable,
// non-crashing editor; saves will surface the server's "not found" error).
const FALLBACK_META: EditorMeta = {
  slug: "undangan-kamu",
  groomName: "Mempelai Pria",
  brideName: "Mempelai Wanita",
  eventDate: null,
  venue: null,
  city: null,
  status: "draft",
  templateSlug: null,
};

function emptySections(): EditorSections {
  return {
    pasangan: { done: false, data: SECTION_DATA_DEFAULTS.pasangan },
    momen: { done: false, data: SECTION_DATA_DEFAULTS.momen },
    acara: { done: false, data: SECTION_DATA_DEFAULTS.acara },
    cerita: { done: false, title: "", body: "", data: SECTION_DATA_DEFAULTS.cerita },
    galeri: { done: false, data: SECTION_DATA_DEFAULTS.galeri },
    amplop: { done: false, data: SECTION_DATA_DEFAULTS.amplop },
    musik: { done: false, data: SECTION_DATA_DEFAULTS.musik },
    rsvp: { done: false, data: SECTION_DATA_DEFAULTS.rsvp },
    hero: { done: false, data: SECTION_DATA_DEFAULTS.hero },
    bagikan: { done: false, data: SECTION_DATA_DEFAULTS.bagikan },
  };
}

export type EditorState = {
  meta: EditorMeta;
  gallery: EditorGallery;
  groups: FormGroup[];
  sections: EditorSections;
  setSections: React.Dispatch<React.SetStateAction<EditorSections>>;
  activeSection: SectionId;
  setActiveSection: (id: SectionId) => void;
  status: EditorSaveStatus;
  setStatus: (s: EditorSaveStatus) => void;
  done: Record<string, boolean>;
  previewData: InvitationView;
};

// Shared orchestration for the wedding editor — owns section state, the active
// tab, the save-status indicator, the manifest-derived group list, and the live
// InvitationView assembled from canonical state. Consumed by both the desktop
// (Editor) and mobile (EditorMobile) layouts so they stay behaviourally in sync.
export function useEditorState(data: EditorData | null): EditorState {
  const meta = useMemo(() => data?.meta ?? FALLBACK_META, [data]);
  const gallery = useMemo(
    () => data?.gallery ?? { photos: [], used: 0, limit: null, packageName: null },
    [data],
  );
  // Which form groups (+ order) this template exposes. Falls back to all 7.
  const manifest = useMemo(
    () => (data?.manifest && data.manifest.formGroups.length > 0 ? data.manifest : DEFAULT_MANIFEST),
    [data],
  );
  const groups = useMemo(() => {
    const sorted = [...manifest.formGroups].sort((a, b) => a.order - b.order);
    // "Bagikan" is a global section (all templates). Guarantee it shows even when
    // a template row's stored manifest predates it (DB manifest is authoritative
    // and may be stale until re-seeded).
    if (!sorted.some((g) => g.id === "bagikan")) {
      sorted.push({ id: "bagikan", label: "Bagikan", order: (sorted.at(-1)?.order ?? 0) + 1 });
    }
    return sorted;
  }, [manifest]);

  const [sections, setSections] = useState<EditorSections>(
    () => data?.sections ?? emptySections(),
  );
  const [activeSection, setActiveSection] = useState<SectionId>(
    () => data?.manifest?.formGroups?.[0]?.id ?? "pasangan",
  );
  const [status, setStatus] = useState<EditorSaveStatus>({ state: "idle" });

  const done: Record<string, boolean> = {
    pasangan: sections.pasangan.done,
    momen: sections.momen.done,
    acara: sections.acara.done,
    cerita: sections.cerita.done,
    galeri: sections.galeri.done,
    amplop: sections.amplop.done,
    musik: sections.musik.done,
    rsvp: sections.rsvp.done,
    hero: sections.hero.done,
    bagikan: sections.bagikan.done,
  };

  // ── live preview data: assemble an InvitationView from canonical state ──
  const previewData = useMemo<InvitationView>(() => {
    const photos = gallery.photos.map((p) => ({
      id: p.id,
      url: p.url,
      thumbUrl: p.thumbUrl, // light CDN variant when configured; else == url
      label: p.label,
      isCover: p.isCover,
      isClosing: p.isClosing,
    }));
    const byId = new Map(photos.map((p) => [p.id, p.url]));
    const groomPhotoId = sections.pasangan.data.groom.photoId;
    const bridePhotoId = sections.pasangan.data.bride.photoId;

    return {
      slug: meta.slug,
      groomName: meta.groomName,
      brideName: meta.brideName,
      eventDate: meta.eventDate,
      venue: meta.venue,
      city: meta.city,
      status: meta.status,
      templateSlug: meta.templateSlug,
      sections: {
        pasangan: sections.pasangan.data,
        momen: sections.momen.data,
        acara: sections.acara.data,
        cerita: {
          title: sections.cerita.title,
          body: sections.cerita.body,
          items: sections.cerita.data.items,
        },
        galeri: sections.galeri.data,
        amplop: sections.amplop.data,
        musik: sections.musik.data,
        rsvp: sections.rsvp.data,
        hero: sections.hero.data,
      },
      photos,
      couplePhotoUrls: {
        groom: groomPhotoId ? byId.get(groomPhotoId) : undefined,
        bride: bridePhotoId ? byId.get(bridePhotoId) : undefined,
      },
      // Two short dummy wishes so the preview's wishes section isn't empty.
      wishes: [
        { fromName: "Sahabat", body: "Selamat menempuh hidup baru! 🌿", createdAt: new Date().toISOString() },
        { fromName: "Keluarga", body: "Bahagia selalu untuk kalian berdua.", createdAt: new Date().toISOString() },
      ],
    };
  }, [meta, gallery, sections]);

  return {
    meta,
    gallery,
    groups,
    sections,
    setSections,
    activeSection,
    setActiveSection,
    status,
    setStatus,
    done,
    previewData,
  };
}

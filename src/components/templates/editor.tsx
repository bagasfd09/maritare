"use client";

import { useMemo, useState } from "react";

import { DashboardShell } from "@/components/templates/dashboard-shell";
import { DashboardTopBar } from "@/components/organisms/dashboard-topbar";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Em } from "@/components/atoms/typography";
import { EditorSectionRail } from "@/components/molecules/editor-section-rail";
import { EditorCanvas, type EditorSaveStatus } from "@/components/molecules/editor-canvas";
import { EditorPhonePreview } from "@/components/molecules/editor-phone-preview";
import { PublishControl } from "@/components/molecules/publish-control";
import { PasanganForm } from "@/components/molecules/editor-forms/pasangan-form";
import { HeroForm } from "@/components/molecules/editor-forms/hero-form";
import { AcaraForm } from "@/components/molecules/editor-forms/acara-form";
import { CeritaForm } from "@/components/molecules/editor-forms/cerita-form";
import { GaleriForm } from "@/components/molecules/editor-forms/galeri-form";
import { AmplopForm } from "@/components/molecules/editor-forms/amplop-form";
import { MusikForm } from "@/components/molecules/editor-forms/musik-form";
import { RsvpForm } from "@/components/molecules/editor-forms/rsvp-form";
import { BagikanForm } from "@/components/molecules/editor-forms/bagikan-form";
import { SECTION_DATA_DEFAULTS, type SectionId } from "@/lib/invitation/sections";
import { DEFAULT_MANIFEST } from "@/lib/invitation/manifest";
import type {
  EditorData,
  EditorMeta,
  EditorSections,
} from "@/components/templates/editor-types";
import type { DashboardChrome } from "@/server/queries/dashboard";
import type { InvitationView } from "@/server/queries/invitation";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

// ── topbar chapter title per section ─────────────────────────────
// Just the serif display title (the established "<word> <em>accent.</em>" form).
// The chapter NUMBER comes from a single source — the manifest-derived eyebrow
// ("Bab 0X dari 0Y") computed below — so no per-section number is stored here.
const CHAPTERS: Record<SectionId, { lead: string; accent: string }> = {
  hero: { lead: "Sampul ", accent: "undangan." },
  pasangan: { lead: "Pasangan ", accent: "kamu." },
  acara: { lead: "Hari ", accent: "bahagianya." },
  cerita: { lead: "Cerita ", accent: "kami." },
  galeri: { lead: "Galeri ", accent: "momen." },
  amplop: { lead: "Amplop ", accent: "digital." },
  musik: { lead: "Musik ", accent: "latar." },
  rsvp: { lead: "Konfirmasi ", accent: "tamu." },
  bagikan: { lead: "Bagikan ", accent: "undangan." },
};

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
    acara: { done: false, data: SECTION_DATA_DEFAULTS.acara },
    cerita: { done: false, title: "", body: "" },
    galeri: { done: false, data: SECTION_DATA_DEFAULTS.galeri },
    amplop: { done: false, data: SECTION_DATA_DEFAULTS.amplop },
    musik: { done: false, data: SECTION_DATA_DEFAULTS.musik },
    rsvp: { done: false, data: SECTION_DATA_DEFAULTS.rsvp },
    hero: { done: false, data: SECTION_DATA_DEFAULTS.hero },
    bagikan: { done: false, data: SECTION_DATA_DEFAULTS.bagikan },
  };
}

export type EditorProps = {
  /** Assembled editor payload, or null when the user has no wedding yet. */
  data: EditorData | null;
  /** Real sidebar chrome (couple/owner identity). */
  chrome?: DashboardChrome | null;
};

// Topbar autosave indicator. Renders "Tersimpan otomatis · baru saja" at rest,
// "Menyimpan…" while a save is in flight, and a Bahasa error line on failure.
function SaveIndicator({ status }: { status: EditorSaveStatus }) {
  if (status.state === "saving") {
    return (
      <span className="text-[11px] text-muted-ink tracking-[0.18em] uppercase font-semibold inline-flex items-center gap-[6px]">
        Menyimpan…
      </span>
    );
  }

  if (status.state === "error") {
    return (
      <span className="text-[11px] text-burgundy tracking-[0.18em] uppercase font-semibold inline-flex items-center gap-[6px]">
        <Icon name="x" size={12} stroke="var(--color-burgundy)" /> {status.message}
      </span>
    );
  }

  const label =
    status.state === "saved"
      ? "Tersimpan otomatis · baru saja"
      : "Tersimpan otomatis · 12 detik lalu";
  return (
    <span className="text-[11px] text-sage tracking-[0.18em] uppercase font-semibold inline-flex items-center gap-[6px]">
      <Icon name="check" size={12} stroke="var(--color-sage)" /> {label}
    </span>
  );
}

// Screen 02 · Editor Undangan — client orchestrator.
export function Editor({ data, chrome }: EditorProps) {
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
    acara: sections.acara.done,
    cerita: sections.cerita.done,
    galeri: sections.galeri.done,
    amplop: sections.amplop.done,
    musik: sections.musik.done,
    rsvp: sections.rsvp.done,
    hero: sections.hero.done,
    bagikan: sections.bagikan.done,
  };

  const chapter = CHAPTERS[activeSection];
  // Chapter count + position come from the manifest (templates expose a subset).
  const groupIdx = groups.findIndex((g) => g.id === activeSection);
  const eyebrow = `Editor · Bab ${pad2(groupIdx >= 0 ? groupIdx + 1 : 1)} dari ${pad2(groups.length)}`;

  // ── live preview data: assemble an InvitationView from canonical state ──
  const previewData = useMemo<InvitationView>(() => {
    const photos = gallery.photos.map((p) => ({
      id: p.id,
      url: p.url,
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
        acara: sections.acara.data,
        cerita: { title: sections.cerita.title, body: sections.cerita.body },
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

  return (
    <DashboardShell active="editor" chrome={chrome}>
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          num=""
          eyebrow={eyebrow}
          title={
            <>
              {chapter.lead}
              <Em className="text-burgundy">{chapter.accent}</Em>
            </>
          }
          actions={
            <>
              <SaveIndicator status={status} />
              <a
                href={`/inv/${meta.slug}?preview=1`}
                target="_blank"
                rel="noopener"
              >
                <Button variant="ghost" type="button">
                  <Icon name="eye" size={14} />
                  Preview
                </Button>
              </a>
              {/* Paid-gated publish: flips status → live (see publishWedding). */}
              <PublishControl slug={meta.slug} initialStatus={meta.status} />
            </>
          }
        />

        <EditorSectionRail
          groups={groups}
          active={activeSection}
          done={done}
          onSelect={setActiveSection}
        />

        {/* Canvas: dark editing surface + live phone preview */}
        <div className="flex-1 grid grid-cols-[1fr_460px] overflow-hidden">
          <EditorCanvas>
            {activeSection === "hero" && (
              <HeroForm
                value={sections.hero}
                photos={gallery.photos}
                onChange={(v) => setSections((s) => ({ ...s, hero: v }))}
                onStatusChange={setStatus}
              />
            )}
            {activeSection === "pasangan" && (
              <PasanganForm
                value={sections.pasangan}
                photos={gallery.photos}
                onChange={(v) => setSections((s) => ({ ...s, pasangan: v }))}
                onStatusChange={setStatus}
              />
            )}
            {activeSection === "acara" && (
              <AcaraForm
                value={sections.acara}
                onChange={(v) => setSections((s) => ({ ...s, acara: v }))}
                onStatusChange={setStatus}
              />
            )}
            {activeSection === "cerita" && (
              <CeritaForm
                value={sections.cerita}
                onChange={(v) => setSections((s) => ({ ...s, cerita: v }))}
                onStatusChange={setStatus}
              />
            )}
            {activeSection === "galeri" && (
              <GaleriForm
                value={sections.galeri}
                photos={gallery.photos}
                onChange={(v) => setSections((s) => ({ ...s, galeri: v }))}
                onStatusChange={setStatus}
              />
            )}
            {activeSection === "amplop" && (
              <AmplopForm
                value={sections.amplop}
                onChange={(v) => setSections((s) => ({ ...s, amplop: v }))}
                onStatusChange={setStatus}
              />
            )}
            {activeSection === "musik" && (
              <MusikForm
                value={sections.musik}
                onChange={(v) => setSections((s) => ({ ...s, musik: v }))}
                onStatusChange={setStatus}
              />
            )}
            {activeSection === "rsvp" && (
              <RsvpForm
                value={sections.rsvp}
                onChange={(v) => setSections((s) => ({ ...s, rsvp: v }))}
                onStatusChange={setStatus}
              />
            )}
            {activeSection === "bagikan" && (
              <BagikanForm
                value={sections.bagikan}
                photos={gallery.photos}
                onChange={(v) => setSections((s) => ({ ...s, bagikan: v }))}
                onStatusChange={setStatus}
              />
            )}
          </EditorCanvas>

          <EditorPhonePreview slug={meta.slug} previewData={previewData} />
        </div>
      </main>
    </DashboardShell>
  );
}

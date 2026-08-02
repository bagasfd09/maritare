"use client";

import type { EditorSaveStatus } from "@/components/molecules/editor-canvas";
import { PasanganForm } from "@/components/molecules/editor-forms/pasangan-form";
import { MomenForm } from "@/components/molecules/editor-forms/momen-form";
import { HeroForm } from "@/components/molecules/editor-forms/hero-form";
import { AcaraForm } from "@/components/molecules/editor-forms/acara-form";
import { CeritaForm } from "@/components/molecules/editor-forms/cerita-form";
import { GaleriForm } from "@/components/molecules/editor-forms/galeri-form";
import { AmplopForm } from "@/components/molecules/editor-forms/amplop-form";
import { MusikForm } from "@/components/molecules/editor-forms/musik-form";
import { RsvpForm } from "@/components/molecules/editor-forms/rsvp-form";
import { BagikanForm } from "@/components/molecules/editor-forms/bagikan-form";
import type { SectionId } from "@/lib/invitation/sections";
import type { EditorPhoto, EditorSections } from "@/components/templates/editor-types";

type ActiveSectionFormProps = {
  activeSection: SectionId;
  sections: EditorSections;
  setSections: React.Dispatch<React.SetStateAction<EditorSections>>;
  photos: EditorPhoto[];
  onStatusChange: (status: EditorSaveStatus) => void;
  /** Active wedding's template slug — a few forms adapt per template (the
   *  Sampul form hides the folk-only hero-asset block elsewhere). */
  templateSlug?: string | null;
};

// Renders the form for the currently selected section. Each form self-manages
// autosave (useSectionAutosave) and reports save lifecycle via onStatusChange.
// Shared by the desktop canvas and the mobile editor so both expose every
// section identically.
export function ActiveSectionForm({
  activeSection,
  sections,
  setSections,
  photos,
  onStatusChange,
  templateSlug,
}: ActiveSectionFormProps) {
  switch (activeSection) {
    case "hero":
      return (
        <HeroForm
          value={sections.hero}
          photos={photos}
          onChange={(v) => setSections((s) => ({ ...s, hero: v }))}
          onStatusChange={onStatusChange}
          // Folk shows the hero asset full-bleed at the top; Onyx uses the same
          // upload as its fixed cinematic backdrop (video or still) behind every
          // section, so both need the block — with Onyx's own wording, since
          // "tampil di paling atas" would be wrong there.
          heroAsset={templateSlug === "folk" || templateSlug === "onyx"}
          {...(templateSlug === "onyx"
            ? {
                heroAssetTitle: "Latar Undangan — Foto / Video",
                heroAssetHint: (
                  <>
                    Media <strong className="text-cream">full-screen</strong> yang jadi{" "}
                    <strong className="text-cream">latar belakang</strong> seluruh undangan — semua
                    bagian bergulir di atasnya. Bisa <strong className="text-cream">foto</strong>{" "}
                    atau <strong className="text-cream">video</strong> (autoplay, tanpa suara).
                    Kalau kosong, otomatis pakai foto sampul.
                  </>
                ),
                // Onyx always renders the backdrop full-bleed — the toggle would
                // do nothing, so it isn't shown.
                heroFullWidthToggle: false,
              }
            : {})}
          // Only templates whose closing section renders the isClosing photo
          // (folk footnote, ivory footnote, onyx closing band) get the Penutup
          // upload block.
          closingAsset={
            templateSlug === "folk" || templateSlug === "ivory" || templateSlug === "onyx"
          }
        />
      );
    case "pasangan":
      return (
        <PasanganForm
          value={sections.pasangan}
          photos={photos}
          onChange={(v) => setSections((s) => ({ ...s, pasangan: v }))}
          onStatusChange={onStatusChange}
        />
      );
    case "momen":
      return (
        <MomenForm
          value={sections.momen}
          onChange={(v) => setSections((s) => ({ ...s, momen: v }))}
          onStatusChange={onStatusChange}
        />
      );
    case "acara":
      return (
        <AcaraForm
          value={sections.acara}
          onChange={(v) => setSections((s) => ({ ...s, acara: v }))}
          onStatusChange={onStatusChange}
        />
      );
    case "cerita":
      return (
        <CeritaForm
          value={sections.cerita}
          photos={photos}
          onChange={(v) => setSections((s) => ({ ...s, cerita: v }))}
          onStatusChange={onStatusChange}
        />
      );
    case "galeri":
      return (
        <GaleriForm
          value={sections.galeri}
          photos={photos}
          onChange={(v) => setSections((s) => ({ ...s, galeri: v }))}
          onStatusChange={onStatusChange}
        />
      );
    case "amplop":
      return (
        <AmplopForm
          value={sections.amplop}
          onChange={(v) => setSections((s) => ({ ...s, amplop: v }))}
          onStatusChange={onStatusChange}
        />
      );
    case "musik":
      return (
        <MusikForm
          value={sections.musik}
          onChange={(v) => setSections((s) => ({ ...s, musik: v }))}
          onStatusChange={onStatusChange}
        />
      );
    case "rsvp":
      return (
        <RsvpForm
          value={sections.rsvp}
          onChange={(v) => setSections((s) => ({ ...s, rsvp: v }))}
          onStatusChange={onStatusChange}
        />
      );
    case "bagikan":
      return (
        <BagikanForm
          value={sections.bagikan}
          photos={photos}
          onChange={(v) => setSections((s) => ({ ...s, bagikan: v }))}
          onStatusChange={onStatusChange}
        />
      );
    default:
      return null;
  }
}

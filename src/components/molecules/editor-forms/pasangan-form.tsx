"use client";

import { useCallback } from "react";

import type { EditorSaveStatus } from "@/components/molecules/editor-canvas";
import { COUPLE_INTRO_DEFAULTS, type PasanganData } from "@/lib/invitation/sections";
import type { EditorPhoto } from "@/components/templates/editor-types";
import {
  DoneToggle,
  FieldLabel,
  FormHeading,
  PhotoPicker,
  TextArea,
  TextField,
  Toggle,
} from "@/components/molecules/editor-forms/form-ui";
import { useSectionAutosave } from "@/components/molecules/editor-forms/use-section-autosave";

// Strip empty-string optionals → undefined so Zod min(1)/optional fields don't
// reject blank inputs (the action validates the complete payload).
function clean(v: string | undefined): string | undefined {
  const t = (v ?? "").trim();
  return t.length > 0 ? t : undefined;
}

type Person = PasanganData["groom"];

export type PasanganValue = { done: boolean; data: PasanganData };

type PasanganFormProps = {
  value: PasanganValue;
  onChange: (next: PasanganValue) => void;
  photos: EditorPhoto[];
  onStatusChange?: (status: EditorSaveStatus) => void;
};

// Build the complete, Zod-friendly pasangan payload from canonical state.
function toPayload(data: PasanganData): Record<string, unknown> {
  const person = (p: Person) => ({
    fullName: p.fullName ?? "",
    fatherName: clean(p.fatherName),
    motherName: clean(p.motherName),
    childOrder: clean(p.childOrder),
    instagram: clean(p.instagram),
    photoId: p.photoId,
  });
  const quote = data.quote;
  const intro = data.intro;
  return {
    groom: person(data.groom),
    bride: person(data.bride),
    quote: quote
      ? {
          arabic: clean(quote.arabic),
          text: clean(quote.text),
          source: clean(quote.source),
        }
      : undefined,
    intro: intro
      ? {
          title: clean(intro.title),
          description: clean(intro.description),
        }
      : undefined,
    showHeroText: data.showHeroText,
  };
}

function PersonColumn({
  title,
  person,
  photos,
  onPatch,
}: {
  title: string;
  person: Person;
  photos: EditorPhoto[];
  onPatch: (patch: Partial<Person>) => void;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="font-display italic text-[22px] text-cream mb-5">{title}</div>

      <FieldLabel>Nama lengkap</FieldLabel>
      <TextField
        value={person.fullName ?? ""}
        onChange={(e) => onPatch({ fullName: e.target.value })}
        placeholder="cth. Andi Pratama, S.T."
        className="mb-5"
        maxLength={120}
      />

      {/* The old "Anak ke-" label read like it wanted a bare number, so people
          typed "2" and the invitation rendered "2 Bapak …" — every template
          prints this field verbatim in front of the father's name. */}
      <FieldLabel>Urutan anak</FieldLabel>
      <TextField
        value={person.childOrder ?? ""}
        onChange={(e) => onPatch({ childOrder: e.target.value })}
        placeholder="cth. Anak kedua dari"
        className="mb-5"
        maxLength={80}
      />

      <FieldLabel>Nama ayah</FieldLabel>
      <TextField
        value={person.fatherName ?? ""}
        onChange={(e) => onPatch({ fatherName: e.target.value })}
        placeholder="Nama ayah"
        className="mb-5"
        maxLength={120}
      />

      <FieldLabel>Nama ibu</FieldLabel>
      <TextField
        value={person.motherName ?? ""}
        onChange={(e) => onPatch({ motherName: e.target.value })}
        placeholder="Nama ibu"
        className="mb-5"
        maxLength={120}
      />

      <FieldLabel>Instagram</FieldLabel>
      <div className="flex items-center gap-1 border-b border-[rgba(245,239,230,0.2)] mb-5 focus-within:border-[rgba(245,239,230,0.5)] transition-colors">
        <span className="text-[15px] text-[rgba(245,239,230,0.5)]">@</span>
        <input
          value={person.instagram ?? ""}
          onChange={(e) => onPatch({ instagram: e.target.value.replace(/^@+/, "") })}
          placeholder="username"
          maxLength={60}
          className="flex-1 bg-transparent border-none outline-none text-[15px] font-body text-cream py-[7px] placeholder:text-[rgba(245,239,230,0.32)]"
        />
      </div>

      <FieldLabel>Foto profil</FieldLabel>
      <PhotoPicker
        photos={photos}
        selected={person.photoId}
        onSelect={(photoId) => onPatch({ photoId })}
      />
    </div>
  );
}

// "Pasangan kamu" — couple profiles (two columns) + opening quote.
export function PasanganForm({ value, onChange, photos, onStatusChange }: PasanganFormProps) {
  const buildPayload = useCallback(
    () => ({ data: toPayload(value.data), done: value.done }),
    [value],
  );
  const { scheduleSave, flush, saveNow } = useSectionAutosave({
    sectionId: "pasangan",
    buildPayload,
    onStatusChange,
  });

  function patchData(patch: Partial<PasanganData>, save: "schedule" | "now" = "schedule") {
    const next = { ...value, data: { ...value.data, ...patch } };
    onChange(next);
    if (save === "now") saveNow({ data: toPayload(next.data), done: next.done });
    else scheduleSave();
  }

  function setDone(done: boolean) {
    onChange({ ...value, done });
    saveNow({ ...buildPayload(), done });
  }

  const quote = value.data.quote ?? {};
  const intro = value.data.intro ?? {};

  return (
    <div className="max-w-[680px] mx-auto">
      <FormHeading>Mempelai</FormHeading>

      <div className="flex flex-col md:flex-row gap-9">
        <PersonColumn
          title="Mempelai Pria"
          person={value.data.groom}
          photos={photos}
          onPatch={(patch) => patchData({ groom: { ...value.data.groom, ...patch } })}
        />
        <div className="w-px bg-[rgba(245,239,230,0.1)] self-stretch hidden md:block" />
        <PersonColumn
          title="Mempelai Wanita"
          person={value.data.bride}
          photos={photos}
          onPatch={(patch) => patchData({ bride: { ...value.data.bride, ...patch } })}
        />
      </div>

      <fieldset className="mt-9 pt-7 border-t border-[rgba(245,239,230,0.1)] border-x-0 border-b-0">
        <legend className="font-display italic text-[18px] text-cream mb-4 px-0">
          Kalimat sambutan
        </legend>

        <FieldLabel>Judul</FieldLabel>
        {/* TextArea (not a single-line input) so a long headline wraps downward
            instead of scrolling off to the side — it renders as a multi-line h1. */}
        <TextArea
          value={intro.title ?? ""}
          onChange={(e) => patchData({ intro: { ...intro, title: e.target.value } })}
          onBlur={flush}
          placeholder={COUPLE_INTRO_DEFAULTS.title}
          className="min-h-[60px] mb-5"
          maxLength={160}
        />

        <FieldLabel>Deskripsi</FieldLabel>
        <TextArea
          value={intro.description ?? ""}
          onChange={(e) => patchData({ intro: { ...intro, description: e.target.value } })}
          onBlur={flush}
          placeholder={COUPLE_INTRO_DEFAULTS.description}
          className="min-h-[110px]"
          maxLength={800}
        />
        <p className="mt-2 text-[12px] leading-[1.6] text-[rgba(245,239,230,0.5)]">
          Kalimat manis yang tampil di atas foto kedua mempelai. Kosongkan untuk pakai teks bawaan
          template.
        </p>
      </fieldset>

      <fieldset className="mt-9 pt-7 border-t border-[rgba(245,239,230,0.1)] border-x-0 border-b-0">
        <legend className="font-display italic text-[18px] text-cream mb-4 px-0">
          Kutipan ayat / quote
        </legend>

        <FieldLabel>Teks kutipan</FieldLabel>
        <TextArea
          value={quote.text ?? ""}
          onChange={(e) => patchData({ quote: { ...quote, text: e.target.value } })}
          onBlur={flush}
          placeholder="cth. Dan di antara tanda-tanda kekuasaan-Nya…"
          className="min-h-[80px] mb-5"
          maxLength={600}
        />

        <FieldLabel>Sumber</FieldLabel>
        <TextField
          value={quote.source ?? ""}
          onChange={(e) => patchData({ quote: { ...quote, source: e.target.value } })}
          onBlur={flush}
          placeholder="cth. Q.S. Ar-Rum: 21"
          className="mb-5"
          maxLength={120}
        />

        <FieldLabel>Teks arab (opsional)</FieldLabel>
        <TextArea
          dir="rtl"
          value={quote.arabic ?? ""}
          onChange={(e) => patchData({ quote: { ...quote, arabic: e.target.value } })}
          onBlur={flush}
          placeholder="نص عربي اختياري"
          className="min-h-[70px] text-right"
          maxLength={400}
        />
      </fieldset>

      <div className="mt-9 pt-7 border-t border-[rgba(245,239,230,0.1)]">
        <Toggle
          checked={value.data.showHeroText ?? true}
          onChange={(next) => patchData({ showHeroText: next }, "now")}
          label="Tampilkan nama & tanggal di sampul"
        />
        <p className="mt-2 text-[12px] leading-[1.6] text-[rgba(245,239,230,0.5)]">
          Matikan kalau ilustrasi/foto sampul kamu sudah memuat nama &amp; tanggal.
        </p>
      </div>

      <DoneToggle done={value.done} onChange={setDone} />
    </div>
  );
}

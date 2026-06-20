"use client";

import { useCallback } from "react";

import type { EditorSaveStatus } from "@/components/molecules/editor-canvas";
import {
  DoneToggle,
  FieldLabel,
  FormHeading,
  TextArea,
} from "@/components/molecules/editor-forms/form-ui";
import { useSectionAutosave } from "@/components/molecules/editor-forms/use-section-autosave";

const TITLE_MAX = 120;
const BODY_MAX = 600;

export type CeritaValue = { done: boolean; title: string; body: string };

type CeritaFormProps = {
  value: CeritaValue;
  onChange: (next: CeritaValue) => void;
  onStatusChange?: (status: EditorSaveStatus) => void;
};

// "Cerita kami" (Our Story) — the original cerita editor, title + body, kept
// with its 120 / 600 counters. Saves title/body/done into sections.cerita.
export function CeritaForm({ value, onChange, onStatusChange }: CeritaFormProps) {
  const buildPayload = useCallback(
    () => ({ title: value.title, body: value.body, done: value.done }),
    [value],
  );
  const { scheduleSave, flush, saveNow } = useSectionAutosave({
    sectionId: "cerita",
    buildPayload,
    onStatusChange,
  });

  function update(patch: Partial<CeritaValue>, save: "schedule" | "now" = "schedule") {
    const next = { ...value, ...patch };
    onChange(next);
    if (save === "now") saveNow({ title: next.title, body: next.body, done: next.done });
    else scheduleSave();
  }

  return (
    <div className="max-w-[580px] mx-auto">
      <FormHeading>Our Story</FormHeading>

      <FieldLabel>Judul section</FieldLabel>
      {/* Textarea (not a single-line input) so a long title wraps downward
          instead of scrolling off to the side — renders as a multi-line heading. */}
      <textarea
        value={value.title}
        maxLength={TITLE_MAX}
        rows={2}
        onChange={(e) => update({ title: e.target.value })}
        onBlur={flush}
        placeholder="Beri judul section ini"
        className="block w-full resize-none bg-transparent border-none outline-none font-display italic text-[36px] font-normal leading-[1.15] text-cream py-2 border-b border-[rgba(245,239,230,0.2)] mb-2 tracking-[-0.015em] placeholder:text-[rgba(245,239,230,0.3)]"
      />
      <div className="text-right text-[11px] text-[rgba(245,239,230,0.5)] mb-7">
        {value.title.length} / {TITLE_MAX}
      </div>

      <FieldLabel className="mb-[10px]">Tulis ceritamu</FieldLabel>
      <TextArea
        value={value.body}
        maxLength={BODY_MAX}
        onChange={(e) => update({ body: e.target.value })}
        onBlur={flush}
        placeholder="Ceritakan bagaimana kalian bertemu…"
        className="min-h-[200px] font-display italic text-[17px] leading-[1.7]"
      />

      <div className="text-right text-[11px] text-[rgba(245,239,230,0.5)] mt-[10px]">
        {value.body.length} / {BODY_MAX} karakter
      </div>

      <DoneToggle done={value.done} onChange={(done) => update({ done }, "now")} />
    </div>
  );
}

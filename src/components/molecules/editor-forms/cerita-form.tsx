"use client";

import { useCallback } from "react";

import type { EditorSaveStatus } from "@/components/molecules/editor-canvas";
import type { CeritaData } from "@/lib/invitation/sections";
import type { EditorPhoto } from "@/components/templates/editor-types";
import {
  AddButton,
  DoneToggle,
  FieldLabel,
  FormHeading,
  PhotoPicker,
  RepeaterCard,
  TextArea,
  TextField,
} from "@/components/molecules/editor-forms/form-ui";
import { useSectionAutosave } from "@/components/molecules/editor-forms/use-section-autosave";
import type { SectionPayload } from "@/components/molecules/editor-forms/use-section-autosave";

const MAX_ITEMS = 12;
const TITLE_MAX = 120; // section heading
const ITEM_TITLE_MAX = 120;
const ITEM_BODY_MAX = 1200;

const PLACEHOLDER_TITLES = ["Awal pertemuan", "Perjalanan", "Bersatu selamanya"];

// All-string draft row so the inputs stay controlled; empty rows are dropped
// before saving (mirrors acara-form's repeater).
type DraftItem = { photoId?: string; title: string; body: string };
const EMPTY_ITEM: DraftItem = { title: "", body: "" };

export type CeritaValue = { done: boolean; title: string; body: string; data: CeritaData };

type CeritaFormProps = {
  value: CeritaValue;
  photos: EditorPhoto[];
  onChange: (next: CeritaValue) => void;
  onStatusChange?: (status: EditorSaveStatus) => void;
};

function toDraft(it: CeritaData["items"][number]): DraftItem {
  return { photoId: it.photoId, title: it.title ?? "", body: it.body ?? "" };
}

// Complete cerita payload: section heading (title) + the slide items (drop empty
// rows, strip blank optionals). `body` is intentionally not sent — the legacy
// free-text is preserved untouched and only used as a fallback when items=[].
function toPayload(items: DraftItem[], title: string): SectionPayload {
  const cleaned = items
    .filter((it) => it.photoId || it.title.trim() || it.body.trim())
    .map((it) => ({
      photoId: it.photoId,
      title: it.title.trim() || undefined,
      body: it.body.trim() || undefined,
    }));
  return { title: title.trim(), data: { items: cleaned } };
}

// "Our Story" — section heading + a repeater of story slides (photo + title +
// body). Each item renders as one swipeable slide in the invitation.
export function CeritaForm({ value, photos, onChange, onStatusChange }: CeritaFormProps) {
  const drafts: DraftItem[] = value.data.items.map(toDraft);

  const buildPayload = useCallback(
    () => ({ ...toPayload(value.data.items.map(toDraft), value.title), done: value.done }),
    [value],
  );
  const { scheduleSave, flush, saveNow } = useSectionAutosave({
    sectionId: "cerita",
    buildPayload,
    onStatusChange,
  });

  function commit(next: DraftItem[], save: "schedule" | "now" = "schedule") {
    const items = next.map((d) => ({
      photoId: d.photoId,
      title: d.title || undefined,
      body: d.body || undefined,
    })) as CeritaData["items"];
    onChange({ ...value, data: { items } });
    if (save === "now") saveNow({ ...toPayload(next, value.title), done: value.done });
    else scheduleSave();
  }

  function setTitle(title: string) {
    onChange({ ...value, title });
    scheduleSave();
  }

  function patchItem(index: number, patch: Partial<DraftItem>, save: "schedule" | "now" = "schedule") {
    commit(
      drafts.map((d, i) => (i === index ? { ...d, ...patch } : d)),
      save,
    );
  }

  function addItem() {
    if (drafts.length >= MAX_ITEMS) return;
    commit([...drafts, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    commit(
      drafts.filter((_, i) => i !== index),
      "now",
    );
  }

  function setDone(done: boolean) {
    onChange({ ...value, done });
    saveNow({ ...buildPayload(), done });
  }

  return (
    <div className="max-w-[620px] mx-auto">
      <FormHeading>Our Story</FormHeading>

      <FieldLabel>Judul section</FieldLabel>
      <TextField
        value={value.title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={flush}
        placeholder="Perjalanan Kami"
        maxLength={TITLE_MAX}
        className="mb-2"
      />
      <p className="mb-6 text-[12px] leading-[1.6] text-[rgba(245,239,230,0.5)]">
        Tiap babak tampil sebagai satu slide yang bisa digeser. Tambahkan foto, judul, dan cerita
        singkat untuk tiap babak biar nggak panjang ke bawah.
      </p>

      <div className="flex flex-col gap-4">
        {drafts.map((it, i) => (
          <RepeaterCard key={i} onRemove={() => removeItem(i)}>
            <FieldLabel>Babak {i + 1} · Foto (opsional)</FieldLabel>
            <div className="mb-4">
              <PhotoPicker
                photos={photos}
                selected={it.photoId}
                onSelect={(photoId) => patchItem(i, { photoId }, "now")}
              />
            </div>

            <FieldLabel>Judul babak</FieldLabel>
            <TextField
              value={it.title}
              onChange={(e) => patchItem(i, { title: e.target.value })}
              onBlur={flush}
              placeholder={`cth. ${PLACEHOLDER_TITLES[i] ?? "Babak baru"}`}
              maxLength={ITEM_TITLE_MAX}
              className="mb-4"
            />

            <FieldLabel>Cerita</FieldLabel>
            <TextArea
              value={it.body}
              onChange={(e) => patchItem(i, { body: e.target.value })}
              onBlur={flush}
              placeholder="Ceritakan babak ini…"
              className="min-h-[110px]"
              maxLength={ITEM_BODY_MAX}
            />
            <div className="mt-1 text-right text-[11px] text-[rgba(245,239,230,0.4)]">
              {it.body.length} / {ITEM_BODY_MAX}
            </div>
          </RepeaterCard>
        ))}

        {drafts.length < MAX_ITEMS && <AddButton onClick={addItem}>Tambah babak cerita</AddButton>}
      </div>

      <DoneToggle done={value.done} onChange={setDone} />
    </div>
  );
}

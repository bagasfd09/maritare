"use client";

import { useCallback } from "react";

import type { EditorSaveStatus } from "@/components/molecules/editor-canvas";
import { isCompleteEvent, type AcaraData, type AcaraEvent } from "@/lib/invitation/sections";
import {
  AddButton,
  DoneToggle,
  FieldLabel,
  FormHeading,
  RepeaterCard,
  TextArea,
  TextField,
} from "@/components/molecules/editor-forms/form-ui";
import { useSectionAutosave } from "@/components/molecules/editor-forms/use-section-autosave";

const MAX_EVENTS = 4;

// A blank event row used by the repeater while editing (all strings present so
// the inputs are controlled; empty rows are dropped before saving).
type DraftEvent = {
  name: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  venue: string;
  address: string;
  mapsUrl: string;
};

const EMPTY_EVENT: DraftEvent = {
  name: "",
  date: "",
  timeStart: "",
  timeEnd: "",
  venue: "",
  address: "",
  mapsUrl: "",
};

export type AcaraValue = { done: boolean; data: AcaraData };

type AcaraFormProps = {
  value: AcaraValue;
  onChange: (next: AcaraValue) => void;
  onStatusChange?: (status: EditorSaveStatus) => void;
};

function toDraft(e: AcaraEvent): DraftEvent {
  return {
    name: e.name ?? "",
    date: e.date ?? "",
    timeStart: e.timeStart ?? "",
    timeEnd: e.timeEnd ?? "",
    venue: e.venue ?? "",
    address: e.address ?? "",
    mapsUrl: e.mapsUrl ?? "",
  };
}

// Same story for the map link: acaraEventSchema takes an https URL only, so a
// pasted "maps.app.goo.gl/…" or a half-typed one would sink the whole save.
// Drop it until it's a real https link rather than reject the event with it.
function cleanMapsUrl(raw: string): string | undefined {
  const url = raw.trim();
  return url.startsWith("https://") ? url : undefined;
}

// Build the complete acara payload: drop rows that can't be stored yet, strip
// empty optionals.
function toPayload(events: DraftEvent[], title: string, subtitle: string): Record<string, unknown> {
  const cleaned = events.filter(isCompleteEvent).map((e) => ({
    name: e.name.trim(),
    date: e.date.trim(),
    timeStart: e.timeStart.trim(),
    timeEnd: e.timeEnd.trim() || undefined,
    venue: e.venue.trim(),
    address: e.address.trim() || undefined,
    mapsUrl: cleanMapsUrl(e.mapsUrl),
  }));
  return { title: title.trim() || undefined, subtitle: subtitle.trim() || undefined, events: cleaned };
}

const PLACEHOLDER_NAMES = ["Akad Nikah", "Resepsi"];

export function AcaraForm({ value, onChange, onStatusChange }: AcaraFormProps) {
  // Work against draft rows (all-string) derived from canonical data.
  const drafts: DraftEvent[] = value.data.events.map(toDraft);

  const buildPayload = useCallback(
    () => ({
      data: toPayload(
        value.data.events.map(toDraft),
        value.data.title ?? "",
        value.data.subtitle ?? "",
      ),
      done: value.done,
    }),
    [value],
  );
  const { scheduleSave, flush, saveNow } = useSectionAutosave({
    sectionId: "acara",
    buildPayload,
    onStatusChange,
  });

  // Persist drafts back into canonical AcaraData (kept loosely as the same shape;
  // empty optionals are normalized at save time by toPayload).
  function commit(next: DraftEvent[], save: "schedule" | "now" = "schedule") {
    const events = next.map((d) => ({
      name: d.name,
      date: d.date,
      timeStart: d.timeStart,
      timeEnd: d.timeEnd || undefined,
      venue: d.venue,
      address: d.address || undefined,
      mapsUrl: d.mapsUrl || undefined,
    })) as AcaraData["events"];
    onChange({ ...value, data: { ...value.data, events } });
    if (save === "now")
      saveNow({
        data: toPayload(next, value.data.title ?? "", value.data.subtitle ?? ""),
        done: value.done,
      });
    else scheduleSave();
  }

  // Update the section heading / sub-line, preserving the events list.
  function patchMeta(patch: { title?: string; subtitle?: string }) {
    onChange({ ...value, data: { ...value.data, ...patch } });
    scheduleSave();
  }

  function patchEvent(index: number, patch: Partial<DraftEvent>) {
    const next = drafts.map((d, i) => (i === index ? { ...d, ...patch } : d));
    commit(next);
  }

  function addEvent() {
    if (drafts.length >= MAX_EVENTS) return;
    commit([...drafts, { ...EMPTY_EVENT }]);
  }

  function removeEvent(index: number) {
    commit(drafts.filter((_, i) => i !== index));
  }

  function setDone(done: boolean) {
    onChange({ ...value, done });
    saveNow({ ...buildPayload(), done });
  }

  return (
    <div className="max-w-[620px] mx-auto">
      <FormHeading>Acara</FormHeading>

      <div className="mb-5 flex flex-col gap-4">
        <div>
          <FieldLabel>Judul</FieldLabel>
          <TextField
            value={value.data.title ?? ""}
            onChange={(ev) => patchMeta({ title: ev.target.value })}
            onBlur={flush}
            placeholder="Love is Calling,"
            maxLength={120}
          />
        </div>
        <div>
          <FieldLabel>Subjudul</FieldLabel>
          <TextField
            value={value.data.subtitle ?? ""}
            onChange={(ev) => patchMeta({ subtitle: ev.target.value })}
            onBlur={flush}
            placeholder="Save the Date!"
            maxLength={300}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {drafts.map((e, i) => (
          <RepeaterCard key={i} onRemove={() => removeEvent(i)}>
            <FieldLabel>Nama acara</FieldLabel>
            <TextField
              value={e.name}
              onChange={(ev) => patchEvent(i, { name: ev.target.value })}
              onBlur={flush}
              placeholder={PLACEHOLDER_NAMES[i] ?? "cth. Akad Nikah"}
              maxLength={80}
              className="mb-4"
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <FieldLabel>Tanggal</FieldLabel>
                <TextField
                  type="date"
                  value={e.date}
                  onChange={(ev) => patchEvent(i, { date: ev.target.value })}
                  onBlur={flush}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Mulai</FieldLabel>
                  <TextField
                    type="time"
                    value={e.timeStart}
                    onChange={(ev) => patchEvent(i, { timeStart: ev.target.value })}
                    onBlur={flush}
                  />
                </div>
                <div>
                  <FieldLabel>Selesai</FieldLabel>
                  <TextField
                    type="time"
                    value={e.timeEnd}
                    onChange={(ev) => patchEvent(i, { timeEnd: ev.target.value })}
                    onBlur={flush}
                  />
                </div>
              </div>
            </div>

            <FieldLabel>Tempat</FieldLabel>
            <TextField
              value={e.venue}
              onChange={(ev) => patchEvent(i, { venue: ev.target.value })}
              onBlur={flush}
              placeholder="cth. Gedung Serbaguna"
              maxLength={160}
              className="mb-4"
            />

            <FieldLabel>Alamat</FieldLabel>
            <TextArea
              value={e.address}
              onChange={(ev) => patchEvent(i, { address: ev.target.value })}
              onBlur={flush}
              placeholder="Alamat lengkap"
              className="min-h-[64px] mb-4"
              maxLength={300}
            />

            <FieldLabel>Link Google Maps</FieldLabel>
            <TextField
              type="url"
              value={e.mapsUrl}
              onChange={(ev) => patchEvent(i, { mapsUrl: ev.target.value })}
              onBlur={flush}
              placeholder="https://maps.google.com/…"
              maxLength={500}
            />

            {/* Incomplete rows are held back from the save (see isCompleteEvent),
                so say so — otherwise a half-filled acara vanishes on reload with
                no explanation. */}
            {!isCompleteEvent(e) && (
              <p className="mt-4 text-[11px] leading-relaxed text-[rgba(245,239,230,0.45)]">
                Isi <span className="text-cream">nama acara</span>,{" "}
                <span className="text-cream">tanggal</span>, dan{" "}
                <span className="text-cream">jam mulai</span> dulu ya — acara ini belum tersimpan.
              </p>
            )}
          </RepeaterCard>
        ))}

        {drafts.length < MAX_EVENTS && (
          <AddButton onClick={addEvent}>Tambah acara</AddButton>
        )}
      </div>

      <DoneToggle done={value.done} onChange={setDone} />
    </div>
  );
}

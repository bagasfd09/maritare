"use client";

import { useCallback } from "react";

import type { EditorSaveStatus } from "@/components/molecules/editor-canvas";
import type { RsvpData } from "@/lib/invitation/sections";
import {
  DoneToggle,
  FieldLabel,
  FormHeading,
  TextField,
  Toggle,
} from "@/components/molecules/editor-forms/form-ui";
import { useSectionAutosave } from "@/components/molecules/editor-forms/use-section-autosave";

export type RsvpValue = { done: boolean; data: RsvpData };

type RsvpFormProps = {
  value: RsvpValue;
  onChange: (next: RsvpValue) => void;
  onStatusChange?: (status: EditorSaveStatus) => void;
};

// Spread, not a hand-listed whitelist: RsvpData carries no server-resolved
// fields (unlike musik.audioUrl), the action re-validates with rsvpDataSchema
// anyway, and an enumerated list silently DROPS any field added later.
function toPayload(data: RsvpData): Record<string, unknown> {
  return { ...data, deadline: data.deadline?.trim() || undefined };
}

export function RsvpForm({ value, onChange, onStatusChange }: RsvpFormProps) {
  const buildPayload = useCallback(
    () => ({ data: toPayload(value.data), done: value.done }),
    [value],
  );
  const { scheduleSave, flush, saveNow } = useSectionAutosave({
    sectionId: "rsvp",
    buildPayload,
    onStatusChange,
  });

  function patchData(patch: Partial<RsvpData>, save: "schedule" | "now" = "now") {
    const next = { ...value, data: { ...value.data, ...patch } };
    onChange(next);
    if (save === "now") saveNow({ data: toPayload(next.data), done: next.done });
    else scheduleSave();
  }

  function setDone(done: boolean) {
    onChange({ ...value, done });
    saveNow({ ...buildPayload(), done });
  }

  return (
    <div className="max-w-[560px] mx-auto">
      <FormHeading>Konfirmasi tamu</FormHeading>

      <div className="mb-7">
        <Toggle
          checked={value.data.enabled}
          onChange={(enabled) => patchData({ enabled })}
          label="Aktifkan form RSVP di undangan"
        />
      </div>

      <div className="mb-7">
        <Toggle
          checked={value.data.showQr}
          onChange={(showQr) => patchData({ showQr })}
          label="Tampilkan QR check-in tamu"
        />
        <p className="mt-2 text-[11px] text-[rgba(245,239,230,0.5)]">
          Matikan kalau kamu nggak pakai buku tamu QR di lokasi acara.
        </p>
      </div>

      <FieldLabel>Batas konfirmasi</FieldLabel>
      <TextField
        type="date"
        value={value.data.deadline ?? ""}
        onChange={(e) => patchData({ deadline: e.target.value }, "schedule")}
        onBlur={flush}
        className="mb-7"
      />

      <FieldLabel>Maksimal tamu per RSVP</FieldLabel>
      <TextField
        type="number"
        min={1}
        max={10}
        value={String(value.data.maxPartySize)}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) {
            patchData({ maxPartySize: Math.min(10, Math.max(1, Math.round(n))) }, "schedule");
          }
        }}
        onBlur={flush}
        className="max-w-[120px]"
      />

      <DoneToggle done={value.done} onChange={setDone} />
    </div>
  );
}

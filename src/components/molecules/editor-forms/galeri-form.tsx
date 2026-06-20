"use client";

import { useCallback } from "react";

import type { EditorSaveStatus } from "@/components/molecules/editor-canvas";
import type { EditorPhoto } from "@/components/templates/editor-types";
import type { GaleriData } from "@/lib/invitation/sections";
import { Icon } from "@/components/atoms/icon";
import {
  DoneToggle,
  FormHeading,
} from "@/components/molecules/editor-forms/form-ui";
import { useSectionAutosave } from "@/components/molecules/editor-forms/use-section-autosave";

export type GaleriValue = { done: boolean; data: GaleriData };

type GaleriFormProps = {
  value: GaleriValue;
  onChange: (next: GaleriValue) => void;
  photos: EditorPhoto[];
  onStatusChange?: (status: EditorSaveStatus) => void;
};

// "Galeri momen" — curate which gallery photos appear in the invitation. Photos
// are uploaded/managed on /dashboard/gallery; here the owner PICKS which of them
// show in the invitation's gallery grid (nothing shows until picked). Cover and
// closing photos live in their own sections, so they're not offered here.
export function GaleriForm({ value, onChange, photos, onStatusChange }: GaleriFormProps) {
  // Only photos that can actually appear in the grid are selectable.
  const selectable = photos.filter((p) => !p.isCover && !p.isClosing);
  const selectableIds = selectable.map((p) => p.id);

  // Effective selection = stored ids ∩ currently-selectable photos (drops cover/
  // closing/deleted ids so the saved list never carries stale entries).
  const selected = value.data.selectedPhotoIds.filter((id) => selectableIds.includes(id));
  const selectedSet = new Set(selected);

  const buildPayload = useCallback(() => {
    // Recompute from props (not the derived `selected` array) so the memo dep is
    // stable: keep only ids that still point at a selectable photo.
    const ids = value.data.selectedPhotoIds.filter((id) =>
      photos.some((p) => p.id === id && !p.isCover && !p.isClosing),
    );
    return { data: { selectedPhotoIds: ids }, done: value.done };
  }, [value, photos]);
  const { saveNow } = useSectionAutosave({
    sectionId: "galeri",
    buildPayload,
    onStatusChange,
  });

  function commit(nextIds: string[]) {
    const next: GaleriValue = { ...value, data: { selectedPhotoIds: nextIds } };
    onChange(next);
    saveNow({ data: { selectedPhotoIds: nextIds }, done: next.done });
  }

  function toggle(id: string) {
    // Keep the saved order aligned with how photos appear in the gallery.
    const next = selectableIds.filter((pid) =>
      pid === id ? !selectedSet.has(id) : selectedSet.has(pid),
    );
    commit(next);
  }

  function selectAll() {
    commit(selectableIds);
  }

  function clearAll() {
    commit([]);
  }

  function setDone(done: boolean) {
    const next: GaleriValue = { ...value, done };
    onChange(next);
    saveNow({ data: { selectedPhotoIds: selected }, done });
  }

  const allSelected = selectable.length > 0 && selected.length === selectable.length;

  return (
    <div className="max-w-[620px] mx-auto">
      <FormHeading>Galeri momen</FormHeading>

      <p className="text-[13px] text-[rgba(245,239,230,0.6)] leading-[1.6] mb-5">
        Pilih foto mana yang tampil di galeri undangan. Foto yang tidak dicentang{" "}
        <strong className="text-cream">tidak ditampilkan</strong> ke tamu. Upload &amp; kelola foto
        di halaman Galeri.
      </p>

      {selectable.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-[rgba(245,239,230,0.22)] p-8 text-center">
          <div className="text-[13px] text-[rgba(245,239,230,0.6)] mb-3">
            Belum ada foto galeri yang bisa dipilih.
          </div>
          <a
            href="/dashboard/gallery"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-peach hover:text-cream"
          >
            Kelola foto di halaman Galeri <Icon name="arrow-r" size={13} />
          </a>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] text-[rgba(245,239,230,0.65)]">
              <strong className="text-cream">{selected.length}</strong> dari {selectable.length} foto
              dipilih
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={selectAll}
                disabled={allSelected}
                className="text-[12px] font-semibold text-peach hover:text-cream disabled:opacity-40 disabled:hover:text-peach"
              >
                Pilih semua
              </button>
              <button
                type="button"
                onClick={clearAll}
                disabled={selected.length === 0}
                className="text-[12px] font-semibold text-[rgba(245,239,230,0.55)] hover:text-cream disabled:opacity-40"
              >
                Kosongkan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-5">
            {selectable.map((p) => {
              const on = selectedSet.has(p.id);
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  aria-pressed={on}
                  className={cnSlot(on)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL, not a static asset */}
                  <img
                    src={p.url}
                    alt={p.label ?? ""}
                    className={`w-full h-full object-cover transition ${on ? "" : "opacity-45"}`}
                  />
                  <span
                    className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center border ${
                      on
                        ? "bg-burgundy border-burgundy text-cream"
                        : "bg-[rgba(20,12,12,0.55)] border-[rgba(245,239,230,0.5)] text-transparent"
                    }`}
                  >
                    <Icon name="check" size={12} />
                  </span>
                </button>
              );
            })}
          </div>

          <a
            href="/dashboard/gallery"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-peach hover:text-cream"
          >
            Kelola foto di halaman Galeri <Icon name="arrow-r" size={13} />
          </a>
        </>
      )}

      <DoneToggle done={value.done} onChange={setDone} />
    </div>
  );
}

// Selectable thumbnail: ring + full opacity when picked, dimmed otherwise.
function cnSlot(on: boolean): string {
  return [
    "relative aspect-square rounded-[8px] overflow-hidden bg-[rgba(245,239,230,0.05)]",
    "transition outline-none",
    on
      ? "ring-2 ring-peach"
      : "ring-1 ring-[rgba(245,239,230,0.12)] hover:ring-[rgba(245,239,230,0.35)]",
  ].join(" ");
}

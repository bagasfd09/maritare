"use client";

import { useCallback } from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

// "Galeri momen" — curate AND order which gallery photos appear in the invitation.
// Photos are uploaded/managed on /dashboard/gallery; here the owner PICKS which of
// them show in the invitation's gallery grid (nothing shows until picked) and
// drags them — in a compact 4-column grid — into the exact order guests see. The
// order lives in the `selectedPhotoIds` array itself, so reordering is just
// reordering that list; the renderers (folk/scarlet) iterate it in order. Cover
// and closing photos live in their own sections, so they're not offered here.
export function GaleriForm({ value, onChange, photos, onStatusChange }: GaleriFormProps) {
  // Only photos that can actually appear in the grid are selectable.
  const selectable = photos.filter((p) => !p.isCover && !p.isClosing);
  const selectableIds = selectable.map((p) => p.id);

  // Effective selection = stored ids ∩ currently-selectable photos, in STORED
  // order (drops cover/closing/deleted ids so the saved list never carries stale
  // entries; the surviving order is the owner's drag order).
  const selected = value.data.selectedPhotoIds.filter((id) => selectableIds.includes(id));
  const selectedSet = new Set(selected);

  // Selected ids → photo objects, in the same (stored) order, for the drag grid.
  const photoById = new Map(selectable.map((p) => [p.id, p]));
  const selectedPhotos = selected
    .map((id) => photoById.get(id))
    .filter((p): p is EditorPhoto => !!p);
  const unselected = selectable.filter((p) => !selectedSet.has(p.id));

  const buildPayload = useCallback(() => {
    // Recompute from props (not the derived `selected` array) so the memo dep is
    // stable: keep only ids that still point at a selectable photo, in order.
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

  // Desktop drags after a 6px move (so a click on the ✕ button still removes);
  // touch needs a ~180ms press (so a quick swipe still scrolls the panel);
  // keyboard makes the grid operable without a pointer (a11y).
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function commit(nextIds: string[]) {
    const next: GaleriValue = { ...value, data: { selectedPhotoIds: nextIds } };
    onChange(next);
    saveNow({ data: { selectedPhotoIds: nextIds }, done: next.done });
  }

  // dnd-kit animates the tiles shifting DURING the drag; we only persist the new
  // order once, on drop.
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = selected.indexOf(String(active.id));
    const newIndex = selected.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }
    commit(arrayMove(selected, oldIndex, newIndex));
  }

  function add(id: string) {
    // New picks go to the END of the gallery, preserving the owner's drag order.
    commit([...selected, id]);
  }

  function remove(id: string) {
    commit(selected.filter((pid) => pid !== id));
  }

  function selectAll() {
    // Append the not-yet-picked photos after the current ordered selection.
    commit([...selected, ...unselected.map((p) => p.id)]);
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
        Pilih &amp; urutkan foto yang tampil di galeri undangan. <strong className="text-cream">Seret</strong>{" "}
        foto untuk mengatur urutannya. Foto yang tidak dipilih{" "}
        <strong className="text-cream">tidak ditampilkan</strong> ke tamu. Upload &amp; kelola foto di
        halaman Galeri.
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

          {/* Ordered, drag-to-reorder 4-column grid of the picked photos. The
              number badge is the position guests see; grab any tile to drag. */}
          {selected.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-[rgba(245,239,230,0.18)] p-6 text-center text-[13px] text-[rgba(245,239,230,0.55)] mb-5">
              Belum ada foto di galeri. Tambah dari pilihan foto di bawah.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={selected} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {selectedPhotos.map((p, i) => (
                    <SortableTile
                      key={p.id}
                      photo={p}
                      index={i}
                      onRemove={() => remove(p.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {unselected.length > 0 && (
            <>
              <div className="text-[12px] font-semibold text-[rgba(245,239,230,0.7)] mb-2">
                Tambah foto ke galeri
              </div>
              <div className="grid grid-cols-4 gap-2 mb-5">
                {unselected.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => add(p.id)}
                    aria-label="Tambah ke galeri"
                    className="group relative aspect-square rounded-[8px] overflow-hidden ring-1 ring-[rgba(245,239,230,0.12)] hover:ring-[rgba(245,239,230,0.35)] transition outline-none"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL, not a static asset */}
                    <img
                      src={p.url}
                      alt={p.label ?? ""}
                      className="w-full h-full object-cover opacity-45 group-hover:opacity-70 transition"
                    />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-6 h-6 rounded-full bg-[rgba(20,12,12,0.6)] border border-[rgba(245,239,230,0.5)] text-cream flex items-center justify-center">
                        <Icon name="plus" size={14} />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

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

// One draggable tile in the 4-column gallery-order grid. The whole tile is the
// drag handle (compact — no separate grip); the ✕ stops pointer propagation so
// removing never starts a drag. `isDragging` lifts the tile above its neighbours
// while dnd-kit reflows the rest.
function SortableTile({
  photo,
  index,
  onRemove,
}: {
  photo: EditorPhoto;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative aspect-square select-none overflow-hidden rounded-[8px] ring-1 cursor-grab active:cursor-grabbing ${
        isDragging
          ? "ring-peach opacity-90 shadow-[0_14px_30px_-12px_rgba(0,0,0,0.6)]"
          : "ring-[rgba(245,239,230,0.18)]"
      }`}
    >
      <span className="pointer-events-none absolute left-1 top-1 z-10 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-burgundy px-1 text-[10px] font-semibold leading-none text-cream">
        {index + 1}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL, not a static asset */}
      <img
        src={photo.url}
        alt={photo.label ?? ""}
        draggable={false}
        className="pointer-events-none h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Hapus dari galeri"
        className="absolute right-1 top-1 z-10 rounded-full bg-[rgba(20,12,12,0.65)] p-1 text-cream opacity-0 transition hover:bg-burgundy focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Icon name="x" size={12} />
      </button>
    </div>
  );
}

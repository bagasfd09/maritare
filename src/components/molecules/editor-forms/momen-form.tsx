"use client";

// Folk-only "Momen" section — a custom title + a single uploaded illustration
// (e.g. a hand-drawn map of the two hometowns, the Screenshot_71 reference),
// shown right after the couple. Both are optional; the section self-hides on the
// invitation when title AND image are both empty. The image is a dedicated R2
// asset stored on the section (imageKey, presigned at render) — same flow as the
// folk hero asset, image-only.

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import type { EditorSaveStatus } from "@/components/molecules/editor-canvas";
import type { MomenData } from "@/lib/invitation/sections";
import { Icon } from "@/components/atoms/icon";
import { UploadProgress } from "@/components/atoms/upload-progress";
import {
  DoneToggle,
  FieldLabel,
  FormHeading,
} from "@/components/molecules/editor-forms/form-ui";
import { useSectionAutosave } from "@/components/molecules/editor-forms/use-section-autosave";
import { uploadToR2 } from "@/lib/upload";

const TITLE_MAX = 240;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 10_000_000;

function validateImage(file: File): string | null {
  if (!ACCEPTED_TYPES.has(file.type)) {
    return `"${file.name}" formatnya nggak didukung. Pakai JPG, PNG, WebP, atau AVIF ya.`;
  }
  if (file.size > MAX_BYTES) {
    return `"${file.name}" kegedean (maks 10 MB).`;
  }
  return null;
}

// The Momen illustration slot — a single image stored on the section (not the
// gallery). A freshly-uploaded file previews from a local object URL; on reopen
// it falls back to the server-presigned image URL.
function MomenImageSlot({
  data,
  onUploaded,
  onClear,
}: {
  data: MomenData;
  onUploaded: (objectKey: string) => void;
  onClear: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [localUrl]);

  const previewUrl = localUrl ?? data.imageUrl ?? null;
  const hasImage = !!data.imageKey;

  function handleFile(fileList: FileList | null) {
    if (busy) return;
    const file = fileList?.[0];
    if (!file) return;
    const err = validateImage(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setBusy(true);
    setProgress(0);
    startTransition(async () => {
      const up = await uploadToR2(file, { kind: "momen-image", onProgress: setProgress });
      if (!up.ok) {
        setBusy(false);
        setProgress(null);
        setError(up.error);
        return;
      }
      setLocalUrl(URL.createObjectURL(file));
      onUploaded(up.objectKey);
      setProgress(100);
      setTimeout(() => {
        setProgress(null);
        setBusy(false);
      }, 400);
    });
  }

  function handleClear() {
    if (busy) return;
    setLocalUrl(null);
    onClear();
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files);
          e.target.value = "";
        }}
      />

      {progress !== null ? (
        <div className="rounded-[12px] border-[1.5px] border-dashed border-[rgba(245,239,230,0.25)] px-5 py-7">
          <UploadProgress percent={progress} variant="dark" label="Mengunggah gambar…" />
        </div>
      ) : hasImage && previewUrl ? (
        <div className="rounded-[12px] overflow-hidden border border-[rgba(245,239,230,0.15)]">
          {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL */}
          <img src={previewUrl} alt="Momen" className="w-full max-h-[320px] object-contain bg-[rgba(245,239,230,0.04)]" />
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[rgba(245,239,230,0.04)]">
            <span className="text-[12px] text-[rgba(245,239,230,0.7)]">Gambar momen aktif.</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="text-[12px] font-semibold text-peach hover:text-cream disabled:opacity-50"
              >
                Ganti
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={busy}
                className="text-[12px] font-semibold text-[rgba(245,239,230,0.55)] hover:text-cream disabled:opacity-50"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="w-full rounded-[12px] border-[1.5px] border-dashed border-[rgba(245,239,230,0.25)] p-8 flex flex-col items-center justify-center gap-2 transition-colors hover:border-peach disabled:cursor-wait"
        >
          <span className="w-10 h-10 rounded-full bg-burgundy text-cream flex items-center justify-center">
            <Icon name="upload" size={16} />
          </span>
          <span className="font-display italic text-[15px] text-cream">Upload gambar momen</span>
          <span className="text-[11px] text-[rgba(245,239,230,0.5)]">JPG/PNG/WebP/AVIF, maks 10 MB</span>
        </button>
      )}

      {error && <div className="text-[12px] text-[#ff9b8a] mt-3">{error}</div>}
    </>
  );
}

export type MomenValue = { done: boolean; data: MomenData };

type MomenFormProps = {
  value: MomenValue;
  onChange: (next: MomenValue) => void;
  onStatusChange?: (status: EditorSaveStatus) => void;
};

// Persist only the stored fields — never the server-resolved imageUrl.
function toMomenPayload(data: MomenData): Record<string, unknown> {
  return { title: data.title, imageKey: data.imageKey };
}

export function MomenForm({ value, onChange, onStatusChange }: MomenFormProps) {
  const buildPayload = useCallback(
    () => ({ data: toMomenPayload(value.data), done: value.done }),
    [value],
  );
  const { scheduleSave, flush, saveNow } = useSectionAutosave({
    sectionId: "momen",
    buildPayload,
    onStatusChange,
  });

  // Title changes debounce; image upload / clear and the done toggle save now.
  function setTitle(title: string) {
    const next: MomenValue = { ...value, data: { ...value.data, title } };
    onChange(next);
    scheduleSave();
  }

  function patchData(patch: Partial<MomenData>) {
    const next: MomenValue = { ...value, data: { ...value.data, ...patch } };
    onChange(next);
    saveNow({ data: toMomenPayload(next.data), done: next.done });
  }

  function setDone(done: boolean) {
    const next: MomenValue = { ...value, done };
    onChange(next);
    saveNow({ data: toMomenPayload(next.data), done });
  }

  const title = value.data.title ?? "";

  return (
    <div className="max-w-[620px] mx-auto">
      <FormHeading>Momen</FormHeading>
      <p className="text-[13px] text-[rgba(245,239,230,0.6)] leading-[1.6] mb-6">
        Bagian tambahan setelah <strong className="text-cream">Mempelai</strong> — sebuah{" "}
        <strong className="text-cream">judul bebas</strong> + satu{" "}
        <strong className="text-cream">gambar</strong> (misal peta dua kota kalian). Kalau judul dan
        gambar dua-duanya kosong, bagian ini nggak ditampilkan.
      </p>

      <FieldLabel>Judul</FieldLabel>
      {/* Textarea (not a single-line input) so a long title wraps downward
          instead of scrolling off — it renders as a multi-line heading. */}
      <textarea
        value={title}
        maxLength={TITLE_MAX}
        rows={2}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={flush}
        placeholder="cth. Dua insan dari tempat berbeda, dipertemukan oleh takdir."
        className="block w-full resize-none bg-transparent border-none outline-none font-display italic text-[28px] font-normal leading-[1.2] text-cream py-2 border-b border-[rgba(245,239,230,0.2)] mb-2 tracking-[-0.015em] placeholder:text-[rgba(245,239,230,0.3)]"
      />
      <div className="text-right text-[11px] text-[rgba(245,239,230,0.5)] mb-7">
        {title.length} / {TITLE_MAX}
      </div>

      <FieldLabel className="mb-[10px]">Gambar</FieldLabel>
      <MomenImageSlot
        data={value.data}
        onUploaded={(objectKey) => patchData({ imageKey: objectKey })}
        onClear={() => patchData({ imageKey: undefined })}
      />

      <DoneToggle done={value.done} onChange={setDone} />
    </div>
  );
}

"use client";

// "Bagikan" section (all templates) — the link-preview image shown when the
// invitation URL is shared on WhatsApp / social (Open Graph / og:image).
//
// One optional image upload. When left empty, the preview falls back to the
// cover photo automatically, so a link always shows something. The image is
// stored as an R2 object key on the `bagikan` section (presigned at render for
// this editor slot; resolved to a stable public URL for the actual og:image).

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import type { EditorSaveStatus } from "@/components/molecules/editor-canvas";
import type { EditorPhoto } from "@/components/templates/editor-types";
import type { BagikanData } from "@/lib/invitation/sections";
import { Icon } from "@/components/atoms/icon";
import { UploadProgress } from "@/components/atoms/upload-progress";
import { DoneToggle, FormHeading } from "@/components/molecules/editor-forms/form-ui";
import { useSectionAutosave } from "@/components/molecules/editor-forms/use-section-autosave";
import { uploadToR2 } from "@/lib/upload";

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

// The share-image upload slot — image only, stored on the bagikan section. A
// freshly-uploaded file previews from a local object URL; on reopen it falls
// back to the server-presigned image URL. When neither is set, shows the cover
// photo as the (fallback) effective preview.
function ShareImageSlot({
  data,
  coverUrl,
  onUploaded,
  onClear,
}: {
  data: BagikanData;
  coverUrl: string | null;
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

  const hasOwn = !!data.imageKey;
  const ownUrl = localUrl ?? data.imageUrl ?? null;

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
      const up = await uploadToR2(file, { kind: "share-image", onProgress: setProgress });
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
      ) : hasOwn && ownUrl ? (
        // A dedicated share image is set — show it with Ganti / Hapus.
        <div className="rounded-[12px] overflow-hidden border border-[rgba(245,239,230,0.15)]">
          {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL */}
          <img src={ownUrl} alt="Gambar bagikan" className="w-full max-h-[260px] object-cover" />
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[rgba(245,239,230,0.04)]">
            <span className="text-[12px] text-[rgba(245,239,230,0.7)]">
              Gambar bagikan aktif — tampil saat link dibagikan.
            </span>
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
                Hapus (pakai foto sampul)
              </button>
            </div>
          </div>
        </div>
      ) : coverUrl ? (
        // No dedicated image — preview the cover photo that will be used instead.
        <div className="rounded-[12px] overflow-hidden border border-[rgba(245,239,230,0.15)]">
          {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL */}
          <img src={coverUrl} alt="Foto sampul" className="w-full max-h-[260px] object-cover" />
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[rgba(245,239,230,0.04)]">
            <span className="text-[12px] text-[rgba(245,239,230,0.7)]">
              Sekarang pakai foto sampul. Upload untuk pakai gambar lain.
            </span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="text-[12px] font-semibold text-peach hover:text-cream disabled:opacity-50"
            >
              Upload
            </button>
          </div>
        </div>
      ) : (
        // Neither a share image nor a cover photo yet — plain upload affordance.
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="w-full rounded-[12px] border-[1.5px] border-dashed border-[rgba(245,239,230,0.25)] p-8 flex flex-col items-center justify-center gap-2 transition-colors hover:border-peach disabled:cursor-wait"
        >
          <span className="w-10 h-10 rounded-full bg-burgundy text-cream flex items-center justify-center">
            <Icon name="upload" size={16} />
          </span>
          <span className="font-display italic text-[15px] text-cream">Upload gambar bagikan</span>
          <span className="text-[11px] text-[rgba(245,239,230,0.5)]">
            JPG/PNG/WebP/AVIF, maks 10 MB · paling pas rasio 1.91:1 (mis. 1200×630)
          </span>
        </button>
      )}

      {error && <div className="text-[12px] text-[#ff9b8a] mt-3">{error}</div>}
    </>
  );
}

export type BagikanValue = { done: boolean; data: BagikanData };

type BagikanFormProps = {
  value: BagikanValue;
  onChange: (next: BagikanValue) => void;
  photos: EditorPhoto[];
  onStatusChange?: (status: EditorSaveStatus) => void;
};

// Persist only the stored field — never the server-resolved imageUrl.
function toBagikanPayload(data: BagikanData): Record<string, unknown> {
  return { imageKey: data.imageKey };
}

export function BagikanForm({ value, onChange, photos, onStatusChange }: BagikanFormProps) {
  const buildPayload = useCallback(
    () => ({ data: toBagikanPayload(value.data), done: value.done }),
    [value],
  );
  const { saveNow } = useSectionAutosave({ sectionId: "bagikan", buildPayload, onStatusChange });

  function patch(patch: Partial<BagikanData>) {
    const next: BagikanValue = { ...value, data: { ...value.data, ...patch } };
    onChange(next);
    saveNow({ data: toBagikanPayload(next.data), done: next.done });
  }

  function setDone(done: boolean) {
    const next: BagikanValue = { ...value, done };
    onChange(next);
    saveNow({ data: toBagikanPayload(next.data), done });
  }

  const coverUrl = photos.find((p) => p.isCover)?.url ?? null;

  return (
    <div className="max-w-[620px] mx-auto">
      <FormHeading>Gambar Bagikan (WhatsApp)</FormHeading>
      <p className="text-[13px] text-[rgba(245,239,230,0.6)] leading-[1.6] mb-6">
        Gambar yang muncul saat <strong className="text-cream">link undangan dibagikan</strong> di
        WhatsApp atau media sosial. Kalau kosong, otomatis pakai{" "}
        <strong className="text-cream">foto sampul</strong>. Paling rapi kalau gambarnya{" "}
        <strong className="text-cream">memanjang</strong> (rasio 1.91:1, mis. 1200×630).
      </p>

      <ShareImageSlot
        data={value.data}
        coverUrl={coverUrl}
        onUploaded={(objectKey) => patch({ imageKey: objectKey, imageUrl: undefined })}
        onClear={() => patch({ imageKey: undefined, imageUrl: undefined })}
      />

      <p className="text-[12px] text-[rgba(245,239,230,0.45)] leading-[1.6] mt-5">
        Catatan: pratinjau di WhatsApp tampil setelah undangan{" "}
        <strong className="text-[rgba(245,239,230,0.7)]">dipublikasikan</strong>. WhatsApp juga
        menyimpan pratinjau beberapa saat — kalau gambar baru belum muncul, tunggu sebentar atau
        coba di chat berbeda.
      </p>

      <DoneToggle done={value.done} onChange={setDone} />
    </div>
  );
}

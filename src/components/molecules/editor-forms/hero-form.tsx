"use client";

// Folk-only "Sampul" section — TWO separate cover uploads + the closing photo:
//   1. Foto Sampul (Pembuka)  → the cover photo (isCover) shown inside the
//      ornamented framed cover on the opening "Buka Undangan" gate. A dedicated
//      gallery upload (same presign → PUT → addPhoto flow as the gallery).
//   2. Hero (Atas)            → a SEPARATE asset (image OR video) stored on the
//      hero section (imageKey / videoKey, presigned at render), shown FULL-BLEED
//      at the very top after the gate opens. Distinct from the gate photo.
//   3. Foto Penutup           → the closing-section photo (isClosing).

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { EditorSaveStatus } from "@/components/molecules/editor-canvas";
import type { EditorPhoto } from "@/components/templates/editor-types";
import type { HeroData } from "@/lib/invitation/sections";
import { Icon } from "@/components/atoms/icon";
import { UploadProgress } from "@/components/atoms/upload-progress";
import { DoneToggle, FormHeading, Toggle } from "@/components/molecules/editor-forms/form-ui";
import { useSectionAutosave } from "@/components/molecules/editor-forms/use-section-autosave";
import { uploadToR2 } from "@/lib/upload";
import { addPhoto, deletePhoto, setClosingPhoto, setCoverPhoto } from "@/server/actions/photos";

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 10_000_000;
const ACCEPTED_VIDEO = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const MAX_VIDEO_BYTES = 50_000_000;

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.has(file.type)) {
    return `"${file.name}" formatnya nggak didukung. Pakai JPG, PNG, WebP, atau AVIF ya.`;
  }
  if (file.size > MAX_BYTES) {
    return `"${file.name}" kegedean (maks 10 MB).`;
  }
  return null;
}

// Hero asset accepts an image OR a video, each with its own type/size rules.
function validateHeroAsset(file: File): string | null {
  if (file.type.startsWith("video/")) {
    if (!ACCEPTED_VIDEO.has(file.type)) {
      return `"${file.name}" formatnya nggak didukung. Pakai video MP4, WebM, atau MOV.`;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      return `"${file.name}" kegedean (maks 50 MB).`;
    }
    return null;
  }
  if (!ACCEPTED_TYPES.has(file.type)) {
    return `"${file.name}" formatnya nggak didukung. Pakai foto (JPG/PNG/WebP/AVIF) atau video (MP4/WebM/MOV).`;
  }
  if (file.size > MAX_BYTES) {
    return `"${file.name}" kegedean (maks 10 MB).`;
  }
  return null;
}

// Shared upload: validate → presign + PUT-with-progress (uploadToR2) → register
// the photo row. Returns the new photo id, or a Bahasa error string.
async function uploadPhoto(
  file: File,
  label: string,
  onProgress: (percent: number) => void,
): Promise<{ photoId: string } | { error: string }> {
  const clientError = validateFile(file);
  if (clientError) return { error: clientError };

  const up = await uploadToR2(file, { kind: "photo", onProgress });
  if (!up.ok) return { error: up.error };

  const added = await addPhoto({ objectKey: up.objectKey, label });
  if (!added.ok) return { error: added.error };
  return { photoId: added.photoId };
}

type PhotoSlotProps = {
  photo: EditorPhoto | null;
  onUpload: (file: File, onProgress: (percent: number) => void) => Promise<string | null>;
  onRemove: () => Promise<string | null>;
  imgAlt: string;
  emptyTitle: string;
  emptyHint: string;
  activeNote: string;
  removeLabel: string;
};

// One dedicated photo slot: shows the active photo (with Ganti / Hapus) or an
// empty upload affordance, with a live percentage bar while uploading.
function PhotoSlot({
  photo,
  onUpload,
  onRemove,
  imgAlt,
  emptyTitle,
  emptyHint,
  activeNote,
  removeLabel,
}: PhotoSlotProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  function handleFile(fileList: FileList | null) {
    if (busy) return;
    const file = fileList?.[0];
    if (!file) return;
    setError(null);
    setBusy(true);
    setProgress(0);
    startTransition(async () => {
      const err = await onUpload(file, setProgress);
      if (err) {
        setBusy(false);
        setProgress(null);
        setError(err);
        return;
      }
      setProgress(100);
      router.refresh();
      setTimeout(() => {
        setProgress(null);
        setBusy(false);
      }, 400);
    });
  }

  function handleRemove() {
    if (busy || !photo) return;
    setError(null);
    setBusy(true);
    startTransition(async () => {
      const err = await onRemove();
      setBusy(false);
      if (err) {
        setError(err);
        return;
      }
      router.refresh();
    });
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
          <UploadProgress percent={progress} variant="dark" />
        </div>
      ) : photo ? (
        <div className="rounded-[12px] overflow-hidden border border-[rgba(245,239,230,0.15)]">
          {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL */}
          <img src={photo.url} alt={imgAlt} className="w-full max-h-[260px] object-cover" />
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[rgba(245,239,230,0.04)]">
            <span className="text-[12px] text-[rgba(245,239,230,0.7)]">{activeNote}</span>
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
                onClick={handleRemove}
                disabled={busy}
                className="text-[12px] font-semibold text-[rgba(245,239,230,0.55)] hover:text-cream disabled:opacity-50"
              >
                {removeLabel}
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
          <span className="font-display italic text-[15px] text-cream">{emptyTitle}</span>
          <span className="text-[11px] text-[rgba(245,239,230,0.5)]">{emptyHint}</span>
        </button>
      )}

      {error && <div className="text-[12px] text-[#ff9b8a] mt-3">{error}</div>}
    </>
  );
}

// The HERO asset slot — an image OR a video, stored on the hero section (not the
// gallery). A freshly-uploaded file previews from a local object URL; on reopen
// it falls back to the server-presigned image/video URL.
function HeroAssetSlot({
  data,
  onUploaded,
  onClear,
}: {
  data: HeroData;
  onUploaded: (objectKey: string, isVideo: boolean) => void;
  onClear: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [localIsVideo, setLocalIsVideo] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [localUrl]);

  const previewUrl = localUrl ?? data.videoUrl ?? data.imageUrl ?? null;
  const previewIsVideo = localUrl ? localIsVideo : !!data.videoKey;
  const hasAsset = !!(data.imageKey || data.videoKey);

  function handleFile(fileList: FileList | null) {
    if (busy) return;
    const file = fileList?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const err = validateHeroAsset(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setBusy(true);
    setProgress(0);
    startTransition(async () => {
      const up = await uploadToR2(file, {
        kind: isVideo ? "video" : "hero-image",
        onProgress: setProgress,
      });
      if (!up.ok) {
        setBusy(false);
        setProgress(null);
        setError(up.error);
        return;
      }
      setLocalUrl(URL.createObjectURL(file));
      setLocalIsVideo(isVideo);
      onUploaded(up.objectKey, isVideo);
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
        accept="image/*,video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files);
          e.target.value = "";
        }}
      />

      {progress !== null ? (
        <div className="rounded-[12px] border-[1.5px] border-dashed border-[rgba(245,239,230,0.25)] px-5 py-7">
          <UploadProgress percent={progress} variant="dark" label="Mengunggah hero…" />
        </div>
      ) : hasAsset && previewUrl ? (
        <div className="rounded-[12px] overflow-hidden border border-[rgba(245,239,230,0.15)]">
          {previewIsVideo ? (
            <video src={previewUrl} muted loop playsInline autoPlay className="w-full max-h-[260px] object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL
            <img src={previewUrl} alt="Hero" className="w-full max-h-[260px] object-cover" />
          )}
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[rgba(245,239,230,0.04)]">
            <span className="text-[12px] text-[rgba(245,239,230,0.7)]">
              {previewIsVideo ? "Video hero aktif — tampil full di atas." : "Foto hero aktif — tampil full di atas."}
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
          <span className="font-display italic text-[15px] text-cream">Upload foto / video hero</span>
          <span className="text-[11px] text-[rgba(245,239,230,0.5)]">
            Foto (JPG/PNG/WebP/AVIF, maks 10 MB) atau video (MP4/WebM/MOV, maks 50 MB)
          </span>
        </button>
      )}

      {error && <div className="text-[12px] text-[#ff9b8a] mt-3">{error}</div>}
    </>
  );
}

// The CLOSING asset slot — an image OR a video, like the hero slot. The image
// case is stored as a gallery photo (isClosing); the video case rides on the
// hero section (closingVideoKey). The parent's onUpload/onRemove route each to
// the right place; this component just owns the upload UI + local preview.
function ClosingAssetSlot({
  closingPhoto,
  closingVideoUrl,
  hasClosingVideo,
  onUpload,
  onRemove,
}: {
  closingPhoto: EditorPhoto | null;
  closingVideoUrl: string | undefined;
  hasClosingVideo: boolean;
  onUpload: (file: File, onProgress: (percent: number) => void) => Promise<string | null>;
  onRemove: () => Promise<string | null>;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [localIsVideo, setLocalIsVideo] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [localUrl]);

  const previewUrl = localUrl ?? closingVideoUrl ?? closingPhoto?.url ?? null;
  const previewIsVideo = localUrl ? localIsVideo : hasClosingVideo;
  const hasAsset = !!(localUrl || hasClosingVideo || closingPhoto);

  function handleFile(fileList: FileList | null) {
    if (busy) return;
    const file = fileList?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const err = validateHeroAsset(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setBusy(true);
    setProgress(0);
    startTransition(async () => {
      const uploadErr = await onUpload(file, setProgress);
      if (uploadErr) {
        setBusy(false);
        setProgress(null);
        setError(uploadErr);
        return;
      }
      setLocalUrl(URL.createObjectURL(file));
      setLocalIsVideo(isVideo);
      setProgress(100);
      router.refresh();
      setTimeout(() => {
        setProgress(null);
        setBusy(false);
      }, 400);
    });
  }

  function handleRemove() {
    if (busy || !hasAsset) return;
    setError(null);
    setBusy(true);
    startTransition(async () => {
      const err = await onRemove();
      setLocalUrl(null);
      setBusy(false);
      if (err) {
        setError(err);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files);
          e.target.value = "";
        }}
      />

      {progress !== null ? (
        <div className="rounded-[12px] border-[1.5px] border-dashed border-[rgba(245,239,230,0.25)] px-5 py-7">
          <UploadProgress percent={progress} variant="dark" label="Mengunggah penutup…" />
        </div>
      ) : hasAsset && previewUrl ? (
        <div className="rounded-[12px] overflow-hidden border border-[rgba(245,239,230,0.15)]">
          {previewIsVideo ? (
            <video src={previewUrl} muted loop playsInline autoPlay className="w-full max-h-[260px] object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL
            <img src={previewUrl} alt="Foto penutup" className="w-full max-h-[260px] object-cover" />
          )}
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[rgba(245,239,230,0.04)]">
            <span className="text-[12px] text-[rgba(245,239,230,0.7)]">
              {previewIsVideo
                ? "Video penutup aktif — tampil di bagian bawah."
                : "Foto penutup aktif — tampil di bagian bawah."}
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
                onClick={handleRemove}
                disabled={busy}
                className="text-[12px] font-semibold text-[rgba(245,239,230,0.55)] hover:text-cream disabled:opacity-50"
              >
                Hapus (pakai sampul)
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
          <span className="font-display italic text-[15px] text-cream">Upload foto / video penutup</span>
          <span className="text-[11px] text-[rgba(245,239,230,0.5)]">
            Foto (JPG/PNG/WebP/AVIF, maks 10 MB) atau video (MP4/WebM/MOV, maks 50 MB)
          </span>
        </button>
      )}

      {error && <div className="text-[12px] text-[#ff9b8a] mt-3">{error}</div>}
    </>
  );
}

export type HeroValue = { done: boolean; data: HeroData };

type HeroFormProps = {
  value: HeroValue;
  onChange: (next: HeroValue) => void;
  photos: EditorPhoto[];
  onStatusChange?: (status: EditorSaveStatus) => void;
  /** Show the folk-only full-bleed "Hero (Atas)" asset block. Templates that
   *  only use the cover + closing photos (ivory) pass false. Default true. */
  heroAsset?: boolean;
};

// Persist only the stored hero fields — never the server-resolved *Url fields.
function toHeroPayload(data: HeroData): Record<string, unknown> {
  return {
    fullSize: data.fullSize,
    heroFullWidth: data.heroFullWidth,
    imageKey: data.imageKey,
    videoKey: data.videoKey,
    closingVideoKey: data.closingVideoKey,
  };
}

export function HeroForm({ value, onChange, photos, onStatusChange, heroAsset = true }: HeroFormProps) {
  const buildPayload = useCallback(
    () => ({ data: toHeroPayload(value.data), done: value.done }),
    [value],
  );
  const { saveNow } = useSectionAutosave({ sectionId: "hero", buildPayload, onStatusChange });

  function patchHero(patch: Partial<HeroData>) {
    const next: HeroValue = { ...value, data: { ...value.data, ...patch } };
    onChange(next);
    saveNow({ data: toHeroPayload(next.data), done: next.done });
  }

  function setDone(done: boolean) {
    const next: HeroValue = { ...value, done };
    onChange(next);
    saveNow({ data: toHeroPayload(next.data), done });
  }

  const gateCover = photos.find((p) => p.isCover) ?? null;
  const closing = photos.find((p) => p.isClosing) ?? null;

  return (
    <div className="max-w-[620px] mx-auto">
      <FormHeading>Foto Sampul (Pembuka)</FormHeading>
      <p className="text-[13px] text-[rgba(245,239,230,0.6)] leading-[1.6] mb-6">
        Foto di <strong className="text-cream">layar pembuka</strong> (gerbang &ldquo;Buka Undangan&rdquo;) —
        tampil di dalam bingkai cover berornamen. Kalau kosong, pakai ilustrasi default template.
      </p>

      <PhotoSlot
        photo={gateCover}
        imgAlt="Foto sampul"
        emptyTitle="Upload foto sampul"
        emptyHint="Saat ini pakai tampilan default template"
        activeNote="Foto sampul aktif — tampil di layar pembuka."
        removeLabel="Hapus (pakai default)"
        onUpload={async (file, onProgress) => {
          const res = await uploadPhoto(file, "Foto sampul", onProgress);
          if ("error" in res) return res.error;
          const cover = await setCoverPhoto({ photoId: res.photoId });
          if (!cover.ok) return cover.error;
          if (gateCover) await deletePhoto({ photoId: gateCover.id });
          return null;
        }}
        onRemove={async () => {
          if (!gateCover) return null;
          const res = await deletePhoto({ photoId: gateCover.id });
          return res.ok ? null : res.error;
        }}
      />

      {/* Dedicated full-bleed HERO asset (image or video) — separate upload.
          Folk-only; hidden for templates with no home for it (heroAsset=false). */}
      {heroAsset && (
      <div className="mt-8 pt-7 border-t border-[rgba(245,239,230,0.1)]">
        <FormHeading>Hero (Atas) — Foto / Video</FormHeading>
        <p className="text-[13px] text-[rgba(245,239,230,0.6)] leading-[1.6] mb-6">
          Media <strong className="text-cream">full-screen</strong> yang tampil di paling atas{" "}
          <em>setelah</em> tamu buka undangan. Bisa <strong className="text-cream">foto</strong> atau{" "}
          <strong className="text-cream">video</strong> (autoplay, tanpa suara). Ini{" "}
          <strong className="text-cream">terpisah</strong> dari foto sampul di atas. Kalau kosong, bagian
          ini nggak ditampilkan.
        </p>

        <HeroAssetSlot
          data={value.data}
          onUploaded={(objectKey, isVideo) =>
            patchHero(
              isVideo
                ? { videoKey: objectKey, imageKey: undefined }
                : { imageKey: objectKey, videoKey: undefined },
            )
          }
          onClear={() => patchHero({ imageKey: undefined, videoKey: undefined })}
        />

        {(value.data.imageKey || value.data.videoKey) && (
          <div className="mt-5">
            <Toggle
              checked={value.data.heroFullWidth}
              onChange={(next) => patchHero({ heroFullWidth: next })}
              label="Tampilkan full (tanpa bingkai template)"
            />
            <p className="text-[12px] text-[rgba(245,239,230,0.5)] leading-[1.5] mt-2">
              Aktif = foto/video hero tampil penuh selebar layar. Nonaktif = tampil
              di dalam bingkai cover seperti section Buka Undangan.
            </p>
          </div>
        )}
      </div>
      )}

      {/* Closing asset (photo OR video) — a SEPARATE upload, shown at the very bottom. */}
      <div className="mt-8 pt-7 border-t border-[rgba(245,239,230,0.1)]">
        <FormHeading>Foto / Video Penutup</FormHeading>
        <p className="text-[13px] text-[rgba(245,239,230,0.6)] leading-[1.6] mb-6">
          Media yang tampil di <strong className="text-cream">bagian penutup</strong> (paling bawah
          undangan). Bisa <strong className="text-cream">foto</strong> atau{" "}
          <strong className="text-cream">video</strong> (autoplay, tanpa suara). Kalau kosong, ikut
          foto sampul.
        </p>

        <ClosingAssetSlot
          closingPhoto={closing}
          closingVideoUrl={value.data.closingVideoUrl}
          hasClosingVideo={!!value.data.closingVideoKey}
          onUpload={async (file, onProgress) => {
            if (file.type.startsWith("video/")) {
              const up = await uploadToR2(file, { kind: "video", onProgress });
              if (!up.ok) return up.error;
              patchHero({ closingVideoKey: up.objectKey });
              // A video replaces the photo — drop the old closing photo if any.
              if (closing) await deletePhoto({ photoId: closing.id });
              return null;
            }
            const res = await uploadPhoto(file, "Foto penutup", onProgress);
            if ("error" in res) return res.error;
            const set = await setClosingPhoto({ photoId: res.photoId });
            if (!set.ok) return set.error;
            if (closing) await deletePhoto({ photoId: closing.id });
            // A photo replaces any existing closing video.
            if (value.data.closingVideoKey) patchHero({ closingVideoKey: undefined });
            return null;
          }}
          onRemove={async () => {
            if (value.data.closingVideoKey) {
              patchHero({ closingVideoKey: undefined });
              return null;
            }
            if (closing) {
              const res = await deletePhoto({ photoId: closing.id });
              return res.ok ? null : res.error;
            }
            return null;
          }}
        />
      </div>

      <DoneToggle done={value.done} onChange={setDone} />
    </div>
  );
}

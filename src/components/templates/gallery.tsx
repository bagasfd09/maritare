"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { DashboardShell } from "@/components/templates/dashboard-shell";
import { DashboardTopBar } from "@/components/organisms/dashboard-topbar";
import { Button } from "@/components/atoms/button";
import { CircleButton } from "@/components/atoms/circle-button";
import { Icon } from "@/components/atoms/icon";
import { Em } from "@/components/atoms/typography";
import { SectionNumber } from "@/components/atoms/section-number";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { ProgressBar } from "@/components/atoms/progress-bar";
import { PhotoPlaceholder, type PhotoTone } from "@/components/molecules/gallery-photo";
import { uploadToR2 } from "@/lib/upload";
import { addPhoto, deletePhoto } from "@/server/actions/photos";
import type { DashboardChrome } from "@/server/queries/dashboard";
import type { Gallery as GalleryData } from "@/server/queries/photos";

// Client-side upload guards mirror the sign route's contract (#1): only these
// image types, and at most 10 MB per file. Kept here so the user gets a friendly
// Bahasa error before any network round-trip; the server re-validates anyway.
const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const MAX_BYTES = 10_000_000;

// Decorative tones cycled across the empty placeholder slots so the rest state
// matches the design even before any real photo exists.
const PLACEHOLDER_TONES: PhotoTone[] = [
  "peach",
  "sage",
  "forest",
  "burgundy",
  "blush",
  "dark",
];

// How many tiles the grid shows at rest (1 upload tile + this many photo/
// placeholder tiles), matching the design's 12-photo mock.
const REST_TILE_COUNT = 12;

// The bucket name the query uses for photos with a null/empty label; mirrored
// here so the "Belum berlabel" chip filters the matching photos client-side.
const UNLABELED = "Belum berlabel";
// Special chip that shows every photo regardless of label.
const ALL = "Semua";

// Normalize a photo's label to the same bucket key the query's `labelCounts`
// uses, so chip filtering matches the real per-label counts.
function labelBucket(label: string | null): string {
  return label?.trim() || UNLABELED;
}

// Strip the extension off a file name and clamp to the action's 60-char label
// cap, so the default label is a clean human-readable caption.
function labelFromFileName(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  return base.trim().slice(0, 60);
}

// Friendly client-side validation; returns a Bahasa error string or null.
function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.has(file.type)) {
    return `"${file.name}" formatnya nggak didukung. Pakai JPG, PNG, WebP, atau AVIF ya.`;
  }
  if (file.size > MAX_BYTES) {
    return `"${file.name}" kegedean (maks 10 MB).`;
  }
  return null;
}

type GalleryProps = {
  gallery: GalleryData;
  /** Real sidebar chrome (couple/owner identity). */
  chrome?: DashboardChrome | null;
};

// Screen 06 · Galeri Foto — real photos + quota from the DB, with direct-to-R2
// uploads (presigned PUT) and soft-delete. Fed entirely by props from the page
// server component; no ids are ever sent from the client (ownership is derived
// server-side in the sign route and the photo actions).
export function Gallery({ gallery, chrome }: GalleryProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isPending, startTransition] = useTransition();
  // Upload progress surfaced on the drop-tile, e.g. { done: 1, total: 3 }.
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  // Real 0–100 progress of the file currently streaming to R2 (per-file).
  const [fileProgress, setFileProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track which photo is mid-delete so its tile can show a pending state.
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Active filter chip; `ALL` ("Semua") shows every photo.
  const [activeLabel, setActiveLabel] = useState<string>(ALL);

  const { photos, used, limit, packageName, labelCounts } = gallery;

  // Filter chips: a leading "Semua" (= total used) followed by the real
  // per-label counts from the query.
  const chips = [{ label: ALL, count: used }, ...labelCounts];

  // Photos shown in the grid, filtered by the active chip.
  const visiblePhotos =
    activeLabel === ALL
      ? photos
      : photos.filter((p) => labelBucket(p.label) === activeLabel);

  // Cover caption: the real cover photo's label, or a neutral placeholder.
  const coverPhoto = photos.find((p) => p.isCover) ?? null;
  const coverLabel = coverPhoto?.label?.trim() || "Foto sampul";

  const isUnlimited = limit === null;
  const remaining = isUnlimited ? null : Math.max(0, limit - used);
  const progress = isUnlimited
    ? Math.min(100, used > 0 ? 8 : 0) // unlimited: a thin always-growing hint
    : limit > 0
      ? Math.min(100, Math.round((used / limit) * 100))
      : 0;
  const limitLabel = isUnlimited ? "∞" : String(limit);
  const packageLabel = packageName ?? "—";
  const busy = uploading !== null || isPending;
  // Overall batch progress: finished files + the in-flight file's fraction.
  const overallPct = uploading
    ? Math.min(
        100,
        Math.round(((uploading.done + fileProgress / 100) / uploading.total) * 100),
      )
    : 0;

  // Number of decorative placeholder slots to keep so the rest state matches the
  // design's full grid when there are few/no real photos in the current view.
  const placeholderCount = Math.max(0, REST_TILE_COUNT - visiblePhotos.length);

  // Upload a single file: presign + PUT-with-progress (uploadToR2) → register via
  // addPhoto. Streams real progress into `fileProgress`. Returns a Bahasa error
  // string on failure, or null on success.
  async function uploadOne(file: File): Promise<string | null> {
    const clientError = validateFile(file);
    if (clientError) {
      return clientError;
    }

    const up = await uploadToR2(file, { kind: "photo", onProgress: setFileProgress });
    if (!up.ok) {
      return up.error;
    }

    const add = await addPhoto({
      objectKey: up.objectKey,
      label: labelFromFileName(file.name),
    });
    if (!add.ok) {
      return add.error;
    }
    return null;
  }

  // Sequentially upload the chosen files, surfacing progress and the first
  // error, then refresh the route to pull the new server-rendered grid.
  function handleFiles(fileList: FileList | null) {
    if (busy) {
      return;
    }
    const files = fileList ? Array.from(fileList) : [];
    if (files.length === 0) {
      return;
    }

    setError(null);

    if (!isUnlimited && remaining !== null && files.length > remaining) {
      setError(
        remaining === 0
          ? "Kuota foto paketmu sudah penuh."
          : `Sisa kuota cuma ${remaining} foto, tapi kamu pilih ${files.length}.`,
      );
      return;
    }

    setUploading({ done: 0, total: files.length });
    setFileProgress(0);

    startTransition(async () => {
      let firstError: string | null = null;
      for (let i = 0; i < files.length; i += 1) {
        const fileError = await uploadOne(files[i]);
        if (fileError && !firstError) {
          firstError = fileError;
        }
        setUploading({ done: i + 1, total: files.length });
        // Reset so the overall bar reads done/total exactly at the file boundary
        // (the next file's PUT streams fileProgress 0→100 again).
        setFileProgress(0);
      }
      setFileProgress(0);
      // Pull the fresh server-rendered grid (new presigned URLs + quota).
      router.refresh();
      if (firstError) {
        // Surface the error and clear the indicator right away.
        setUploading(null);
        setError(firstError);
      } else {
        // Hold the completed 100% state one beat before clearing the upload tile
        // (clearing immediately would batch away the final frame).
        setTimeout(() => setUploading(null), 400);
      }
    });
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
    handleFiles(event.dataTransfer.files);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!isDragOver) {
      setIsDragOver(true);
    }
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files);
    // Reset so picking the same file again re-fires onChange.
    event.target.value = "";
  }

  function openFilePicker() {
    if (busy) {
      return;
    }
    fileInputRef.current?.click();
  }

  function handleDelete(photoId: string) {
    if (busy || deletingId !== null) {
      return;
    }
    setError(null);
    setDeletingId(photoId);
    startTransition(async () => {
      const result = await deletePhoto({ photoId });
      setDeletingId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <DashboardShell active="photos" chrome={chrome}>
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          num="§ VI"
          eyebrow="Galeri Foto"
          title={<>Foto-foto <Em className="text-burgundy">kalian.</Em></>}
          actions={
            <>
              <span className="text-[11px] text-muted-ink tracking-[0.18em] uppercase font-semibold inline-flex items-center gap-[6px]">
                <span className="font-display font-extrabold text-[16px] text-burgundy">{used}</span>
                / {limitLabel} foto · paket {packageLabel}
              </span>
              <Button variant="ghost"><Icon name="grip" size={14} />Atur urutan</Button>
              <Button variant="primary" onClick={openFilePicker} disabled={busy}>
                <Icon name="upload" size={14} />Upload foto
              </Button>
            </>
          }
        />

        <div className="flex-1 px-10 py-7 overflow-y-auto flex flex-col">
          {/* Quota strip + cover photo */}
          <div className="grid grid-cols-[1.4fr_1fr] gap-4 mb-[22px]">
            <div className="bg-paper border border-line rounded-[14px] px-[22px] py-[18px]">
              <div className="flex items-center justify-between mb-3">
                <SectionNumber className="text-[11px]">i. Quota</SectionNumber>
                <span className="text-[11px] text-muted-ink [font-variant:small-caps] tracking-[0.18em]">
                  {isUnlimited ? "Tak terbatas" : `Sisa ${remaining} foto`}
                </span>
              </div>
              <div className="flex items-baseline gap-[6px] mb-3">
                <span className="font-display font-extrabold text-[44px] leading-none tracking-[-0.03em] text-charcoal">{used}</span>
                <span className="font-display italic text-[22px] text-muted-ink">/ {limitLabel} foto</span>
              </div>
              <ProgressBar
                value={progress}
                height={6}
                trackClassName="bg-cream mb-[10px]"
                fillClassName="bg-linear-to-r from-terracotta to-burgundy"
              />
              <div className="flex items-center justify-between">
                <div className="text-[12px] text-muted-ink">
                  Butuh lebih? <a href="#" className="text-burgundy font-semibold no-underline">Upgrade ke Platinum →</a>
                </div>
              </div>
            </div>

            <div className="bg-charcoal text-cream rounded-[14px] px-[22px] py-[18px] flex items-center gap-4 relative overflow-hidden">
              <div className="absolute -top-5 -right-[25px] w-[100px] h-[100px] opacity-[0.08]">
                <FlowerMark size={100} color="var(--color-peach)" core="var(--color-peach)" stamen="var(--color-terracotta)" />
              </div>
              <div className="w-[60px] h-20 rounded-[6px] bg-[linear-gradient(135deg,var(--color-terracotta),var(--color-burgundy-deep))] shrink-0 relative">
                <span className="absolute bottom-[6px] left-[6px] text-[8px] text-cream font-display italic">Cover</span>
              </div>
              <div className="flex-1 relative z-[2]">
                <SectionNumber className="text-[11px] text-peach mb-1">ii. Cover photo</SectionNumber>
                <div className="font-display italic text-[18px] text-cream">{coverLabel}</div>
                <div className="text-[11px] text-[rgba(245,239,230,0.6)] mt-1">Tampil sebagai foto utama di undangan</div>
                <a
                  href="#"
                  className="mt-2 inline-flex items-center gap-[6px] text-[11px] text-peach tracking-[0.14em] uppercase font-semibold"
                >
                  Ganti cover <Icon name="arrow-r" size={11} stroke="var(--color-peach)" />
                </a>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-4">
            <SectionNumber className="text-[12px]">iii. Semua foto</SectionNumber>
            <div className="flex-1" />
            <div className="flex gap-1 bg-paper border border-line rounded-full p-[3px]">
              {chips.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setActiveLabel(t.label)}
                  className={cn(
                    "px-3 py-[6px] rounded-full text-[11px] tracking-[0.12em] uppercase font-semibold cursor-pointer",
                    activeLabel === t.label ? "text-cream bg-charcoal" : "text-muted-ink bg-transparent",
                  )}
                >
                  {t.label} <span className="opacity-60 ml-1">{t.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Inline error line under the toolbar. */}
          {error && (
            <div className="text-[12px] text-burgundy mb-3">{error}</div>
          )}

          {/* Hidden multi-file picker driving both the drop-tile and the topbar
              "Upload foto" button. */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleInputChange}
            className="hidden"
          />

          {/* Grid — natural height; the content wrapper above is the scroller. */}
          <div>
            <div className="grid grid-cols-6 gap-3">
              {/* Upload tile */}
              <div
                onClick={openFilePicker}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  "aspect-[1/1.2] border-[1.5px] border-dashed rounded-xl flex flex-col items-center justify-center gap-2 p-[14px] transition-colors",
                  busy ? "cursor-wait" : "cursor-pointer",
                  isDragOver ? "border-burgundy bg-peach/40" : "border-rule bg-paper",
                )}
              >
                <div className="w-9 h-9 rounded-full bg-burgundy text-cream flex items-center justify-center">
                  <Icon name="upload" size={16} />
                </div>
                {uploading ? (
                  <>
                    <div className="font-display italic text-[13px] text-charcoal text-center">
                      Mengunggah…
                    </div>
                    <div className="text-[20px] font-bold tabular-nums text-burgundy leading-none">
                      {overallPct}%
                    </div>
                    <div className="w-full h-[5px] rounded-full bg-rule/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-burgundy transition-[width] duration-200 ease-out"
                        style={{ width: `${overallPct}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-muted-ink tracking-[0.16em] uppercase font-semibold text-center">
                      {uploading.done}/{uploading.total} foto
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-display italic text-[14px] text-charcoal text-center">Drop foto<br />di sini</div>
                    <div className="text-[10px] text-muted-ink tracking-[0.16em] uppercase font-semibold text-center">atau klik</div>
                  </>
                )}
              </div>

              {/* Real photos from the DB (filtered by the active chip). */}
              {visiblePhotos.map((p) => {
                const isCover = p.isCover;
                const isClosing = p.isClosing;
                const isDeleting = deletingId === p.id;
                const dateLabel = new Intl.DateTimeFormat("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }).format(p.createdAt);
                return (
                  <div
                    key={p.id}
                    className={cn(
                      "group aspect-[1/1.2] rounded-xl overflow-hidden relative cursor-pointer bg-paper",
                      isCover
                        ? "border-2 border-burgundy"
                        : isClosing
                          ? "border-2 border-sage"
                          : "border border-line",
                      isDeleting && "opacity-50",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URLs are short-lived and not known at build time; next/image is not configured for arbitrary R2 hosts */}
                    <img
                      src={p.viewUrl}
                      alt={p.label ?? "Foto undangan"}
                      className="w-full h-full object-cover rounded-[10px]"
                    />
                    {/* Italic label bottom-left, matching PhotoPlaceholder. */}
                    {p.label && (
                      <span className="absolute left-[14px] bottom-[14px] z-[2] font-display italic text-[10px] text-[rgba(255,255,255,0.92)] [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]">
                        {p.label}
                      </span>
                    )}
                    {/* Top-right controls */}
                    <div className="absolute top-2 right-2 flex gap-1 z-[3]">
                      {isCover && (
                        <span className="text-[8px] px-[7px] py-[3px] rounded-full bg-burgundy text-cream font-bold tracking-[0.18em] uppercase">
                          Cover
                        </span>
                      )}
                      {isClosing && (
                        <span className="text-[8px] px-[7px] py-[3px] rounded-full bg-sage text-cream font-bold tracking-[0.18em] uppercase">
                          Penutup
                        </span>
                      )}
                      <CircleButton
                        size={22}
                        variant="solid"
                        title="Hapus foto"
                        disabled={busy}
                        onClick={() => handleDelete(p.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      >
                        <Icon name="x" size={11} />
                      </CircleButton>
                    </div>
                    {/* Bottom date strip */}
                    <div className="absolute bottom-0 left-0 right-0 pt-5 px-2 pb-2 bg-[linear-gradient(to_top,rgba(0,0,0,0.55),transparent)] flex items-center justify-between">
                      <span className="text-[9px] text-[rgba(255,255,255,0.85)] font-display italic">
                        {dateLabel}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Decorative empty slots so the rest state matches the design. */}
              {Array.from({ length: placeholderCount }).map((_, i) => (
                <div
                  key={`ph-${i}`}
                  className="aspect-[1/1.2] rounded-xl overflow-hidden relative bg-paper border border-line"
                >
                  <PhotoPlaceholder
                    tone={PLACEHOLDER_TONES[i % PLACEHOLDER_TONES.length]}
                    label={null}
                    className="w-full h-full rounded-[10px]"
                    labelClassName="text-[10px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}

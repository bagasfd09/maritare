"use client";

import { Icon } from "@/components/atoms/icon";
import { FlowerMark } from "@/components/atoms/flower-mark";
import {
  MobileCard,
  MobileEyebrow,
  MobileEm,
  MobileButton,
  MobileProgress,
} from "@/components/molecules/mobile-primitives";
import { MobileShell } from "@/components/templates/mobile-shell";
import { useGallery } from "@/components/templates/use-gallery";
import { cn } from "@/lib/utils";
import type { Gallery } from "@/server/queries/photos";

// Mobile screen 06 · Galeri Foto — same data and behaviour as the desktop
// (shared useGallery): working uploads with progress, delete, and cover/closing
// badges. Setting cover/penutup stays a desktop affordance (hover has no touch
// equivalent worth the clutter here).
export function GalleryMobile({ gallery }: { gallery: Gallery }) {
  const { photos, used, limit, packageName } = gallery;
  const {
    fileInputRef,
    uploading,
    overallPct,
    error,
    pendingPhotoId,
    busy,
    handleInputChange,
    openFilePicker,
    handleDelete,
  } = useGallery(gallery);

  const isUnlimited = limit === null;
  const limitLabel = isUnlimited ? "∞" : String(limit);
  const packageLabel = packageName ?? "—";
  const progress = limit ? Math.round((used / limit) * 100) : 0;

  return (
    <MobileShell
      active="galeri"
      eyebrow="Galeri Foto"
      title={
        <>
          Galeri <MobileEm>foto.</MobileEm>
        </>
      }
    >
      {/* Hidden multi-file picker driving both upload buttons. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Storage quota card */}
      <MobileCard className="relative overflow-hidden">
        <div className="absolute -bottom-8 -right-8 w-[110px] h-[110px] opacity-[0.06] pointer-events-none" aria-hidden>
          <FlowerMark size={110} color="var(--color-burgundy)" core="var(--color-terracotta)" stamen="var(--color-peach)" />
        </div>
        <div className="flex items-center justify-between mb-3 relative">
          <div>
            <MobileEyebrow>Penyimpanan · Paket {packageLabel}</MobileEyebrow>
            <div className="font-display font-extrabold text-2xl mt-1">
              {used} <span className="text-[15px] text-muted-ink">/ {limitLabel} foto</span>
            </div>
          </div>
          <FlowerMark size={20} />
        </div>
        <MobileProgress value={progress} className="mb-[14px]" />
        <MobileButton variant="dark" full type="button" onClick={openFilePicker} disabled={busy}>
          <Icon name="upload" size={16} />{" "}
          {uploading ? `Mengunggah… ${overallPct}% (${uploading.done}/${uploading.total})` : "Unggah foto"}
        </MobileButton>
        {error && <div className="text-[11.5px] text-burgundy mt-2">{error}</div>}
      </MobileCard>

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-[10px]">
        {photos.map((p) => {
          const isWorking = pendingPhotoId === p.id;
          return (
            <div
              key={p.id}
              className={cn(
                "h-[130px] rounded-[14px] overflow-hidden relative bg-paper",
                p.isCover && "border-2 border-burgundy",
                p.isClosing && !p.isCover && "border-2 border-sage",
                isWorking && "opacity-50",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URLs are short-lived and not known at build time; next/image is not configured for arbitrary R2 hosts */}
              <img src={p.viewUrl} alt="Foto undangan" className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 flex gap-1 z-[2]">
                {p.isCover && (
                  <span className="text-[8px] px-[7px] py-[3px] rounded-full bg-burgundy text-cream font-bold tracking-[0.18em] uppercase">
                    Cover
                  </span>
                )}
                {p.isClosing && (
                  <span className="text-[8px] px-[7px] py-[3px] rounded-full bg-sage text-cream font-bold tracking-[0.18em] uppercase">
                    Penutup
                  </span>
                )}
              </div>
              <button
                type="button"
                title="Hapus foto"
                disabled={busy || isWorking}
                onClick={() => handleDelete(p.id)}
                className="absolute top-2 right-2 z-[2] w-[22px] h-[22px] rounded-full bg-[rgba(0,0,0,0.45)] text-white flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                <Icon name="x" size={11} stroke="currentColor" />
              </button>
            </div>
          );
        })}

        {/* Upload tile — doubles as the empty state's only tile. */}
        <button
          type="button"
          onClick={openFilePicker}
          disabled={busy}
          className={cn(
            "h-[130px] rounded-[14px] border-[1.5px] border-dashed border-rule bg-transparent text-muted-ink flex flex-col items-center justify-center gap-2",
            busy ? "cursor-wait" : "cursor-pointer",
          )}
        >
          {uploading ? (
            <>
              <span className="text-[18px] font-bold tabular-nums text-burgundy leading-none">{overallPct}%</span>
              <span className="text-[11px] font-semibold">Mengunggah…</span>
            </>
          ) : (
            <>
              <Icon name="plus" size={22} stroke="currentColor" />
              <span className="text-[11px] font-semibold">{photos.length === 0 ? "Unggah foto pertama" : "Tambah"}</span>
            </>
          )}
        </button>
      </div>
    </MobileShell>
  );
}

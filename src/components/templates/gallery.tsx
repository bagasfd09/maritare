"use client";

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
import { useGallery } from "@/components/templates/use-gallery";
import type { DashboardChrome } from "@/server/queries/dashboard";
import type { Gallery as GalleryData } from "@/server/queries/photos";

type GalleryProps = {
  gallery: GalleryData;
  /** Real sidebar chrome (couple/owner identity). */
  chrome?: DashboardChrome | null;
};

// Screen 06 · Galeri Foto — real photos + quota from the DB, with direct-to-R2
// uploads (presigned PUT), soft-delete, and cover/closing selection right on
// the tiles. No filename labels, no filter chips, no decorative dummy tiles:
// the grid is exactly the couple's photos plus one upload tile.
export function Gallery({ gallery, chrome }: GalleryProps) {
  const { photos, used, limit, packageName } = gallery;
  const {
    fileInputRef,
    uploading,
    overallPct,
    isDragOver,
    error,
    pendingPhotoId,
    busy,
    isUnlimited,
    remaining,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleInputChange,
    openFilePicker,
    handleDelete,
    handleSetCover,
    handleSetClosing,
  } = useGallery(gallery);

  const progress =
    limit === null
      ? Math.min(100, used > 0 ? 8 : 0) // unlimited: a thin always-growing hint
      : limit > 0
        ? Math.min(100, Math.round((used / limit) * 100))
        : 0;
  const limitLabel = isUnlimited ? "∞" : String(limit);
  const packageLabel = packageName ?? "—";

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
              <Button variant="primary" onClick={openFilePicker} disabled={busy}>
                <Icon name="upload" size={14} />Upload foto
              </Button>
            </>
          }
        />

        <div className="flex-1 px-10 py-7 overflow-y-auto flex flex-col">
          {/* Quota strip + brand note */}
          <div className="grid grid-cols-[1.4fr_1fr] gap-4 mb-[22px]">
            <div className="relative bg-paper border border-line rounded-[14px] px-[22px] py-[18px] overflow-hidden">
              <div className="absolute -bottom-9 -right-9 w-[130px] h-[130px] opacity-[0.06] pointer-events-none" aria-hidden>
                <FlowerMark size={130} color="var(--color-burgundy)" core="var(--color-terracotta)" stamen="var(--color-peach)" />
              </div>
              <div className="relative">
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
                    Butuh lebih?{" "}
                    <a href="/dashboard/billing" className="text-burgundy font-semibold no-underline">
                      Upgrade paket →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative brand note — the dark twin every screen pairs with. */}
            <div className="bg-charcoal text-cream rounded-[14px] px-[22px] py-[18px] flex items-center gap-4 relative overflow-hidden">
              <div className="absolute -top-5 -right-[25px] w-[100px] h-[100px] opacity-[0.08]" aria-hidden>
                <FlowerMark size={100} color="var(--color-peach)" core="var(--color-peach)" stamen="var(--color-terracotta)" />
              </div>
              <div className="w-11 h-11 rounded-full bg-[rgba(245,239,230,0.1)] border border-[rgba(245,239,230,0.2)] flex items-center justify-center shrink-0">
                <FlowerMark size={22} color="var(--color-peach)" core="var(--color-peach)" stamen="var(--color-terracotta)" />
              </div>
              <div className="flex-1 relative z-[2]">
                <SectionNumber className="text-[11px] text-peach mb-1">ii. Catatan</SectionNumber>
                <div className="font-display italic text-[17px] text-cream leading-snug">
                  Momen terbaik kalian, tersimpan rapi.
                </div>
                <div className="text-[11px] text-[rgba(245,239,230,0.6)] mt-1">
                  Foto di sini otomatis bisa dipakai di galeri undangan & editor.
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar — petal rule, matching the checkout group headers. */}
          <div className="flex items-center gap-3 mb-4">
            <SectionNumber className="text-[12px]">iii. Semua foto</SectionNumber>
            <span className="text-[11px] text-muted-ink font-display italic shrink-0">
              {used > 0 ? `${used} foto` : "Mulai unggah foto pertamamu"}
            </span>
            <span className="h-px flex-1 bg-line" aria-hidden />
            <FlowerMark size={9} color="var(--color-burgundy)" core="var(--color-terracotta)" stamen="var(--color-peach)" />
            <span className="h-px w-10 bg-line" aria-hidden />
            <span className="text-[10.5px] text-faint tracking-[0.14em] uppercase font-semibold shrink-0">
              Hover foto untuk atur Cover · Penutup · Hapus
            </span>
          </div>

          {/* Inline error line under the toolbar. */}
          {error && <div className="text-[12px] text-burgundy mb-3">{error}</div>}

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

          {photos.length === 0 && !uploading ? (
            /* Empty state — one wide branded dropzone instead of dummy tiles. */
            <div
              onClick={openFilePicker}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "relative border-[1.5px] border-dashed rounded-2xl px-8 py-14 flex flex-col items-center justify-center gap-3 text-center transition-colors overflow-hidden",
                busy ? "cursor-wait" : "cursor-pointer",
                isDragOver ? "border-burgundy bg-peach/40" : "border-rule bg-paper",
              )}
            >
              <div className="absolute -top-10 -right-10 w-[160px] h-[160px] opacity-[0.06] pointer-events-none" aria-hidden>
                <FlowerMark size={160} color="var(--color-burgundy)" core="var(--color-terracotta)" stamen="var(--color-peach)" />
              </div>
              <div className="w-12 h-12 rounded-full bg-burgundy text-cream flex items-center justify-center">
                <Icon name="upload" size={20} />
              </div>
              <div className="font-display italic text-[20px] text-charcoal">
                Belum ada foto — mulai dari sini.
              </div>
              <div className="text-[12px] text-muted-ink max-w-[380px] leading-[1.6]">
                Drop beberapa foto sekaligus di sini, atau klik untuk pilih dari perangkatmu.
                JPG, PNG, WebP, atau AVIF — maksimal 10 MB per foto.
              </div>
            </div>
          ) : (
            /* Grid — upload tile + the couple's real photos. Nothing decorative. */
            <div className="grid grid-cols-6 gap-3">
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
                    <div className="font-display italic text-[13px] text-charcoal text-center">Mengunggah…</div>
                    <div className="text-[20px] font-bold tabular-nums text-burgundy leading-none">{overallPct}%</div>
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

              {photos.map((p) => {
                const isWorking = pendingPhotoId === p.id;
                const dateLabel = new Intl.DateTimeFormat("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }).format(p.createdAt);
                return (
                  <div
                    key={p.id}
                    className={cn(
                      "group aspect-[1/1.2] rounded-xl overflow-hidden relative bg-paper",
                      p.isCover
                        ? "border-2 border-burgundy"
                        : p.isClosing
                          ? "border-2 border-sage"
                          : "border border-line",
                      isWorking && "opacity-50",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URLs are short-lived and not known at build time; next/image is not configured for arbitrary R2 hosts */}
                    <img
                      src={p.viewUrl}
                      alt="Foto undangan"
                      className="w-full h-full object-cover rounded-[10px]"
                    />

                    {/* Status badges + delete (delete only on hover) */}
                    <div className="absolute top-2 right-2 flex gap-1 z-[3]">
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
                      <CircleButton
                        size={22}
                        variant="solid"
                        title="Hapus foto"
                        disabled={busy || isWorking}
                        onClick={() => handleDelete(p.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      >
                        <Icon name="x" size={11} />
                      </CircleButton>
                    </div>

                    {/* Bottom strip: date + cover/closing actions on hover */}
                    <div className="absolute bottom-0 left-0 right-0 pt-6 px-2 pb-2 bg-[linear-gradient(to_top,rgba(0,0,0,0.6),transparent)] flex items-center justify-between gap-1">
                      <span className="text-[9px] text-[rgba(255,255,255,0.85)] font-display italic shrink-0">
                        {dateLabel}
                      </span>
                      <span className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          disabled={busy || isWorking}
                          onClick={() => handleSetCover(p.id, p.isCover)}
                          title={p.isCover ? "Lepas dari cover" : "Jadikan foto sampul"}
                          className={cn(
                            "text-[8.5px] px-2 py-[3px] rounded-full font-bold tracking-[0.14em] uppercase cursor-pointer border",
                            p.isCover
                              ? "bg-burgundy text-cream border-burgundy"
                              : "bg-[rgba(0,0,0,0.35)] text-white border-[rgba(255,255,255,0.5)]",
                          )}
                        >
                          Cover
                        </button>
                        <button
                          type="button"
                          disabled={busy || isWorking}
                          onClick={() => handleSetClosing(p.id, p.isClosing)}
                          title={p.isClosing ? "Lepas dari penutup" : "Jadikan foto penutup"}
                          className={cn(
                            "text-[8.5px] px-2 py-[3px] rounded-full font-bold tracking-[0.14em] uppercase cursor-pointer border",
                            p.isClosing
                              ? "bg-sage text-cream border-sage"
                              : "bg-[rgba(0,0,0,0.35)] text-white border-[rgba(255,255,255,0.5)]",
                          )}
                        >
                          Penutup
                        </button>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}

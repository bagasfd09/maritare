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
import type { Gallery } from "@/server/queries/photos";

// Mobile screen 06 · Galeri Foto — real photos + quota from the DB / R2, fed by
// props from the page server component (same `Gallery` data as the desktop).
export function GalleryMobile({ gallery }: { gallery: Gallery }) {
  const { photos, used, limit, packageName } = gallery;

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
      {/* Storage quota card */}
      <MobileCard>
        <div className="flex items-center justify-between mb-3">
          <div>
            <MobileEyebrow>Penyimpanan · Paket {packageLabel}</MobileEyebrow>
            <div className="font-display font-extrabold text-2xl mt-1">
              {used} <span className="text-[15px] text-muted-ink">/ {limitLabel} foto</span>
            </div>
          </div>
          <FlowerMark size={20} />
        </div>
        <MobileProgress value={progress} className="mb-[14px]" />
        <MobileButton variant="dark" full type="button">
          <Icon name="upload" size={16} /> Unggah foto
        </MobileButton>
      </MobileCard>

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-[10px]">
        {photos.length === 0 ? (
          <div className="col-span-2 text-center text-[13px] text-muted-ink py-8">
            Belum ada foto
          </div>
        ) : (
          photos.map((p) => (
            <div
              key={p.id}
              className="h-[130px] rounded-[14px] overflow-hidden relative bg-paper"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- presigned R2 URLs are short-lived and not known at build time; next/image is not configured for arbitrary R2 hosts */}
              <img
                src={p.viewUrl}
                alt={p.label ?? "Foto undangan"}
                className="w-full h-full object-cover"
              />
              {p.label && (
                <span className="absolute left-3 bottom-3 z-[2] font-display italic text-[11px] text-[rgba(255,255,255,0.92)] [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]">
                  {p.label}
                </span>
              )}
            </div>
          ))
        )}
        <button
          type="button"
          className="h-[130px] rounded-[14px] border-[1.5px] border-dashed border-rule bg-transparent text-muted-ink flex flex-col items-center justify-center gap-2 cursor-pointer"
        >
          <Icon name="plus" size={22} stroke="var(--color-muted-ink)" />
          <span className="text-[11px] font-semibold">Tambah</span>
        </button>
      </div>
    </MobileShell>
  );
}

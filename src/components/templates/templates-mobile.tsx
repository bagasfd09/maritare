import { StatusPill } from "@/components/atoms/status-pill";
import { MiniInvite, type MiniInvitePalette } from "@/components/molecules/mini-invite";
import {
  MobileButton,
  MobileCard,
  MobileChip,
  MobileChipRow,
  MobileEm,
  MobileHeading,
} from "@/components/molecules/mobile-primitives";
import { MobileShell } from "@/components/templates/mobile-shell";
import { templateThumbSrc } from "@/components/invitation/slugs";
import type { TemplatesData } from "@/server/queries/dashboard";

const CATEGORIES = ["Semua", "Editorial", "Romantic", "Rustic", "Minimal"];

const MINI_INVITE_PALETTES = [
  "garden", "oxblood", "blush", "moss", "ivory", "midnight", "terracotta", "sage",
] as const;

function toPalette(slug: string): MiniInvitePalette {
  return (MINI_INVITE_PALETTES as readonly string[]).includes(slug)
    ? (slug as MiniInvitePalette)
    : "garden";
}

// Mobile screen 04 · Galeri Template. Data-driven from the global catalog;
// "Semua" is the active category (static, matching the design's default).
export function TemplatesMobile({ data }: { data: TemplatesData }) {
  const cat = "Semua";
  const templates = data.templates;
  const featured =
    templates.find((t) => t.slug === data.currentTemplateSlug) ??
    templates.find((t) => t.featured) ??
    templates[0];
  const others = featured ? templates.filter((t) => t.slug !== featured.slug) : templates;
  const isCurrent = featured?.slug === data.currentTemplateSlug;

  return (
    <MobileShell active="template" eyebrow="Galeri Template" title={<>Pilih <MobileEm>tema.</MobileEm></>}>
      <MobileChipRow>
        {CATEGORIES.map((c) => (
          <MobileChip key={c} active={cat === c}>
            {c}
          </MobileChip>
        ))}
      </MobileChipRow>

      {/* Featured: current (or recommended) template */}
      {featured && (
        <MobileCard className="flex items-center gap-4">
          {(() => {
            const thumb = templateThumbSrc(featured.slug, featured.coverUrl ?? null);
            return thumb ? (
              // eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL or static thumb; plain img keeps signed URLs off the optimizer
              <img
                src={thumb}
                alt={`Pratinjau ${featured.name}`}
                loading="lazy"
                className="w-[104px] h-[140px] rounded-[6px] object-cover object-top shrink-0"
              />
            ) : (
              <MiniInvite width={104} palette={toPalette(featured.slug)} scale={0.62} />
            );
          })()}
          <div className="flex-1 min-w-0">
            <StatusPill tone={isCurrent ? "live" : "draft"} className="text-[10px]">
              {isCurrent ? "Sedang dipakai" : "Pilihan Maritare"}
            </StatusPill>
            <MobileHeading className="text-[22px] mt-[10px]">
              {featured.name}
            </MobileHeading>
            <div className="text-xs text-muted-ink mt-1 leading-[1.5]">
              {featured.style ?? featured.category ?? ""}
            </div>
            <MobileButton variant="ghost" className="h-[38px] mt-3">
              Sesuaikan tema
            </MobileButton>
          </div>
        </MobileCard>
      )}

      <div className="flex items-center justify-between gap-[10px] mt-[2px]">
        <MobileHeading className="text-[17px]">
          Tema <MobileEm>lainnya.</MobileEm>
        </MobileHeading>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {others.map((t) => {
          const thumb = templateThumbSrc(t.slug, t.coverUrl ?? null);
          return (
          <MobileCard key={t.slug} className="p-[10px] relative overflow-hidden">
            {t.exclusive && (
              <span className="absolute top-2 left-2 z-[2] bg-burgundy text-cream text-[8px] tracking-[0.18em] uppercase font-bold px-[6px] py-[3px] rounded-full">
                ◆ Exclusive
              </span>
            )}
            <div className="flex justify-center">
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element -- presigned R2 URL or static thumb; plain img keeps signed URLs off the optimizer
                <img
                  src={thumb}
                  alt={`Pratinjau ${t.name}`}
                  loading="lazy"
                  className="w-[120px] h-[162px] rounded-[6px] object-cover object-top"
                />
              ) : (
                <MiniInvite width={120} palette={toPalette(t.slug)} scale={0.7} />
              )}
            </div>
            <div className="flex items-center justify-between mt-[10px]">
              <span className="font-display italic text-sm">{t.name}</span>
              <span className="text-[9px] tracking-[0.12em] uppercase font-bold text-terracotta">
                {t.category ?? ""}
              </span>
            </div>
          </MobileCard>
          );
        })}
      </div>
    </MobileShell>
  );
}

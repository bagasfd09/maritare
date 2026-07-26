"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { MiniInvite, type MiniInvitePalette } from "@/components/molecules/mini-invite";
import { chooseTemplate } from "@/server/actions/wedding";
import { cn } from "@/lib/utils";

export type Template = {
  id: MiniInvitePalette;
  name: string;
  style: string;
  palette: [string, string, string];
  category: "Editorial" | "Romantic" | "Rustic" | "Minimal";
  featured?: boolean;
  current?: boolean;
  isNew?: boolean;
  /** Granted to this customer specifically — the catalog already filtered it in. */
  exclusive?: boolean;
};

type TemplateCardProps = {
  template: Template;
  number: number;
  // The real catalog slug (drives chooseTemplate; may differ from `id`, which
  // is the MiniInvite palette key and falls back to "garden" for unknowns).
  slug: string;
  // Whether this template has a renderable invitation implementation.
  renderable: boolean;
  // Live preview URL, or null when there is nothing to preview yet.
  previewHref: string | null;
  // Real cover thumbnail for renderable templates; falls back to the abstract
  // MiniInvite when absent (catalog-only templates have no real render yet).
  thumbSrc?: string | null;
};

// Gallery tile: mini invitation preview + name, palette swatches, and actions.
export function TemplateCard({
  template,
  number,
  slug,
  renderable,
  previewHref,
  thumbSrc,
}: TemplateCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handlePakai() {
    setError(null);
    startTransition(async () => {
      const result = await chooseTemplate({ templateSlug: slug });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Server revalidated /dashboard/templates; refresh to reflect immediately.
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "bg-paper rounded-2xl p-[14px] relative cursor-pointer border",
        // Exclusive tiles get a burgundy hairline instead of a second badge
        // fighting for the same corner — quiet, but unmistakable in a full grid.
        template.exclusive ? "border-burgundy/45" : "border-line",
      )}
    >
      {/* Exclusive sits top-LEFT so it never collides with Dipakai / Baru. */}
      {template.exclusive && (
        <div className="absolute top-[10px] left-[10px] z-[3] bg-burgundy text-cream text-[9px] tracking-[0.2em] uppercase font-bold px-2 py-1 rounded-full">
          ◆ Exclusive
        </div>
      )}
      {/* "Sedang dipakai" takes priority over the "Baru" badge for the current template. */}
      {template.current ? (
        <div className="absolute top-[10px] right-[10px] z-[3] bg-burgundy text-cream text-[9px] tracking-[0.2em] uppercase font-bold px-2 py-1 rounded-full">
          Dipakai
        </div>
      ) : (
        template.isNew && (
          <div className="absolute top-[10px] right-[10px] z-[3] bg-blush text-burgundy-dark text-[9px] tracking-[0.2em] uppercase font-bold px-2 py-1 rounded-full">
            Baru
          </div>
        )
      )}
      <div className="bg-cream rounded-[10px] mb-3 flex justify-center overflow-hidden">
        {thumbSrc ? (
          // Real cover render of the renderable template (license-safe assets).
          // eslint-disable-next-line @next/next/no-img-element -- static local thumbnail; plain img keeps it off the optimizer
          <img
            src={thumbSrc}
            alt={`Pratinjau ${template.name}`}
            loading="lazy"
            className="h-[230px] w-full object-cover object-top"
          />
        ) : (
          <div className="pt-4 px-2 pb-[14px]">
            <MiniInvite palette={template.id} width={150} scale={0.74} />
          </div>
        )}
      </div>
      <div className="flex items-start justify-between mb-[10px] px-1">
        <div className="flex-1">
          <div className="font-display italic text-[18px] leading-[1.1] text-charcoal">{template.name}</div>
          <div className="text-[10px] text-muted-ink tracking-[0.22em] uppercase font-semibold mt-1">
            № {String(number).padStart(2, "0")} · {template.style}
          </div>
        </div>
        <div className="flex gap-[3px] pt-[2px]">
          {template.palette.map((c) => (
            <span
              key={c}
              className="w-[11px] h-[11px] rounded-full border border-[rgba(0,0,0,0.08)]"
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-[6px] px-[2px]">
        {renderable && previewHref ? (
          <a
            href={previewHref}
            target="_blank"
            rel="noopener"
            className="flex-1 justify-center inline-flex items-center gap-2 rounded-full border border-charcoal/20 hover:border-charcoal bg-transparent text-charcoal font-body font-medium tracking-[0.08em] uppercase whitespace-nowrap cursor-pointer transition-colors h-[30px] px-3 text-[11px] no-underline"
          >
            <Icon name="eye" size={12} />
            Preview
          </a>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-center opacity-50"
            disabled
            title="Segera hadir"
          >
            <Icon name="eye" size={12} />
            Segera hadir
          </Button>
        )}
        {template.current ? (
          <Button variant="ghost" size="sm" className="flex-1 justify-center" disabled>
            <Icon name="check" size={12} />
            Dipakai
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            className="flex-1 justify-center"
            onClick={handlePakai}
            disabled={isPending}
          >
            {isPending ? "Memasang…" : "Pakai →"}
          </Button>
        )}
      </div>
      {error && (
        <div className="mt-2 px-[2px] text-[10px] text-burgundy leading-snug">{error}</div>
      )}
    </div>
  );
}

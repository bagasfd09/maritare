"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/button";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import { Display } from "@/components/atoms/typography";
import { chooseTemplate } from "@/server/actions/wedding";

type TemplateFeaturedProps = {
  slug: string;
  name: string;
  style: string | null;
  palette: string[];
  previewHref: string | null;
  thumbSrc: string | null;
  current: boolean;
};

// Featured hero for the templates gallery (dark surface). Data-driven: shows the
// wedding's current template (or the catalog's featured pick) with a live
// preview link and a "Pakai" action.
export function TemplateFeatured({
  slug,
  name,
  style,
  palette,
  previewHref,
  thumbSrc,
  current,
}: TemplateFeaturedProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [c0, c1, c2] = palette;

  function handlePakai() {
    setError(null);
    startTransition(async () => {
      const result = await chooseTemplate({ templateSlug: slug });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-2 gap-4 mb-[22px] bg-charcoal rounded-[18px] p-[22px] text-cream overflow-hidden relative">
      <div className="absolute -top-[30px] right-[200px] w-[140px] h-[140px] opacity-[0.06]">
        <FlowerMark size={140} color="var(--color-peach)" core="var(--color-peach)" stamen="var(--color-terracotta)" />
      </div>

      <div className="flex flex-col justify-between px-3 py-[10px] relative z-[2]">
        <div>
          <div className="inline-flex items-center gap-[6px] px-[11px] py-[5px] rounded-full bg-burgundy text-peach text-[10px] font-bold tracking-[0.18em] uppercase mb-[18px]">
            ★ {current ? "Aktif sekarang" : "Pilihan Maritare"}
          </div>
          <Display as="div" className="text-[46px] tracking-[-0.03em] text-peach">
            {name}
          </Display>
          {style && (
            <div className="font-display italic text-[18px] text-[rgba(245,239,230,0.7)] mt-[6px]">
              {style}
            </div>
          )}
          <div className="mt-[18px] text-[13px] text-[rgba(245,239,230,0.78)] leading-[1.6] max-w-[380px]">
            Desain undangan siap pakai — tinggal isi nama, foto, dan acara di
            editor. Ganti template kapan saja, gratis selama belum publish.
          </div>
        </div>
        <div>
          <div className="flex gap-2 mb-[14px] flex-wrap">
            {palette.filter(Boolean).map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-[6px] text-[10px] px-[10px] py-1 rounded-full bg-[rgba(245,239,230,0.1)] text-[rgba(245,239,230,0.8)] font-semibold tracking-[0.06em]"
              >
                <span className="w-[10px] h-[10px] rounded-full" style={{ background: c }} />
                {c.toUpperCase()}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            {previewHref && (
              <a
                href={previewHref}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-2 h-[38px] px-4 rounded-full bg-[rgba(245,239,230,0.1)] text-cream font-body font-medium text-[12px] tracking-[0.06em] no-underline cursor-pointer"
              >
                <Icon name="eye" size={14} />
                Lihat preview lengkap
              </a>
            )}
            {current ? (
              <Button variant="dark" className="bg-cream text-charcoal font-bold" disabled>
                <Icon name="check" size={14} />
                Sedang dipakai
              </Button>
            ) : (
              <Button
                variant="dark"
                className="bg-cream text-charcoal font-bold"
                onClick={handlePakai}
                disabled={isPending}
              >
                <Icon name="check" size={14} />
                {isPending ? "Memasang…" : "Pakai template ini"}
              </Button>
            )}
          </div>
          {error && <div className="mt-2 text-[11px] text-peach">{error}</div>}
        </div>
      </div>

      <div className="flex items-center justify-center p-[14px] relative z-[2]">
        {thumbSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- static local thumbnail; plain img keeps it off the optimizer
          <img
            src={thumbSrc}
            alt={`Pratinjau ${name}`}
            className="max-h-[300px] w-auto rounded-[10px] object-contain shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
          />
        ) : (
          <div className="flex gap-3">
            {[c0, c1, c2].filter(Boolean).map((c, i) => (
              <span
                key={i}
                className="w-[70px] h-[240px] rounded-[10px] border border-[rgba(245,239,230,0.12)]"
                style={{ background: c }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

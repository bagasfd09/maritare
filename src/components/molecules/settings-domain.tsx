"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Display, Em } from "@/components/atoms/typography";
import { SectionNumber } from "@/components/atoms/section-number";
import { isValidSlug } from "@/lib/slug";
import { renameSlug } from "@/server/actions/settings";

// Ports `.d-input-lbl` from the design.
const INPUT_LABEL =
  "font-body text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-ink mb-2 block";

// Settings · section ii: invitation slug field + custom domain upsell.
export function SettingsDomain({ weddingSlug }: { weddingSlug: string }) {
  const router = useRouter();
  const [slug, setSlug] = useState(weddingSlug);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const trimmed = slug.trim().toLowerCase();
  const dirty = trimmed !== weddingSlug;
  const formatOk = trimmed.length === 0 || isValidSlug(trimmed);

  function handleSave() {
    setStatus(null);
    if (!isValidSlug(trimmed)) {
      setStatus({ ok: false, msg: "Slug hanya boleh huruf kecil, angka, dan tanda hubung." });
      return;
    }
    startTransition(async () => {
      const result = await renameSlug({ slug: trimmed });
      if (result.ok) {
        setStatus({ ok: true, msg: "Slug tersimpan." });
        router.refresh();
      } else {
        setStatus({ ok: false, msg: result.error });
      }
    });
  }

  return (
    <section id="domain" className="scroll-mt-6">
      <SectionNumber className="text-[12px] mb-1">iii. Domain &amp; Slug</SectionNumber>
      <Display as="div" className="text-[26px] mb-4">
        Link <Em className="text-burgundy">undanganmu.</Em>
      </Display>

      <div className="bg-paper border border-line rounded-[14px] px-[22px] py-5">
        <label className={INPUT_LABEL} htmlFor="set-slug">Alamat undangan</label>
        <div className="flex items-center bg-cream border border-beige rounded-[12px] pl-[14px] mb-[10px]">
          <span className="font-display italic text-muted-ink text-[15px] pr-1">maritare.id /</span>
          <input
            id="set-slug"
            className="flex-1 bg-transparent border-none py-3 pr-[14px] pl-[6px] font-body text-[14px] font-semibold text-charcoal outline-none"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            maxLength={60}
          />
          {!formatOk && (
            <span className="text-[11px] px-[9px] py-[3px] rounded-full bg-[rgba(124,45,45,0.12)] text-burgundy font-bold tracking-[0.12em] uppercase mr-[10px]">
              Format salah
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mb-[14px]">
          <Button size="sm" variant="primary" onClick={handleSave} disabled={isPending || !dirty || !formatOk}>
            {isPending ? "Menyimpan…" : "Simpan slug"}
          </Button>
          {status && (
            <span className={status.ok ? "text-[12px] text-sage" : "text-[12px] text-burgundy"}>
              {status.msg}
            </span>
          )}
        </div>

        <div className="flex items-start gap-[14px] px-4 py-[14px] bg-cream rounded-[10px] border border-dashed border-rule">
          <div className="w-8 h-8 rounded-lg bg-peach text-burgundy-dark flex items-center justify-center shrink-0">
            <Icon name="sparkle" size={14} />
          </div>
          <div className="flex-1">
            <div className="font-display italic text-[16px] text-charcoal">Pakai custom domain</div>
            <div className="text-[12px] text-muted-ink mt-[2px]">
              kamu.com / undangan.id — termasuk di paket Platinum.
            </div>
          </div>
          <Button variant="ghost" size="sm">Upgrade →</Button>
        </div>
      </div>
    </section>
  );
}

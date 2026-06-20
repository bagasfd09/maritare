"use client";

// First-run onboarding form. Collects the minimum needed to create a wedding
// (couple names + date + template); everything else is editable later in the
// editor. On submit it calls createWedding, which inserts the wedding (owned by
// the session user) and redirects to the editor.

import { useState, useTransition } from "react";

import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import { Logo } from "@/components/atoms/logo";
import { Display, Em } from "@/components/atoms/typography";
import { cn } from "@/lib/utils";
import type { CatalogTemplate } from "@/server/queries/dashboard";
import { createWedding } from "@/server/actions/wedding";

const INPUT =
  "w-full bg-cream border border-beige rounded-[12px] px-[14px] py-3 font-body text-[14px] text-charcoal outline-none transition-colors focus:border-burgundy focus:bg-paper placeholder:text-faint";
const INPUT_LABEL =
  "font-body text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-ink mb-2 block";

// Local cover thumbnails for renderable templates.
const TEMPLATE_THUMBS: Record<string, string> = {
  folk: "/invitation/thumbs/folk.webp",
};

export function Onboarding({ templates }: { templates: CatalogTemplate[] }) {
  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [templateSlug, setTemplateSlug] = useState(templates[0]?.slug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!groomName.trim() || !brideName.trim()) {
      setError("Isi nama kedua mempelai dulu ya.");
      return;
    }
    if (!templateSlug) {
      setError("Pilih satu template dulu.");
      return;
    }

    startTransition(async () => {
      // On success this redirects (never returns); only errors come back.
      const result = await createWedding({
        groomName: groomName.trim(),
        brideName: brideName.trim(),
        eventDate: eventDate || "",
        templateSlug,
      });
      if (result && !result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="min-h-screen w-full bg-ivory text-charcoal font-body flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-[680px]">
        {/* Brand header */}
        <div className="flex items-center justify-between mb-8">
          <Logo size={26} />
          <FlowerMark size={20} />
        </div>

        <div className="mb-6">
          <span className="text-[11px] tracking-[0.22em] uppercase font-bold text-muted-ink">
            Selamat datang
          </span>
          <Display as="h1" className="text-[34px] mt-2 leading-[1.05]">
            Buat <Em className="text-burgundy">undangan</Em> pertamamu.
          </Display>
          <p className="text-[14px] text-muted-ink mt-3 leading-[1.6] max-w-[460px]">
            Isi data dasarnya dulu — nama, tanggal, dan pilih template. Sisanya
            (foto, acara, amplop, ucapan) bisa kamu atur di editor setelah ini.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Couple names */}
          <div className="bg-paper border border-line rounded-[14px] px-[22px] py-5 grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
            <div>
              <label className={INPUT_LABEL} htmlFor="ob-groom">
                Nama mempelai pria
              </label>
              <input
                id="ob-groom"
                className={INPUT}
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                placeholder="mis. Bagas"
                maxLength={80}
                autoComplete="off"
              />
            </div>
            <div>
              <label className={INPUT_LABEL} htmlFor="ob-bride">
                Nama mempelai wanita
              </label>
              <input
                id="ob-bride"
                className={INPUT}
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                placeholder="mis. Kiki"
                maxLength={80}
                autoComplete="off"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={INPUT_LABEL} htmlFor="ob-date">
                Tanggal nikah <span className="text-faint normal-case">(bisa diisi nanti)</span>
              </label>
              <input
                id="ob-date"
                type="date"
                className={cn(INPUT, "sm:max-w-[240px]")}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
          </div>

          {/* Template picker */}
          <div>
            <label className={cn(INPUT_LABEL, "px-1")}>Pilih template</label>
            <div className="grid grid-cols-2 gap-4">
              {templates.map((t) => {
                const selected = t.slug === templateSlug;
                // Prefer an admin-uploaded cover (presigned URL), then the local
                // static thumb, then the palette-block placeholder.
                const thumb = t.coverUrl ?? TEMPLATE_THUMBS[t.slug] ?? null;
                const [c0, c1, c2] = t.palette;
                return (
                  <button
                    type="button"
                    key={t.slug}
                    onClick={() => setTemplateSlug(t.slug)}
                    aria-pressed={selected}
                    className={cn(
                      "text-left bg-paper rounded-2xl border p-[14px] relative cursor-pointer transition-colors",
                      selected ? "border-burgundy ring-1 ring-burgundy" : "border-line hover:border-charcoal/30",
                    )}
                  >
                    {selected && (
                      <span className="absolute top-[10px] right-[10px] z-[3] bg-burgundy text-cream w-6 h-6 rounded-full inline-flex items-center justify-center">
                        <Icon name="check" size={13} />
                      </span>
                    )}
                    <div className="bg-cream rounded-[10px] mb-3 overflow-hidden h-[180px] flex items-center justify-center">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element -- static local thumbnail; plain img keeps it off the optimizer
                        <img
                          src={thumb}
                          alt={`Pratinjau ${t.name}`}
                          loading="lazy"
                          className="h-full w-full object-cover object-top"
                        />
                      ) : (
                        <div className="flex gap-[6px]">
                          {[c0, c1, c2].filter(Boolean).map((c, i) => (
                            <span
                              key={i}
                              className="w-10 h-20 rounded-md border border-[rgba(0,0,0,0.08)]"
                              style={{ background: c }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="font-display italic text-[18px] leading-[1.1] text-charcoal px-1">
                      {t.name}
                    </div>
                    <div className="text-[10px] text-muted-ink tracking-[0.2em] uppercase font-semibold mt-1 px-1">
                      {t.style ?? t.category ?? ""}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="text-[13px] text-burgundy bg-blush/40 border border-burgundy/30 rounded-[10px] px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-burgundy text-cream font-body font-semibold text-[14px] tracking-[0.04em] cursor-pointer disabled:opacity-60 transition-opacity"
            >
              {isPending ? "Membuat…" : "Buat undangan →"}
            </button>
            <span className="text-[12px] text-muted-ink">
              Gratis selama belum publish.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

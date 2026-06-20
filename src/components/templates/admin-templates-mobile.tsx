"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminMobileShell } from "@/components/templates/admin-mobile-shell";
import {
  AdminMobileBtnMini,
  AdminMobileCard,
  AdminMobileChip,
  AdminMobileHScroll,
  AdminMobileHead,
  AdminMobileSecLabel,
  AdminMobileTag,
} from "@/components/molecules/admin-mobile-primitives";
import { AdminStatus } from "@/components/molecules/admin-badges";
import { MiniInvite, type MiniInvitePalette } from "@/components/molecules/mini-invite";
import { updateTemplate } from "@/server/actions/template";
import type { AdminTemplateRow } from "@/server/queries/admin";
import { cn } from "@/lib/utils";

// Admin mobile · Template — library overview with top performers strip and
// the full 2-col template grid. Ported 1:1 from the design's M_Templates.
// Local-only view state: search, category chips, sort, select (detail sheet),
// and CSV export. Featured/publish toggles persist via `updateTemplate` and
// then `router.refresh()` to pull the fresh server-rendered rows.

// "Semua" + the real categories present in the data + "Draft". The category
// column is free text in the DB, so chips are derived from the actual rows.
type CategoryFilter = string;

type SortMode = "default" | "uses" | "name" | "new";

const SORT_LABELS: Record<SortMode, string> = {
  default: "Urutkan",
  uses: "Paling banyak",
  name: "A–Z",
  new: "Terbaru",
};

const SORT_CYCLE: Record<SortMode, SortMode> = {
  default: "uses",
  uses: "name",
  name: "new",
  new: "default",
};

// Controlled clone of AdminMobileSearch — the shared primitive is uncontrolled
// (no value/onChange) and other screens use it as-is, so this stays local.
function TemplatesSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-[9px] bg-paper border border-line rounded-full px-[15px] py-[10px]">
      <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="var(--color-faint)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-5-5" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cari nama atau kategori template…"
        className="flex-1 border-none bg-transparent outline-none font-body text-[13px] text-charcoal placeholder:text-faint"
      />
    </div>
  );
}

// Text-link styled button for the section-label action slot (visual twin of
// AdminMobileLink, but a real <button> for keyboard semantics).
function SecActionBtn({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "bg-transparent border-0 p-0 cursor-pointer font-body text-[11px] text-burgundy font-bold tracking-[0.06em] uppercase",
        className,
      )}
      {...props}
    />
  );
}

function buildCsv(rows: AdminTemplateRow[]): string {
  const esc = (v: string | number | boolean): string => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ["id", "name", "category", "uses", "status", "featured", "new"].join(",");
  const lines = rows.map((t) =>
    [t.id, t.name, t.category, t.uses, t.status, t.featured, t.new].map(esc).join(","),
  );
  return [header, ...lines].join("\n");
}

type AdminTemplatesMobileProps = {
  templates: AdminTemplateRow[];
};

export function AdminTemplatesMobile({ templates }: AdminTemplatesMobileProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CategoryFilter>("Semua");
  const [sort, setSort] = useState<SortMode>("default");
  // Slug (`id`) of the row whose featured/status flip is in flight — disables
  // its controls and gates concurrent toggles (mirrors the desktop pattern).
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [, startToggle] = useTransition();

  const q = query.trim().toLowerCase();

  const publishedCount = templates.filter((t) => t.status === "published").length;
  const totalUses = templates.reduce((s, t) => s + t.uses, 0);

  // Filter chips derived from the real rows: "Semua" + each distinct category
  // present (in first-seen order) + "Draft".
  const filterChips = useMemo<CategoryFilter[]>(() => {
    const categories: string[] = [];
    for (const t of templates) {
      if (t.category && !categories.includes(t.category)) {
        categories.push(t.category);
      }
    }
    return ["Semua", ...categories, "Draft"];
  }, [templates]);

  // Top performers: ranked featured-first then by uses, but displayed in
  // source order so the at-rest render matches the original exactly. With a
  // search query the strip shows matches (by uses desc) instead of the top 3.
  const stripTemplates = useMemo(() => {
    if (q !== "") {
      return templates
        .filter((t) => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
        .sort((a, b) => b.uses - a.uses);
    }
    const ranked = [...templates]
      .sort((a, b) => Number(b.featured) - Number(a.featured) || b.uses - a.uses)
      .slice(0, 3);
    const ids = new Set(ranked.map((t) => t.id));
    return templates.filter((t) => ids.has(t.id));
  }, [templates, q]);

  const gridTemplates = useMemo(() => {
    const rows = templates.filter((t) => {
      const matchesQuery = q === "" || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      const matchesFilter =
        filter === "Semua" || (filter === "Draft" ? t.status === "draft" : t.category === filter);
      return matchesQuery && matchesFilter;
    });
    if (sort === "uses") return [...rows].sort((a, b) => b.uses - a.uses);
    if (sort === "name") return [...rows].sort((a, b) => a.name.localeCompare(b.name, "id"));
    if (sort === "new") return [...rows].sort((a, b) => Number(b.new) - Number(a.new));
    return rows;
  }, [templates, q, filter, sort]);

  const selected = selectedId !== null ? (templates.find((t) => t.id === selectedId) ?? null) : null;

  const toggleSelected = (id: string) => setSelectedId((cur) => (cur === id ? null : id));

  const cardKeyHandler = (id: string) => (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleSelected(id);
    }
  };

  // Persist the featured flip via the action, then refresh to pull the fresh
  // server-rendered rows. On failure leave the data unchanged.
  const toggleFeatured = (t: AdminTemplateRow) => {
    if (togglingId !== null) return;
    setTogglingId(t.id);
    startToggle(async () => {
      const res = await updateTemplate({ id: t.templateId, featured: !t.featured });
      setTogglingId(null);
      if (res.ok) {
        router.refresh();
      }
    });
  };

  // Persist the publish/draft flip via the action, then refresh. On failure
  // leave the data unchanged.
  const togglePublish = (t: AdminTemplateRow) => {
    if (togglingId !== null) return;
    setTogglingId(t.id);
    const next = t.status === "published" ? "draft" : "published";
    startToggle(async () => {
      const res = await updateTemplate({ id: t.templateId, status: next });
      setTogglingId(null);
      if (res.ok) {
        router.refresh();
      }
    });
  };

  const cycleSort = () => setSort((cur) => SORT_CYCLE[cur]);

  const exportCsv = () => {
    const blob = new Blob([buildCsv(templates)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "maritare-templates.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminMobileShell active="templates">
      <AdminMobileHead
        eyebrow={`${templates.length} template · ${publishedCount} published`}
        title="Library template"
        sub={`${totalUses} undangan memakai`}
      />

      {/* search */}
      <div className="px-[18px] pt-3">
        <TemplatesSearch value={query} onChange={setQuery} />
      </div>

      {/* top performers — horizontal scroll */}
      <AdminMobileSecLabel>Paling banyak dipakai</AdminMobileSecLabel>
      <AdminMobileHScroll className="px-[18px] pb-[2px]">
        {stripTemplates.map((t, i) => (
          <AdminMobileCard
            key={t.id}
            role="button"
            tabIndex={0}
            aria-pressed={selectedId === t.id}
            onClick={() => toggleSelected(t.id)}
            onKeyDown={cardKeyHandler(t.id)}
            className={cn(
              "flex-[0_0_auto] w-[200px] p-3 flex gap-3 items-center cursor-pointer",
              selectedId === t.id && "ring-2 ring-burgundy",
            )}
          >
            <div className="w-[56px] h-[76px] shrink-0">
              {t.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- presigned R2 URLs are short-lived and not known at build time; next/image is not configured for arbitrary R2 hosts
                <img
                  src={t.coverUrl}
                  alt={`Cover ${t.name}`}
                  className="w-full h-full object-cover rounded-[4px]"
                />
              ) : (
                <MiniInvite palette={t.id as MiniInvitePalette} width={56} scale={0.28} />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[8.5px] text-terracotta tracking-[0.18em] uppercase font-bold">
                № {String(i + 1).padStart(2, "0")}
              </div>
              <div className="font-display italic text-[16px] text-charcoal mt-[2px] leading-[1.05]">{t.name}</div>
              <div className="flex items-baseline gap-1 mt-[6px]">
                <span className="font-display font-extrabold text-[20px] text-burgundy leading-none">{t.uses}</span>
                <span className="text-[9px] text-muted-ink tracking-[0.12em] uppercase font-semibold">aktif</span>
              </div>
            </div>
          </AdminMobileCard>
        ))}
        {stripTemplates.length === 0 && (
          <div className="flex-[0_0_auto] font-body text-[12px] text-muted-ink py-4">
            Nggak ada template yang cocok.
          </div>
        )}
      </AdminMobileHScroll>

      {/* grid 2-col */}
      <AdminMobileSecLabel
        action={
          <div className="flex items-center gap-3">
            <SecActionBtn onClick={cycleSort}>{SORT_LABELS[sort]}</SecActionBtn>
            <SecActionBtn onClick={exportCsv}>Export CSV</SecActionBtn>
          </div>
        }
      >
        Semua template · {gridTemplates.length}
      </AdminMobileSecLabel>
      <AdminMobileHScroll className="px-[18px] pb-3">
        {filterChips.map((c) => (
          <AdminMobileChip key={c} on={filter === c} onClick={() => setFilter(c)}>
            {c}
          </AdminMobileChip>
        ))}
      </AdminMobileHScroll>
      <div className="px-[18px] grid grid-cols-2 gap-3">
        {gridTemplates.map((t) => (
          <AdminMobileCard
            key={t.id}
            role="button"
            tabIndex={0}
            aria-pressed={selectedId === t.id}
            onClick={() => toggleSelected(t.id)}
            onKeyDown={cardKeyHandler(t.id)}
            className={cn(
              "p-[10px] relative overflow-hidden cursor-pointer",
              selectedId === t.id && "ring-2 ring-burgundy",
            )}
          >
            <div className="absolute top-2 left-2 z-[3] flex gap-1">
              {t.status === "draft" && <AdminMobileTag tone="peach">Draft</AdminMobileTag>}
              {t.featured && (
                <button
                  type="button"
                  aria-label="Hapus dari featured"
                  disabled={togglingId !== null}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFeatured(t);
                  }}
                  className="bg-transparent border-0 p-0 cursor-pointer font-body disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <AdminMobileTag tone="terra">★</AdminMobileTag>
                </button>
              )}
              {t.new && <AdminMobileTag tone="dark">Baru</AdminMobileTag>}
            </div>
            <div className="bg-cream rounded-[9px] pt-4 px-[6px] pb-3 mb-[10px] flex justify-center">
              {t.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- presigned R2 URLs are short-lived and not known at build time; next/image is not configured for arbitrary R2 hosts
                <img
                  src={t.coverUrl}
                  alt={`Cover ${t.name}`}
                  className="w-[110px] aspect-[1/1.35] object-cover rounded-[5px]"
                />
              ) : (
                <MiniInvite palette={t.id as MiniInvitePalette} width={110} scale={0.56} />
              )}
            </div>
            <div className="flex items-start justify-between gap-[6px]">
              <div className="min-w-0">
                <div className="font-display italic text-[15px] text-charcoal leading-[1.05]">{t.name}</div>
                <div className="text-[8.5px] text-muted-ink tracking-[0.16em] uppercase font-semibold mt-[3px]">
                  {t.category}
                </div>
              </div>
              <div className="flex gap-[2px] pt-[3px] shrink-0">
                {t.palette.map((c, j) => (
                  <span
                    key={j}
                    className="w-[9px] h-[9px] rounded-full border border-black/[0.08]"
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between mt-[10px] pt-[9px] border-t border-line">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-extrabold text-[16px] text-charcoal">{t.uses}</span>
                <span className="text-[8.5px] text-muted-ink tracking-[0.1em] uppercase">dipakai</span>
              </div>
              <button
                type="button"
                aria-label={t.status === "draft" ? "Publish template ini" : "Jadikan draft"}
                disabled={togglingId !== null}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePublish(t);
                }}
                className="bg-transparent border-0 p-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <AdminStatus status={t.status} />
              </button>
            </div>
          </AdminMobileCard>
        ))}
        {gridTemplates.length === 0 && (
          <div className="col-span-2 text-center font-body text-[12px] text-muted-ink py-8">
            {templates.length === 0
              ? "Belum ada template."
              : "Nggak ada template yang cocok. Coba ubah kata kunci atau filternya, ya."}
          </div>
        )}
      </div>

      {/* detail sheet — tap a card to open, tap backdrop / card again to close */}
      {selected && (
        <>
          <div className="absolute inset-0 z-[45] bg-charcoal/35" onClick={() => setSelectedId(null)} aria-hidden />
          <div
            role="dialog"
            aria-label={`Detail template ${selected.name}`}
            className="absolute inset-x-0 bottom-0 z-50 bg-paper border-t border-line rounded-t-[20px] px-5 pt-3 pb-7"
          >
            <div className="w-9 h-1 rounded-full bg-line mx-auto mb-4" />
            <div className="flex gap-4 items-start">
              <div className="shrink-0">
                {selected.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- presigned R2 URLs are short-lived and not known at build time; next/image is not configured for arbitrary R2 hosts
                  <img
                    src={selected.coverUrl}
                    alt={`Cover ${selected.name}`}
                    className="w-[72px] aspect-[1/1.35] object-cover rounded-[5px]"
                  />
                ) : (
                  <MiniInvite palette={selected.id as MiniInvitePalette} width={72} scale={0.36} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] text-terracotta tracking-[0.18em] uppercase font-bold">
                  {selected.category} · {selected.style}
                </div>
                <div className="font-display italic text-[21px] text-charcoal mt-[2px] leading-[1.05]">
                  {selected.name}
                </div>
                <div className="flex items-baseline gap-1 mt-[6px]">
                  <span className="font-display font-extrabold text-[20px] text-burgundy leading-none">
                    {selected.uses}
                  </span>
                  <span className="text-[9px] text-muted-ink tracking-[0.12em] uppercase font-semibold">
                    undangan memakai
                  </span>
                </div>
                <div className="flex items-center gap-[6px] mt-[10px] flex-wrap">
                  <AdminStatus status={selected.status} />
                  {selected.featured && <AdminMobileTag tone="terra">★ Featured</AdminMobileTag>}
                  {selected.new && <AdminMobileTag tone="dark">Baru</AdminMobileTag>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-[10px] mt-4 pt-[14px] border-t border-line">
              {selected.palette.map((c, j) => (
                <span key={j} className="inline-flex items-center gap-[5px]">
                  <span className="w-[16px] h-[16px] rounded-full border border-black/[0.08]" style={{ background: c }} />
                  <span className="font-body text-[9.5px] text-muted-ink uppercase tracking-[0.08em]">{c}</span>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <AdminMobileBtnMini
                disabled={togglingId !== null}
                onClick={() => toggleFeatured(selected)}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selected.featured ? "★ Hapus featured" : "★ Jadikan featured"}
              </AdminMobileBtnMini>
              <AdminMobileBtnMini
                sage={selected.status === "draft"}
                disabled={togglingId !== null}
                onClick={() => togglePublish(selected)}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selected.status === "draft" ? "Publish" : "Jadikan draft"}
              </AdminMobileBtnMini>
            </div>
          </div>
        </>
      )}
    </AdminMobileShell>
  );
}

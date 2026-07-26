"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/templates/admin-shell";
import { AdminTopBar } from "@/components/organisms/admin-topbar";
import { AdminStatus } from "@/components/molecules/admin-badges";
import { MiniInvite, type MiniInvitePalette } from "@/components/molecules/mini-invite";
import { AdminTemplateEdit } from "@/components/molecules/admin-template-edit";
import { Icon } from "@/components/atoms/icon";
import { Button } from "@/components/atoms/button";
import { CircleButton } from "@/components/atoms/circle-button";
import { updateTemplate } from "@/server/actions/template";
import type { AdminTemplateRow } from "@/server/queries/admin";
import { cn } from "@/lib/utils";

const FILTERS = ["Semua", "Published", "Draft", "Featured", "Exclusive"] as const;
type FilterKey = (typeof FILTERS)[number];

const SORTS = ["Terpopuler", "Terbaru", "A–Z"] as const;
type SortKey = (typeof SORTS)[number];

type AdminTemplatesScreenProps = {
  templates: AdminTemplateRow[];
};

// Admin · Template — library overview: hot performers strip + full template grid.
// Ports the design's Admin_Templates screen 1:1.
export function AdminTemplatesScreen({ templates }: AdminTemplatesScreenProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("Semua");
  const [sort, setSort] = useState<SortKey>("Terpopuler");
  // Slug (`id`) of the row whose edit modal is open, or null.
  const [editingId, setEditingId] = useState<string | null>(null);
  // Slug of the row whose status is mid-toggle (drives its pending state).
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [, startToggle] = useTransition();

  const editingTemplate =
    editingId !== null ? (templates.find((t) => t.id === editingId) ?? null) : null;

  // Quick publish/draft flip from the card — persists via the action, then
  // refreshes to pull the fresh server-rendered grid.
  function toggleStatus(t: AdminTemplateRow) {
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
  }

  // Summary counts derived from the real array (drives the top-bar eyebrow).
  const publishedCount = templates.filter((t) => t.status === "published").length;
  const draftCount = templates.length - publishedCount;
  const totalUses = templates.reduce((sum, t) => sum + t.uses, 0);
  const exclusiveCount = templates.filter((t) => t.allowedUsers.length > 0).length;
  const eyebrow =
    `${templates.length} template · ${publishedCount} published · ${draftCount} draft` +
    (exclusiveCount > 0 ? ` · ${exclusiveCount} exclusive` : "") +
    ` · ${totalUses} undangan total memakai`;

  // "Most used" strip: real array is featured/new/name-ordered, so rank the top
  // three by usage explicitly for the performers strip.
  const topUsed = useMemo(
    () => [...templates].sort((a, b) => b.uses - a.uses).slice(0, 3),
    [templates],
  );

  const visibleTemplates = useMemo(() => {
    const indexed = templates.map((t, index) => ({ t, index }));

    const filtered = indexed.filter(({ t }) => {
      if (filter === "Published") return t.status === "published";
      if (filter === "Draft") return t.status === "draft";
      if (filter === "Featured") return t.featured === true;
      if (filter === "Exclusive") return t.allowedUsers.length > 0;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sort === "Terbaru") return Number(b.t.new) - Number(a.t.new) || a.index - b.index;
      if (sort === "A–Z") return a.t.name.localeCompare(b.t.name, "id");
      // "Terpopuler": rank by real usage count, highest first.
      return b.t.uses - a.t.uses;
    });

    return sorted.map(({ t }) => t);
  }, [templates, filter, sort]);

  return (
    <AdminShell active="templates">
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminTopBar
          crumbs={["Admin", "Template"]}
          title="Library template"
          eyebrow={eyebrow}
          actions={
            <>
              <div className="flex gap-1 bg-paper border border-line rounded-full p-[3px]">
                {FILTERS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilter(t)}
                    className={cn(
                      "px-3 py-[6px] rounded-full text-[10px] tracking-[0.16em] uppercase font-bold cursor-pointer",
                      filter === t ? "text-cream bg-forest-deep" : "text-muted-ink bg-transparent",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {/* Template upload pipeline isn't built yet — honestly disabled. */}
              <Button
                size="sm"
                disabled
                title="Segera hadir"
                className="bg-forest-deep text-cream hover:bg-forest-deep opacity-50 cursor-not-allowed"
              >
                <Icon name="plus" size={12} />
                Upload template baru
              </Button>
            </>
          }
        />

        {/* THE scroller — shell is viewport-locked, only this area scrolls. */}
        <div className="flex-1 overflow-y-auto px-9 py-6">
          {/* Hot performers strip */}
          <div className="grid grid-cols-3 gap-[14px] mb-[22px]">
            {topUsed.map((t, i) => (
              <div
                key={t.id}
                className="bg-paper border border-line rounded-[14px] py-[14px] px-4 flex items-center gap-[14px]"
              >
                <div className="w-16 h-[86px] shrink-0">
                  <MiniInvite palette={t.id as MiniInvitePalette} width={64} scale={0.32} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[9px] text-terracotta tracking-[0.22em] uppercase font-bold">
                      № {String(i + 1).padStart(2, "0")} most used
                    </span>
                  </div>
                  <div className="font-display italic text-[18px] text-charcoal mt-[2px]">{t.name}</div>
                  <div className="flex items-baseline gap-[6px] mt-[6px]">
                    <span className="font-display font-extrabold text-[22px] text-burgundy leading-none">
                      {t.uses}
                    </span>
                    <span className="text-[10px] text-muted-ink tracking-[0.16em] uppercase font-semibold">
                      undangan aktif
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section title */}
          <div className="flex items-center justify-between mb-[14px]">
            <div className="font-display italic font-semibold text-[20px] text-charcoal">
              Semua template <span className="text-faint">· {visibleTemplates.length}</span>
            </div>
            <div className="flex items-center gap-[10px]">
              <span className="text-[11px] text-muted-ink">Urut:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="py-[5px] px-3 rounded-md border border-line bg-paper font-body text-[11px] font-semibold"
              >
                {SORTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-4 gap-[14px]">
            {visibleTemplates.map((t) => (
              <div
                key={t.id}
                className="bg-paper rounded-[14px] border border-line p-3 relative overflow-hidden"
              >
                {/* Status badge */}
                <div className="absolute top-[10px] left-[10px] z-[3] flex gap-1">
                  {t.status === "draft" && (
                    <span className="text-[9px] py-[3px] px-2 rounded bg-peach text-[#5a2a18] font-bold tracking-[0.16em] uppercase">
                      Draft
                    </span>
                  )}
                  {t.featured && (
                    <span className="text-[9px] py-[3px] px-2 rounded bg-terracotta text-white font-bold tracking-[0.16em] uppercase">
                      ★ Featured
                    </span>
                  )}
                  {t.new && (
                    <span className="text-[9px] py-[3px] px-2 rounded bg-charcoal text-peach font-bold tracking-[0.16em] uppercase">
                      Baru
                    </span>
                  )}
                  {t.allowedUsers.length > 0 && (
                    <span
                      title={t.allowedUsers.map((u) => u.name || u.email).join("\n")}
                      className="text-[9px] py-[3px] px-2 rounded bg-burgundy text-cream font-bold tracking-[0.16em] uppercase cursor-help"
                    >
                      ◆ Exclusive · {t.allowedUsers.length}
                    </span>
                  )}
                </div>
                {/* Quick actions */}
                <div className="absolute top-[10px] right-[10px] z-[3] flex gap-[3px]">
                  <CircleButton
                    size={24}
                    className="bg-cream"
                    title="Edit"
                    onClick={() => setEditingId(t.id)}
                  >
                    <Icon name="edit" size={10} />
                  </CircleButton>
                  <CircleButton
                    size={24}
                    className="bg-cream"
                    title={t.status === "published" ? "Jadikan draft" : "Publish"}
                    disabled={togglingId !== null}
                    onClick={() => toggleStatus(t)}
                  >
                    <Icon name={t.status === "published" ? "eye" : "check"} size={10} />
                  </CircleButton>
                </div>

                <div className="bg-cream rounded-[10px] pt-5 px-2 pb-4 mb-3 flex justify-center">
                  {t.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- presigned R2 URLs are short-lived and not known at build time; next/image is not configured for arbitrary R2 hosts
                    <img
                      src={t.coverUrl}
                      alt={`Cover ${t.name}`}
                      className="w-[150px] aspect-[1/1.35] object-cover rounded-[6px] shadow-[0_12px_28px_-14px_rgba(46,58,41,0.25)]"
                    />
                  ) : (
                    <MiniInvite palette={t.id as MiniInvitePalette} width={150} scale={0.74} />
                  )}
                </div>

                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-display italic text-[17px] text-charcoal leading-[1.1]">{t.name}</div>
                    <div className="text-[10px] text-muted-ink tracking-[0.18em] uppercase font-semibold mt-1">
                      {t.category}
                    </div>
                  </div>
                  <div className="flex gap-[2px] pt-[2px]">
                    {t.palette.map((c, j) => (
                      <span
                        key={j}
                        style={{ background: c }}
                        className="w-[10px] h-[10px] rounded-full border border-black/[0.08]"
                      />
                    ))}
                  </div>
                </div>

                {/* Usage stats */}
                <div className="py-2 px-[10px] bg-cream rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[9px] text-muted-ink tracking-[0.18em] uppercase font-semibold">
                      Dipakai
                    </div>
                    <div className="font-display font-extrabold text-[18px] leading-none text-charcoal">
                      {t.uses}
                    </div>
                  </div>
                  <button
                    type="button"
                    title={t.status === "published" ? "Jadikan draft" : "Publish"}
                    aria-label={t.status === "published" ? "Jadikan draft" : "Publish template ini"}
                    disabled={togglingId !== null}
                    onClick={() => toggleStatus(t)}
                    className="bg-transparent border-0 p-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <AdminStatus status={t.status} />
                  </button>
                </div>
              </div>
            ))}
            {visibleTemplates.length === 0 && (
              <div className="col-span-4 text-center font-body text-[13px] text-muted-ink py-16">
                {templates.length === 0
                  ? "Belum ada template."
                  : "Nggak ada template yang cocok dengan filter ini."}
              </div>
            )}
          </div>
        </div>
      </main>

      {editingTemplate && (
        <AdminTemplateEdit
          template={editingTemplate}
          open={editingId !== null}
          onClose={() => setEditingId(null)}
        />
      )}
    </AdminShell>
  );
}

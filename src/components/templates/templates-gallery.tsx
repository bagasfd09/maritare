import { cn } from "@/lib/utils";
import { DashboardShell } from "@/components/templates/dashboard-shell";
import { DashboardTopBar } from "@/components/organisms/dashboard-topbar";
import { Display, Em } from "@/components/atoms/typography";
import { SectionNumber } from "@/components/atoms/section-number";
import { TemplateFeatured } from "@/components/molecules/template-featured";
import { TemplateCard, type Template } from "@/components/molecules/template-card";
import { type MiniInvitePalette } from "@/components/molecules/mini-invite";
import { isRenderableTemplateSlug } from "@/components/invitation/slugs";
import type { CatalogTemplate, TemplatesData } from "@/server/queries/dashboard";

// The fixed set of palette keys MiniInvite knows. A template slug that isn't a
// known palette (e.g. "scarlet") falls back to "garden" so it never crashes.
const MINI_INVITE_PALETTES = [
  "garden", "oxblood", "blush", "moss", "ivory", "midnight", "terracotta", "sage",
] as const;

function isMiniInvitePalette(slug: string): slug is MiniInvitePalette {
  return (MINI_INVITE_PALETTES as readonly string[]).includes(slug);
}

// A gallery row carries the real catalog slug (for chooseTemplate / preview)
// plus its renderable + preview metadata, alongside the display `Template` and
// the raw catalog row (for the featured hero).
type GalleryRow = {
  slug: string;
  renderable: boolean;
  previewHref: string | null;
  // Cover thumbnail: admin-uploaded coverUrl if present, else the static
  // renderable thumb (see public/invitation/thumbs), else null (MiniInvite).
  thumbSrc: string | null;
  template: Template;
  source: CatalogTemplate;
};

// Renderable templates that have a generated cover thumbnail in
// public/invitation/thumbs/<slug>.webp.
const TEMPLATE_THUMBS: Record<string, string> = {
  folk: "/invitation/thumbs/folk.webp",
};

const CATEGORIES = ["Semua", "Editorial", "Romantic", "Rustic", "Minimal"];

// The categories TemplateCard's strict union accepts; anything else falls back
// to "Editorial" so an unexpected DB value never breaks the type.
const CARD_CATEGORIES = ["Editorial", "Romantic", "Rustic", "Minimal"] as const;
type CardCategory = (typeof CARD_CATEGORIES)[number];

function toCardCategory(value: string | null): CardCategory {
  return CARD_CATEGORIES.includes(value as CardCategory) ? (value as CardCategory) : "Editorial";
}

// Map a template slug to a MiniInvite palette, falling back to "garden" for any
// slug that isn't a known palette key (so a renderable-but-unstyled slug like
// "scarlet" renders the default palette instead of crashing).
function toPalette(slug: string): MiniInvitePalette {
  return isMiniInvitePalette(slug) ? slug : "garden";
}

function toRows(data: TemplatesData): GalleryRow[] {
  return data.templates.map((t) => {
    const [c0, c1, c2] = t.palette;
    const renderable = isRenderableTemplateSlug(t.slug);
    // Catalog preview is GLOBAL — a neutral demo render of the template, not the
    // user's own wedding/gallery (that's what the editor preview is for).
    const previewHref = renderable ? `/inv/preview/${t.slug}` : null;
    return {
      slug: t.slug,
      renderable,
      previewHref,
      // An admin-uploaded cover (presigned URL) wins for ANY template, even
      // non-renderable ones; the static thumb stays the fallback for renderable.
      thumbSrc: t.coverUrl ?? (renderable ? (TEMPLATE_THUMBS[t.slug] ?? null) : null),
      template: {
        id: toPalette(t.slug),
        name: t.name,
        style: t.style ?? "",
        // MiniInvite swatches always read exactly three colors; pad if the DB
        // palette is shorter so the tuple type is satisfied.
        palette: [c0 ?? "#000000", c1 ?? "#000000", c2 ?? "#000000"],
        category: toCardCategory(t.category),
        featured: t.featured,
        isNew: t.isNew,
        current: t.slug === data.currentTemplateSlug,
      },
      source: t,
    };
  });
}

// Screen 04 · Galeri Template. `data` is the global published catalog
// (folk + scarlet) plus the wedding's current selection.
export function TemplatesGallery({ data }: { data: TemplatesData }) {
  const rows = toRows(data);

  // The featured hero shows the wedding's current template, else the catalog's
  // featured pick, else the first row. The grid excludes it (no duplicate).
  const featured =
    rows.find((r) => r.template.current) ??
    rows.find((r) => r.source.featured) ??
    rows[0];
  const gridRows = featured ? rows.filter((r) => r.slug !== featured.slug) : rows;

  return (
    <DashboardShell active="templates" chrome={data.chrome}>
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          num="§ III"
          eyebrow="Galeri Template"
          title={<>Pilih <Em className="text-burgundy">stationery</Em> kamu.</>}
          actions={
            <div className="flex gap-1 bg-paper border border-line rounded-full p-[3px]">
              {CATEGORIES.map((c, i) => (
                <a
                  key={c}
                  href="#"
                  className={cn(
                    "px-3 py-[6px] rounded-full text-[10px] tracking-[0.16em] uppercase font-bold no-underline",
                    i === 0 ? "text-cream bg-charcoal" : "text-muted-ink",
                  )}
                >
                  {c}
                </a>
              ))}
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto pt-[26px] px-10 pb-8">
          {/* Featured: current (or recommended) template */}
          {featured && (
            <TemplateFeatured
              slug={featured.slug}
              name={featured.source.name}
              style={featured.source.style}
              palette={featured.source.palette}
              previewHref={featured.previewHref}
              thumbSrc={featured.thumbSrc}
              current={featured.template.current ?? false}
            />
          )}

          {/* Section title */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <SectionNumber className="text-[12px] mb-1">iv. Koleksi lainnya</SectionNumber>
              <Display as="div" className="text-[26px]">
                {gridRows.length} template <Em className="text-faint">siap dicoba.</Em>
              </Display>
            </div>
            <div className="flex items-center gap-[10px]">
              <span className="text-muted-ink font-display italic text-[14px]">
                Ganti kapan saja — gratis selama belum publish
              </span>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-4 gap-4">
            {gridRows.map((r, i) => (
              <TemplateCard
                key={r.slug}
                template={r.template}
                number={i + 2}
                slug={r.slug}
                renderable={r.renderable}
                previewHref={r.previewHref}
                thumbSrc={r.thumbSrc}
              />
            ))}
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}

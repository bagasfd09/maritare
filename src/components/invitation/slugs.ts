// Server-safe list of template slugs that have a real renderable React
// implementation. Kept free of component imports so server queries/pages can
// import it without pulling client component trees.

export const RENDERABLE_TEMPLATE_SLUGS = [
  "folk",
  "scarlet",
  "ivory",
  "sienna",
  "plum",
  "onyx",
] as const;

export type RenderableTemplateSlug = (typeof RENDERABLE_TEMPLATE_SLUGS)[number];

export function isRenderableTemplateSlug(slug: string): slug is RenderableTemplateSlug {
  return (RENDERABLE_TEMPLATE_SLUGS as readonly string[]).includes(slug);
}

// Renderable templates that ship a generated cover thumbnail at
// public/invitation/thumbs/<slug>.webp.
const TEMPLATE_THUMBS: Record<string, string> = {
  folk: "/invitation/thumbs/folk.webp",
  ivory: "/invitation/thumbs/ivory.webp",
  onyx: "/invitation/thumbs/onyx.webp",
};

// Cover thumbnail for a catalog template, resolved identically on web + mobile:
// an admin-uploaded coverUrl wins for ANY template (even non-renderable); else
// the static local thumb for renderable templates; else null (callers fall back
// to the abstract MiniInvite).
export function templateThumbSrc(slug: string, coverUrl: string | null): string | null {
  if (coverUrl) return coverUrl;
  return isRenderableTemplateSlug(slug) ? TEMPLATE_THUMBS[slug] ?? null : null;
}

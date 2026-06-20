// Server-safe list of template slugs that have a real renderable React
// implementation. Kept free of component imports so server queries/pages can
// import it without pulling client component trees.

export const RENDERABLE_TEMPLATE_SLUGS = ["folk", "scarlet"] as const;

export type RenderableTemplateSlug = (typeof RENDERABLE_TEMPLATE_SLUGS)[number];

export function isRenderableTemplateSlug(slug: string): slug is RenderableTemplateSlug {
  return (RENDERABLE_TEMPLATE_SLUGS as readonly string[]).includes(slug);
}

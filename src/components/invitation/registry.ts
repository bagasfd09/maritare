// Template slug → renderable component registry.
//
// Only Folk + Scarlet are offered now (Flora/Crimson kept dormant in the tree
// but removed from the catalog/registry). `getInvitationTemplate` falls back to
// Folk for unknown/null slugs so a wedding pointing at a retired template still
// renders (never 404s).

import type { ComponentType } from "react";

import { FolkTemplate } from "@/components/invitation/folk/folk-template";
import { ScarletTemplate } from "@/components/invitation/scarlet/scarlet-template";
import type { InvitationTemplateProps } from "@/components/invitation/types";

const REGISTRY: Record<string, ComponentType<InvitationTemplateProps>> = {
  folk: FolkTemplate,
  scarlet: ScarletTemplate,
};

export function getInvitationTemplate(
  slug: string | null,
): ComponentType<InvitationTemplateProps> {
  return (slug && REGISTRY[slug]) || FolkTemplate;
}

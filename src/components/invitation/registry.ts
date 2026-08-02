// Template slug → renderable component registry.
//
// Only Folk + Scarlet are offered now (Flora/Crimson kept dormant in the tree
// but removed from the catalog/registry). `getInvitationTemplate` falls back to
// Folk for unknown/null slugs so a wedding pointing at a retired template still
// renders (never 404s).

import type { ComponentType } from "react";

import { FolkTemplate } from "@/components/invitation/folk/folk-template";
import { IvoryTemplate } from "@/components/invitation/ivory/ivory-template";
import { OnyxTemplate } from "@/components/invitation/onyx/onyx-template";
import { PlumTemplate } from "@/components/invitation/plum/plum-template";
import { ScarletTemplate } from "@/components/invitation/scarlet/scarlet-template";
import { SiennaTemplate } from "@/components/invitation/sienna/sienna-template";
import type { InvitationTemplateProps } from "@/components/invitation/types";

const REGISTRY: Record<string, ComponentType<InvitationTemplateProps>> = {
  folk: FolkTemplate,
  ivory: IvoryTemplate,
  scarlet: ScarletTemplate,
  sienna: SiennaTemplate,
  plum: PlumTemplate,
  onyx: OnyxTemplate,
};

export function getInvitationTemplate(
  slug: string | null,
): ComponentType<InvitationTemplateProps> {
  return (slug && REGISTRY[slug]) || FolkTemplate;
}

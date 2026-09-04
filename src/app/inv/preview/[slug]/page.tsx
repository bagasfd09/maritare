import { notFound } from "next/navigation";

import { getInvitationTemplate } from "@/components/invitation/registry";
import { isRenderableTemplateSlug } from "@/components/invitation/slugs";
import { demoInvitation } from "@/lib/invitation/demo";

// Global TEMPLATE-CATALOG preview: renders a template with neutral demo data
// (never the signed-in user's wedding/gallery). Lives under /inv so it inherits
// the invitation layout's fonts. The editor preview is what shows real user data.
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export default async function TemplatePreviewPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isRenderableTemplateSlug(slug)) {
    notFound();
  }
  const Template = getInvitationTemplate(slug);
  // editorPreview = forms disabled + no audio (a static showcase render).
  // Placeholder guest — the real one rides on ?to=/?g= of a sent link, which a
  // catalog preview has no equivalent of; without it the cover's "Kepada Yth."
  // block never shows here.
  // eslint-disable-next-line react-hooks/static-components -- registry returns a module-level component, never a new one
  return <Template data={demoInvitation(slug)} mode="editorPreview" guestName="Nama Tamu" />;
}

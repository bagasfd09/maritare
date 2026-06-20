import { redirect } from "next/navigation";

import { TemplatesGallery } from "@/components/templates/templates-gallery";
import { TemplatesMobile } from "@/components/templates/templates-mobile";
import { getTemplatesData } from "@/server/queries/dashboard";

export default async function Page() {
  const data = await getTemplatesData();
  if (!data) {
    redirect("/dashboard/onboarding");
  }
  return (
    <>
      <div className="hidden lg:contents"><TemplatesGallery data={data} /></div>
      <TemplatesMobile data={data} />
    </>
  );
}

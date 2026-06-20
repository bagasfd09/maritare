import { AdminTemplatesScreen } from "@/components/templates/admin-templates";
import { AdminTemplatesMobile } from "@/components/templates/admin-templates-mobile";
import { getAdminTemplates } from "@/server/queries/admin";

export default async function Page() {
  const templates = await getAdminTemplates();
  return (
    <>
      <div className="hidden lg:contents"><AdminTemplatesScreen templates={templates} /></div>
      <AdminTemplatesMobile templates={templates} />
    </>
  );
}

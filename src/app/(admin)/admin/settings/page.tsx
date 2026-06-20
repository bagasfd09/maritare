import { redirect } from "next/navigation";

import { AdminSettings } from "@/components/templates/admin-settings";
import { getAppSettings } from "@/server/queries/app-settings";

export default async function Page() {
  const data = await getAppSettings();
  if (!data) {
    redirect("/login");
  }
  return <AdminSettings data={data} />;
}

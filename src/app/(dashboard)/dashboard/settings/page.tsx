import { redirect } from "next/navigation";

import { Settings } from "@/components/templates/settings";
import { SettingsMobile } from "@/components/templates/settings-mobile";
import { getSettingsData } from "@/server/queries/dashboard";

export default async function Page() {
  const data = await getSettingsData();
  if (!data) {
    redirect("/dashboard/onboarding");
  }
  return (
    <>
      <div className="hidden lg:contents"><Settings data={data} /></div>
      <SettingsMobile data={data} />
    </>
  );
}

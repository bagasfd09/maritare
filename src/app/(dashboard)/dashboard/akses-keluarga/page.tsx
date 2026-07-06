import { redirect } from "next/navigation";

import { AksesKeluarga } from "@/components/templates/akses-keluarga";
import { getShareAccessData } from "@/server/queries/share";

export default async function Page() {
  const data = await getShareAccessData();
  if (!data) {
    redirect("/dashboard/onboarding");
  }
  return <AksesKeluarga data={data} />;
}

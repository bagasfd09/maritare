import { redirect } from "next/navigation";

import { AksesKeluarga } from "@/components/templates/akses-keluarga";
import { AksesKeluargaMobile } from "@/components/templates/akses-keluarga-mobile";
import { getShareAccessData } from "@/server/queries/share";

export default async function Page() {
  const data = await getShareAccessData();
  if (!data) {
    redirect("/dashboard/onboarding");
  }
  return (
    <>
      <div className="hidden lg:contents">
        <AksesKeluarga data={data} />
      </div>
      <AksesKeluargaMobile data={data} />
    </>
  );
}

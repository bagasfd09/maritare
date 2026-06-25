import { redirect } from "next/navigation";

import { WaBlast } from "@/components/templates/wa-blast";
import { WaBlastMobile } from "@/components/templates/wa-blast-mobile";
import { getWaBlastData } from "@/server/queries/dashboard";

export default async function Page() {
  const data = await getWaBlastData();
  if (!data) {
    redirect("/dashboard/onboarding");
  }
  return (
    <>
      <div className="hidden lg:contents">
        <WaBlast data={data} />
      </div>
      <WaBlastMobile data={data} />
    </>
  );
}

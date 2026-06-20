import { redirect } from "next/navigation";

import { Overview } from "@/components/templates/overview";
import { OverviewMobile } from "@/components/templates/overview-mobile";
import { getOverviewData } from "@/server/queries/dashboard";

export default async function Page() {
  const data = await getOverviewData();
  if (!data) {
    redirect("/dashboard/onboarding");
  }
  return (
    <>
      <div className="hidden lg:contents">
        <Overview data={data} />
      </div>
      <OverviewMobile data={data} chrome={data.chrome} />
    </>
  );
}

import { redirect } from "next/navigation";

import { GuestGroups } from "@/components/templates/guest-groups";
import { GuestGroupsMobile } from "@/components/templates/guest-groups-mobile";
import { getGuestGroupsData } from "@/server/queries/guest-groups";

export default async function Page() {
  const data = await getGuestGroupsData();
  if (!data) {
    redirect("/dashboard/onboarding");
  }
  return (
    <>
      <div className="hidden lg:contents">
        <GuestGroups data={data} />
      </div>
      <GuestGroupsMobile data={data} />
    </>
  );
}

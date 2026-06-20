import { redirect } from "next/navigation";

import { Guests } from "@/components/templates/guests";
import { GuestsMobile } from "@/components/templates/guests-mobile";
import { getGuestsData } from "@/server/queries/dashboard";

export default async function Page() {
  const data = await getGuestsData();
  if (!data) {
    redirect("/dashboard/onboarding");
  }
  return (
    <>
      <div className="hidden lg:contents">
        <Guests data={data} chrome={data.chrome} />
      </div>
      <GuestsMobile data={data} chrome={data.chrome} />
    </>
  );
}

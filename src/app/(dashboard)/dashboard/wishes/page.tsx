import { redirect } from "next/navigation";

import { Wishes } from "@/components/templates/wishes";
import { WishesMobile } from "@/components/templates/wishes-mobile";
import { getWishesData } from "@/server/queries/dashboard";

export default async function Page() {
  const data = await getWishesData();
  if (!data) {
    redirect("/dashboard/onboarding");
  }
  return (
    <>
      <div className="hidden lg:contents">
        <Wishes data={data} chrome={data.chrome} />
      </div>
      <WishesMobile data={data} chrome={data.chrome} />
    </>
  );
}

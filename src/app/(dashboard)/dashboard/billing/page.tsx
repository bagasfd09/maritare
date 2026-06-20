import { redirect } from "next/navigation";

import { Billing } from "@/components/templates/billing";
import { BillingMobile } from "@/components/templates/billing-mobile";
import { getBillingData } from "@/server/queries/dashboard";

export default async function Page() {
  const data = await getBillingData();
  if (!data) {
    redirect("/dashboard/onboarding");
  }
  return (
    <>
      <div className="hidden lg:contents"><Billing data={data} /></div>
      <BillingMobile data={data} />
    </>
  );
}

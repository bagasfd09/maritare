import { redirect } from "next/navigation";

import { BillingMobile } from "@/components/templates/billing-mobile";
import { Checkout } from "@/components/templates/checkout";
import { getBillingData } from "@/server/queries/dashboard";

export default async function Page() {
  const data = await getBillingData();
  if (!data) {
    redirect("/dashboard/onboarding");
  }
  return (
    <>
      {/* Desktop: the checkout screen (design 08). Mobile keeps the billing
          overview — its design (MB_Tagihan) is unchanged. */}
      <div className="hidden lg:contents">
        <Checkout chrome={data.chrome} email={data.billingContact.email} />
      </div>
      <BillingMobile data={data} />
    </>
  );
}

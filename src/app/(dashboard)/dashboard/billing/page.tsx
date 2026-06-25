import { redirect } from "next/navigation";

import { Checkout } from "@/components/templates/checkout";
import { CheckoutMobile } from "@/components/templates/checkout-mobile";
import { getBillingData } from "@/server/queries/dashboard";

export default async function Page() {
  const data = await getBillingData();
  if (!data) {
    redirect("/dashboard/onboarding");
  }
  return (
    <>
      {/* Checkout screen (design 08) on both surfaces; mobile is the stacked twin. */}
      <div className="hidden lg:contents">
        <Checkout chrome={data.chrome} email={data.billingContact.email} />
      </div>
      <CheckoutMobile chrome={data.chrome} email={data.billingContact.email} />
    </>
  );
}

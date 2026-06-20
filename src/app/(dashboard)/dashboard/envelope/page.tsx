import { redirect } from "next/navigation";

import { Envelope } from "@/components/templates/envelope";
import { EnvelopeMobile } from "@/components/templates/envelope-mobile";
import { getEnvelopeData } from "@/server/queries/dashboard";

export default async function Page() {
  const data = await getEnvelopeData();
  if (!data) {
    redirect("/dashboard/onboarding");
  }
  return (
    <>
      <div className="hidden lg:contents"><Envelope data={data} /></div>
      <EnvelopeMobile data={data} />
    </>
  );
}

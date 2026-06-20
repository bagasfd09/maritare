import { redirect } from "next/navigation";

import { AdminSupport } from "@/components/templates/admin-support";
import { getSupportTickets } from "@/server/queries/support";

export default async function Page() {
  const data = await getSupportTickets();
  if (!data) {
    redirect("/login");
  }
  return <AdminSupport data={data} />;
}

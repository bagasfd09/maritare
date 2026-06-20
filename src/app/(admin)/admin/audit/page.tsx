import { redirect } from "next/navigation";

import { AdminAudit } from "@/components/templates/admin-audit";
import { getAuditLog } from "@/server/queries/audit";

export default async function Page() {
  const entries = await getAuditLog();
  if (!entries) {
    redirect("/login");
  }
  return <AdminAudit entries={entries} />;
}

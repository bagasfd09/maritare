import { redirect } from "next/navigation";
import { AdminOverview } from "@/components/templates/admin-overview";
import { AdminOverviewMobile } from "@/components/templates/admin-overview-mobile";
import { getAdminOverview, getAdminUser } from "@/server/queries/admin";

export default async function Page() {
  const [data, adminUser] = await Promise.all([getAdminOverview(), getAdminUser()]);
  if (!data) {
    redirect("/login");
  }

  return (
    <>
      <div className="hidden lg:contents">
        <AdminOverview data={data} adminUser={adminUser} />
      </div>
      <AdminOverviewMobile data={data} adminUser={adminUser} />
    </>
  );
}

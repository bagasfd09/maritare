import { AdminPackages } from "@/components/templates/admin-packages";
import { AdminPackagesMobile } from "@/components/templates/admin-packages-mobile";
import { getAdminPackages, getAdminPromos } from "@/server/queries/admin";

export default async function Page() {
  const [packages, promos] = await Promise.all([getAdminPackages(), getAdminPromos()]);

  return (
    <>
      <div className="hidden lg:contents">
        <AdminPackages packages={packages} promos={promos} />
      </div>
      <AdminPackagesMobile packages={packages} promos={promos} />
    </>
  );
}

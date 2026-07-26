import { AdminPackages } from "@/components/templates/admin-packages";
import { AdminPackagesMobile } from "@/components/templates/admin-packages-mobile";
import { getAdminPackages, getAdminPromos } from "@/server/queries/admin";

export default async function Page() {
  const [packages, promos] = await Promise.all([getAdminPackages(), getAdminPromos()]);

  return (
    <>
      <div className="hidden lg:contents">
        {/* Desktop: promos moved to their own screen (/admin/promos). */}
        <AdminPackages packages={packages} />
      </div>
      <AdminPackagesMobile packages={packages} promos={promos} />
    </>
  );
}

import { AdminPromos } from "@/components/templates/admin-promos";
import { getAdminPackages, getAdminPromos } from "@/server/queries/admin";

// Admin · Promo — dedicated promo management (split out of Paket & Promo).
// Packages ride along solely to feed the "Berlaku untuk paket" dropdown.
export default async function Page() {
  const [promos, packages] = await Promise.all([getAdminPromos(), getAdminPackages()]);
  return (
    <AdminPromos
      promos={promos}
      packages={packages.map((p) => ({ packageId: p.packageId, name: p.name }))}
    />
  );
}

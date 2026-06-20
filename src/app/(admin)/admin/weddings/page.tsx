import { AdminWeddings } from "@/components/templates/admin-weddings";
import { AdminWeddingsMobile } from "@/components/templates/admin-weddings-mobile";
import { getAdminWeddings } from "@/server/queries/admin";

export default async function Page() {
  const weddings = await getAdminWeddings();

  return (
    <>
      <div className="hidden lg:contents">
        <AdminWeddings weddings={weddings} />
      </div>
      <AdminWeddingsMobile weddings={weddings} />
    </>
  );
}

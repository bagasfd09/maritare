import { AdminWeddings } from "@/components/templates/admin-weddings";
import { AdminWeddingsMobile } from "@/components/templates/admin-weddings-mobile";
import { getAdminWeddings } from "@/server/queries/admin";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [weddings, { q }] = await Promise.all([getAdminWeddings(), searchParams]);

  return (
    <>
      <div className="hidden lg:contents">
        <AdminWeddings weddings={weddings} initialQuery={q ?? ""} />
      </div>
      <AdminWeddingsMobile weddings={weddings} initialQuery={q ?? ""} />
    </>
  );
}

import { AdminUsers } from "@/components/templates/admin-users";
import { AdminUsersMobile } from "@/components/templates/admin-users-mobile";
import { getAdminUsers } from "@/server/queries/admin";

export default async function Page() {
  const users = await getAdminUsers();

  return (
    <>
      <div className="hidden lg:contents">
        <AdminUsers users={users} />
      </div>
      <AdminUsersMobile users={users} />
    </>
  );
}

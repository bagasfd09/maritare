import { AdminTeam } from "@/components/templates/admin-team";
import { AdminTeamMobile } from "@/components/templates/admin-team-mobile";
import { getAdminTeam, getTeamInvites } from "@/server/queries/admin";

export default async function Page() {
  const [team, invites] = await Promise.all([getAdminTeam(), getTeamInvites()]);
  return (
    <>
      <div className="hidden lg:contents">
        <AdminTeam team={team} invites={invites} />
      </div>
      <AdminTeamMobile team={team} invites={invites} />
    </>
  );
}

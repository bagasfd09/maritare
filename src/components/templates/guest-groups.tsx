import { DashboardShell } from "@/components/templates/dashboard-shell";
import { DashboardTopBar } from "@/components/organisms/dashboard-topbar";
import { Em } from "@/components/atoms/typography";
import { GuestGroupsManager } from "@/components/organisms/guest-groups-manager";
import type { GuestGroupsData } from "@/server/queries/guest-groups";

// Grup Tamu — badge icons for the free-text guest groups. Single responsive
// template (like Petugas Resepsi): the manager list works at mobile widths.
export function GuestGroups({ data }: { data: GuestGroupsData }) {
  return (
    <DashboardShell active="groups" chrome={data.chrome}>
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          num="§ IV"
          eyebrow="Grup Tamu"
          title={<>Badge untuk <Em className="text-burgundy">tiap grup.</Em></>}
        />

        <div className="flex-1 min-h-0 px-5 py-7 lg:px-10 overflow-y-auto">
          <GuestGroupsManager groups={data.groups} />
        </div>
      </main>
    </DashboardShell>
  );
}

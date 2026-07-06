import { DashboardShell } from "@/components/templates/dashboard-shell";
import { DashboardTopBar } from "@/components/organisms/dashboard-topbar";
import { Em } from "@/components/atoms/typography";
import { ShareAccessManager } from "@/components/organisms/share-access-manager";
import type { ShareAccessData } from "@/server/queries/share";

// Akses Keluarga. The owner issues 1-hour codes so family members can send
// invitations to their own side's guests via their own WhatsApp — no dashboard
// account, scoped per token to one or more guest sides.
export function AksesKeluarga({ data }: { data: ShareAccessData }) {
  return (
    <DashboardShell active="akses-keluarga" chrome={data.chrome}>
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          num="§ XI"
          eyebrow="Akses Keluarga"
          title={<>Keluarga ikut <Em className="text-burgundy">menyebar undangan.</Em></>}
        />

        <div className="flex-1 min-h-0 px-10 py-7 overflow-y-auto">
          <ShareAccessManager tokens={data.tokens} availableSides={data.availableSides} />
        </div>
      </main>
    </DashboardShell>
  );
}

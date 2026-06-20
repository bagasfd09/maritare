import { DashboardShell } from "@/components/templates/dashboard-shell";
import { DashboardTopBar } from "@/components/organisms/dashboard-topbar";
import { Em } from "@/components/atoms/typography";
import { PetugasManager } from "@/components/organisms/petugas-manager";
import type { PetugasData } from "@/server/queries/petugas";

// Petugas Resepsi (reception attendants). The owner issues token codes that let
// staff run the online guestbook kiosk WITHOUT any dashboard access. One token =
// one active device; the number of tokens is capped by the package quota.
export function PetugasResepsi({ data }: { data: PetugasData }) {
  return (
    <DashboardShell active="petugas" chrome={data.chrome}>
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          num="§ X"
          eyebrow="Petugas Resepsi"
          title={<>Penjaga <Em className="text-burgundy">buku tamu.</Em></>}
        />

        <div className="flex-1 min-h-0 px-10 py-7 overflow-y-auto">
          <PetugasManager tokens={data.tokens} quota={data.quota} />
        </div>
      </main>
    </DashboardShell>
  );
}

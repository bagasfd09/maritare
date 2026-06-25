import { DashboardShell } from "@/components/templates/dashboard-shell";
import { DashboardTopBar } from "@/components/organisms/dashboard-topbar";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Display, Em } from "@/components/atoms/typography";
import { SectionNumber } from "@/components/atoms/section-number";
import { SettingsNav } from "@/components/molecules/settings-nav";
import { SettingsAccount } from "@/components/molecules/settings-account";
import { SettingsWedding } from "@/components/molecules/settings-wedding";
import { SettingsPartner } from "@/components/molecules/settings-partner";
import { SettingsDomain } from "@/components/molecules/settings-domain";
import { SettingsNotifications } from "@/components/molecules/settings-notifications";
import { SettingsDanger } from "@/components/molecules/settings-danger";
import { SettingsSupport } from "@/components/molecules/settings-support";
import { logout } from "@/server/actions/auth";
import type { SettingsData } from "@/server/queries/dashboard";

// Screen 09 · Pengaturan (Settings). Data-driven from the signed-in user's
// profile + invitation. Each section saves explicitly via its own action.
export function Settings({ data }: { data: SettingsData }) {
  return (
    <DashboardShell active="settings" chrome={data.chrome}>
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          num="§ IX"
          eyebrow="Pengaturan"
          title={<>Atur <Em className="text-burgundy">preferensi.</Em></>}
          actions={
            <a
              href={`/inv/${data.weddingSlug}`}
              target="_blank"
              rel="noopener"
              className="no-underline"
            >
              <Button variant="ghost"><Icon name="external" size={14} />Lihat undangan</Button>
            </a>
          }
        />

        <div className="flex-1 min-h-0 px-10 py-7 overflow-y-auto grid grid-cols-[200px_1fr] gap-7 items-start">
          <SettingsNav />

          <div className="min-w-0 flex flex-col gap-[22px]">
            <SettingsAccount profile={data.profile} />
            <SettingsWedding wedding={data.wedding} />
            <SettingsPartner inviteCode={data.inviteCode} members={data.members} />
            <SettingsDomain weddingSlug={data.weddingSlug} />
            <SettingsNotifications prefs={data.notificationPrefs} />
            <SettingsDanger />

            <section id="support" className="scroll-mt-6">
              <SectionNumber className="text-[12px] mb-1">vi. Bantuan</SectionNumber>
              <Display as="div" className="text-[26px] mb-4">
                Hubungi <Em className="text-burgundy">support.</Em>
              </Display>
              <SettingsSupport />
            </section>

            <section>
              <div className="bg-paper border border-line rounded-[14px] px-[22px] py-4 flex items-center gap-[18px]">
                <span className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-sage-soft text-[#2E3325]">
                  <Icon name="logout" size={16} />
                </span>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold text-charcoal">Keluar</div>
                  <div className="text-[12px] text-muted-ink mt-[2px]">Akhiri sesi di perangkat ini.</div>
                </div>
                <form action={logout}>
                  <Button
                    type="submit"
                    size="sm"
                    variant="ghost"
                    className="text-burgundy border-burgundy hover:border-burgundy"
                  >
                    Keluar
                  </Button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}

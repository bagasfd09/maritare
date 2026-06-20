import { AdminMobileAppBar } from "@/components/organisms/admin-mobile-appbar";
import { AdminMobileTabBar, type AdminMobileNavKey } from "@/components/organisms/admin-mobile-tabbar";
import type { AdminUser } from "@/server/queries/admin";

type AdminMobileShellProps = {
  active: AdminMobileNavKey;
  // Real signed-in admin identity for the app bar avatar. Forwarded from the
  // server page; optional so a not-yet-wired caller still renders.
  user?: AdminUser | null;
  children: React.ReactNode;
};

// Admin mobile app shell — self-gated to < lg (desktop admin renders ≥ lg).
// Phone column (max 420px) centered on a warm gray stage, rounded ≥460px.
//
// Prop-driven (synchronous), mirroring `AdminShell`: the consuming mobile screen
// templates are Client Components, so this shell cannot self-fetch. The owning
// server page fetches `getAdminUser()` and feeds `user` down; the (admin) layout
// is the authoritative session/role gate.
export function AdminMobileShell({ active, user, children }: AdminMobileShellProps) {
  return (
    <div className="lg:hidden min-h-dvh bg-[#d9d2c6] flex items-center justify-center font-body text-charcoal">
      <div className="w-full max-w-[420px] h-dvh max-h-[920px] mx-auto flex flex-col bg-ivory relative overflow-hidden shadow-[0_30px_80px_-30px_rgba(40,24,12,0.45)] min-[460px]:rounded-[28px] min-[460px]:h-[min(100dvh,900px)]">
        <AdminMobileAppBar user={user} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </main>
        <AdminMobileTabBar active={active} />
      </div>
    </div>
  );
}

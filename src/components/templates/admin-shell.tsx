import { AdminSidebar } from "@/components/organisms/admin-sidebar";
import type { AdminOverview, AdminUser } from "@/server/queries/admin";

type AdminShellProps = {
  active?: string;
  // Real identity for the sidebar profile. Forwarded from the server page (which
  // fetches `getAdminUser()`); optional so a not-yet-wired caller still renders.
  user?: AdminUser | null;
  // Real sidebar quick-stat source (this-month revenue + total weddings count).
  // Optional for the same reason; when omitted the sidebar shows neutral
  // placeholders instead of fabricated figures.
  overview?: AdminOverview | null;
  children: React.ReactNode;
};

// Admin page skeleton — same scroll model as the customer dashboard:
// viewport-locked shell, pinned sidebar, each screen's content area scrolls.
//
// This is a prop-driven (synchronous) component, mirroring `DashboardShell`:
// the consuming admin screen templates are Client Components that import and
// render this shell, so it cannot self-fetch (an async Server Component cannot
// be a direct import of a Client Component). The owning server page fetches the
// admin getters and feeds `user`/`overview` down; the (admin) layout is the
// authoritative session/role gate.
export function AdminShell({ active = "overview", user, overview, children }: AdminShellProps) {
  // Build the sidebar's real-data slice only when overview is wired — otherwise
  // pass null so the sidebar renders its neutral placeholders.
  const sidebarChrome = overview
    ? {
        user: user ?? null,
        revenueThisMonth: overview.revenueThisMonth,
        weddingsTotal: overview.weddingsTotal,
      }
    : null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-ivory text-charcoal font-body">
      <AdminSidebar active={active} chrome={sidebarChrome} />
      {children}
    </div>
  );
}

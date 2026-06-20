import { DashboardSidebar } from "@/components/organisms/dashboard-sidebar";
import type { DashboardChrome } from "@/server/queries/dashboard";

type DashboardShellProps = {
  active?: string;
  // Optional sidebar chrome. When undefined/null the sidebar renders today's
  // hardcoded mock (no visual change for unwired pages).
  chrome?: DashboardChrome | null;
  children: React.ReactNode;
};

// Page skeleton: persistent sidebar + a full-height main column (the `children`).
// Locked to the viewport (h-screen): the sidebar never grows past the screen;
// each screen's content area is the scroller instead of the page itself.
export function DashboardShell({ active = "home", chrome, children }: DashboardShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-ivory text-charcoal font-body">
      <DashboardSidebar active={active} chrome={chrome} />
      {children}
    </div>
  );
}

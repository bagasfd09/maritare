import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/atoms/icon";
import { logout } from "@/server/actions/auth";
import { rupiah } from "@/lib/format";
import type { AdminUser } from "@/server/queries/admin";

type NavItem = { id: string; icon: IconName; label: string; href: string };

const ITEMS: NavItem[] = [
  { id: "overview", icon: "home", label: "Overview", href: "/admin" },
  { id: "weddings", icon: "users", label: "Undangan", href: "/admin/weddings" },
  { id: "users", icon: "user", label: "User", href: "/admin/users" },
  { id: "orders", icon: "card", label: "Pesanan", href: "/admin/orders" },
  { id: "templates", icon: "template", label: "Template", href: "/admin/templates" },
  { id: "packages", icon: "sparkle", label: "Paket", href: "/admin/packages" },
  { id: "promos", icon: "qr", label: "Promo", href: "/admin/promos" },
  { id: "team", icon: "users", label: "Tim admin", href: "/admin/team" },
];

// Secondary nav — real pages now exist behind these. `id` matches the `active`
// prop so the highlight treatment mirrors the primary nav.
const BOTTOM: { id: string; icon: IconName; label: string; href: string }[] = [
  { id: "support", icon: "heart", label: "Support", href: "/admin/support" },
  { id: "settings", icon: "settings", label: "Pengaturan", href: "/admin/settings" },
];

// The real-data slice the sidebar renders. Optional: when omitted the shell is
// rendered with neutral placeholders (no fabricated identity/stats), so a not-
// yet-wired caller still mounts without crashing or showing fake numbers.
export type AdminSidebarChrome = {
  user: AdminUser | null;
  // This-month paid revenue (rupiah int) for the "Bulan ini" quick stat.
  revenueThisMonth: number;
  // Total non-deleted weddings → the "Undangan" nav count.
  weddingsTotal: number;
};

// Dark forest sidebar — visually distinguishes admin mode from the customer dashboard.
export function AdminSidebar({
  active = "overview",
  chrome,
}: {
  active?: string;
  chrome?: AdminSidebarChrome | null;
}) {
  const user = chrome?.user ?? null;
  // Nav count for the "Undangan" item: real total, hidden until data is wired.
  const weddingsCount = chrome ? String(chrome.weddingsTotal) : undefined;
  return (
    <aside className="w-[232px] h-full overflow-y-auto bg-forest-deep text-cream pt-[22px] px-[14px] pb-[18px] flex flex-col shrink-0 relative">
      {/* Logo + admin badge */}
      <div className="flex items-center justify-between px-[6px] pb-[18px] border-b border-[rgba(245,239,230,0.12)]">
        <Link
          href="/admin"
          className="inline-flex items-baseline gap-[2px] font-display font-extrabold text-[22px] [font-variation-settings:'opsz'_48] tracking-[-0.04em] text-cream no-underline lowercase"
        >
          maritare
          <span className="text-terracotta font-body text-[18px] -translate-y-[3px] inline-block">*</span>
        </Link>
        <span className="text-[9px] px-2 py-[3px] rounded bg-terracotta text-white font-bold tracking-[0.18em] uppercase">
          Admin
        </span>
      </div>

      {/* Quick stats */}
      <div className="px-[6px] pt-4 pb-[14px]">
        <div className="text-[9px] text-peach tracking-[0.28em] uppercase font-semibold opacity-80 mb-[6px]">
          Bulan ini
        </div>
        <div className="flex items-baseline gap-1">
          {/* Real this-month paid revenue. No month-over-month source exists, so
              the previous "↗ +18%" trend was removed rather than faked. */}
          <span className="font-display font-extrabold text-2xl text-peach tracking-[-0.02em]">
            {chrome ? rupiah(chrome.revenueThisMonth) : "—"}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-[2px] mt-1">
        {ITEMS.map((it) => {
          const on = active === it.id;
          // Only the "Undangan" item carries a real count; the orders "new" dot
          // was removed (no pending-orders source is passed to the sidebar).
          const count = it.id === "weddings" ? weddingsCount : undefined;
          return (
            <Link
              key={it.id}
              href={it.href}
              className={cn(
                "flex items-center gap-[11px] px-[11px] py-[9px] rounded-lg text-[13px] font-medium no-underline transition-colors",
                on ? "text-forest-deep bg-peach" : "text-[rgba(245,239,230,0.78)]",
              )}
            >
              <Icon name={it.icon} size={15} />
              <span className="flex-1">{it.label}</span>
              {count && (
                <span
                  className={cn(
                    "text-[10px] px-[6px] py-px rounded-full font-bold",
                    on ? "bg-burgundy text-white" : "bg-[rgba(245,239,230,0.12)] text-[rgba(245,239,230,0.75)]",
                  )}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Secondary nav — real pages, same active-highlight as the primary nav */}
      <nav className="flex flex-col gap-[2px] pt-[14px] border-t border-[rgba(245,239,230,0.12)]">
        {BOTTOM.map((it) => {
          const on = active === it.id;
          return (
            <Link
              key={it.id}
              href={it.href}
              className={cn(
                "flex items-center gap-[11px] px-[11px] py-[9px] rounded-lg text-[13px] font-medium no-underline transition-colors",
                on ? "text-forest-deep bg-peach" : "text-[rgba(245,239,230,0.6)]",
              )}
            >
              <Icon name={it.icon} size={15} />
              {it.label}
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="mt-3 px-3 py-[11px] rounded-[10px] bg-[rgba(245,239,230,0.06)] flex items-center gap-[10px]">
        <span className="w-8 h-8 rounded-full bg-terracotta text-white flex items-center justify-center font-display font-bold text-[12px] shrink-0">
          {user?.initials ?? "?"}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-cream truncate">{user?.name ?? "Akun admin"}</div>
          <div className="text-[10px] text-peach tracking-[0.18em] uppercase font-semibold truncate">
            {user?.roleLabel ?? "Admin"}
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            title="Keluar"
            aria-label="Keluar"
            className="w-8 h-8 rounded-full inline-flex items-center justify-center shrink-0 cursor-pointer transition-colors text-[rgba(245,239,230,0.6)] border border-[rgba(245,239,230,0.18)] bg-transparent hover:bg-[rgba(245,239,230,0.12)] hover:text-cream"
          >
            <Icon name="logout" size={14} />
          </button>
        </form>
      </div>
    </aside>
  );
}

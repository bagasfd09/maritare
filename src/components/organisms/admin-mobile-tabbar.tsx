"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/atoms/icon";
import { logout } from "@/server/actions/auth";

export type AdminMobileNavKey = "overview" | "weddings" | "orders" | "templates" | "packages" | "team";

const ROUTES: Record<AdminMobileNavKey, string> = {
  overview: "/admin",
  weddings: "/admin/weddings",
  orders: "/admin/orders",
  templates: "/admin/templates",
  packages: "/admin/packages",
  team: "/admin/team",
};

// The orders "nub" dot was removed — there is no real pending-orders source to
// back an always-on "new orders" indicator.
const TABS: { id: AdminMobileNavKey | "__more"; icon: IconName; label: string }[] = [
  { id: "overview", icon: "home", label: "Beranda" },
  { id: "weddings", icon: "users", label: "Undangan" },
  { id: "orders", icon: "card", label: "Pesanan" },
  { id: "templates", icon: "template", label: "Template" },
  { id: "__more", icon: "more", label: "Lainnya" },
];

// Sheet destinations. The first two map to bottom-tab keys (for active
// highlight); "Support"/"Pengaturan" are standalone routes that aren't tabs, so
// they carry an explicit href instead of an AdminMobileNavKey.
type SheetItem = {
  icon: IconName;
  title: string;
  desc: string;
} & ({ id: AdminMobileNavKey } | { href: string });

const SHEET_ITEMS: SheetItem[] = [
  { id: "packages", icon: "sparkle", title: "Paket & Promo", desc: "Harga, paket, kode promo" },
  { id: "team", icon: "users", title: "Tim admin", desc: "Anggota, role & izin" },
  { href: "/admin/support", icon: "heart", title: "Support", desc: "Bantuan & tiket" },
  { href: "/admin/settings", icon: "settings", title: "Pengaturan", desc: "Akun & preferensi" },
];

// Dark forest tab bar + the "Lainnya" slide-up sheet. Routes are real pages.
export function AdminMobileTabBar({ active }: { active: AdminMobileNavKey }) {
  const [sheet, setSheet] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const moreActive = active === "packages" || active === "team";

  return (
    <>
      {/* More sheet */}
      <div
        className={cn(
          "absolute inset-0 z-40 bg-[rgba(31,43,28,0.42)] transition-opacity duration-[250ms]",
          sheet ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setSheet(false)}
      />
      <div
        className={cn(
          "absolute left-0 right-0 bottom-0 z-[41] bg-ivory rounded-t-[22px]",
          "px-4 pt-[10px] pb-[calc(20px+env(safe-area-inset-bottom))]",
          "transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          "shadow-[0_-16px_40px_-16px_rgba(40,24,12,0.4)]",
          sheet ? "translate-y-0" : "translate-y-[102%]",
        )}
      >
        <div className="w-10 h-1 rounded-full bg-beige mt-[6px] mb-[14px] mx-auto" />
        {SHEET_ITEMS.map((it) => {
          const on = "id" in it && active === it.id;
          return (
            <button
              key={it.title}
              className={cn(
                "flex items-center gap-[14px] w-full px-2 py-[14px] border-b border-line last:border-b-0",
                "bg-transparent text-left cursor-pointer",
              )}
              onClick={() => {
                setSheet(false);
                router.push("id" in it ? ROUTES[it.id] : it.href);
              }}
            >
              <span
                className={cn(
                  "w-10 h-10 rounded-[11px] inline-flex items-center justify-center shrink-0",
                  on ? "bg-forest-deep text-peach" : "bg-cream text-forest",
                )}
              >
                <Icon name={it.icon} size={18} />
              </span>
              <div className="flex-1">
                <div className="text-[14.5px] font-semibold text-charcoal">{it.title}</div>
                <div className="text-[11px] text-muted-ink mt-px">{it.desc}</div>
              </div>
              <Icon name="chevron-r" size={16} stroke="var(--color-faint)" />
            </button>
          );
        })}
        <button
          type="button"
          title="Keluar"
          disabled={pending}
          onClick={() => startTransition(() => logout())}
          className="flex items-center gap-[14px] w-full px-2 py-[14px] border-b border-line last:border-b-0 bg-transparent text-left cursor-pointer text-burgundy disabled:opacity-60"
        >
          <span className="w-10 h-10 rounded-[11px] inline-flex items-center justify-center shrink-0 bg-[rgba(124,45,45,0.1)] text-burgundy">
            <Icon name="logout" size={18} />
          </span>
          <div className="flex-1">
            <div className="text-[14.5px] font-semibold">Keluar</div>
            <div className="text-[11px] text-muted-ink mt-px">Akhiri sesi kamu</div>
          </div>
        </button>
      </div>

      {/* Bottom tab bar */}
      <nav className="shrink-0 z-30 bg-forest-deep flex items-stretch px-[6px] pt-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
        {TABS.map((t) => {
          const on = t.id === "__more" ? moreActive : active === t.id;
          const inner = (
            <>
              {on && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-[18px] h-[3px] rounded-[3px] bg-peach" />}
              <span className="relative inline-flex">
                <Icon name={t.icon} size={20} />
              </span>
              <span>{t.label}</span>
            </>
          );
          const cls = cn(
            "flex-1 flex flex-col items-center gap-1 px-[2px] py-[6px] relative cursor-pointer",
            "font-body text-[9.5px] font-semibold tracking-[0.04em] bg-transparent border-none no-underline",
            on ? "text-peach" : "text-[rgba(245,239,230,0.6)]",
          );
          return t.id === "__more" ? (
            <button key={t.id} className={cls} onClick={() => setSheet(true)}>
              {inner}
            </button>
          ) : (
            <Link key={t.id} href={ROUTES[t.id as AdminMobileNavKey]} className={cls}>
              {inner}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

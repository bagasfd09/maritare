import { cn } from "@/lib/utils";
import { Logo } from "@/components/atoms/logo";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Avatar } from "@/components/atoms/avatar";
import { StatusPill } from "@/components/atoms/status-pill";
import { LabelSc } from "@/components/atoms/typography";
import { logout } from "@/server/actions/auth";
import type { DashboardChrome } from "@/server/queries/dashboard";

type NavItem = { id: string; icon: IconName; label: string; href: string; badge?: string };

const TOP: { label: string; items: NavItem[] }[] = [
  {
    label: "Undangan",
    items: [
      { id: "home", icon: "home", label: "Beranda", href: "/dashboard" },
      { id: "editor", icon: "edit", label: "Editor", href: "/dashboard/editor" },
      { id: "templates", icon: "template", label: "Template", href: "/dashboard/templates" },
      { id: "photos", icon: "image", label: "Galeri", href: "/dashboard/gallery" },
    ],
  },
  {
    label: "Tamu & Acara",
    items: [
      { id: "guests", icon: "users", label: "Tamu", href: "/dashboard/guests" },
      { id: "wishes", icon: "heart", label: "Ucapan", href: "/dashboard/wishes", badge: "5" },
      { id: "petugas", icon: "users", label: "Petugas Resepsi", href: "/dashboard/petugas" },
      { id: "akses-keluarga", icon: "share", label: "Akses Keluarga", href: "/dashboard/akses-keluarga" },
    ],
  },
];

const BOTTOM: NavItem[] = [
  { id: "billing", icon: "card", label: "Pembayaran", href: "/dashboard/billing" },
  { id: "settings", icon: "settings", label: "Pengaturan", href: "/dashboard/settings" },
];

// Map the wedding publish status to the StatusPill tone + Bahasa label. When no
// chrome is wired the caller renders the hardcoded "Draft · belum publish" mock.
function statusDisplay(
  status: DashboardChrome["status"],
): { tone: "default" | "draft" | "live"; label: string } {
  switch (status) {
    case "live":
      return { tone: "live", label: "Live · tayang" };
    case "expired":
      return { tone: "default", label: "Kedaluwarsa · sudah lewat" };
    case "pending":
      return { tone: "draft", label: "Menunggu · proses publish" };
    case "draft":
    default:
      return { tone: "draft", label: "Draft · belum publish" };
  }
}

// The shared dashboard chrome. `active` highlights the current nav item.
//
// `chrome` is optional: when it is undefined/null the sidebar renders EXACTLY
// the hardcoded mock (zero visual change for pages that have not been wired to
// the dashboard query layer yet). When provided, the couple name, status pill,
// wishes badge, package line and profile identity are data-driven.
export function DashboardSidebar({
  active = "home",
  chrome,
}: {
  active?: string;
  chrome?: DashboardChrome | null;
}) {
  const status = chrome ? statusDisplay(chrome.status) : null;
  // Wishes badge: data-driven count when wired (hidden at 0). No mock fallback.
  const wishesBadge =
    chrome && chrome.pendingWishes > 0 ? String(chrome.pendingWishes) : undefined;

  return (
    <aside className="w-60 h-full overflow-y-auto bg-cream border-r border-beige pt-[26px] px-[18px] pb-6 flex flex-col shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-between px-2 pb-[22px] border-b border-beige">
        <Logo size={24} />
        <FlowerMark size={16} />
      </div>

      {/* Wedding label */}
      <div className="px-2 pt-5 pb-[18px]">
        <LabelSc className="mb-[6px]">Undangan kamu</LabelSc>
        <div className="font-display italic text-[22px] text-charcoal leading-[1.1] tracking-[-0.015em]">
          {chrome ? (
            <>
              {chrome.brideName} <span className="text-burgundy">&amp;</span> {chrome.groomName}
            </>
          ) : (
            "Undanganmu"
          )}
        </div>
        <div className="mt-[10px]">
          {status ? (
            <StatusPill tone={status.tone}>{status.label}</StatusPill>
          ) : (
            <StatusPill tone="draft">Draft · belum publish</StatusPill>
          )}
        </div>
      </div>

      {/* Primary nav — flat items grouped under section labels */}
      <nav className="flex flex-col mt-2">
        {TOP.map((group) => (
          <div key={group.label} className="flex flex-col gap-[2px] mb-4">
            <LabelSc className="px-3 mb-[6px]">{group.label}</LabelSc>
            {group.items.map((it) => {
              const isActive = active === it.id;
              // The wishes item is the only data-driven badge; everything else
              // keeps its mock badge value.
              const badge = it.id === "wishes" ? wishesBadge : it.badge;
              return (
                <a
                  key={it.id}
                  href={it.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-[10px] rounded-[10px] text-[13px] font-medium",
                    isActive ? "bg-burgundy text-cream" : "text-charcoal",
                  )}
                >
                  <Icon name={it.icon} size={16} />
                  <span className="flex-1">{it.label}</span>
                  {badge && !isActive && (
                    <span className="text-[10px] bg-terracotta text-white px-[6px] py-[2px] rounded-full font-bold">
                      {badge}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Buku Tamu — its own section: a solid button (not a flat nav link) that
          opens the reception kiosk in a NEW TAB, since the kiosk lives outside
          the dashboard shell. */}
      <a
        href="/guestbook"
        target="_blank"
        rel="noopener"
        className="flex items-center gap-3 px-3 py-[11px] rounded-[10px] bg-burgundy text-cream text-[13px] font-semibold shadow-[0_6px_16px_-6px_rgba(124,45,45,0.6)] hover:bg-burgundy-deep transition-colors"
      >
        <Icon name="qr" size={16} />
        <span className="flex-1">Buku Tamu</span>
        <Icon name="external" size={13} />
      </a>

      {/* Secondary nav */}
      <nav className="flex flex-col gap-[2px] mt-4 pt-4 border-t border-beige">
        <LabelSc className="px-3 mb-[6px]">Akun</LabelSc>
        {BOTTOM.map((it) => {
          const isActive = active === it.id;
          return (
            <a
              key={it.id}
              href={it.href}
              className={cn(
                "flex items-center gap-3 px-3 py-[10px] rounded-[10px] text-[13px] font-medium",
                isActive ? "bg-burgundy text-cream" : "text-muted-ink",
              )}
            >
              <Icon name={it.icon} size={16} />
              {it.label}
            </a>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="mt-[14px] p-3 rounded-[12px] bg-paper border border-line flex items-center gap-[10px]">
        <Avatar tone="burgundy">{chrome ? chrome.userInitials : "?"}</Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold truncate">
            {chrome ? chrome.userName : "Akun kamu"}
          </div>
          <div className="text-[10px] text-muted-ink uppercase tracking-[0.18em] truncate">
            {chrome ? `Paket ${chrome.packageName ?? "—"}` : "—"}
          </div>
        </div>
        <form action={logout} className="contents">
          <button
            type="submit"
            title="Keluar"
            className="w-7 h-7 rounded-full inline-flex items-center justify-center shrink-0 text-muted-ink hover:bg-burgundy hover:text-cream transition-colors cursor-pointer"
          >
            <Icon name="logout" size={14} />
          </button>
        </form>
        <Icon name="chevron-r" size={14} />
      </div>
    </aside>
  );
}

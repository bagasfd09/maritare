import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/atoms/icon";

type NavItem = {
  id: string;
  label: string;
  icon: IconName;
  active?: boolean;
  danger?: boolean;
};

// Each item anchors to a real section id on the settings page. Privasi & Ekspor
// data are intentionally omitted until those features exist (no dead links).
const ITEMS: NavItem[] = [
  { id: "account", label: "Akun", icon: "settings", active: true },
  { id: "undangan", label: "Detail undangan", icon: "calendar" },
  { id: "partner", label: "Partner", icon: "users" },
  { id: "domain", label: "Domain & slug", icon: "globe" },
  { id: "notifikasi", label: "Notifikasi", icon: "bell" },
  { id: "danger", label: "Zona berbahaya", icon: "x", danger: true },
  { id: "support", label: "Bantuan", icon: "heart" },
];

// Settings sub-navigation rail (left column of the settings screen).
export function SettingsNav() {
  return (
    <nav className="flex flex-col gap-[2px]">
      {ITEMS.map((it) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          className={cn(
            "flex items-center gap-[10px] px-3 py-[9px] rounded-lg text-[13px] font-medium",
            it.active
              ? "text-cream bg-charcoal"
              : it.danger
                ? "text-burgundy"
                : "text-muted-ink",
          )}
        >
          <Icon name={it.icon} size={14} />
          {it.label}
        </a>
      ))}
    </nav>
  );
}

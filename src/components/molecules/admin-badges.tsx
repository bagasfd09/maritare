import { cn } from "@/lib/utils";
import type { PackageName } from "@/lib/admin-data";

// Status pill covering every admin state (weddings, orders, templates, promos).
// Ports the design's AdminStatus 1:1.
export type AdminStatusKey =
  | "live" | "draft" | "pending" | "expired"
  | "paid" | "failed" | "refunded"
  | "published" | "active" | "exhausted";

const STATUS_MAP: Record<AdminStatusKey, { bg: string; color: string; label: string; dot: string; pulse?: boolean }> = {
  live: { bg: "bg-[rgba(77,216,145,0.18)]", color: "text-[#1c5a36]", label: "Live", dot: "bg-[#4DD891]", pulse: true },
  draft: { bg: "bg-peach", color: "text-[#5a2a18]", label: "Draft", dot: "bg-terracotta" },
  pending: { bg: "bg-peach", color: "text-[#5a2a18]", label: "Pending", dot: "bg-terracotta" },
  expired: { bg: "bg-[rgba(124,45,45,0.12)]", color: "text-burgundy", label: "Expired", dot: "bg-burgundy" },
  paid: { bg: "bg-[rgba(77,216,145,0.18)]", color: "text-[#1c5a36]", label: "Lunas", dot: "bg-[#4DD891]" },
  failed: { bg: "bg-[rgba(124,45,45,0.14)]", color: "text-burgundy", label: "Gagal", dot: "bg-burgundy" },
  refunded: { bg: "bg-cream", color: "text-muted-ink", label: "Refunded", dot: "bg-muted-ink" },
  published: { bg: "bg-[rgba(77,216,145,0.18)]", color: "text-[#1c5a36]", label: "Published", dot: "bg-[#4DD891]" },
  active: { bg: "bg-[rgba(77,216,145,0.18)]", color: "text-[#1c5a36]", label: "Aktif", dot: "bg-[#4DD891]" },
  exhausted: { bg: "bg-cream", color: "text-muted-ink", label: "Habis", dot: "bg-muted-ink" },
};

export function AdminStatus({ status }: { status: AdminStatusKey }) {
  const s = STATUS_MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[6px] px-[10px] py-[3px] rounded-full",
        "font-body text-[10px] font-bold tracking-[0.12em] uppercase",
        s.bg,
        s.color,
      )}
    >
      <span className={cn("w-[6px] h-[6px] rounded-full", s.dot, s.pulse && "animate-dot-pulse")} />
      {s.label}
    </span>
  );
}

// Package tier badge. Ports the design's PkgBadge — accepts the raw pkg string
// ("Gold (extend)" falls back to Silver styling like the source's map lookup).
const PKG_MAP: Record<PackageName, string> = {
  Silver: "bg-cream text-charcoal border border-beige",
  Gold: "bg-peach text-[#5a2a18]",
  Platinum: "bg-charcoal text-peach",
};

export function PkgBadge({ pkg }: { pkg: string }) {
  const cls = PKG_MAP[pkg as PackageName] ?? PKG_MAP.Silver;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] px-[9px] py-[3px] rounded",
        "text-[10px] font-bold tracking-[0.14em] uppercase",
        cls,
      )}
    >
      {pkg}
    </span>
  );
}

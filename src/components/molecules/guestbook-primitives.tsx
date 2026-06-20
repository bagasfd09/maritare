import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/atoms/icon";

// ── Guestbook kiosk primitives, ported 1:1 from guestbook-v2-shared.jsx ──
// Tablet-landscape check-in app; bigger touch targets than the dashboard.

type GbKind = "primary" | "dark" | "ghost" | "cream";

const KINDS: Record<GbKind, string> = {
  primary: "bg-burgundy text-cream border border-transparent shadow-[0_14px_26px_-14px_rgba(124,45,45,0.55)]",
  dark: "bg-charcoal text-cream border border-transparent",
  ghost: "bg-transparent text-charcoal border border-charcoal/[0.22]",
  cream: "bg-cream text-charcoal border border-transparent",
};

type GuestbookButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  kind?: GbKind;
  h?: number;
  fz?: number;
  icon?: React.ReactNode;
  iconAfter?: React.ReactNode;
};

// `GbBtn` — large touch pill; horizontal padding scales with height like the source.
export function GuestbookButton({
  kind = "primary",
  h = 56,
  fz = 13,
  icon,
  iconAfter,
  className,
  style,
  children,
  ...props
}: GuestbookButtonProps) {
  return (
    <button
      style={{ height: h, padding: `0 ${Math.round(h * 0.55)}px`, fontSize: fz, ...style }}
      className={cn(
        "inline-flex items-center justify-center gap-[10px] rounded-full",
        "font-body font-semibold tracking-[0.14em] uppercase cursor-pointer whitespace-nowrap",
        KINDS[kind],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
      {iconAfter}
    </button>
  );
}

// `GbStep` — editorial step marker (mirrors .d-secnum at kiosk scale).
export function GuestbookStep({
  children,
  center = false,
  className,
}: {
  children: React.ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 font-display italic text-burgundy text-[15px] tracking-[0.04em]",
        center && "justify-center",
        className,
      )}
    >
      <span className="w-6 h-px bg-rule opacity-80" />
      {children}
    </div>
  );
}

// `GbTabs` — segmented Cari Nama / Pindai QR switch; tabs are real routes.
export function GuestbookTabs({ active = "search", compact = false }: { active?: "search" | "qr"; compact?: boolean }) {
  const tabs = [
    { id: "search" as const, l: "Cari Nama", icon: "search" as const, href: "/guestbook/search" },
    { id: "qr" as const, l: "Pindai QR", icon: "qr" as const, href: "/guestbook/qr" },
  ];
  return (
    <div className="inline-flex gap-1 bg-charcoal/5 border border-beige rounded-full p-1">
      {tabs.map((tab) => {
        const on = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "rounded-full font-body font-semibold text-[12px] tracking-[0.16em] uppercase",
              "inline-flex items-center gap-[10px] no-underline",
              compact ? "px-6 py-[10px]" : "px-[30px] py-[13px]",
              on ? "text-cream bg-charcoal" : "text-charcoal bg-transparent",
            )}
          >
            <Icon name={tab.icon} size={14} />
            {tab.l}
          </Link>
        );
      })}
    </div>
  );
}

// `GbCounter` — live attendance chip in the header.
export function GuestbookCounter({ now = 142, total = 280 }: { now?: number; total?: number }) {
  return (
    <div className="inline-flex items-center gap-[10px] bg-charcoal text-cream pl-[13px] pr-4 py-2 rounded-full">
      <span className="w-2 h-2 rounded-full bg-[#4DD891] animate-dot-pulse" />
      <span className="font-body text-[9.5px] tracking-[0.22em] uppercase font-semibold text-peach">Hadir</span>
      <span className="font-display font-bold text-[16px] tracking-[-0.02em] text-cream">
        {now} <span className="opacity-50 font-normal">/ {total}</span>
      </span>
    </div>
  );
}

// `GbKeyboard` — static on-screen qwerty for the search screen.
export function GuestbookKeyboard() {
  const rows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];
  const keyBase =
    "h-[50px] bg-paper border border-line rounded-[10px] font-body font-medium text-[18px] text-charcoal cursor-pointer uppercase shadow-[0_1px_0_rgba(26,26,26,0.08)]";
  const fnKey = "text-[10.5px] font-semibold tracking-[0.2em] text-muted-ink normal-case";
  return (
    <div className="flex flex-col items-center gap-[7px]">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-[7px]">
          {row.map((k) => (
            <button key={k} className={cn(keyBase, "w-[58px]")}>
              {k}
            </button>
          ))}
          {ri === 2 && (
            <button
              className={cn(
                keyBase,
                "w-[122px] bg-charcoal text-cream border-none text-[10.5px] font-semibold tracking-[0.2em]",
                "inline-flex items-center justify-center gap-2",
              )}
            >
              <Icon name="x" size={12} />
              Hapus
            </button>
          )}
        </div>
      ))}
      <div className="flex gap-[7px]">
        <button className={cn(keyBase, fnKey, "w-[116px] h-[46px]")}>123</button>
        <button className={cn(keyBase, fnKey, "w-[410px] h-[46px]")}>Spasi</button>
        <button className={cn(keyBase, "w-[116px] h-[46px] bg-burgundy text-cream border-none text-[16px]")}>↵</button>
      </div>
    </div>
  );
}

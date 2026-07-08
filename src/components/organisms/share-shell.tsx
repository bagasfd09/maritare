"use client";

// Shared chrome for the family access pages (/kirim/tamu and /kirim): branded
// sticky header with the 1-hour countdown + logout, ambient floral decoration
// (same signature as the kiosk/share logins), and a two-tab bottom nav
// mirroring the customer mobile dashboard shell.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Logo } from "@/components/atoms/logo";
import { cn } from "@/lib/utils";
import { endShareSession } from "@/server/actions/share";

export type ShareTab = "tamu" | "kirim";

const TABS: { key: ShareTab; href: string; icon: IconName; label: string }[] = [
  { key: "tamu", href: "/kirim/tamu", icon: "users", label: "Tamu" },
  { key: "kirim", href: "/kirim", icon: "wa", label: "Kirim" },
];

function mmss(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ShareShell({
  active,
  expiresAtMs,
  children,
}: {
  active: ShareTab;
  expiresAtMs: number;
  children: React.ReactNode;
}) {
  const router = useRouter();
  // null until mounted — Date.now() at render would differ between the SSR
  // pass and hydration, so the first real value comes from the effect.
  const [remaining, setRemaining] = useState<number | null>(null);

  // 1-second countdown. Past zero the interval stays alive and keeps polling
  // refresh (every 3rd tick) until the SERVER agrees the session is dead and
  // redirects — a client clock ahead of the server would otherwise strand the
  // page frozen at 00:00. Navigation unmounts us, which clears the interval.
  useEffect(() => {
    let ticksPastZero = 0;
    const tick = () => {
      const left = expiresAtMs - Date.now();
      setRemaining(left);
      if (left <= 0 && ticksPastZero++ % 3 === 0) {
        router.refresh();
      }
    };
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, [expiresAtMs, router]);

  const lowTime = remaining !== null && remaining <= 5 * 60 * 1000;

  return (
    <div className="relative min-h-screen w-full bg-cream text-charcoal font-body">
      {/* Ambient floral decoration — fixed so it doesn't scroll with content. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-[-150px] bottom-[-170px] animate-gb-spin-slow">
          <FlowerMark size={460} color="rgba(176,74,58,0.05)" core="rgba(176,74,58,0.05)" stamen="transparent" />
        </div>
        <div className="absolute left-[-180px] top-[-200px] animate-gb-spin-slow [animation-direction:reverse] [animation-duration:150s]">
          <FlowerMark size={360} color="rgba(124,45,45,0.04)" core="rgba(124,45,45,0.04)" stamen="transparent" />
        </div>
      </div>

      {/* Sticky header: logo + countdown + logout — identity lives in each
          page's heading so the bar stays clean on small screens. */}
      <header className="sticky top-0 z-20 bg-paper/95 backdrop-blur border-b border-line">
        <div className="max-w-[560px] mx-auto px-5 py-3 flex items-center gap-3">
          <Logo size={22} />
          <FlowerMark size={13} />
          <div className="flex-1" />
          <span
            className={cn(
              "inline-flex items-center gap-1 px-3 py-[6px] rounded-full text-[12px] font-semibold tabular-nums",
              lowTime ? "bg-peach text-burgundy-dark" : "bg-cream text-charcoal border border-line",
            )}
          >
            <Icon name="calendar" size={12} />
            {remaining === null ? "--:--" : mmss(remaining)}
          </span>
          <form action={endShareSession}>
            <button
              type="submit"
              title="Keluar"
              className="w-8 h-8 rounded-full inline-flex items-center justify-center text-muted-ink hover:bg-cream cursor-pointer"
            >
              <Icon name="logout" size={14} />
            </button>
          </form>
        </div>
      </header>

      <main className="relative z-10 max-w-[560px] mx-auto px-5 py-5 pb-[110px]">{children}</main>

      {/* Bottom tab bar — same styling as the customer mobile shell. */}
      <nav className="fixed inset-x-0 bottom-0 z-20 bg-paper/95 backdrop-blur border-t border-beige shadow-[0_-12px_30px_-22px_rgba(62,20,20,0.4)]">
        <div className="max-w-[560px] mx-auto flex items-end justify-around px-2 pt-[10px] pb-[calc(12px+env(safe-area-inset-bottom))]">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 pt-1 no-underline",
                active === t.key ? "text-burgundy" : "text-faint",
              )}
            >
              <Icon name={t.icon} size={22} strokeWidth={active === t.key ? 1.9 : 1.6} />
              <span className="text-[9.5px] tracking-[0.04em] font-semibold">{t.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

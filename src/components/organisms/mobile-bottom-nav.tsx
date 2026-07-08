"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/atoms/icon";
import { CircleButton } from "@/components/atoms/circle-button";
import { logout } from "@/server/actions/auth";

export type MobileNavKey =
  | "beranda" | "editor" | "tamu" | "template" | "ucapan"
  | "galeri" | "amplop" | "tagihan" | "pengaturan"
  | "petugas" | "akses-keluarga";

const ROUTES: Record<MobileNavKey, string> = {
  beranda: "/dashboard",
  editor: "/dashboard/editor",
  tamu: "/dashboard/guests",
  template: "/dashboard/templates",
  ucapan: "/dashboard/wishes",
  galeri: "/dashboard/gallery",
  amplop: "/dashboard/envelope",
  tagihan: "/dashboard/billing",
  pengaturan: "/dashboard/settings",
  petugas: "/dashboard/petugas",
  "akses-keluarga": "/dashboard/akses-keluarga",
};

// menus that live inside the "Lainnya" overflow sheet
const MORE: { key: MobileNavKey; icon: IconName; title: string; sub: string }[] = [
  { key: "template", icon: "template", title: "Galeri Template", sub: "Ganti tema undangan" },
  { key: "galeri", icon: "image", title: "Galeri Foto", sub: "18 dari 30 foto" },
  { key: "petugas", icon: "users", title: "Petugas Resepsi", sub: "Token penjaga buku tamu" },
  { key: "akses-keluarga", icon: "share", title: "Akses Keluarga", sub: "Keluarga ikut sebar undangan" },
  { key: "tagihan", icon: "card", title: "Tagihan & Paket", sub: "Paket Gold aktif" },
  { key: "pengaturan", icon: "settings", title: "Pengaturan", sub: "Akun, domain, notifikasi" },
];
const MORE_KEYS = MORE.map((m) => m.key);

function NavTab({
  navKey,
  icon,
  label,
  badge,
  active,
}: {
  navKey: MobileNavKey;
  icon: IconName;
  label: string;
  badge?: string;
  active: boolean;
}) {
  return (
    <Link
      href={ROUTES[navKey]}
      className={cn(
        "flex-1 flex flex-col items-center gap-1 pt-1 relative no-underline",
        active ? "text-burgundy" : "text-faint",
      )}
    >
      {badge && (
        <span className="absolute -top-[2px] left-1/2 ml-[6px] bg-terracotta text-white text-[9px] font-bold leading-none px-[5px] py-[2px] rounded-full">
          {badge}
        </span>
      )}
      <Icon name={icon} size={22} strokeWidth={active ? 1.9 : 1.6} />
      <span className="text-[9.5px] tracking-[0.04em] font-semibold">{label}</span>
    </Link>
  );
}

// `.m-nav` + `.m-sheet` — bottom tab bar with the "Lainnya" overflow sheet.
export function MobileBottomNav({ active }: { active: MobileNavKey }) {
  const [sheet, setSheet] = useState(false);
  const [pending, startTransition] = useTransition();
  const moreActive = MORE_KEYS.includes(active);

  return (
    <>
      <nav className="shrink-0 relative flex items-end justify-around px-2 pt-[10px] pb-[calc(12px+env(safe-area-inset-bottom))] bg-paper border-t border-beige shadow-[0_-12px_30px_-22px_rgba(62,20,20,0.4)]">
        <NavTab navKey="beranda" icon="home" label="Beranda" active={active === "beranda"} />
        <NavTab navKey="tamu" icon="users" label="Tamu" active={active === "tamu"} />
        <Link
          href={ROUTES.editor}
          aria-label="Editor undangan"
          className={cn(
            "shrink-0 w-14 h-14 rounded-full text-cream border-4 border-ivory flex items-center justify-center -mt-[26px] shadow-[0_12px_24px_-8px_rgba(124,45,45,0.6)] no-underline",
            active === "editor" ? "bg-burgundy-deep" : "bg-burgundy",
          )}
        >
          <Icon name="edit" size={22} strokeWidth={1.9} />
        </Link>
        <NavTab navKey="ucapan" icon="heart" label="Ucapan" badge="5" active={active === "ucapan"} />
        <button
          type="button"
          onClick={() => setSheet(true)}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 pt-1 relative bg-transparent border-0 cursor-pointer",
            moreActive ? "text-burgundy" : "text-faint",
          )}
        >
          <Icon name="more" size={22} strokeWidth={moreActive ? 2.4 : 2} />
          <span className="text-[9.5px] tracking-[0.04em] font-semibold">Lainnya</span>
        </button>
      </nav>

      {sheet && (
        <div
          className="absolute inset-0 z-20 bg-[rgba(30,16,16,0.42)] flex items-end animate-scrim-in"
          onClick={() => setSheet(false)}
        >
          <div
            className="w-full bg-paper rounded-t-[26px] px-[18px] pt-[10px] pb-[calc(22px+env(safe-area-inset-bottom))] animate-sheet-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-rule mt-1 mb-4 mx-auto" />
            <div className="flex items-center justify-between px-[6px] pb-2">
              <div className="font-display font-extrabold [font-variation-settings:'opsz'_60] text-xl tracking-[-0.02em]">
                Menu <em className="italic font-normal text-burgundy">lainnya.</em>
              </div>
              <CircleButton size={32} onClick={() => setSheet(false)}>
                <Icon name="x" size={15} />
              </CircleButton>
            </div>
            {MORE.map((m) => (
              <Link
                key={m.key}
                href={ROUTES[m.key]}
                className="flex items-center gap-[14px] py-[13px] px-[6px] border-b border-line last:border-b-0 no-underline text-charcoal"
              >
                <span
                  className={cn(
                    "w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0",
                    active === m.key ? "bg-burgundy text-cream" : "bg-sage-soft text-[#2E3325]",
                  )}
                >
                  <Icon name={m.icon} size={18} />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{m.title}</div>
                  <div className="text-[11px] text-muted-ink mt-px">{m.sub}</div>
                </div>
                <Icon name="chevron-r" size={16} stroke="var(--color-faint)" />
              </Link>
            ))}
            <button
              type="button"
              title="Keluar"
              disabled={pending}
              onClick={() => startTransition(() => logout())}
              className="flex items-center gap-[14px] w-full py-[13px] px-[6px] border-b border-line last:border-b-0 bg-transparent text-left text-burgundy disabled:opacity-60"
            >
              <span className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0 bg-[rgba(124,45,45,0.1)] text-burgundy">
                <Icon name="logout" size={18} />
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold">Keluar</div>
                <div className="text-[11px] text-muted-ink mt-px">Akhiri sesi kamu</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

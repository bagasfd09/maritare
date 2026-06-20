"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/atoms/icon";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { Avatar } from "@/components/atoms/avatar";
import { AdminStatus, PkgBadge } from "@/components/molecules/admin-badges";
import {
  AdminMobileBtnMini,
  AdminMobileCard,
  AdminMobileHead,
  AdminMobileSecLabel,
} from "@/components/molecules/admin-mobile-primitives";
import { AdminMobileTabBar } from "@/components/organisms/admin-mobile-tabbar";
import type {
  AdminOverview as AdminOverviewData,
  AdminTransactionRow,
  AdminUser,
} from "@/server/queries/admin";
import { rupiahShort } from "@/lib/format";
import { logout } from "@/server/actions/auth";

// `.m-link` classes on a real next/link Link (the design's `go("...")` anchors).
const LINK_CLS = "text-[11px] text-burgundy font-bold tracking-[0.06em] uppercase no-underline";

// App bar round icon button (local copy of the shared app bar's styling so this
// screen can wire interactions without touching the shared organism).
const ICON_BTN_CLS =
  "w-[38px] h-[38px] rounded-full border border-beige bg-transparent inline-flex items-center justify-center text-charcoal cursor-pointer";

// Avatar tone cycle, matching the design's AV constant.
const AV = ["peach", "sage", "blush", "burgundy", "dark"] as const;

type TransactionStatus = AdminTransactionRow["status"];

// Status → leading icon square styling for the transactions list (data-driven → inline style).
const TX_ICON: Record<TransactionStatus, { bg: string; color: string; icon: IconName }> = {
  paid: { bg: "rgba(77,216,145,0.15)", color: "#1c5a36", icon: "check" },
  failed: { bg: "rgba(124,45,45,0.12)", color: "var(--color-burgundy)", icon: "x" },
  refunded: { bg: "var(--color-cream)", color: "var(--color-muted-ink)", icon: "arrow-d" },
  pending: { bg: "var(--color-peach)", color: "var(--color-terracotta)", icon: "card" },
};

type Notif = { id: string; icon: IconName; title: string; desc: string };

// Key/value line inside an expanded card drawer.
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[9px] text-muted-ink tracking-[0.18em] uppercase font-semibold shrink-0">{label}</span>
      <span className="text-[11.5px] font-semibold text-charcoal text-right min-w-0 truncate">{children}</span>
    </div>
  );
}

type AdminOverviewMobileProps = {
  data: AdminOverviewData;
  adminUser: AdminUser | null;
};

// Admin mobile 01 · Beranda — KPIs, recent activity and system status from real
// data. The shell markup is replicated locally (byte-identical classes to
// AdminMobileShell/AdminMobileAppBar) so the app-bar actions can be wired up
// without editing shared organisms.
export function AdminOverviewMobile({ data, adminUser }: AdminOverviewMobileProps) {
  // App bar overlays.
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifsRead, setNotifsRead] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, startLogout] = useTransition();
  // Row drawers.
  const [openWeddingId, setOpenWeddingId] = useState<string | null>(null);
  const [openTxId, setOpenTxId] = useState<string | null>(null);

  const { recentWeddings, recentTransactions } = data;
  const txList = recentTransactions.slice(0, 4);

  const weddingMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = recentWeddings.slice(0, 4);
    if (!q) return base;
    return recentWeddings.filter(
      (w) =>
        w.couple.toLowerCase().includes(q) ||
        w.city.toLowerCase().includes(q) ||
        w.customer.toLowerCase().includes(q),
    );
  }, [query, recentWeddings]);
  const visibleWeddings = weddingMatches.slice(0, 4);

  const notifs = useMemo<Notif[]>(() => {
    const list: Notif[] = [];
    for (const t of txList) {
      if (t.status === "pending") {
        list.push({
          id: `tx-${t.id}`,
          icon: "card",
          title: `${t.couple} – konfirmasi pembayaran manual`,
          desc: `${t.method} · ${t.time}`,
        });
      }
    }
    return list;
  }, [txList]);

  const greetingName = adminUser?.name ?? "Admin";
  const profileInitials = adminUser?.initials ?? "AD";

  const anyOverlay = searchOpen || notifsOpen || profileOpen;

  const closeOverlays = () => {
    setSearchOpen(false);
    setQuery("");
    setNotifsOpen(false);
    setProfileOpen(false);
  };

  const toggleSearch = () => {
    if (searchOpen) {
      setSearchOpen(false);
      setQuery("");
    } else {
      setSearchOpen(true);
      setNotifsOpen(false);
      setProfileOpen(false);
    }
  };

  const toggleNotifs = () => {
    if (notifsOpen) {
      setNotifsOpen(false);
    } else {
      setNotifsOpen(true);
      setNotifsRead(true);
      setSearchOpen(false);
      setQuery("");
      setProfileOpen(false);
    }
  };

  const toggleProfile = () => {
    if (profileOpen) {
      setProfileOpen(false);
    } else {
      setProfileOpen(true);
      setSearchOpen(false);
      setQuery("");
      setNotifsOpen(false);
    }
  };

  return (
    <div className="lg:hidden min-h-dvh bg-[#d9d2c6] flex items-center justify-center font-body text-charcoal">
      <div className="w-full max-w-[420px] h-dvh max-h-[920px] mx-auto flex flex-col bg-ivory relative overflow-hidden shadow-[0_30px_80px_-30px_rgba(40,24,12,0.45)] min-[460px]:rounded-[28px] min-[460px]:h-[min(100dvh,900px)]">
        {/* App bar + slide-down panels */}
        <div className="relative z-40 shrink-0">
          <header className="bg-[rgba(250,246,241,0.9)] backdrop-blur-[14px] backdrop-saturate-150 border-b border-beige flex items-center justify-between px-4 py-[14px]">
            <div className="inline-flex items-center gap-2">
              <Link
                href="/admin"
                className="font-display font-extrabold text-[21px] [font-variation-settings:'opsz'_40] tracking-[-0.04em] text-charcoal lowercase no-underline inline-flex items-baseline gap-px"
              >
                maritare
                <span className="text-terracotta font-body text-[15px] -translate-y-[3px]">*</span>
              </Link>
              <span className="text-[8px] px-[7px] py-[3px] rounded bg-terracotta text-white font-bold tracking-[0.16em] uppercase">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Cari"
                aria-expanded={searchOpen}
                onClick={toggleSearch}
                className={cn(ICON_BTN_CLS, searchOpen && "bg-cream")}
              >
                <Icon name="search" size={16} />
              </button>
              <button
                type="button"
                aria-label="Notifikasi"
                aria-expanded={notifsOpen}
                onClick={toggleNotifs}
                className={cn(ICON_BTN_CLS, "relative", notifsOpen && "bg-cream")}
              >
                <Icon name="bell" size={16} />
                {!notifsRead && notifs.length > 0 && (
                  <span className="absolute top-2 right-[9px] w-[7px] h-[7px] rounded-full bg-terracotta border-[1.5px] border-ivory" />
                )}
              </button>
              <button
                type="button"
                aria-label="Profil admin"
                aria-expanded={profileOpen}
                onClick={toggleProfile}
                className="w-[38px] h-[38px] rounded-full bg-terracotta text-white inline-flex items-center justify-center font-display font-bold text-[13px] shrink-0 cursor-pointer"
              >
                {profileInitials}
              </button>
            </div>
          </header>

          {/* Slide-down search */}
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 z-50 px-4 py-3 bg-[rgba(250,246,241,0.97)] backdrop-blur-[14px] border-b border-beige shadow-[0_18px_30px_-18px_rgba(40,24,12,0.35)]">
              <div className="flex items-center gap-[9px] bg-paper border border-line rounded-full px-[15px] py-[10px]">
                <Icon name="search" size={15} stroke="var(--color-faint)" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") closeOverlays();
                  }}
                  placeholder="Cari pasangan, kota, atau email…"
                  className="flex-1 min-w-0 border-none bg-transparent outline-none font-body text-[13px] text-charcoal placeholder:text-faint"
                />
                {query !== "" && (
                  <button
                    type="button"
                    aria-label="Hapus pencarian"
                    onClick={() => setQuery("")}
                    className="bg-transparent text-faint cursor-pointer inline-flex items-center"
                  >
                    <Icon name="x" size={13} />
                  </button>
                )}
              </div>
              {query.trim() !== "" && (
                <div className="px-1 pt-2 text-[10.5px] text-muted-ink font-display italic">
                  {weddingMatches.length} undangan cocok — cek bagian “Undangan baru”
                </div>
              )}
            </div>
          )}

          {/* Slide-down notifications */}
          {notifsOpen && (
            <div className="absolute top-full left-0 right-0 z-50 bg-[rgba(250,246,241,0.97)] backdrop-blur-[14px] border-b border-beige shadow-[0_18px_30px_-18px_rgba(40,24,12,0.35)]">
              <div className="px-[18px] pt-3 pb-1 text-[10px] text-muted-ink tracking-[0.22em] uppercase font-semibold">
                Notifikasi
              </div>
              {notifs.length === 0 ? (
                <div className="px-[18px] pt-2 pb-4 font-display italic text-[12.5px] text-muted-ink">
                  Tidak ada notifikasi baru. Semua beres!
                </div>
              ) : (
                notifs.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setNotifsOpen(false)}
                    className="flex items-start gap-3 w-full px-[18px] py-3 bg-transparent text-left cursor-pointer border-b border-line last:border-b-0"
                  >
                    <span className="w-[30px] h-[30px] rounded-[9px] shrink-0 inline-flex items-center justify-center bg-peach text-terracotta">
                      <Icon name={n.icon} size={14} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-semibold text-charcoal">{n.title}</div>
                      <div className="text-[10.5px] text-muted-ink mt-[2px]">{n.desc}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Profile mini-sheet */}
          {profileOpen && (
            <div className="absolute top-[calc(100%+8px)] right-3 z-50 w-[240px] bg-paper border border-line rounded-[16px] shadow-[0_24px_48px_-20px_rgba(40,24,12,0.45)] p-4">
              <div className="flex items-center gap-3">
                <span className="w-[42px] h-[42px] rounded-full bg-terracotta text-white inline-flex items-center justify-center font-display font-bold text-[14px] shrink-0">
                  {profileInitials}
                </span>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold text-charcoal truncate">{greetingName}</div>
                  <div className="text-[10px] text-terracotta tracking-[0.14em] uppercase font-bold mt-px">
                    {adminUser?.roleLabel ?? "Admin"}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-muted-ink mt-[10px] pb-3 border-b border-line truncate">
                {adminUser?.email ?? "—"}
              </div>
              <AdminMobileBtnMini
                type="button"
                disabled={loggingOut}
                onClick={() => startLogout(() => logout())}
                className="w-full mt-3 border-burgundy bg-[rgba(124,45,45,0.08)] text-burgundy disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loggingOut ? "Keluar…" : "Keluar"}
              </AdminMobileBtnMini>
            </div>
          )}
        </div>

        {/* Tap-away backdrop for app-bar overlays */}
        {anyOverlay && <div aria-hidden="true" className="absolute inset-0 z-[35]" onClick={closeOverlays} />}

        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <AdminMobileHead eyebrow="Ringkasan platform" title={`Halo, ${greetingName}.`} />

          {/* Revenue hero */}
          <div className="mx-[18px] mt-[14px] bg-charcoal text-cream rounded-[18px] px-5 pt-5 pb-[18px] relative overflow-hidden">
            <div className="absolute -top-7 -right-7 w-[120px] h-[120px] opacity-[0.07]">
              <FlowerMark size={120} color="var(--color-peach)" core="var(--color-peach)" stamen="var(--color-terracotta)" />
            </div>
            <div className="relative z-[2]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-peach tracking-[0.22em] uppercase font-semibold">Revenue · bulan ini</span>
              </div>
              <div className="font-display font-extrabold text-[46px] leading-none tracking-[-0.035em] text-peach mt-3">
                {rupiahShort(data.revenueThisMonth)}
              </div>
              <div className="font-display italic text-[13px] text-[rgba(245,239,230,0.7)] mt-1">
                Hari ini: {rupiahShort(data.revenueToday)}
              </div>
            </div>
          </div>

          {/* KPI 2x2 */}
          <div className="grid grid-cols-2 gap-[10px] px-[18px] pt-3">
            <AdminMobileCard className="px-[14px] pt-[14px] pb-[13px]">
              <div className="flex items-center justify-between mb-[10px]">
                <span className="text-[9px] text-muted-ink tracking-[0.18em] uppercase font-semibold">Undangan aktif</span>
                <Icon name="users" size={13} stroke="var(--color-faint)" />
              </div>
              <div className="font-display font-extrabold text-[30px] leading-none tracking-[-0.03em] text-charcoal">
                {data.weddingsLive}
              </div>
              <div className="text-[10px] text-muted-ink font-display italic mt-[5px]">dari {data.weddingsTotal} undangan</div>
            </AdminMobileCard>

            <AdminMobileCard className="px-[14px] pt-[14px] pb-[13px]">
              <div className="flex items-center justify-between mb-[10px]">
                <span className="text-[9px] text-muted-ink tracking-[0.18em] uppercase font-semibold">Signup baru</span>
                <Icon name="sparkle" size={13} stroke="var(--color-faint)" />
              </div>
              <div className="font-display font-extrabold text-[30px] leading-none tracking-[-0.03em] text-charcoal">
                {data.signupsThisWeek}
              </div>
              <div className="text-[10px] text-muted-ink font-display italic mt-[5px]">minggu ini</div>
            </AdminMobileCard>

            <AdminMobileCard className="px-[14px] pt-[14px] pb-[13px]">
              <div className="flex items-center justify-between mb-[10px]">
                <span className="text-[9px] text-muted-ink tracking-[0.18em] uppercase font-semibold">Konversi</span>
                <Icon name="arrow-ur" size={13} stroke="var(--color-faint)" />
              </div>
              <div className="font-display font-extrabold text-[30px] leading-none tracking-[-0.03em] text-charcoal">
                {data.conversionPct}%
              </div>
              <div className="text-[10px] text-muted-ink font-display italic mt-[5px]">live / total</div>
            </AdminMobileCard>

            <AdminMobileCard className="px-[14px] pt-[14px] pb-[13px]">
              <div className="flex items-center justify-between mb-[10px]">
                <span className="text-[9px] text-muted-ink tracking-[0.18em] uppercase font-semibold">Support open</span>
                <Icon name="bell" size={13} stroke={data.supportOpen > 0 ? "var(--color-terracotta)" : "var(--color-faint)"} />
              </div>
              <div
                className={cn(
                  "font-display font-extrabold text-[30px] leading-none tracking-[-0.03em]",
                  data.supportOpen > 0 ? "text-terracotta" : "text-charcoal",
                )}
              >
                {data.supportOpen}
              </div>
              <div className="text-[10px] text-muted-ink font-display italic mt-[5px]">tiket aktif</div>
            </AdminMobileCard>
          </div>

          {/* Recent weddings */}
          <AdminMobileSecLabel
            action={
              <Link href="/admin/weddings" className={LINK_CLS}>
                Semua →
              </Link>
            }
          >
            Undangan baru
          </AdminMobileSecLabel>
          <div className="px-[18px] flex flex-col gap-2">
            {visibleWeddings.map((w, i) => {
              const open = openWeddingId === w.id;
              return (
                <AdminMobileCard key={w.id}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenWeddingId(open ? null : w.id)}
                    className="w-full px-[14px] py-3 flex items-center gap-3 bg-transparent text-left cursor-pointer"
                  >
                    <Avatar tone={AV[i % 5]} size={36} className="text-[12px]">
                      {w.couple.split(" & ").map((p) => p[0]).join("")}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[13.5px] text-charcoal">{w.couple}</div>
                      <div className="text-[10.5px] text-muted-ink mt-[2px]">
                        {w.city} · {w.date}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-[5px]">
                      <AdminStatus status={w.status} />
                      <span className="font-display font-bold text-[12.5px]">
                        {w.paid ? rupiahShort(w.paid) : <span className="text-faint">—</span>}
                      </span>
                    </div>
                  </button>
                  {open && (
                    <div className="mx-[14px] pt-[10px] pb-3 border-t border-line flex flex-col gap-[7px]">
                      <DetailRow label="Slug">/inv/{w.slug}</DetailRow>
                      <DetailRow label="Template">{w.template}</DetailRow>
                      <DetailRow label="Paket">
                        <PkgBadge pkg={w.pkg} />
                      </DetailRow>
                      <DetailRow label="Customer">{w.customer}</DetailRow>
                    </div>
                  )}
                </AdminMobileCard>
              );
            })}
            {visibleWeddings.length === 0 && (
              <AdminMobileCard className="px-[14px] py-4">
                <div className="text-[12px] text-muted-ink font-display italic text-center">
                  {query.trim() !== "" ? "Tidak ada undangan yang cocok dengan pencarianmu." : "Belum ada data"}
                </div>
              </AdminMobileCard>
            )}
          </div>

          {/* Recent transactions */}
          <AdminMobileSecLabel
            action={
              <Link href="/admin/orders" className={LINK_CLS}>
                Semua →
              </Link>
            }
          >
            Transaksi terakhir
          </AdminMobileSecLabel>
          <div className="px-[18px] flex flex-col gap-2">
            {txList.map((t) => {
              const open = openTxId === t.id;
              return (
                <AdminMobileCard key={t.id}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenTxId(open ? null : t.id)}
                    className="w-full px-[14px] py-3 flex items-center gap-3 bg-transparent text-left cursor-pointer"
                  >
                    <div
                      className="w-[34px] h-[34px] rounded-[9px] shrink-0 flex items-center justify-center"
                      style={{ background: TX_ICON[t.status].bg, color: TX_ICON[t.status].color }}
                    >
                      <Icon name={TX_ICON[t.status].icon} size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-charcoal">
                        {t.couple} · {t.pkg}
                      </div>
                      <div className="text-[10px] text-muted-ink mt-[2px]">
                        {t.method} · {t.time}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "font-display font-bold text-[13px]",
                        t.status === "refunded" ? "text-muted-ink line-through" : "text-charcoal",
                      )}
                    >
                      {rupiahShort(t.amount)}
                    </div>
                  </button>
                  {open && (
                    <div className="mx-[14px] pt-[10px] pb-3 border-t border-line flex flex-col gap-[7px]">
                      <DetailRow label="ID transaksi">{t.id}</DetailRow>
                      <DetailRow label="Customer">{t.customer}</DetailRow>
                      <DetailRow label="Metode">{t.method}</DetailRow>
                      <DetailRow label="Status">
                        <AdminStatus status={t.status} />
                      </DetailRow>
                    </div>
                  )}
                </AdminMobileCard>
              );
            })}
            {txList.length === 0 && (
              <AdminMobileCard className="px-[14px] py-4">
                <div className="text-[12px] text-muted-ink font-display italic text-center">
                  Belum ada data
                </div>
              </AdminMobileCard>
            )}
          </div>
        </main>

        <AdminMobileTabBar active="overview" />
      </div>
    </div>
  );
}

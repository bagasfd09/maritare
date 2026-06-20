"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import { ProgressBar } from "@/components/atoms/progress-bar";
import { AdminStatus } from "@/components/molecules/admin-badges";
import {
  AdminMobileCard,
  AdminMobileChip,
  AdminMobileHead,
  AdminMobileIconMini,
  AdminMobileSecLabel,
  AdminMobileTag,
} from "@/components/molecules/admin-mobile-primitives";
import { AdminMobileTabBar } from "@/components/organisms/admin-mobile-tabbar";
import { AdminPackageForm } from "@/components/molecules/admin-package-form";
import { rupiah, rupiahShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deletePromo, togglePromo } from "@/server/actions/promo";
import type { AdminPackageRow, AdminPromoRow } from "@/server/queries/admin";

// Admin mobile screen 5 · Paket & Promo. Ports the design's M_Packages 1:1, now
// backed by REAL data passed in from the server page: packages + promos render
// from props, the app-bar search filters both lists, and each promo can be
// toggled active/inactive or deleted via Server Actions (router.refresh on
// success). Packages support create (the "+ Paket baru" entry), per-card edit,
// and a revenue view (sold × price) via the shared AdminPackageForm + modal.
//
// Note: the shell + app bar markup from AdminMobileShell/AdminMobileAppBar is
// replicated locally (1:1 classes) because the shared app bar exposes no
// onClick props for its search/bell buttons and shared files must not change.

export function AdminPackagesMobile({
  packages,
  promos,
}: {
  packages: AdminPackageRow[];
  promos: AdminPromoRow[];
}) {
  const [promoMenu, setPromoMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const shownPackages = useMemo(
    () =>
      q
        ? packages.filter(
            (p) => p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q),
          )
        : packages,
    [packages, q],
  );
  const shownPromos = useMemo(
    () =>
      q
        ? promos.filter(
            (p) => p.code.toLowerCase().includes(q) || p.scope.toLowerCase().includes(q),
          )
        : promos,
    [promos, q],
  );

  // Subtitle counts derive from the real data.
  const activePkgCount = packages.filter((p) => p.active).length;
  const activePromoCount = promos.filter((p) => p.status === "active").length;

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <div className="lg:hidden min-h-dvh bg-[#d9d2c6] flex items-center justify-center font-body text-charcoal">
      <div className="w-full max-w-[420px] h-dvh max-h-[920px] mx-auto flex flex-col bg-ivory relative overflow-hidden shadow-[0_30px_80px_-30px_rgba(40,24,12,0.45)] min-[460px]:rounded-[28px] min-[460px]:h-[min(100dvh,900px)]">
        {/* App bar — local 1:1 copy of AdminMobileAppBar so search/bell get onClick. */}
        <header className="shrink-0 z-30 bg-[rgba(250,246,241,0.9)] backdrop-blur-[14px] backdrop-saturate-150 border-b border-beige flex items-center justify-between px-4 py-[14px]">
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
              aria-label="Cari"
              onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
              className="w-[38px] h-[38px] rounded-full border border-beige bg-transparent inline-flex items-center justify-center text-charcoal cursor-pointer"
            >
              <Icon name="search" size={16} />
            </button>
            <span className="w-[38px] h-[38px] rounded-full bg-terracotta text-white inline-flex items-center justify-center font-display font-bold text-[13px] shrink-0">
              RP
            </span>
          </div>
        </header>

        {/* Search bar — slides over the app bar, filters both lists live. */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-0 z-[35] bg-ivory border-b border-beige flex items-center gap-2 px-4 py-3">
            <div className="flex items-center gap-[9px] bg-paper border border-line rounded-full px-[15px] py-[10px] flex-1">
              <Icon name="search" size={15} stroke="var(--color-faint)" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari paket atau kode promo…"
                className="flex-1 min-w-0 border-none bg-transparent outline-none font-body text-[13px] text-charcoal placeholder:text-faint"
              />
            </div>
            <button
              aria-label="Tutup pencarian"
              onClick={closeSearch}
              className="w-8 h-8 rounded-full shrink-0 border border-beige bg-transparent inline-flex items-center justify-center text-charcoal cursor-pointer"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <AdminMobileHead
            eyebrow="Paket & promo"
            title="Paket & promo"
            sub={`${activePkgCount} paket aktif · ${activePromoCount} promo aktif`}
          />

          <div className="flex items-center justify-between pr-[18px]">
            <AdminMobileSecLabel>i. Paket harga</AdminMobileSecLabel>
            <AdminPackageForm mode="create" />
          </div>
          <div className="px-[18px] flex flex-col gap-3">
            {packages.length === 0 && (
              <div className="font-display italic text-[12.5px] text-muted-ink px-1 py-2">
                Belum ada paket.
              </div>
            )}
            {packages.length > 0 && q && shownPackages.length === 0 && (
              <div className="font-display italic text-[12.5px] text-muted-ink px-1 py-2">
                Nggak ada paket yang cocok dengan pencarianmu.
              </div>
            )}
            {shownPackages.map((p) => (
              <PackageMobileCard key={p.id} pkg={p} />
            ))}
          </div>

          <AdminMobileSecLabel>ii. Kode promo</AdminMobileSecLabel>
          <div className="px-[18px] flex flex-col gap-2">
            {promos.length === 0 && (
              <div className="font-display italic text-[12.5px] text-muted-ink px-1 py-2">
                Belum ada promo. Tambah promo pertamamu.
              </div>
            )}
            {promos.length > 0 && q && shownPromos.length === 0 && (
              <div className="font-display italic text-[12.5px] text-muted-ink px-1 py-2">
                Nggak ada kode promo yang cocok dengan pencarianmu.
              </div>
            )}
            {shownPromos.map((p) => (
              <PromoMobileCard
                key={p.id}
                promo={p}
                open={promoMenu === p.id}
                onToggleMenu={() => setPromoMenu(promoMenu === p.id ? null : p.id)}
              />
            ))}
          </div>
        </main>

        <AdminMobileTabBar active="packages" />
      </div>
    </div>
  );
}

// One pricing tier card on mobile. The featured tier flips to the dark charcoal
// surface with the peach flower watermark; deactivated tiers dim. The bottom row
// carries the real Edit (shared form) + Revenue (sold × price modal) controls.
function PackageMobileCard({ pkg: p }: { pkg: AdminPackageRow }) {
  const [revenueOpen, setRevenueOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-2xl pt-[18px] px-[18px] pb-4 relative overflow-hidden",
        p.featured ? "bg-charcoal text-cream" : "bg-paper text-charcoal border border-line",
        !p.active && "opacity-60",
      )}
    >
      {p.featured && (
        <div className="absolute -top-[26px] -right-[26px] w-[110px] h-[110px] opacity-[0.08]">
          <FlowerMark size={110} color="var(--color-peach)" core="var(--color-peach)" stamen="var(--color-terracotta)" />
        </div>
      )}
      <div className="relative z-[2]">
        <div className="flex items-center justify-between">
          <div className={cn("font-display italic text-[12.5px]", p.featured ? "text-peach" : "text-burgundy")}>
            {p.tagline || "—"}
          </div>
          {!p.active ? (
            <AdminMobileTag>Nonaktif</AdminMobileTag>
          ) : (
            p.featured && <AdminMobileTag tone="terra">★ Featured</AdminMobileTag>
          )}
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <div className={cn("font-display font-extrabold text-[26px] tracking-[-0.02em]", p.featured ? "text-peach" : "text-charcoal")}>
            {p.name}
          </div>
          <div className={cn("font-display font-extrabold text-[28px] tracking-[-0.025em]", p.featured ? "text-cream" : "text-charcoal")}>
            {rupiahShort(p.price)}
          </div>
        </div>
        <div
          className={cn(
            "text-[9.5px] tracking-[0.16em] uppercase font-semibold mt-1",
            p.featured ? "text-[rgba(245,239,230,0.55)]" : "text-muted-ink",
          )}
        >
          {p.days} hari · {p.guests === -1 ? "unlimited tamu" : `${p.guests} tamu`}
        </div>
        <ul
          className={cn(
            "list-none px-0 py-3 mt-3 mb-0 border-t",
            p.featured ? "border-[rgba(245,239,230,0.16)]" : "border-line",
          )}
        >
          {p.perks.map((perk, i) => (
            <li
              key={i}
              className={cn(
                "flex items-center gap-2 py-[3px] text-[12px]",
                p.featured ? "text-[rgba(245,239,230,0.85)]" : "text-charcoal",
              )}
            >
              <Icon name="check" size={11} stroke={p.featured ? "var(--color-peach)" : "var(--color-burgundy)"} />
              {perk}
            </li>
          ))}
        </ul>
        <div
          className={cn(
            "flex items-center justify-between pt-3 border-t",
            p.featured ? "border-[rgba(245,239,230,0.16)]" : "border-line",
          )}
        >
          <div className="flex items-baseline gap-[5px]">
            <span className={cn("font-display font-bold text-[20px]", p.featured ? "text-peach" : "text-charcoal")}>
              {p.sold}
            </span>
            <span className={cn("text-[10px]", p.featured ? "text-[rgba(245,239,230,0.55)]" : "text-muted-ink")}>
              total terjual
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AdminPackageForm mode="edit" package={p} />
            <button
              type="button"
              onClick={() => setRevenueOpen(true)}
              title={`Pendapatan ${p.name}`}
              className={cn(
                "inline-flex items-center gap-[6px] rounded-full border px-[10px] py-[5px] text-[10px] font-semibold tracking-[0.1em] uppercase cursor-pointer transition-colors",
                p.featured
                  ? "border-[rgba(245,239,230,0.25)] text-cream hover:bg-[rgba(245,239,230,0.1)]"
                  : "border-line text-charcoal hover:bg-cream",
              )}
            >
              <Icon name="card" size={11} />
              Pendapatan
            </button>
          </div>
        </div>
      </div>

      {revenueOpen && (
        <PackageRevenueModalMobile pkg={p} onClose={() => setRevenueOpen(false)} />
      )}
    </div>
  );
}

// Mobile per-package revenue modal: revenue = sold × price, plus the sold count.
function PackageRevenueModalMobile({ pkg: p, onClose }: { pkg: AdminPackageRow; onClose: () => void }) {
  const revenue = p.sold * p.price;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Pendapatan paket ${p.name}`}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(31,43,28,0.42)]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] bg-ivory rounded-t-[22px] px-4 pt-[10px] pb-[calc(20px+env(safe-area-inset-bottom))] shadow-[0_-16px_40px_-16px_rgba(40,24,12,0.4)]"
      >
        <div className="w-10 h-1 rounded-full bg-beige mt-[6px] mb-[14px] mx-auto" />
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <div className="text-[10px] tracking-[0.18em] uppercase font-semibold text-muted-ink">Pendapatan</div>
            <div className="font-display font-bold text-[16px] tracking-[-0.01em] text-charcoal">Paket {p.name}</div>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-beige bg-transparent inline-flex items-center justify-center text-charcoal cursor-pointer"
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <div className="rounded-xl bg-charcoal text-cream px-[18px] py-4 mb-3">
          <div className="text-[10px] tracking-[0.22em] uppercase font-semibold text-peach mb-[8px]">Total pendapatan</div>
          <div className="font-display font-extrabold text-[28px] leading-none tracking-[-0.02em] text-peach">
            {rupiah(revenue)}
          </div>
          <div className="text-[11px] font-display italic mt-2 text-[rgba(245,239,230,0.6)]">
            {p.sold} terjual × {rupiah(p.price)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-line px-[14px] py-3">
            <div className="text-[10px] tracking-[0.18em] uppercase font-semibold text-muted-ink mb-1">Terjual</div>
            <div className="font-display font-bold text-[20px] text-charcoal">{p.sold}</div>
          </div>
          <div className="rounded-xl border border-line px-[14px] py-3">
            <div className="text-[10px] tracking-[0.18em] uppercase font-semibold text-muted-ink mb-1">Harga satuan</div>
            <div className="font-display font-bold text-[20px] text-charcoal">{rupiahShort(p.price)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// One promo card on mobile. Owns its transition so a pending toggle/delete only
// disables this card's controls. `quota === null` renders as "∞" — never `/null`.
function PromoMobileCard({
  promo: p,
  open,
  onToggleMenu,
}: {
  promo: AdminPromoRow;
  open: boolean;
  onToggleMenu: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const pct = p.quota != null && p.quota > 0 ? Math.min(100, (p.used / p.quota) * 100) : 0;
  const isActive = p.status === "active";

  const runToggle = () => {
    startTransition(async () => {
      const result = await togglePromo({ id: p.id, active: !isActive });
      if (result.ok) {
        router.refresh();
      }
    });
  };

  const runDelete = () => {
    startTransition(async () => {
      const result = await deletePromo({ id: p.id });
      if (result.ok) {
        router.refresh();
      }
    });
  };

  return (
    <AdminMobileCard className={cn("p-[14px]", isPending && "opacity-50")}>
      <div className="flex items-center justify-between">
        <span className="font-display font-extrabold text-[14px] text-charcoal px-[11px] py-1 bg-cream border border-dashed border-rule rounded-[5px] tracking-[0.05em]">
          {p.code}
        </span>
        <span className="font-display italic text-[16px] text-burgundy">—{p.off}</span>
      </div>
      <div className="flex items-center gap-[10px] mt-3">
        <div className="flex-1">
          <div className="text-[11px] text-muted-ink">{p.scope}</div>
          <div className="flex items-center gap-2 mt-[6px]">
            <ProgressBar
              value={pct}
              height={5}
              trackClassName="bg-cream"
              fillClassName={p.status === "exhausted" ? "bg-muted-ink" : "bg-burgundy"}
            />
            <span className="text-[10.5px] font-semibold text-charcoal">
              {p.used}/{p.quota ?? "∞"}
            </span>
          </div>
        </div>
        <AdminStatus status={p.status} />
        <AdminMobileIconMini
          aria-label={`Atur promo ${p.code}`}
          aria-expanded={open}
          disabled={isPending}
          className="w-7 h-7"
          onClick={onToggleMenu}
        >
          <Icon name="more" size={13} />
        </AdminMobileIconMini>
      </div>

      {/* Promo action row — real toggle + delete via Server Actions. */}
      {open && (
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-line">
          <span className="text-[11px] text-muted-ink">Berlaku sampai {p.until}</span>
          <div className="flex items-center gap-2">
            <AdminMobileChip on={!isActive} disabled={isPending} onClick={runToggle}>
              {isActive ? "Nonaktifkan" : "Aktifkan"}
            </AdminMobileChip>
            <AdminMobileChip
              disabled={isPending}
              onClick={runDelete}
              className="border-burgundy/30 text-burgundy"
            >
              Hapus
            </AdminMobileChip>
          </div>
        </div>
      )}
    </AdminMobileCard>
  );
}

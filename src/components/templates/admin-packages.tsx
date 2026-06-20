"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/templates/admin-shell";
import { AdminTopBar } from "@/components/organisms/admin-topbar";
import { AdminStatus } from "@/components/molecules/admin-badges";
import { AdminPromoForm } from "@/components/molecules/admin-promo-form";
import { AdminPackageForm } from "@/components/molecules/admin-package-form";
import { Icon } from "@/components/atoms/icon";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { CircleButton } from "@/components/atoms/circle-button";
import { SectionNumber } from "@/components/atoms/section-number";
import { ProgressBar } from "@/components/atoms/progress-bar";
import { rupiah, rupiahShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deletePromo, togglePromo } from "@/server/actions/promo";
import {
  adminTogglePackageActive,
  adminTogglePackageFeatured,
} from "@/server/actions/package";
import type { AdminPackageRow, AdminPromoRow } from "@/server/queries/admin";

// `.d-tbl` spec — shared header/cell classes for the promo table.
const TH = "font-body text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-ink text-left px-[14px] py-3 border-b border-beige";
const TD = "p-[14px] border-b border-line align-middle";

// Admin · Paket & Promo — pricing package cards + promo code table, all from
// real data. Packages render read-only (no package mutation actions exist yet).
// Promos are live: the inline "Tambah promo" form creates rows, and each row can
// be toggled active/inactive or deleted via Server Actions; every mutation calls
// `router.refresh()` so the server-fetched lists re-render.
export function AdminPackages({
  packages,
  promos,
}: {
  packages: AdminPackageRow[];
  promos: AdminPromoRow[];
}) {
  const activePackages = packages.filter((p) => p.active).length;
  const activePromos = promos.filter((p) => p.status === "active").length;
  const exhaustedPromos = promos.filter((p) => p.status === "exhausted").length;
  const eyebrow = `${activePackages} paket aktif · ${activePromos} promo aktif · ${exhaustedPromos} promo habis`;

  return (
    <AdminShell active="packages">
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminTopBar
          crumbs={["Admin", "Paket & Promo"]}
          title="Paket & promo aktif"
          eyebrow={eyebrow}
          actions={<AdminPackageForm mode="create" />}
        />

        <div className="flex-1 overflow-y-auto px-9 py-6 flex flex-col gap-[22px]">
          {/* Packages */}
          <section>
            <SectionNumber className="text-xs mb-3">i. Paket harga</SectionNumber>
            {packages.length === 0 ? (
              <div className="bg-paper border border-line rounded-[14px] px-5 py-8 text-center text-[12px] text-muted-ink font-display italic">
                Belum ada paket.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-[14px]">
                {packages.map((p) => (
                  <PackageCard key={p.id} pkg={p} />
                ))}
              </div>
            )}
          </section>

          {/* Promos */}
          <section className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <SectionNumber className="text-xs">ii. Kode promo</SectionNumber>
            </div>
            <AdminPromoForm />
            {promos.length === 0 ? (
              <div className="bg-paper border border-line rounded-[14px] px-5 py-10 text-center text-[12px] text-muted-ink font-display italic">
                Belum ada promo. Tambah promo pertamamu.
              </div>
            ) : (
              <div className="bg-paper border border-line rounded-[14px] overflow-hidden flex-1">
                <table className="w-full border-separate border-spacing-0 text-[13px] [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:hover_td]:bg-[rgba(124,45,45,0.03)]">
                  <thead>
                    <tr className="bg-cream">
                      <th className={cn(TH, "pl-5")}>Kode</th>
                      <th className={TH}>Diskon</th>
                      <th className={TH}>Berlaku untuk</th>
                      <th className={TH}>Terpakai</th>
                      <th className={TH}>Berakhir</th>
                      <th className={TH}>Status</th>
                      <th className={cn(TH, "w-20")}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promos.map((p) => (
                      <PromoRow key={p.id} promo={p} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </AdminShell>
  );
}

// One promo table row. Owns its own transition so a pending toggle/delete only
// disables this row's controls. `quota === null` renders as "∞" — never `/ null`.
function PromoRow({ promo: p }: { promo: AdminPromoRow }) {
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
    <tr className={cn(isPending && "opacity-50")}>
      <td className={cn(TD, "pl-5")}>
        <span className="inline-block font-display font-extrabold text-[14px] text-charcoal px-3 py-1 bg-cream border border-dashed border-rule rounded-[5px] tracking-[0.06em]">
          {p.code}
        </span>
      </td>
      <td className={TD}>
        <span className="font-display italic text-[16px] text-burgundy">—{p.off}</span>
      </td>
      <td className={cn(TD, "text-xs")}>{p.scope}</td>
      <td className={TD}>
        <div className="flex items-center gap-[10px]">
          <ProgressBar
            value={pct}
            height={5}
            trackClassName="flex-none w-20 bg-cream"
            fillClassName={p.status === "exhausted" ? "bg-muted-ink" : "bg-burgundy"}
          />
          <span className="text-[11px] font-semibold text-charcoal">
            {p.used} / {p.quota ?? "∞"}
          </span>
        </div>
      </td>
      <td className={cn(TD, "text-[11px] text-muted-ink italic font-display")}>{p.until}</td>
      <td className={TD}><AdminStatus status={p.status} /></td>
      <td className={TD}>
        <div className="flex gap-1">
          <CircleButton
            size={26}
            title={isActive ? "Nonaktifkan" : "Aktifkan"}
            disabled={isPending}
            onClick={runToggle}
          >
            <Icon name={isActive ? "x" : "check"} size={11} />
          </CircleButton>
          <ActionMenu
            size={26}
            title="Lainnya"
            iconSize={11}
            disabled={isPending}
            items={[
              {
                label: isActive ? "Nonaktifkan" : "Aktifkan",
                onSelect: runToggle,
              },
              { label: "Hapus", danger: true, onSelect: runDelete },
            ]}
          />
        </div>
      </td>
    </tr>
  );
}

type ActionMenuItem = {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

// Local popover menu anchored to a "more" CircleButton. Fixed positioning so
// it escapes `overflow-hidden` containers (table card, package cards); flips
// upward near the viewport bottom. A full-screen click-away layer closes it.
function ActionMenu({
  items,
  size,
  title,
  iconSize,
  triggerClassName,
  disabled,
}: {
  items: ActionMenuItem[];
  size: number;
  title?: string;
  iconSize: number;
  triggerClassName?: string;
  disabled?: boolean;
}) {
  const [pos, setPos] = useState<{ top: number; left: number; up: boolean } | null>(null);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (pos) {
      setPos(null);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const up = r.bottom + 140 > window.innerHeight;
    setPos({ top: up ? r.top - 6 : r.bottom + 6, left: r.right, up });
  };

  return (
    <>
      <CircleButton size={size} title={title} disabled={disabled} className={triggerClassName} onClick={toggle}>
        <Icon name="more" size={iconSize} />
      </CircleButton>
      {pos && (
        <>
          {/* Click-away layer — closes the menu without triggering anything else. */}
          <div aria-hidden className="fixed inset-0 z-40" onClick={() => setPos(null)} />
          <div
            role="menu"
            className="fixed z-50 min-w-[180px] py-1 bg-paper border border-line rounded-[10px] shadow-[0_14px_30px_rgba(26,26,26,0.16)]"
            style={{
              top: pos.top,
              left: pos.left,
              transform: pos.up ? "translate(-100%, -100%)" : "translateX(-100%)",
            }}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setPos(null);
                  item.onSelect();
                }}
                className={cn(
                  "block w-full text-left font-body text-xs px-[14px] py-2 cursor-pointer",
                  item.danger ? "text-burgundy hover:bg-[rgba(124,45,45,0.06)]" : "text-charcoal hover:bg-cream",
                  item.disabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

// One pricing tier card — the featured tier flips to the dark charcoal surface
// with the peach flower watermark. Deactivated tiers dim and swap the badge.
// Owns its own transition so a pending toggle only disables this card; the
// "Pendapatan" button opens a per-card revenue modal (sold × price).
function PackageCard({ pkg: p }: { pkg: AdminPackageRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [revenueOpen, setRevenueOpen] = useState(false);

  const featured = p.featured;

  const runToggleActive = () => {
    setError(null);
    startTransition(async () => {
      const result = await adminTogglePackageActive({ id: p.packageId, active: !p.active });
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const runToggleFeatured = () => {
    setError(null);
    startTransition(async () => {
      const result = await adminTogglePackageFeatured({ id: p.packageId, featured: !p.featured });
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div
      className={cn(
        "rounded-2xl py-[22px] px-6 relative overflow-hidden",
        featured ? "bg-charcoal text-cream" : "bg-paper text-charcoal border border-line",
        !p.active && "opacity-60",
        isPending && "pointer-events-none opacity-50",
      )}
    >
      {featured && (
        <div className="absolute -top-[30px] -right-[30px] w-[130px] h-[130px] opacity-[0.08]">
          <FlowerMark size={130} color="var(--color-peach)" core="var(--color-peach)" stamen="var(--color-terracotta)" />
        </div>
      )}
      <div className="relative z-[2]">
        <div className="flex items-center justify-between mb-3">
          <div className={cn("font-display italic text-[13px]", featured ? "text-peach" : "text-burgundy")}>
            {p.tagline || "—"}
          </div>
          <div className="flex items-center gap-2">
            {!p.active ? (
              <span className="text-[9px] px-2 py-[3px] rounded bg-cream border border-line text-muted-ink font-bold tracking-[0.16em] uppercase">Nonaktif</span>
            ) : (
              featured && (
                <span className="text-[9px] px-2 py-[3px] rounded bg-terracotta text-white font-bold tracking-[0.16em] uppercase">★ Featured</span>
              )
            )}
            <AdminPackageForm mode="edit" package={p} />
          </div>
        </div>
        <div className={cn("font-display font-extrabold text-[32px] leading-none tracking-[-0.02em]", featured ? "text-peach" : "text-charcoal")}>
          {p.name}
        </div>
        <div className="flex items-baseline gap-1 mt-[14px]">
          <span className={cn("font-display font-extrabold text-[36px] leading-none tracking-[-0.025em]", featured ? "text-cream" : "text-charcoal")}>
            {rupiahShort(p.price)}
          </span>
        </div>
        <div className={cn("text-[10px] tracking-[0.18em] uppercase font-semibold mt-1", featured ? "text-[rgba(245,239,230,0.55)]" : "text-muted-ink")}>
          {p.days} hari · {p.guests === -1 ? "unlimited tamu" : `${p.guests} tamu`}
        </div>

        <ul className={cn("list-none py-4 px-0 m-0 mt-[14px] border-t border-b", featured ? "border-[rgba(245,239,230,0.16)]" : "border-line")}>
          {p.perks.map((perk) => (
            <li key={perk} className={cn("flex items-center gap-2 py-1 text-xs", featured ? "text-[rgba(245,239,230,0.85)]" : "text-charcoal")}>
              <Icon name="check" size={11} stroke={featured ? "var(--color-peach)" : "var(--color-burgundy)"} />
              {perk}
            </li>
          ))}
        </ul>

        {/* Quick toggles — active / featured. */}
        <div className="flex items-center gap-2 mt-[14px]">
          <button
            type="button"
            disabled={isPending}
            onClick={runToggleActive}
            className={cn(
              "inline-flex items-center gap-[6px] rounded-full border px-[11px] py-[6px] text-[10px] font-semibold tracking-[0.1em] uppercase cursor-pointer transition-colors disabled:opacity-50",
              featured
                ? "border-[rgba(245,239,230,0.25)] text-cream hover:bg-[rgba(245,239,230,0.1)]"
                : "border-line text-charcoal hover:bg-cream",
            )}
          >
            <Icon name={p.active ? "x" : "check"} size={11} />
            {p.active ? "Nonaktifkan" : "Aktifkan"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={runToggleFeatured}
            className={cn(
              "inline-flex items-center gap-[6px] rounded-full border px-[11px] py-[6px] text-[10px] font-semibold tracking-[0.1em] uppercase cursor-pointer transition-colors disabled:opacity-50",
              p.featured
                ? "border-terracotta text-terracotta bg-transparent hover:bg-[rgba(192,86,55,0.08)]"
                : featured
                  ? "border-[rgba(245,239,230,0.25)] text-cream hover:bg-[rgba(245,239,230,0.1)]"
                  : "border-line text-charcoal hover:bg-cream",
            )}
          >
            <Icon name="sparkle" size={11} />
            {p.featured ? "Unfeature" : "Featured"}
          </button>
        </div>

        {error && (
          <div className={cn("text-[11px] font-semibold mt-2", featured ? "text-peach" : "text-burgundy")}>
            {error}
          </div>
        )}

        {/* Sold count + revenue */}
        <div className="flex items-center justify-between mt-[14px]">
          <div>
            <div className={cn("text-[10px] tracking-[0.18em] uppercase font-semibold", featured ? "text-[rgba(245,239,230,0.55)]" : "text-muted-ink")}>Terjual</div>
            <div className="flex items-baseline gap-[5px] mt-[2px]">
              <span className={cn("font-display font-bold text-[22px] leading-none", featured ? "text-peach" : "text-charcoal")}>{p.sold}</span>
              <span className={cn("text-[11px]", featured ? "text-[rgba(245,239,230,0.55)]" : "text-muted-ink")}>total</span>
            </div>
          </div>
          <div className="flex gap-[5px]">
            <CircleButton
              size={30}
              title={`Pendapatan ${p.name}`}
              onClick={() => setRevenueOpen(true)}
              className={featured ? "bg-[rgba(245,239,230,0.1)] text-cream border-transparent" : "border-line"}
            >
              <Icon name="card" size={12} />
            </CircleButton>
          </div>
        </div>
      </div>

      {revenueOpen && (
        <RevenueModal pkg={p} onClose={() => setRevenueOpen(false)} />
      )}
    </div>
  );
}

// Small per-package revenue modal: revenue = sold × price, plus the sold count.
function RevenueModal({ pkg: p, onClose }: { pkg: AdminPackageRow; onClose: () => void }) {
  const revenue = p.sold * p.price;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Pendapatan paket ${p.name}`}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[rgba(31,43,28,0.42)]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[380px] bg-paper border border-line rounded-[16px] p-[22px] shadow-[0_24px_60px_rgba(26,26,26,0.22)]"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] tracking-[0.18em] uppercase font-semibold text-muted-ink">Pendapatan</div>
            <div className="font-display font-bold text-[17px] tracking-[-0.01em] text-charcoal">Paket {p.name}</div>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-line bg-transparent inline-flex items-center justify-center text-charcoal cursor-pointer hover:bg-cream"
          >
            <Icon name="x" size={13} />
          </button>
        </div>

        <div className="rounded-xl bg-charcoal text-cream px-[18px] py-4 mb-3">
          <div className="text-[10px] tracking-[0.22em] uppercase font-semibold text-peach mb-[8px]">Total pendapatan</div>
          <div className="font-display font-extrabold text-[30px] leading-none tracking-[-0.02em] text-peach">
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

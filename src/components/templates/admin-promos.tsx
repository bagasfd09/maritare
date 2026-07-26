"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { AdminShell } from "@/components/templates/admin-shell";
import { AdminTopBar } from "@/components/organisms/admin-topbar";
import { AdminStatus } from "@/components/molecules/admin-badges";
import { ActionMenu } from "@/components/molecules/admin-action-menu";
import { AdminPromoForm, type PromoFormPackage } from "@/components/molecules/admin-promo-form";
import { Icon } from "@/components/atoms/icon";
import { CircleButton } from "@/components/atoms/circle-button";
import { SectionNumber } from "@/components/atoms/section-number";
import { ProgressBar } from "@/components/atoms/progress-bar";
import { cn } from "@/lib/utils";
import { deletePromo, togglePromo } from "@/server/actions/promo";
import type { AdminPromoRow } from "@/server/queries/admin";

// `.d-tbl` spec — shared header/cell classes for the promo table.
const TH = "font-body text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-ink text-left px-[14px] py-3 border-b border-beige";
const TD = "p-[14px] border-b border-line align-middle";

// Admin · Promo — the dedicated promo screen, split out of Paket & Promo.
// Promos here are the real thing: package restriction and user targeting are
// enforced by resolvePromo at checkout, and a 100% promo activates the package
// for free (order settles without the gateway).
export function AdminPromos({
  promos,
  packages,
}: {
  promos: AdminPromoRow[];
  packages: PromoFormPackage[];
}) {
  const active = promos.filter((p) => p.status === "active").length;
  const exhausted = promos.filter((p) => p.status === "exhausted").length;
  const eyebrow = `${active} promo aktif · ${exhausted} habis · ${promos.length} total`;

  return (
    <AdminShell active="promos">
      <main className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBar
          crumbs={["Admin", "Promo"]}
          title="Kode promo"
          eyebrow={eyebrow}
        />

        <div className="flex-1 px-8 py-6 overflow-y-auto flex flex-col gap-4">
          <section className="flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <SectionNumber className="text-xs">i. Semua promo</SectionNumber>
            </div>
            <AdminPromoForm packages={packages} />
            {promos.length === 0 ? (
              <div className="bg-paper border border-line rounded-[14px] px-5 py-10 text-center text-[12px] text-muted-ink font-display italic">
                Belum ada promo. Tambah promo pertamamu.
              </div>
            ) : (
              <div className="bg-paper border border-line rounded-[14px] overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 text-[13px] [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:hover_td]:bg-[rgba(124,45,45,0.03)]">
                  <thead>
                    <tr className="bg-cream">
                      <th className={cn(TH, "pl-5")}>Kode</th>
                      <th className={TH}>Diskon</th>
                      <th className={TH}>Berlaku untuk</th>
                      <th className={TH}>Untuk user</th>
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
      <td className={cn(TD, "text-xs")}>
        {p.targetUsers.length === 0 ? (
          <span className="text-muted-ink">Semua user</span>
        ) : (
          <span
            title={p.targetUsers.join("\n")}
            className="inline-flex items-center gap-[5px] px-2 py-[3px] rounded-full bg-cream border border-line text-charcoal font-semibold cursor-help"
          >
            <Icon name="user" size={10} />
            {p.targetUsers.length} user
          </span>
        )}
      </td>
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
              { label: isActive ? "Nonaktifkan" : "Aktifkan", onSelect: runToggle },
              { label: "Hapus", danger: true, onSelect: runDelete },
            ]}
          />
        </div>
      </td>
    </tr>
  );
}

"use client";

import { useState } from "react";

import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import {
  MobileButton,
  MobileCard,
  MobileEm,
  MobileEyebrow,
  MobileSecLabel,
} from "@/components/molecules/mobile-primitives";
import { BillingHistory, PendingPaymentBanner } from "@/components/molecules/billing-history";
import { PaymentChannelRow } from "@/components/molecules/payment-channel-row";
import { MobileShell } from "@/components/templates/mobile-shell";
import { useCheckout } from "@/components/templates/use-checkout";
import { type CheckoutPlan } from "@/lib/checkout";
import { CHECKOUT_CHANNELS, CHECKOUT_GROUPS } from "@/lib/payment/channels";
import { rupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BillingData, DashboardChrome } from "@/server/queries/dashboard";

function thousands(n: number): string {
  return (n / 1000).toLocaleString("id-ID");
}

// Mobile screen 08 · Checkout — the mobile twin of the desktop Checkout. Same
// catalog + pricing + payment handoff (useCheckout); layout stacked for a phone.
//
// `chrome` is part of the page data contract (mirrors the desktop call) but the
// mobile shell has no sidebar, so it is intentionally not consumed.
export function CheckoutMobile({
  email,
  plans,
  orders,
}: {
  chrome: DashboardChrome | null;
  email: string;
  plans: CheckoutPlan[];
  orders: BillingData["orders"];
}) {
  const {
    plan,
    setPlan,
    channel,
    setChannel,
    promoInput,
    setPromoInput,
    promo,
    promoErr,
    setPromoErr,
    applyPromo,
    clearPromo,
    promoPending,
    pay,
    payPending,
    payErr,
    sel,
    promoOff,
    total,
    verb,
  } = useCheckout(plans);

  const selChannel = CHECKOUT_CHANNELS.find((c) => c.id === channel) ?? null;
  const pendingOrder = orders.find((o) => o.status === "pending") ?? null;

  // One payment group open at a time (accordion) so the phone list stays short.
  // Starts on the group holding the preselected channel.
  const [openGroup, setOpenGroup] = useState<string>(
    () =>
      CHECKOUT_GROUPS.find((g) => g.options.some((o) => o.id === channel))?.title ??
      CHECKOUT_GROUPS[0]?.title ??
      "",
  );

  return (
    <MobileShell
      active="tagihan"
      eyebrow="Checkout"
      title={<>Selesaikan <MobileEm>pesananmu.</MobileEm></>}
    >
      {pendingOrder && <PendingPaymentBanner order={pendingOrder} />}

      {/* i · Pilih paket */}
      <div>
        <div className="flex items-baseline justify-between px-1 mb-[10px]">
          <MobileSecLabel>i. Pilih paket</MobileSecLabel>
          <span className="text-[11px] font-display italic text-muted-ink">Bayar sekali.</span>
        </div>
        {plans.length === 0 ? (
          <MobileCard>
            <div className="text-[12.5px] text-muted-ink">
              Belum ada paket yang tersedia. Hubungi admin ya.
            </div>
          </MobileCard>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {plans.map((p) => {
              const active = plan === p.id;
              const locked = p.state === "lower";
              const isCurrent = p.state === "current";
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => !locked && setPlan(p.id)}
                  disabled={locked}
                  className={cn(
                    "text-left font-body rounded-2xl px-4 py-4 relative flex flex-col border w-full overflow-hidden",
                    active
                      ? "bg-charcoal text-cream border-[1.5px] border-charcoal"
                      : "bg-paper text-charcoal border-line",
                    locked ? "opacity-55 cursor-not-allowed" : "cursor-pointer",
                  )}
                >
                  {/* brand watermark — mirrors the flower on the summary card */}
                  <div className="absolute -bottom-6 -right-6 w-[100px] h-[100px] opacity-[0.05] pointer-events-none" aria-hidden>
                    <FlowerMark
                      size={100}
                      color={active ? "var(--color-peach)" : "var(--color-burgundy)"}
                      core={active ? "var(--color-peach)" : "var(--color-terracotta)"}
                      stamen={active ? "var(--color-terracotta)" : "var(--color-peach)"}
                    />
                  </div>

                  <div className="flex items-center justify-between mb-[8px]">
                    <span className={cn("font-display italic font-bold text-[13px]", active ? "text-peach" : "text-burgundy")}>
                      № {p.roman}
                    </span>
                    {p.state === "upgrade" && (
                      <span className={cn(
                        "text-[8.5px] px-2 py-[3px] rounded-full font-bold tracking-[0.16em] uppercase",
                        active ? "bg-terracotta text-white" : "bg-peach text-[#5a2a18]",
                      )}>
                        ★ Disarankan
                      </span>
                    )}
                    {isCurrent && (
                      <span className={cn(
                        "text-[8.5px] px-2 py-[3px] rounded-full font-bold tracking-[0.16em] uppercase",
                        active ? "bg-[rgba(245,239,230,0.16)] text-peach" : "bg-sage-soft text-[#1c2818]",
                      )}>
                        Aktif
                      </span>
                    )}
                    {locked && (
                      <span className="text-[8.5px] px-2 py-[3px] rounded-full font-bold tracking-[0.16em] uppercase bg-cream text-faint border border-line">
                        Lebih rendah
                      </span>
                    )}
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <div className={cn("font-display font-extrabold text-[24px] leading-none tracking-[-0.025em]", active ? "text-peach" : "text-charcoal")}>
                        {p.name}
                      </div>
                      <div className={cn("text-[11px] mt-[6px] tracking-[0.04em]", active ? "text-[rgba(245,239,230,0.6)]" : "text-muted-ink")}>
                        {p.per} · {p.guests}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-baseline justify-end gap-[3px]">
                        <span className={cn("text-[12px] font-bold", active ? "text-[rgba(245,239,230,0.7)]" : "text-muted-ink")}>Rp</span>
                        <span className={cn("font-display font-extrabold text-[24px] tracking-[-0.02em]", active ? "text-cream" : "text-charcoal")}>
                          {thousands(p.price)}
                        </span>
                        <span className={cn("text-[12px] font-bold", active ? "text-[rgba(245,239,230,0.7)]" : "text-muted-ink")}>rb</span>
                      </div>
                    </div>
                  </div>

                  {/* ornament divider — petals between hairlines */}
                  <div className="flex items-center gap-[7px] my-3" aria-hidden>
                    <span className={cn("h-px flex-1", active ? "bg-[rgba(245,239,230,0.14)]" : "bg-line")} />
                    <FlowerMark
                      size={9}
                      color={active ? "var(--color-peach)" : "var(--color-burgundy)"}
                      core="var(--color-terracotta)"
                      stamen="var(--color-peach)"
                    />
                    <span className={cn("h-px flex-1", active ? "bg-[rgba(245,239,230,0.14)]" : "bg-line")} />
                  </div>

                  <ul className="list-none m-0 p-0 flex flex-col gap-[6px]">
                    {p.perks.map((f, i) => (
                      <li key={i} className={cn("flex gap-[7px] text-[11.5px] leading-[1.35]", active ? "text-[rgba(245,239,230,0.85)]" : "text-charcoal")}>
                        <span className={cn("mt-px shrink-0", active ? "text-peach" : "text-sage")}>
                          <Icon name="check" size={12} stroke="currentColor" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className={cn("flex items-center gap-2 mt-3 pt-3 border-t", active ? "border-[rgba(245,239,230,0.14)]" : "border-line")}>
                    <span className={cn(
                      "w-4 h-4 rounded-full shrink-0 inline-flex items-center justify-center",
                      active ? "bg-peach" : "border-[1.5px] border-beige",
                    )}>
                      {active && <Icon name="check" size={10} stroke="#1a1a1a" />}
                    </span>
                    <span className={cn(
                      "text-[10.5px] font-bold tracking-[0.14em] uppercase",
                      active ? "text-peach" : locked ? "text-faint" : "text-muted-ink",
                    )}>
                      {locked ? "Tak tersedia" : active ? "Dipilih" : isCurrent ? "Perpanjang" : "Pilih"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ii · Metode pembayaran — VA renders on our own page; e-wallets hand
          off to the chosen wallet's flow. 100%-off promo: nothing to pay, the
          picker collapses into a note. */}
      <div>
        <div className="flex items-baseline justify-between px-1 mb-[10px]">
          <MobileSecLabel>ii. Metode pembayaran</MobileSecLabel>
          <span className="text-[10px] text-muted-ink inline-flex items-center gap-[5px]">
            <Icon name="qr" size={12} /> Aman
          </span>
        </div>
        {total === 0 && sel ? (
          <div className="border border-line rounded-xl bg-paper px-4 py-4 flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-sage-soft flex items-center justify-center shrink-0">
              <Icon name="check" size={16} stroke="#1c2818" />
            </span>
            <div>
              <div className="font-display italic text-[14px] text-charcoal">Gratis — promo 100% aktif.</div>
              <div className="text-[11px] text-muted-ink mt-[2px]">
                Nggak perlu metode pembayaran. Tinggal aktifkan di bawah.
              </div>
            </div>
          </div>
        ) : (
        <div className="flex flex-col gap-[10px]">
          {CHECKOUT_GROUPS.map((group) => {
            const isOpen = openGroup === group.title;
            const selectedHere = group.options.find((o) => o.id === channel) ?? null;
            return (
              <div key={group.title} className="border border-line rounded-xl bg-paper overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenGroup(isOpen ? "" : group.title)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-2 px-[13px] py-[12px] text-left cursor-pointer"
                >
                  <FlowerMark size={11} color="var(--color-burgundy)" core="var(--color-terracotta)" stamen="var(--color-peach)" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-ink shrink-0">
                    {group.title}
                  </span>
                  {/* keep the choice visible while its group is folded */}
                  {!isOpen && selectedHere && (
                    <span className="min-w-0 inline-flex items-center gap-[5px] ml-1">
                      <span className="w-[5px] h-[5px] rounded-full bg-burgundy shrink-0" />
                      <span className="text-[10.5px] font-semibold text-burgundy truncate">
                        {selectedHere.label}
                      </span>
                    </span>
                  )}
                  <span className="flex-1" />
                  <span className="text-[10px] text-faint font-semibold shrink-0">
                    {group.options.length} pilihan
                  </span>
                  <span className={cn("inline-flex text-muted-ink transition-transform duration-200 shrink-0", isOpen && "rotate-90")}>
                    <Icon name="arrow-r" size={12} stroke="currentColor" />
                  </span>
                </button>
                {/* Animated collapse: grid row 0fr -> 1fr transitions height:auto
                    natively — no measuring, no animation lib. `inert` keeps the
                    folded rows out of the tab order. */}
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden min-h-0" inert={!isOpen}>
                    <div
                      className={cn(
                        "px-[10px] pb-[10px] flex flex-col gap-[8px] transition-opacity duration-200",
                        isOpen ? "opacity-100" : "opacity-0",
                      )}
                    >
                      {group.options.map((m) => (
                        <PaymentChannelRow key={m.id} option={m} active={channel === m.id} onSelect={setChannel} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Order summary */}
      <MobileCard tone="dark" className="overflow-hidden relative">
        <div className="absolute -top-9 -right-10 w-[150px] h-[150px] opacity-[0.07]">
          <FlowerMark size={150} color="var(--color-peach)" core="var(--color-peach)" stamen="var(--color-terracotta)" />
        </div>
        <div className="relative z-[2]">
          <MobileEyebrow className="text-peach">Ringkasan pesanan</MobileEyebrow>
          <div className="font-display font-extrabold text-xl text-cream leading-[1.05] tracking-[-0.025em] mt-[6px]">
            {verb} <MobileEm className="text-peach">{sel?.name ?? "—"}.</MobileEm>
          </div>
          <div className="font-display italic text-[12.5px] text-[rgba(245,239,230,0.65)] mt-1">
            {sel ? `${sel.per} · ${sel.guests}` : "Belum ada paket tersedia"}
          </div>

          {/* promo code */}
          <div className="mt-[18px]">
            {promo ? (
              <div className="flex items-center gap-[10px] px-3 py-[9px] rounded-[10px] bg-[rgba(143,217,168,0.14)] border border-[rgba(143,217,168,0.4)]">
                <Icon name="check" size={14} stroke="#8FD9A8" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-bold text-cream tracking-[0.06em]">{promo.code}</div>
                  <div className="text-[10.5px] text-[#8FD9A8]">{promo.label} diterapkan</div>
                </div>
                <button
                  type="button"
                  onClick={clearPromo}
                  title="Hapus kode promo"
                  className="bg-transparent border-0 text-[rgba(245,239,230,0.6)] cursor-pointer flex p-[2px]"
                >
                  <Icon name="x" size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoErr(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") applyPromo(); }}
                    placeholder="Kode promo"
                    className={cn(
                      "flex-1 min-w-0 bg-[rgba(245,239,230,0.06)] rounded-[10px] px-3 py-[9px] text-cream font-body text-[12.5px] tracking-[0.08em] outline-none uppercase border placeholder:text-[rgba(245,239,230,0.4)]",
                      promoErr ? "border-terracotta" : "border-[rgba(245,239,230,0.2)]",
                    )}
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={promoPending}
                    className="shrink-0 px-4 rounded-[10px] bg-peach text-charcoal font-bold text-[12.5px] disabled:opacity-60"
                  >
                    {promoPending ? "Cek…" : "Pakai"}
                  </button>
                </div>
                {promoErr ? (
                  <div className="text-[10.5px] text-terracotta mt-[6px] flex items-center gap-[5px]">
                    <Icon name="x" size={11} stroke="var(--color-terracotta)" />{promoErr}
                  </div>
                ) : (
                  <div className="text-[10.5px] text-[rgba(245,239,230,0.5)] mt-[6px]">Punya kode promo? Masukkan di sini.</div>
                )}
              </>
            )}
          </div>

          {/* line items */}
          <div className="mt-5 flex flex-col gap-[12px]">
            <div className="flex justify-between items-baseline text-[13px]">
              <span className="text-[rgba(245,239,230,0.8)]">
                {sel ? `Paket ${sel.name} · ${sel.per}` : "Paket"}
              </span>
              <span className="font-display font-bold text-cream">{rupiah(sel?.price ?? 0)}</span>
            </div>
            {selChannel && total > 0 && (
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-[rgba(245,239,230,0.8)]">Metode pembayaran</span>
                <span className="inline-flex items-center gap-[7px] min-w-0">
                  {selChannel.logo ? (
                    <span className="h-[18px] px-[5px] bg-white rounded-[5px] inline-flex items-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element -- tiny local asset */}
                      <img src={selChannel.logo} alt="" className="max-h-[11px] w-auto object-contain" />
                    </span>
                  ) : (
                    <span
                      className="h-[18px] px-[6px] rounded-[5px] text-white inline-flex items-center text-[7.5px] font-extrabold tracking-[0.04em] uppercase shrink-0"
                      style={{ background: selChannel.color }}
                    >
                      {selChannel.badge}
                    </span>
                  )}
                  <span className="font-display font-bold text-cream text-[12.5px] truncate">{selChannel.label}</span>
                </span>
              </div>
            )}
            {promo && promoOff > 0 && (
              <div className="flex justify-between items-baseline text-[13px]">
                <span className="text-[rgba(245,239,230,0.8)] inline-flex items-center gap-[6px]">
                  Promo {promo.code}
                  <span className="text-[9px] px-[6px] py-px rounded-full bg-peach text-[#5a2a18] font-extrabold tracking-[0.08em]">
                    {promo.label}
                  </span>
                </span>
                <span className="font-display font-bold text-[#8FD9A8]">− {rupiah(promoOff)}</span>
              </div>
            )}
          </div>

          <div className="h-px bg-[rgba(245,239,230,0.16)] my-4" />

          <div className="flex justify-between items-end">
            <div>
              <div className="text-[9px] text-[rgba(245,239,230,0.55)] tracking-[0.22em] uppercase font-semibold">Total bayar</div>
              <div className="text-[10px] text-[rgba(245,239,230,0.5)] font-display italic mt-[2px]">Sudah termasuk PPN</div>
            </div>
            <div className="text-right">
              <div className="font-display font-extrabold text-[30px] text-peach tracking-[-0.02em] leading-none">{rupiah(total)}</div>
              {promoOff > 0 && (
                <div className="text-[9.5px] text-[#8FD9A8] font-bold tracking-[0.04em] mt-[5px]">Kamu hemat {rupiah(promoOff)}</div>
              )}
            </div>
          </div>

          <MobileButton
            type="button"
            full
            onClick={pay}
            disabled={payPending || !sel}
            className="mt-5 bg-peach text-charcoal font-bold"
          >
            {payPending
              ? "Menyiapkan pembayaran…"
              : total === 0
                ? <>Aktifkan Gratis <Icon name="arrow-r" size={14} /></>
                : <>Bayar {rupiah(total)} <Icon name="arrow-r" size={14} /></>}
          </MobileButton>

          {payErr && (
            <div className="text-[10.5px] text-terracotta mt-[10px] flex items-center justify-center gap-[5px] text-center">
              <Icon name="x" size={11} stroke="var(--color-terracotta)" />{payErr}
            </div>
          )}

          <div className="flex items-center justify-center gap-[7px] mt-3 text-[10.5px] text-[rgba(245,239,230,0.55)]">
            <Icon name="check" size={12} stroke="var(--color-sage)" />
            Pembayaran terenkripsi & terverifikasi otomatis
          </div>
        </div>
      </MobileCard>

      {/* fine print */}
      <MobileCard className="flex gap-[11px] items-start">
        <span className="w-7 h-7 rounded-lg bg-peach text-burgundy-dark flex items-center justify-center shrink-0">
          <Icon name="envelope" size={14} />
        </span>
        <div className="text-[11.5px] leading-[1.5] text-muted-ink">
          Invoice & bukti bayar otomatis dikirim ke{" "}
          <span className="text-charcoal font-semibold">{email}</span>. Paket aktif seketika setelah pembayaran dikonfirmasi.
        </div>
      </MobileCard>

      <BillingHistory orders={orders} />
    </MobileShell>
  );
}

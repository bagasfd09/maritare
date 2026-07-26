"use client";

import { Button } from "@/components/atoms/button";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import { SectionNumber } from "@/components/atoms/section-number";
import { Em } from "@/components/atoms/typography";
import { DashboardTopBar } from "@/components/organisms/dashboard-topbar";
import { DashboardShell } from "@/components/templates/dashboard-shell";
import { BillingHistory, PendingPaymentBanner } from "@/components/molecules/billing-history";
import { PaymentChannelRow } from "@/components/molecules/payment-channel-row";
import { useCheckout } from "@/components/templates/use-checkout";
import { type CheckoutPlan } from "@/lib/checkout";
import { CHECKOUT_CHANNELS, CHECKOUT_GROUPS } from "@/lib/payment/channels";
import { rupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BillingData, DashboardChrome } from "@/server/queries/dashboard";

// Screen 08 · Checkout — ported 1:1 from the design's Final_Checkout.
//
// Live: plans are priced from the `packages` table and "Bayar" creates an order
// and hands off to the DOKU-hosted payment page (see startCheckout). The
// payment-method grid below is a PREVIEW only — the actual channel is chosen on
// DOKU's page, which lists whatever is enabled on the account. The mobile twin
// is CheckoutMobile; both share behaviour via useCheckout so they never drift.

export function Checkout({
  chrome,
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

  return (
    <DashboardShell active="billing" chrome={chrome}>
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          num="§ VIII"
          eyebrow="Checkout"
          title={<>Selesaikan <Em className="text-burgundy">pesananmu.</Em></>}
          actions={
            <>
              <span className="text-[11px] text-muted-ink tracking-[0.18em] uppercase font-semibold inline-flex items-center gap-[6px]">
                <Icon name="card" size={13} /> Paket aktif:{" "}
                <span className="text-burgundy">{chrome?.packageName ?? "Belum ada"}</span>
              </span>
              <Button
                variant="ghost"
                onClick={() =>
                  document.getElementById("riwayat-tagihan")?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
              >
                <Icon name="list" size={14} />Riwayat tagihan
              </Button>
            </>
          }
        />

        <div className="flex-1 px-10 py-[26px] overflow-y-auto grid grid-cols-[1fr_360px] gap-6">
          {/* LEFT — plan + payment selection */}
          <div className="flex flex-col gap-5 min-w-0">
            {/* i · Pilih paket */}
            <section>
              <div className="flex items-baseline justify-between mb-3">
                <SectionNumber className="text-[12px]">i. Pilih paket</SectionNumber>
                <span className="text-[12px] font-display italic text-muted-ink">
                  Bayar sekali — tanpa langganan bulanan.
                </span>
              </div>

              {plans.length === 0 ? (
                <div className="bg-paper border border-line rounded-2xl px-5 py-6 text-[12.5px] text-muted-ink">
                  Belum ada paket yang tersedia. Hubungi admin ya.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
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
                          "text-left font-body rounded-2xl px-4 pt-4 pb-[14px] relative flex flex-col border overflow-hidden",
                          active
                            ? "bg-charcoal text-cream border-[1.5px] border-charcoal"
                            : "bg-paper text-charcoal border-line",
                          locked ? "opacity-55 cursor-not-allowed" : "cursor-pointer",
                        )}
                      >
                        {/* brand watermark — mirrors the flower on the summary card */}
                        <div className="absolute -bottom-7 -right-7 w-[120px] h-[120px] opacity-[0.06] pointer-events-none" aria-hidden>
                          <FlowerMark
                            size={120}
                            color={active ? "var(--color-peach)" : "var(--color-burgundy)"}
                            core={active ? "var(--color-peach)" : "var(--color-terracotta)"}
                            stamen={active ? "var(--color-terracotta)" : "var(--color-peach)"}
                          />
                        </div>

                        {/* tier ribbon */}
                        <div className="flex items-center justify-between mb-[10px]">
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

                        <div className={cn("font-display font-extrabold text-[26px] leading-none tracking-[-0.025em]", active ? "text-peach" : "text-charcoal")}>
                          {p.name}
                        </div>

                        <div className="flex items-baseline gap-[3px] mt-2">
                          <span className={cn("text-[12px] font-bold", active ? "text-[rgba(245,239,230,0.7)]" : "text-muted-ink")}>Rp</span>
                          <span className={cn("font-display font-extrabold text-[26px] tracking-[-0.02em]", active ? "text-cream" : "text-charcoal")}>
                            {(p.price / 1000).toLocaleString("id-ID")}
                          </span>
                          <span className={cn("text-[12px] font-bold", active ? "text-[rgba(245,239,230,0.7)]" : "text-muted-ink")}>rb</span>
                        </div>
                        <div className={cn("text-[11px] mt-[3px] tracking-[0.04em]", active ? "text-[rgba(245,239,230,0.6)]" : "text-muted-ink")}>
                          {p.per} · {p.guests}
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

                        <ul className="list-none m-0 p-0 flex flex-col gap-[6px] flex-1">
                          {p.perks.map((f, i) => (
                            <li key={i} className={cn("flex gap-[7px] text-[11.5px] leading-[1.35]", active ? "text-[rgba(245,239,230,0.85)]" : "text-charcoal")}>
                              <span className={cn("mt-px shrink-0", active ? "text-peach" : "text-sage")}>
                                <Icon name="check" size={12} stroke="currentColor" />
                              </span>
                              {f}
                            </li>
                          ))}
                        </ul>

                        {/* select indicator */}
                        <div className={cn("flex items-center gap-2 mt-[14px] pt-3 border-t", active ? "border-[rgba(245,239,230,0.14)]" : "border-line")}>
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
            </section>

            {/* ii · Metode pembayaran — VA is issued via DOKU and rendered on our
                own payment page; e-wallets hand off to the chosen wallet's flow. */}
            <section className="flex flex-col min-h-0">
              <div className="flex items-baseline justify-between mb-3">
                <SectionNumber className="text-[12px]">ii. Metode pembayaran</SectionNumber>
                <span className="text-[11px] text-muted-ink inline-flex items-center gap-[6px]">
                  <Icon name="qr" size={13} /> Diproses aman lewat payment gateway
                </span>
              </div>

              {/* 100%-off promo: nothing to pay, so the method picker collapses
                  into a note (startCheckout skips the gateway entirely). */}
              {total === 0 && sel ? (
                <div className="relative bg-cream border border-line rounded-2xl p-6 overflow-hidden flex items-center gap-4">
                  <div className="absolute -top-8 -right-8 w-[110px] h-[110px] opacity-[0.06] pointer-events-none" aria-hidden>
                    <FlowerMark size={110} color="var(--color-burgundy)" core="var(--color-terracotta)" stamen="var(--color-peach)" />
                  </div>
                  <span className="w-10 h-10 rounded-full bg-sage-soft flex items-center justify-center shrink-0">
                    <Icon name="check" size={18} stroke="#1c2818" />
                  </span>
                  <div className="relative">
                    <div className="font-display italic text-[16px] text-charcoal">Gratis — promo 100% aktif.</div>
                    <div className="text-[12px] text-muted-ink mt-[2px]">
                      Nggak perlu metode pembayaran. Klik tombol di kanan dan paketmu langsung aktif.
                    </div>
                  </div>
                </div>
              ) : (
              <div className="relative bg-cream border border-line rounded-2xl p-5 overflow-hidden">
                <div className="absolute -top-8 -left-8 w-[110px] h-[110px] opacity-[0.05] pointer-events-none" aria-hidden>
                  <FlowerMark size={110} color="var(--color-burgundy)" core="var(--color-terracotta)" stamen="var(--color-peach)" />
                </div>

                <div className="relative flex flex-col gap-[18px]">
                  {CHECKOUT_GROUPS.map((group) => (
                    <div key={group.title}>
                      <div className="flex items-center gap-2 mb-[10px]">
                        <FlowerMark size={11} color="var(--color-burgundy)" core="var(--color-terracotta)" stamen="var(--color-peach)" />
                        <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-muted-ink">
                          {group.title}
                        </span>
                        <span className="h-px flex-1 bg-line" />
                        <span className="text-[10px] text-faint font-semibold">{group.options.length} pilihan</span>
                      </div>
                      <div className="grid grid-cols-2 gap-[10px]">
                        {group.options.map((m) => (
                          <PaymentChannelRow key={m.id} option={m} active={channel === m.id} onSelect={setChannel} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </section>
          </div>

          {/* RIGHT — sticky order summary */}
          <aside className="flex flex-col gap-[14px] h-full min-h-0">
            {pendingOrder && <PendingPaymentBanner order={pendingOrder} />}

            <div className="flex-1 bg-charcoal text-cream rounded-2xl px-7 pt-8 pb-7 relative overflow-hidden flex flex-col">
              <div className="absolute -top-9 -right-10 w-[170px] h-[170px] opacity-[0.07]">
                <FlowerMark size={170} color="var(--color-peach)" core="var(--color-peach)" stamen="var(--color-terracotta)" />
              </div>

              <div className="relative z-[2] flex flex-col flex-1">
                <SectionNumber className="text-[11px] text-peach before:bg-peach">Ringkasan pesanan</SectionNumber>
                <div className="font-display font-extrabold text-2xl text-cream leading-[1.05] tracking-[-0.025em] mt-[6px]">
                  {verb} <Em className="text-peach">{sel?.name ?? "—"}.</Em>
                </div>
                <div className="font-display italic text-[13px] text-[rgba(245,239,230,0.65)] mt-1">
                  {sel ? `${sel.per} · ${sel.guests}` : "Belum ada paket tersedia"}
                </div>

                {/* promo code */}
                <div className="mt-[22px]">
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
                          placeholder="Masukkan kode promo"
                          className={cn(
                            "flex-1 bg-[rgba(245,239,230,0.06)] rounded-[10px] px-3 py-[9px] text-cream font-body text-[12.5px] tracking-[0.08em] outline-none uppercase border placeholder:text-[rgba(245,239,230,0.4)]",
                            promoErr ? "border-terracotta" : "border-[rgba(245,239,230,0.2)]",
                          )}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={applyPromo}
                          disabled={promoPending}
                          className="bg-peach text-charcoal font-bold hover:bg-peach"
                        >
                          {promoPending ? "Cek…" : "Pakai"}
                        </Button>
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
                <div className="mt-6 flex flex-col gap-[13px]">
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

                <div className="h-px bg-[rgba(245,239,230,0.16)] mt-auto mb-4" />

                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[9px] text-[rgba(245,239,230,0.55)] tracking-[0.22em] uppercase font-semibold">Total bayar</div>
                    <div className="text-[10px] text-[rgba(245,239,230,0.5)] font-display italic mt-[2px]">Sudah termasuk PPN</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-extrabold text-[32px] text-peach tracking-[-0.02em] leading-none">{rupiah(total)}</div>
                    {promoOff > 0 && (
                      <div className="text-[9.5px] text-[#8FD9A8] font-bold tracking-[0.04em] mt-[5px]">Kamu hemat {rupiah(promoOff)}</div>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={pay}
                  disabled={payPending || !sel}
                  className="w-full justify-center mt-5 bg-peach text-charcoal font-bold py-[14px] h-auto hover:bg-peach"
                >
                  {payPending
                    ? "Menyiapkan pembayaran…"
                    : total === 0
                      ? <>Aktifkan Gratis <Icon name="arrow-r" size={14} /></>
                      : <>Bayar {rupiah(total)} <Icon name="arrow-r" size={14} /></>}
                </Button>

                {payErr && (
                  <div className="text-[10.5px] text-terracotta mt-[10px] flex items-center justify-center gap-[5px] text-center">
                    <Icon name="x" size={11} stroke="var(--color-terracotta)" />{payErr}
                  </div>
                )}

                <div className="flex items-center justify-center gap-[7px] mt-[14px] text-[10.5px] text-[rgba(245,239,230,0.55)]">
                  <Icon name="check" size={12} stroke="var(--color-sage)" />
                  Pembayaran terenkripsi & terverifikasi otomatis
                </div>
              </div>
            </div>

            {/* fine print */}
            <div className="bg-paper border border-line rounded-[14px] px-4 py-[13px] flex gap-[11px] items-start">
              <span className="w-7 h-7 rounded-lg bg-peach text-burgundy-dark flex items-center justify-center shrink-0">
                <Icon name="envelope" size={14} />
              </span>
              <div className="text-[11.5px] leading-[1.5] text-muted-ink">
                Invoice & bukti bayar otomatis dikirim ke{" "}
                <span className="text-charcoal font-semibold">{email}</span>. Paket aktif seketika setelah pembayaran dikonfirmasi.
              </div>
            </div>

            <BillingHistory orders={orders} />
          </aside>
        </div>
      </main>
    </DashboardShell>
  );
}

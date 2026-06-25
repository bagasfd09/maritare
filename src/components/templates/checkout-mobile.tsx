"use client";

import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import {
  MobileButton,
  MobileCard,
  MobileEm,
  MobileEyebrow,
  MobileSecLabel,
} from "@/components/molecules/mobile-primitives";
import { MobileShell } from "@/components/templates/mobile-shell";
import { useCheckout } from "@/components/templates/use-checkout";
import { CD_UNITS, LAUNCH_PCT, PAYS, PLANS } from "@/lib/checkout";
import { rupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DashboardChrome } from "@/server/queries/dashboard";

function thousands(n: number): string {
  return (n / 1000).toLocaleString("id-ID");
}

// Mobile screen 08 · Checkout — the mobile twin of the desktop Checkout. Same
// catalog + pricing + state (useCheckout); layout stacked for a phone.
//
// `chrome` is part of the page data contract (mirrors the desktop call) but the
// mobile shell has no sidebar, so it is intentionally not consumed.
export function CheckoutMobile({
  email,
}: {
  chrome: DashboardChrome | null;
  email: string;
}) {
  const {
    plan,
    setPlan,
    pay,
    setPay,
    promoInput,
    setPromoInput,
    voucher,
    voucherErr,
    setVoucherErr,
    remain,
    applyVoucher,
    clearVoucher,
    sel,
    launchOff,
    voucherOff,
    credit,
    total,
    saved,
    verb,
  } = useCheckout();

  return (
    <MobileShell
      active="tagihan"
      eyebrow="Checkout"
      title={<>Selesaikan <MobileEm>pesananmu.</MobileEm></>}
    >
      {/* Promo countdown banner */}
      <MobileCard className="bg-peach border-burgundy/15">
        <div className="flex items-center gap-3">
          <span className="w-[30px] h-[30px] rounded-lg bg-burgundy text-peach flex items-center justify-center shrink-0">
            <Icon name="sparkle" size={15} />
          </span>
          <div className="min-w-0">
            <div className="font-display italic text-[15px] text-burgundy-dark leading-none">
              Promo Pembukaan · hemat {LAUNCH_PCT}%
            </div>
            <div className="text-[11px] text-[#5a2a18] mt-[3px]">
              Berlaku untuk semua paket — harga sudah otomatis dipotong.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-[6px] mt-3">
          <span className="text-[9px] text-[#5a2a18] tracking-[0.16em] uppercase font-bold mr-auto">
            Berakhir
          </span>
          {CD_UNITS.map((u) => {
            const v = Math.floor(remain / u.div) % u.mod;
            return (
              <div
                key={u.key}
                className="text-center min-w-[40px] px-[6px] py-[5px] rounded-lg bg-burgundy-dark text-peach"
              >
                <div className="font-display font-extrabold text-[17px] leading-none tabular-nums">
                  {String(v).padStart(2, "0")}
                </div>
                <div className="text-[7px] tracking-[0.12em] uppercase opacity-70 mt-[2px]">{u.key}</div>
              </div>
            );
          })}
        </div>
      </MobileCard>

      {/* i · Pilih paket */}
      <div>
        <div className="flex items-baseline justify-between px-1 mb-[10px]">
          <MobileSecLabel>i. Pilih paket</MobileSecLabel>
          <span className="text-[11px] font-display italic text-muted-ink">Bayar sekali.</span>
        </div>
        <div className="flex flex-col gap-[10px]">
          {PLANS.map((p) => {
            const active = plan === p.id;
            const locked = p.state === "lower";
            const isCurrent = p.state === "current";
            const discounted = p.price - Math.round((p.price * LAUNCH_PCT) / 100);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => !locked && setPlan(p.id)}
                disabled={locked}
                className={cn(
                  "text-left font-body rounded-2xl px-4 py-4 relative flex flex-col border w-full",
                  active
                    ? "bg-charcoal text-cream border-[1.5px] border-charcoal"
                    : "bg-paper text-charcoal border-line",
                  locked ? "opacity-55 cursor-not-allowed" : "cursor-pointer",
                )}
              >
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
                    <div className="flex items-center justify-end gap-[6px]">
                      <span className={cn("font-display font-semibold text-[11px] line-through", active ? "text-[rgba(245,239,230,0.5)]" : "text-faint")}>
                        Rp {thousands(p.price)}rb
                      </span>
                      <span className={cn(
                        "text-[8px] px-[6px] py-[2px] rounded-full font-extrabold tracking-[0.08em]",
                        active ? "bg-terracotta text-white" : "bg-burgundy/10 text-burgundy",
                      )}>
                        −{LAUNCH_PCT}%
                      </span>
                    </div>
                    <div className="flex items-baseline justify-end gap-[3px] mt-[2px]">
                      <span className={cn("text-[12px] font-bold", active ? "text-[rgba(245,239,230,0.7)]" : "text-muted-ink")}>Rp</span>
                      <span className={cn("font-display font-extrabold text-[24px] tracking-[-0.02em]", active ? "text-cream" : "text-charcoal")}>
                        {thousands(discounted)}
                      </span>
                      <span className={cn("text-[12px] font-bold", active ? "text-[rgba(245,239,230,0.7)]" : "text-muted-ink")}>rb</span>
                    </div>
                  </div>
                </div>

                <div className={cn("h-px my-3", active ? "bg-[rgba(245,239,230,0.14)]" : "bg-line")} />

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
      </div>

      {/* ii · Metode pembayaran */}
      <div>
        <div className="flex items-baseline justify-between px-1 mb-[10px]">
          <MobileSecLabel>ii. Metode pembayaran</MobileSecLabel>
          <span className="text-[10px] text-muted-ink inline-flex items-center gap-[5px]">
            <Icon name="qr" size={12} /> Aman
          </span>
        </div>
        <div className="flex flex-col gap-[8px]">
          {PAYS.map((m) => {
            const active = pay === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setPay(m.id)}
                className={cn(
                  "text-left font-body flex items-center gap-3 bg-paper rounded-xl px-[13px] py-[11px] border cursor-pointer w-full",
                  active ? "border-[1.5px] border-burgundy" : "border-line",
                )}
              >
                <span
                  className="w-11 h-[30px] rounded-md text-white flex items-center justify-center text-[8.5px] font-extrabold tracking-[0.04em] shrink-0 uppercase"
                  style={{ background: m.color }}
                >
                  {m.badge}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-[6px]">
                    <span className="text-[12.5px] font-semibold text-charcoal">{m.label}</span>
                    {m.recommended && (
                      <span className="text-[8px] px-[6px] py-[1.5px] rounded-full bg-sage-soft text-[#1c2818] font-bold tracking-[0.12em] uppercase">
                        Cepat
                      </span>
                    )}
                  </span>
                  <span className="block text-[10.5px] text-muted-ink mt-px">{m.desc}</span>
                </span>
                <span className={cn(
                  "w-4 h-4 rounded-full shrink-0 inline-flex items-center justify-center",
                  active ? "bg-burgundy" : "border-[1.5px] border-beige",
                )}>
                  {active && <Icon name="check" size={10} stroke="#f5efe6" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Order summary */}
      <MobileCard tone="dark" className="overflow-hidden relative">
        <div className="absolute -top-9 -right-10 w-[150px] h-[150px] opacity-[0.07]">
          <FlowerMark size={150} color="var(--color-peach)" core="var(--color-peach)" stamen="var(--color-terracotta)" />
        </div>
        <div className="relative z-[2]">
          <MobileEyebrow className="text-peach">Ringkasan pesanan</MobileEyebrow>
          <div className="font-display font-extrabold text-xl text-cream leading-[1.05] tracking-[-0.025em] mt-[6px]">
            {verb} <MobileEm className="text-peach">{sel.name}.</MobileEm>
          </div>
          <div className="font-display italic text-[12.5px] text-[rgba(245,239,230,0.65)] mt-1">
            {sel.per} · {sel.guests}
          </div>

          {/* voucher */}
          <div className="mt-[18px]">
            {voucher ? (
              <div className="flex items-center gap-[10px] px-3 py-[9px] rounded-[10px] bg-[rgba(143,217,168,0.14)] border border-[rgba(143,217,168,0.4)]">
                <Icon name="check" size={14} stroke="#8FD9A8" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-bold text-cream tracking-[0.06em]">{voucher.code}</div>
                  <div className="text-[10.5px] text-[#8FD9A8]">{voucher.label} diterapkan</div>
                </div>
                <button
                  type="button"
                  onClick={clearVoucher}
                  title="Hapus voucher"
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
                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setVoucherErr(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") applyVoucher(); }}
                    placeholder="Kode voucher"
                    className={cn(
                      "flex-1 min-w-0 bg-[rgba(245,239,230,0.06)] rounded-[10px] px-3 py-[9px] text-cream font-body text-[12.5px] tracking-[0.08em] outline-none uppercase border placeholder:text-[rgba(245,239,230,0.4)]",
                      voucherErr ? "border-terracotta" : "border-[rgba(245,239,230,0.2)]",
                    )}
                  />
                  <button
                    type="button"
                    onClick={applyVoucher}
                    className="shrink-0 px-4 rounded-[10px] bg-peach text-charcoal font-bold text-[12.5px]"
                  >
                    Pakai
                  </button>
                </div>
                {voucherErr ? (
                  <div className="text-[10.5px] text-terracotta mt-[6px] flex items-center gap-[5px]">
                    <Icon name="x" size={11} stroke="var(--color-terracotta)" />{voucherErr}
                  </div>
                ) : (
                  <div className="text-[10.5px] text-[rgba(245,239,230,0.5)] mt-[6px]">Coba: CINTA20 · NIKAHYUK · MARITARE10</div>
                )}
              </>
            )}
          </div>

          {/* line items */}
          <div className="mt-5 flex flex-col gap-[12px]">
            <div className="flex justify-between items-baseline text-[13px]">
              <span className="text-[rgba(245,239,230,0.8)]">Paket {sel.name} · {sel.per}</span>
              <span className="font-display font-bold line-through text-[rgba(245,239,230,0.5)]">{rupiah(sel.price)}</span>
            </div>
            <div className="flex justify-between items-baseline text-[13px]">
              <span className="text-[rgba(245,239,230,0.8)] inline-flex items-center gap-[6px]">
                Promo Pembukaan
                <span className="text-[9px] px-[6px] py-px rounded-full bg-terracotta text-white font-extrabold tracking-[0.08em]">−{LAUNCH_PCT}%</span>
              </span>
              <span className="font-display font-bold text-[#8FD9A8]">− {rupiah(launchOff)}</span>
            </div>
            {voucher && (
              <div className="flex justify-between items-baseline text-[13px]">
                <span className="text-[rgba(245,239,230,0.8)] inline-flex items-center gap-[6px]">
                  Voucher {voucher.code}
                  <span className="text-[9px] px-[6px] py-px rounded-full bg-peach text-[#5a2a18] font-extrabold tracking-[0.08em]">−{voucher.pct}%</span>
                </span>
                <span className="font-display font-bold text-[#8FD9A8]">− {rupiah(voucherOff)}</span>
              </div>
            )}
            {credit > 0 && (
              <div className="flex justify-between items-baseline text-[13px]">
                <span className="text-[rgba(245,239,230,0.8)] inline-flex items-center gap-[6px]">
                  Kredit sisa Gold
                  <span className="text-[9px] text-peach tracking-[0.1em] uppercase font-display italic">173 hari</span>
                </span>
                <span className="font-display font-bold text-[#8FD9A8]">− {rupiah(credit)}</span>
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
              <div className="text-[9.5px] text-[#8FD9A8] font-bold tracking-[0.04em] mt-[5px]">Kamu hemat {rupiah(saved)}</div>
            </div>
          </div>

          <MobileButton type="button" full className="mt-5 bg-peach text-charcoal font-bold">
            Bayar {rupiah(total)} <Icon name="arrow-r" size={14} />
          </MobileButton>

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
    </MobileShell>
  );
}

"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/atoms/button";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import { SectionNumber } from "@/components/atoms/section-number";
import { Em } from "@/components/atoms/typography";
import { DashboardTopBar } from "@/components/organisms/dashboard-topbar";
import { DashboardShell } from "@/components/templates/dashboard-shell";
import { rupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DashboardChrome } from "@/server/queries/dashboard";

// Screen 08 · Checkout — ported 1:1 from the design's Final_Checkout.
//
// UI only: there is no payment backend yet (the gateway provider is undecided),
// so the plan/payment/voucher catalog below is baked from the design and the
// "Bayar" button is intentionally inert. When a provider is chosen, wire the
// selection state to a Server Action + order/promo tables. Until then this is a
// faithful, interactive mock. Live read data threaded in: sidebar `chrome` and
// the invoice `email`.

type PlanState = "lower" | "current" | "upgrade";
type Plan = {
  id: string;
  roman: string;
  name: string;
  price: number;
  per: string;
  guests: string;
  perks: string[];
  state: PlanState;
};

const LAUNCH_PCT = 20;
// Proportional credit for the still-active Gold plan, applied on upgrade.
const GOLD_CREDIT = 150_000;

const PLANS: Plan[] = [
  {
    id: "silver",
    roman: "I",
    name: "Silver",
    price: 150_000,
    per: "90 hari aktif",
    guests: "Hingga 100 tamu",
    perks: ["1 template editorial", "Galeri 30 foto", "RSVP & buku tamu digital"],
    state: "lower",
  },
  {
    id: "gold",
    roman: "II",
    name: "Gold",
    price: 300_000,
    per: "180 hari aktif",
    guests: "Hingga 300 tamu",
    perks: ["Semua dari Silver, plus →", "Subdomain nama.maritare.id", "Livestream & QR check-in"],
    state: "current",
  },
  {
    id: "platinum",
    roman: "III",
    name: "Platinum",
    price: 500_000,
    per: "1 tahun aktif",
    guests: "Tamu unlimited",
    perks: [
      "Semua dari Gold, plus →",
      "Custom domain (.com / .id)",
      "Galeri foto unlimited",
      "Konsultasi desain 1-on-1",
    ],
    state: "upgrade",
  },
];

type Pay = { id: string; label: string; desc: string; badge: string; color: string; recommended?: boolean };
const PAYS: Pay[] = [
  { id: "bca", label: "BCA Virtual Account", desc: "Transfer & verifikasi otomatis", badge: "BCA", color: "#0060AF", recommended: true },
  { id: "qris", label: "QRIS", desc: "Scan dari semua e-wallet & m-banking", badge: "QRIS", color: "#1a1a1a" },
  { id: "gopay", label: "GoPay", desc: "Saldo GoPay / GoPay Later", badge: "GoPay", color: "#00AED6" },
  { id: "ewallet", label: "OVO · DANA · ShopeePay", desc: "Bayar dengan e-wallet pilihanmu", badge: "e-wallet", color: "#4C2A86" },
  { id: "cc", label: "Kartu Kredit / Debit", desc: "Visa · Mastercard · JCB · cicilan 0%", badge: "Kartu", color: "#7c2d2d" },
];

type Voucher = { pct: number; label: string };
const VOUCHERS: Record<string, Voucher> = {
  CINTA20: { pct: 20, label: "Diskon 20%" },
  NIKAHYUK: { pct: 15, label: "Diskon 15%" },
  MARITARE10: { pct: 10, label: "Diskon 10%" },
};

// Fixed launch-promo window (2d 14h 22m 08s). Seeded as a constant so first
// paint matches on server and client; the live deadline is set on mount.
const PROMO_MS = ((2 * 24 + 14) * 3600 + 22 * 60 + 8) * 1000;

const CD_UNITS: Array<{ key: "hari" | "jam" | "mnt" | "dtk"; div: number; mod: number }> = [
  { key: "hari", div: 86_400_000, mod: Infinity },
  { key: "jam", div: 3_600_000, mod: 24 },
  { key: "mnt", div: 60_000, mod: 60 },
  { key: "dtk", div: 1_000, mod: 60 },
];

export function Checkout({ chrome, email }: { chrome: DashboardChrome | null; email: string }) {
  const [plan, setPlan] = useState("platinum");
  const [pay, setPay] = useState("bca");
  const [promoInput, setPromoInput] = useState("");
  const [voucher, setVoucher] = useState<{ code: string } & Voucher | null>(null);
  const [voucherErr, setVoucherErr] = useState("");
  const [remain, setRemain] = useState(PROMO_MS);

  useEffect(() => {
    const deadline = Date.now() + PROMO_MS;
    const t = setInterval(() => setRemain(Math.max(0, deadline - Date.now())), 1000);
    return () => clearInterval(t);
  }, []);

  function applyVoucher() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const found = VOUCHERS[code];
    if (found) {
      setVoucher({ code, ...found });
      setVoucherErr("");
    } else {
      setVoucherErr("Kode voucher tidak valid atau sudah berakhir.");
    }
  }

  const sel = PLANS.find((p) => p.id === plan)!;
  const launchOff = Math.round((sel.price * LAUNCH_PCT) / 100);
  const afterLaunch = sel.price - launchOff;
  const voucherOff = voucher ? Math.round((afterLaunch * voucher.pct) / 100) : 0;
  const credit = plan === "platinum" ? GOLD_CREDIT : 0;
  const total = Math.max(0, sel.price - launchOff - voucherOff - credit);
  const saved = launchOff + voucherOff + credit;
  const verb = plan === "gold" ? "Perpanjang" : "Upgrade ke";

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
                <Icon name="card" size={13} /> Paket aktif: <span className="text-burgundy">Gold</span>
              </span>
              <Button variant="ghost"><Icon name="list" size={14} />Riwayat tagihan</Button>
            </>
          }
        />

        <div className="flex-1 px-10 py-[26px] overflow-y-auto grid grid-cols-[1fr_360px] gap-6">
          {/* LEFT — plan + payment selection */}
          <div className="flex flex-col gap-5 min-w-0">
            {/* Promo countdown banner */}
            <div className="flex items-center justify-between gap-4 pl-[14px] pr-4 py-[11px] rounded-[14px] bg-peach border border-burgundy/15">
              <div className="flex items-center gap-3">
                <span className="w-[30px] h-[30px] rounded-lg bg-burgundy text-peach flex items-center justify-center shrink-0">
                  <Icon name="sparkle" size={15} />
                </span>
                <div>
                  <div className="font-display italic text-base text-burgundy-dark leading-none">
                    Promo Pembukaan · hemat {LAUNCH_PCT}%
                  </div>
                  <div className="text-[11px] text-[#5a2a18] mt-[3px]">
                    Berlaku untuk semua paket — harga sudah otomatis dipotong.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-[6px]">
                <span className="text-[9px] text-[#5a2a18] tracking-[0.16em] uppercase font-bold mr-[2px]">Berakhir</span>
                {CD_UNITS.map((u) => {
                  const v = Math.floor(remain / u.div) % u.mod;
                  return (
                    <div key={u.key} className="text-center min-w-[36px] px-[6px] py-[5px] rounded-lg bg-burgundy-dark text-peach">
                      <div className="font-display font-extrabold text-[17px] leading-none tabular-nums">
                        {String(v).padStart(2, "0")}
                      </div>
                      <div className="text-[7px] tracking-[0.12em] uppercase opacity-70 mt-[2px]">{u.key}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* i · Pilih paket */}
            <section>
              <div className="flex items-baseline justify-between mb-3">
                <SectionNumber className="text-[12px]">i. Pilih paket</SectionNumber>
                <span className="text-[12px] font-display italic text-muted-ink">
                  Bayar sekali — tanpa langganan bulanan.
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {PLANS.map((p) => {
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
                        "text-left font-body rounded-2xl px-4 pt-4 pb-[14px] relative flex flex-col border",
                        active
                          ? "bg-charcoal text-cream border-[1.5px] border-charcoal"
                          : "bg-paper text-charcoal border-line",
                        locked ? "opacity-55 cursor-not-allowed" : "cursor-pointer",
                      )}
                    >
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

                      <div className="flex items-center gap-[6px] mt-2">
                        <span className={cn("font-display font-semibold text-[12px] line-through", active ? "text-[rgba(245,239,230,0.5)]" : "text-faint")}>
                          Rp {(p.price / 1000).toLocaleString("id-ID")}rb
                        </span>
                        <span className={cn(
                          "text-[8px] px-[6px] py-[2px] rounded-full font-extrabold tracking-[0.08em]",
                          active ? "bg-terracotta text-white" : "bg-burgundy/10 text-burgundy",
                        )}>
                          −{LAUNCH_PCT}%
                        </span>
                      </div>
                      <div className="flex items-baseline gap-[3px] mt-[2px]">
                        <span className={cn("text-[12px] font-bold", active ? "text-[rgba(245,239,230,0.7)]" : "text-muted-ink")}>Rp</span>
                        <span className={cn("font-display font-extrabold text-[26px] tracking-[-0.02em]", active ? "text-cream" : "text-charcoal")}>
                          {((p.price - Math.round((p.price * LAUNCH_PCT) / 100)) / 1000).toLocaleString("id-ID")}
                        </span>
                        <span className={cn("text-[12px] font-bold", active ? "text-[rgba(245,239,230,0.7)]" : "text-muted-ink")}>rb</span>
                      </div>
                      <div className={cn("text-[11px] mt-[3px] tracking-[0.04em]", active ? "text-[rgba(245,239,230,0.6)]" : "text-muted-ink")}>
                        {p.per} · {p.guests}
                      </div>

                      <div className={cn("h-px my-3", active ? "bg-[rgba(245,239,230,0.14)]" : "bg-line")} />

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
            </section>

            {/* ii · Metode pembayaran */}
            <section className="flex flex-col min-h-0">
              <div className="flex items-baseline justify-between mb-3">
                <SectionNumber className="text-[12px]">ii. Metode pembayaran</SectionNumber>
                <span className="text-[11px] text-muted-ink inline-flex items-center gap-[6px]">
                  <Icon name="qr" size={13} /> Diproses aman lewat payment gateway
                </span>
              </div>

              <div className="grid grid-cols-2 gap-[10px]">
                {PAYS.map((m) => {
                  const active = pay === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPay(m.id)}
                      className={cn(
                        "text-left font-body flex items-center gap-3 bg-paper rounded-xl px-[13px] py-[11px] border cursor-pointer",
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
            </section>
          </div>

          {/* RIGHT — sticky order summary */}
          <aside className="flex flex-col gap-[14px] h-full min-h-0">
            <div className="flex-1 bg-charcoal text-cream rounded-2xl px-7 pt-8 pb-7 relative overflow-hidden flex flex-col">
              <div className="absolute -top-9 -right-10 w-[170px] h-[170px] opacity-[0.07]">
                <FlowerMark size={170} color="var(--color-peach)" core="var(--color-peach)" stamen="var(--color-terracotta)" />
              </div>

              <div className="relative z-[2] flex flex-col flex-1">
                <SectionNumber className="text-[11px] text-peach before:bg-peach">Ringkasan pesanan</SectionNumber>
                <div className="font-display font-extrabold text-2xl text-cream leading-[1.05] tracking-[-0.025em] mt-[6px]">
                  {verb} <Em className="text-peach">{sel.name}.</Em>
                </div>
                <div className="font-display italic text-[13px] text-[rgba(245,239,230,0.65)] mt-1">
                  {sel.per} · {sel.guests}
                </div>

                {/* voucher */}
                <div className="mt-[22px]">
                  {voucher ? (
                    <div className="flex items-center gap-[10px] px-3 py-[9px] rounded-[10px] bg-[rgba(143,217,168,0.14)] border border-[rgba(143,217,168,0.4)]">
                      <Icon name="check" size={14} stroke="#8FD9A8" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-bold text-cream tracking-[0.06em]">{voucher.code}</div>
                        <div className="text-[10.5px] text-[#8FD9A8]">{voucher.label} diterapkan</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setVoucher(null); setPromoInput(""); }}
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
                          placeholder="Masukkan kode voucher"
                          className={cn(
                            "flex-1 bg-[rgba(245,239,230,0.06)] rounded-[10px] px-3 py-[9px] text-cream font-body text-[12.5px] tracking-[0.08em] outline-none uppercase border placeholder:text-[rgba(245,239,230,0.4)]",
                            voucherErr ? "border-terracotta" : "border-[rgba(245,239,230,0.2)]",
                          )}
                        />
                        <Button type="button" size="sm" onClick={applyVoucher} className="bg-peach text-charcoal font-bold hover:bg-peach">
                          Pakai
                        </Button>
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
                <div className="mt-6 flex flex-col gap-[13px]">
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

                <div className="h-px bg-[rgba(245,239,230,0.16)] mt-auto mb-4" />

                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[9px] text-[rgba(245,239,230,0.55)] tracking-[0.22em] uppercase font-semibold">Total bayar</div>
                    <div className="text-[10px] text-[rgba(245,239,230,0.5)] font-display italic mt-[2px]">Sudah termasuk PPN</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-extrabold text-[32px] text-peach tracking-[-0.02em] leading-none">{rupiah(total)}</div>
                    <div className="text-[9.5px] text-[#8FD9A8] font-bold tracking-[0.04em] mt-[5px]">Kamu hemat {rupiah(saved)}</div>
                  </div>
                </div>

                <Button type="button" className="w-full justify-center mt-5 bg-peach text-charcoal font-bold py-[14px] h-auto hover:bg-peach">
                  Bayar {rupiah(total)} <Icon name="arrow-r" size={14} />
                </Button>

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
          </aside>
        </div>
      </main>
    </DashboardShell>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/atoms/button";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import { SectionNumber } from "@/components/atoms/section-number";
import { Em } from "@/components/atoms/typography";
import { rupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PaymentOrderData } from "@/server/queries/payment";
import { getOrderStatus } from "@/server/actions/checkout";

// Our own payment page. The VA number / QR come from DOKU SNAP but every pixel
// here is maritare's — that is the whole point of taking the Direct API route
// instead of the hosted checkout.
//
// Settlement is the webhook's job; this screen only watches for it. Polling is
// the fallback for the case the customer keeps the tab open — the page also
// re-checks on refocus, which is what actually happens when someone returns
// from their banking app.

const POLL_MS = 5000;

export function PaymentInstructions({ order }: { order: PaymentOrderData }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [copied, setCopied] = useState<string | null>(null);
  const [remain, setRemain] = useState<number | null>(null);

  // Narrowed once here: a `?.kind === "va"` check doesn't survive into a JSX
  // closure, which is what forces non-null assertions further down otherwise.
  const instrument = order.instrument;
  const va = instrument?.kind === "va" ? instrument : null;
  const qris = instrument?.kind === "qris" ? instrument : null;
  const expiresAt = instrument?.expiresAt ?? null;

  // Countdown to the instrument's expiry.
  useEffect(() => {
    if (!expiresAt) return;
    const deadline = new Date(expiresAt).getTime();
    if (Number.isNaN(deadline)) return;
    const tick = () => setRemain(Math.max(0, deadline - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  // Watch for the webhook settling this order. Stops as soon as it is no longer
  // pending so a paid page isn't hitting the server forever.
  useEffect(() => {
    if (status !== "pending") return;
    let alive = true;
    async function check() {
      const next = await getOrderStatus(order.invoiceNo);
      if (!alive || !next || next === "pending") return;
      setStatus(next);
      router.refresh(); // pull the sidebar package pill back in sync
    }
    const t = setInterval(check, POLL_MS);
    window.addEventListener("focus", check);
    return () => {
      alive = false;
      clearInterval(t);
      window.removeEventListener("focus", check);
    };
  }, [status, order.invoiceNo, router]);

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    } catch {
      // Clipboard can be blocked (insecure origin, permissions) — the number is
      // on screen and selectable, so failing quietly is fine.
    }
  }

  const expired = remain !== null && remain === 0 && status === "pending";

  return (
    <div className="max-w-[560px] mx-auto w-full flex flex-col gap-[14px]">
      <div className="bg-charcoal text-cream rounded-2xl px-7 pt-8 pb-7 relative overflow-hidden">
        <div className="absolute -top-9 -right-10 w-[170px] h-[170px] opacity-[0.07]">
          <FlowerMark size={170} color="var(--color-peach)" core="var(--color-peach)" stamen="var(--color-terracotta)" />
        </div>

        <div className="relative z-[2]">
          <SectionNumber className="text-[11px] text-peach before:bg-peach">
            {order.invoiceNo}
          </SectionNumber>

          {status === "paid" ? (
            <>
              <div className="font-display font-extrabold text-2xl text-cream leading-[1.05] tracking-[-0.025em] mt-[6px]">
                Pembayaran <Em className="text-peach">berhasil.</Em>
              </div>
              <div className="font-display italic text-[13px] text-[rgba(245,239,230,0.65)] mt-1">
                {order.description ?? "Paket undangan"} · {rupiah(order.amount)}
              </div>
              <div className="flex items-center gap-[10px] px-3 py-[11px] rounded-[10px] bg-[rgba(143,217,168,0.14)] border border-[rgba(143,217,168,0.4)] mt-5">
                <Icon name="check" size={16} stroke="#8FD9A8" />
                <div className="text-[12.5px] text-cream">
                  Paketmu sudah aktif. Undangan siap dipublish.
                </div>
              </div>
              <Button
                type="button"
                onClick={() => router.push("/dashboard/editor")}
                className="w-full justify-center mt-5 bg-peach text-charcoal font-bold py-[14px] h-auto hover:bg-peach"
              >
                Lanjut ke editor <Icon name="arrow-r" size={14} />
              </Button>
            </>
          ) : (
            <>
              <div className="font-display font-extrabold text-2xl text-cream leading-[1.05] tracking-[-0.025em] mt-[6px]">
                {qris ? (
                  <>Scan untuk <Em className="text-peach">bayar.</Em></>
                ) : (
                  <>Transfer ke <Em className="text-peach">Virtual Account.</Em></>
                )}
              </div>
              <div className="font-display italic text-[13px] text-[rgba(245,239,230,0.65)] mt-1">
                {order.description ?? "Paket undangan"}
              </div>

              {/* amount */}
              <div className="mt-[22px] flex items-end justify-between gap-3">
                <div>
                  <div className="text-[9px] text-[rgba(245,239,230,0.55)] tracking-[0.22em] uppercase font-semibold">
                    Jumlah tepat
                  </div>
                  <div className="font-display font-extrabold text-[30px] text-peach tracking-[-0.02em] leading-none mt-[5px]">
                    {rupiah(order.amount)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copy(String(order.amount), "amount")}
                  className="shrink-0 text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-2 rounded-[10px] border border-[rgba(245,239,230,0.25)] text-cream"
                >
                  {copied === "amount" ? "Tersalin" : "Salin"}
                </button>
              </div>

              {va && (
                <div className="mt-5">
                  <div className="text-[9px] text-[rgba(245,239,230,0.55)] tracking-[0.22em] uppercase font-semibold">
                    Virtual Account {va.bank}
                  </div>
                  <div className="flex items-center gap-2 mt-[6px]">
                    <div className="flex-1 font-display font-extrabold text-[22px] text-cream tracking-[0.06em] tabular-nums break-all">
                      {va.virtualAccountNo}
                    </div>
                    <button
                      type="button"
                      onClick={() => copy(va.virtualAccountNo, "va")}
                      className="shrink-0 text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-2 rounded-[10px] bg-peach text-charcoal"
                    >
                      {copied === "va" ? "Tersalin" : "Salin"}
                    </button>
                  </div>
                </div>
              )}

              {qris && order.qrDataUrl && (
                <div className="mt-5 flex flex-col items-center">
                  <div className="bg-white rounded-2xl p-4">
                    {/* Plain <img>, matching the rest of the app: the src is an
                        inline data URI, so next/image has nothing to optimise and
                        no network request is saved. eager + a fixed box because a
                        lazily-collapsed QR is an unscannable QR. */}
                    {/* eslint-disable-next-line @next/next/no-img-element -- data URI: nothing for the optimiser to do */}
                    <img
                      src={order.qrDataUrl}
                      alt={`QRIS untuk ${order.invoiceNo}`}
                      width={240}
                      height={240}
                      loading="eager"
                      className="w-[240px] h-[240px] block"
                    />
                  </div>
                  <div className="text-[11px] text-[rgba(245,239,230,0.6)] mt-3 text-center">
                    Scan pakai GoPay, OVO, DANA, ShopeePay, atau m-banking apa pun.
                  </div>
                </div>
              )}

              {!instrument && (
                <div className="mt-5 text-[12.5px] text-[rgba(245,239,230,0.7)]">
                  Instruksi pembayaran belum tersedia. Coba buat pesanan baru dari halaman tagihan.
                </div>
              )}

              <div className="h-px bg-[rgba(245,239,230,0.16)] my-5" />

              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] text-[rgba(245,239,230,0.6)]">
                  {expired ? (
                    <span className="text-terracotta font-semibold">Batas waktu pembayaran habis.</span>
                  ) : remain !== null ? (
                    <>Bayar sebelum <span className="text-peach font-bold tabular-nums">{formatRemain(remain)}</span></>
                  ) : (
                    "Menunggu pembayaran…"
                  )}
                </div>
                <div className={cn(
                  "flex items-center gap-[6px] text-[11px]",
                  expired ? "text-terracotta" : "text-[rgba(245,239,230,0.55)]",
                )}>
                  {!expired && (
                    <span className="w-[7px] h-[7px] rounded-full bg-peach animate-pulse" aria-hidden />
                  )}
                  {expired ? "Kedaluwarsa" : "Cek otomatis"}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {status !== "paid" && (
        <div className="bg-paper border border-line rounded-[14px] px-4 py-[13px] flex gap-[11px] items-start">
          <span className="w-7 h-7 rounded-lg bg-peach text-burgundy-dark flex items-center justify-center shrink-0">
            <Icon name="check" size={14} />
          </span>
          <div className="text-[11.5px] leading-[1.5] text-muted-ink">
            Halaman ini update sendiri begitu pembayaranmu masuk — nggak perlu di-refresh.
            Transfer <span className="text-charcoal font-semibold">persis {rupiah(order.amount)}</span> ya,
            supaya otomatis terverifikasi.
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => router.push("/dashboard/billing")}
        className="text-[11.5px] text-muted-ink hover:text-charcoal self-center"
      >
        ← Kembali ke tagihan
      </button>
    </div>
  );
}

function formatRemain(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

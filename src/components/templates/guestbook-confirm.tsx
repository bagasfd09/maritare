"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/atoms/icon";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { GuestbookShell } from "@/components/templates/guestbook-shell";
import { GuestbookButton, GuestbookStep } from "@/components/molecules/guestbook-primitives";
import { checkInGuest } from "@/server/actions/guestbook";
import type { KioskGuest, KioskHeader } from "@/server/queries/guestbook";
import { cn } from "@/lib/utils";

// Headcount bounds — at least the guest themselves, capped to keep the kiosk sane.
const MIN_GUESTS = 1;
const MAX_GUESTS = 20;

// Guestbook 04 · Konfirmasi — guest found, confirm check-in.
// Ported from `Gb2_Confirm`; now wired to the real guest plus a server-action
// check-in. The +pendamping stepper seeds from the guest's RSVP.

// gb2Eyebrow base (size applied per usage).
const eyebrow = "font-body tracking-[0.24em] uppercase font-semibold text-muted-ink";

type GuestbookConfirmProps = {
  header: KioskHeader | null;
  guest: KioskGuest;
};

export function GuestbookConfirm({ header, guest }: GuestbookConfirmProps) {
  const router = useRouter();
  const [count, setCount] = useState(guest.partySize ?? 2);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Couple names + side label resolve from the live header, falling back to the
  // prototype couple so copy never renders blank.
  const groom = header?.groomName ?? "Andi";
  const bride = header?.brideName ?? "Putri";
  const sideLabel =
    guest.side === "groom" ? groom : guest.side === "bride" ? bride : guest.side === "both" ? "—" : guest.side;

  const info = [
    { l: "Grup", v: guest.group ?? "Tamu Undangan" },
    { l: "Pihak", v: sideLabel },
    { l: "RSVP", v: `${guest.partySize ?? "—"} orang` },
  ];

  const onConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await checkInGuest({
        guestId: guest.id,
        partySize: count,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/guestbook/thankyou?guest=${guest.id}`);
    });
  };

  return (
    <GuestbookShell eyebrow="Buku Tamu · Konfirmasi" header={header}>
      <div className="relative h-full grid grid-cols-[1.4fr_1fr] gap-10 px-14 pt-9 pb-[30px] overflow-hidden">
        {/* Decorative florals — subtle, behind everything (matches the kiosk's
            other screens). pointer-events-none so they never block taps. */}
        <div className="pointer-events-none absolute -top-[70px] -left-[60px] opacity-[0.05]">
          <FlowerMark size={230} color="var(--color-burgundy)" core="var(--color-burgundy)" stamen="var(--color-terracotta)" />
        </div>
        <div className="pointer-events-none absolute -bottom-[90px] right-[28px] opacity-[0.05]">
          <FlowerMark size={190} color="var(--color-terracotta)" core="var(--color-terracotta)" stamen="var(--color-peach)" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(234,211,194,0.16),transparent_45%)]" />

        {/* Left: welcome */}
        <div className="relative flex flex-col">
          <GuestbookStep>02 · konfirmasi kehadiran</GuestbookStep>
          <div className="font-display italic text-terracotta text-[24px] leading-none mt-5 select-none" aria-hidden="true">
            ❦
          </div>
          <div className="font-display italic font-normal tracking-[-0.01em] text-[34px] text-muted-ink mt-1 leading-none">
            Selamat datang,
          </div>
          <h1 className="font-display [font-variation-settings:'opsz'_144] font-extrabold text-[84px] tracking-[-0.04em] leading-[0.96] text-burgundy m-0 mt-2">
            {guest.name}.
          </h1>
          {/* Ornamental divider — hairline · flower · fading hairline */}
          <div className="flex items-center gap-3 mt-6 mb-[18px]">
            <span className="h-px w-16 bg-[#C9BC9A]" />
            <FlowerMark size={16} color="var(--color-terracotta)" core="var(--color-burgundy)" stamen="var(--color-peach)" />
            <span className="h-px flex-1 max-w-[140px] bg-gradient-to-r from-[#C9BC9A] to-transparent" />
          </div>
          <p className="font-body text-[17px] leading-[1.6] text-[#3F3B35] max-w-[470px] m-0">
            Terima kasih telah hadir di hari bahagia {groom} &amp; {bride}. Kami
            senang sekali bisa berbagi momen ini bersama kamu dan keluarga.
          </p>

          {/* Info card */}
          <div className="mt-auto bg-paper border border-line rounded-2xl px-6 py-5">
            <div className="grid grid-cols-[1.4fr_0.8fr_1fr] gap-[22px]">
              {info.map((d) => (
                <div key={d.l}>
                  <div className={cn(eyebrow, "text-[9.5px]")}>{d.l}</div>
                  <div className="font-display font-semibold text-[17px] tracking-[-0.015em] text-charcoal mt-[6px] leading-[1.25]">
                    {d.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: stepper + CTA */}
        <div className="relative flex flex-col gap-[14px]">
          <div className="bg-paper border border-line rounded-[18px] px-[26px] py-5">
            <div className="flex items-center gap-2 mb-[14px]">
              <FlowerMark size={14} color="var(--color-terracotta)" core="var(--color-burgundy)" stamen="var(--color-peach)" />
              <div className={cn(eyebrow, "text-[10px]")}>Hadir bersama berapa orang?</div>
            </div>
            <div className="flex items-center justify-between gap-[14px]">
              <button
                type="button"
                onClick={() => setCount((c) => Math.max(MIN_GUESTS, c - 1))}
                disabled={count <= MIN_GUESTS || pending}
                aria-label="Kurangi jumlah orang"
                className="w-[62px] h-[62px] rounded-full border border-charcoal/[0.22] bg-transparent text-charcoal text-[28px] font-body cursor-pointer transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &minus;
              </button>
              <div className="text-center">
                <div className="font-display [font-variation-settings:'opsz'_144] font-extrabold text-[76px] tracking-[-0.05em] leading-[0.9] text-burgundy m-0 tabular-nums">
                  {count}
                </div>
                <div className={cn(eyebrow, "text-[9.5px] mt-[6px]")}>orang</div>
              </div>
              <button
                type="button"
                onClick={() => setCount((c) => Math.min(MAX_GUESTS, c + 1))}
                disabled={count >= MAX_GUESTS || pending}
                aria-label="Tambah jumlah orang"
                className="w-[62px] h-[62px] rounded-full border-none bg-charcoal text-cream text-[28px] font-body cursor-pointer shadow-[0_10px_20px_-8px_rgba(26,26,26,0.4)] transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            <div className="font-body text-[12.5px] leading-[1.6] text-faint text-center mt-[10px]">
              Sesuai konfirmasi RSVP awal
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            {/* Error line — burgundy, only on a failed check-in. */}
            {error && (
              <div className="font-body text-[12.5px] leading-[1.5] text-burgundy text-center">
                {error}
              </div>
            )}
            <GuestbookButton
              type="button"
              onClick={onConfirm}
              disabled={pending}
              h={62}
              fz={13.5}
              className="w-full disabled:opacity-60 disabled:cursor-not-allowed"
              iconAfter={!pending ? <Icon name="arrow-r" size={17} /> : undefined}
            >
              {pending ? "Menyimpan…" : "Konfirmasi check-in"}
            </GuestbookButton>
            {/* Back to search — outlined burgundy pill so the "wrong guest"
                escape hatch reads clearly as a tappable button. */}
            <Link
              href="/guestbook/search"
              className={cn(
                eyebrow,
                "text-[11px] text-burgundy h-[50px] rounded-full border-[1.5px] border-burgundy/45 bg-burgundy/[0.04]",
                "inline-flex items-center justify-center gap-[10px] no-underline",
                pending && "pointer-events-none opacity-50",
              )}
            >
              <Icon name="arrow-r" size={14} className="rotate-180" stroke="var(--color-burgundy)" />
              Bukan saya · Cari ulang
            </Link>
          </div>
        </div>
      </div>
    </GuestbookShell>
  );
}

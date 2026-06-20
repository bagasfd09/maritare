"use client";

// Amplop digital — bank accounts and e-wallets with copy-to-clipboard, plus an
// optional physical gift address. Hidden when both account lists are empty.

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/atoms/icon";
import type { AmplopData } from "@/lib/invitation/sections";

import { FloraDivider, OrnamentImg } from "./flora-ornaments";
import { Reveal } from "./reveal";

type FloraGiftProps = {
  amplop: AmplopData;
};

type AccountCardProps = {
  /** "BCA" / "GoPay" — rendered as a small-caps label. */
  label: string;
  number: string;
  holder: string;
  copyKey: string;
  copiedKey: string | null;
  onCopy: (key: string, value: string) => void;
};

function AccountCard({ label, number, holder, copyKey, copiedKey, onCopy }: AccountCardProps) {
  const copied = copiedKey === copyKey;
  return (
    <div className="rounded-2xl border border-line bg-paper px-6 py-6 text-center shadow-[0_14px_30px_-22px_rgba(60,30,10,0.35)]">
      <p className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-burgundy">
        {label}
      </p>
      <p className="mt-3 font-body text-[20px] font-medium tracking-[0.14em] text-charcoal [font-feature-settings:'tnum']">
        {number}
      </p>
      <p className="mt-1.5 font-body text-[12.5px] text-muted-ink">a.n. {holder}</p>
      <button
        type="button"
        onClick={() => onCopy(copyKey, number)}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-burgundy px-5 py-2 font-body text-[11px] font-medium uppercase tracking-[0.16em] text-burgundy transition hover:bg-burgundy hover:text-ivory"
      >
        <Icon name={copied ? "check" : "copy"} size={13} />
        {copied ? "Tersalin ✓" : "Salin"}
      </button>
    </div>
  );
}

export function FloraGift({ amplop }: FloraGiftProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  if (amplop.accounts.length === 0 && amplop.ewallets.length === 0) {
    return null;
  }

  const handleCopy = (key: string, value: string) => {
    // Strip spaces/dashes so the pasted number is bank-app ready.
    void navigator.clipboard
      .writeText(value.replace(/[\s-]/g, ""))
      .then(() => {
        setCopiedKey(key);
        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setCopiedKey(null), 2000);
      })
      .catch(() => {
        // Clipboard unavailable (http / old browser) — quietly do nothing.
      });
  };

  return (
    <section className="relative overflow-hidden bg-cream/60 px-8 py-16 text-center">
      {/* deep red rose accent hugging the top-right corner */}
      <Reveal variant="fade-left" className="pointer-events-none absolute -right-14 -top-10 w-40">
        <OrnamentImg
          asset="rose-red"
          mirrored
          className="-rotate-[16deg]"
          sway
          swayOrigin="origin-bottom-left"
        />
      </Reveal>

      <div className="relative">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-ink">
          Tanda Kasih
        </p>
        <h2 className="mt-4 font-display text-[28px] font-bold tracking-[-0.02em] text-charcoal [font-variation-settings:'opsz'_96]">
          Amplop <span className="font-normal italic text-burgundy">digital</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[320px] font-body text-[13px] leading-relaxed text-muted-ink">
          Kehadiranmu adalah hadiah terindah bagi kami. Namun jika ingin berbagi tanda kasih, kami
          sediakan amplop digital berikut:
        </p>
      </div>

      <div className="relative mt-10 space-y-5">
        {amplop.accounts.map((account, i) => (
          <Reveal key={`bank-${i}`} delay={(i % 3) * 120}>
            <AccountCard
              label={account.bank}
              number={account.number}
              holder={account.holder}
              copyKey={`bank-${i}`}
              copiedKey={copiedKey}
              onCopy={handleCopy}
            />
          </Reveal>
        ))}
        {amplop.ewallets.map((wallet, i) => (
          <Reveal key={`ewallet-${i}`} delay={((amplop.accounts.length + i) % 3) * 120}>
            <AccountCard
              label={wallet.provider}
              number={wallet.number}
              holder={wallet.holder}
              copyKey={`ewallet-${i}`}
              copiedKey={copiedKey}
              onCopy={handleCopy}
            />
          </Reveal>
        ))}
      </div>

      {amplop.giftAddress && (
        <div className="mt-8 rounded-2xl border border-dashed border-rule bg-ivory px-6 py-6">
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-burgundy">
            Kirim Kado
          </p>
          <p className="mx-auto mt-3 max-w-[280px] font-body text-[12.5px] leading-relaxed text-muted-ink">
            {amplop.giftAddress}
          </p>
        </div>
      )}

      <FloraDivider className="mx-auto mt-14 w-48 text-rule" />
    </section>
  );
}

"use client";

// Amplop digital — bank accounts + e-wallets with copy-to-clipboard (identical
// logic to Flora), plus an optional physical gift address. Folk restyle.

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/atoms/icon";
import type { AmplopData } from "@/lib/invitation/sections";

import { Reveal } from "../flora/reveal";
import { FolkFloral } from "./folk-ornaments";

type FolkGiftProps = {
  amplop: AmplopData;
};

type AccountCardProps = {
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
    <div className="rounded-[22px] border border-[#C9A24B]/60 bg-[#F5EFE0] px-6 py-6 text-center shadow-[0_14px_30px_-22px_rgba(0,0,0,0.45)] ring-1 ring-inset ring-[#C9A24B]/25">
      <p className="[font-family:var(--font-caveat)] text-[20px] font-semibold text-[#9E2B62]">
        {label}
      </p>
      <p className="mt-2 font-body text-[20px] font-medium tracking-[0.14em] text-[#3C471F] [font-feature-settings:'tnum']">
        {number}
      </p>
      <p className="mt-1.5 font-body text-[12.5px] text-[#52602F]">a.n. {holder}</p>
      <button
        type="button"
        onClick={() => onCopy(copyKey, number)}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#9E2B62] px-5 py-2 font-body text-[11px] font-medium uppercase tracking-[0.16em] text-[#F5EFE0] transition hover:bg-[#7A1E48]"
      >
        <Icon name={copied ? "check" : "copy"} size={13} />
        {copied ? "Tersalin ✓" : "Salin"}
      </button>
    </div>
  );
}

export function FolkGift({ amplop }: FolkGiftProps) {
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
    <section className="px-5 pb-10">
      <Reveal variant="zoom-in">
        <div className="relative overflow-hidden rounded-[28px] bg-[#9E2B62] px-7 pb-9 pt-8 shadow-[0_20px_44px_-26px_rgba(0,0,0,0.55)]">
          {/* lush burgundy roses bleeding from the top-right corner */}
          <FolkFloral
            name="burgundy-roses-bouquet"
            className="pointer-events-none absolute -right-10 -top-8 w-[140px] select-none opacity-90"
          />

          <div className="relative text-center">
            <FolkFloral name="gold-ornament" className="mx-auto mb-2 h-12 w-auto opacity-95" />
            <p className="[font-family:var(--font-caveat)] text-[22px] font-semibold text-[#E8A0B8]">
              Tanda Kasih
            </p>
            <h2 className="mt-1 font-display text-[26px] font-bold tracking-[-0.02em] text-[#F5EFE0] [font-variation-settings:'opsz'_96]">
              Amplop digital
            </h2>
            <p className="mx-auto mt-3 max-w-[320px] font-body text-[13px] leading-relaxed text-[#F5EFE0]/85">
              Kehadiranmu adalah hadiah terindah bagi kami. Namun jika ingin berbagi tanda kasih, kami
              sediakan amplop digital berikut:
            </p>
          </div>

          <div className="relative mt-8 space-y-4">
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
            <div className="relative mt-6 rounded-[22px] border border-dashed border-[#F5EFE0]/50 bg-[#7A1E48]/40 px-6 py-6 text-center">
              <p className="[font-family:var(--font-caveat)] text-[19px] font-semibold text-[#E8A0B8]">
                Kirim Kado
              </p>
              <p className="mx-auto mt-2 max-w-[280px] font-body text-[12.5px] leading-relaxed text-[#F5EFE0]/85">
                {amplop.giftAddress}
              </p>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}

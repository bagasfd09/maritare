"use client";

// Amplop digital — bank accounts and e-wallets inside the ornamental brown card
// frame, with copy-to-clipboard, plus an optional physical gift address.

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/atoms/icon";
import type { AmplopData } from "@/lib/invitation/sections";

import { DIVIDER_GOLD, FRAME_CARD, SHIELD_RED, ScarletImg } from "./scarlet-ornaments";
import { Reveal } from "../flora/reveal";

type ScarletGiftProps = {
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
    <div className="relative mx-auto w-[280px]">
      <ScarletImg name={FRAME_CARD} className="w-full" />
      <div className="absolute inset-x-[13%] bottom-[10%] top-[10%] flex flex-col items-center justify-center text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#700f06]">{label}</p>
        <p className="mt-3 text-[20px] font-light tracking-[0.14em] text-[#2a221c] [font-feature-settings:'tnum']">
          {number}
        </p>
        <p className="mt-1.5 text-[12px] text-[#6f6253]">a.n. {holder}</p>
        <button
          type="button"
          onClick={() => onCopy(copyKey, number)}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#700f06] px-5 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#700f06] transition hover:bg-[#700f06] hover:text-[#f5f2e4]"
        >
          <Icon name={copied ? "check" : "copy"} size={12} />
          {copied ? "Tersalin ✓" : "Salin"}
        </button>
      </div>
    </div>
  );
}

export function ScarletGift({ amplop }: ScarletGiftProps) {
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
    <section className="relative overflow-hidden bg-[#f5f2e4] px-8 py-20 text-center">
      <ScarletImg name={SHIELD_RED} className="mx-auto mb-5 w-11" />
      <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-[#8a643c]">
        Tanda Kasih
      </p>
      <h2 className="mt-4 [font-family:var(--font-cormorant)] text-[34px] font-light leading-tight text-[#2a221c]">
        Amplop <span className="italic text-[#700f06]">digital</span>
      </h2>
      <p className="mx-auto mt-4 max-w-[320px] text-[12.5px] leading-relaxed text-[#6f6253]">
        Kehadiranmu adalah hadiah terindah bagi kami. Namun jika ingin berbagi tanda kasih, kami
        sediakan amplop digital berikut:
      </p>

      <div className="mt-10 space-y-6">
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
        <div className="mx-auto mt-8 max-w-[300px] border border-dashed border-[#cdbb9a] bg-[#fcf9f4] px-6 py-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#700f06]">
            Kirim Kado
          </p>
          <p className="mx-auto mt-3 max-w-[260px] text-[12px] leading-relaxed text-[#6f6253]">
            {amplop.giftAddress}
          </p>
        </div>
      )}

      <ScarletImg name={DIVIDER_GOLD} className="mx-auto mt-12 w-48" />
    </section>
  );
}

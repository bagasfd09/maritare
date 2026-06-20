"use client";

// Amplop digital — bank accounts and e-wallets with copy-to-clipboard, plus an
// optional physical gift address. Hidden when both account lists are empty.
// Copy interaction is identical to Flora; restyled to crimson/gold.

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/atoms/icon";
import type { AmplopData } from "@/lib/invitation/sections";

import { Reveal } from "../flora/reveal";
import { CrimsonFloralImg } from "./crimson-florals";
import { CrimsonCardFrame, CrimsonDivider } from "./crimson-ornaments";

type CrimsonGiftProps = {
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
    <div className="relative rounded-[18px] bg-[#F4ECDC] px-6 py-6 text-center shadow-[0_16px_34px_-24px_rgba(110,22,34,0.45)]">
      <CrimsonCardFrame className="pointer-events-none absolute inset-0 h-full w-full text-[#C9A24B]" />
      <p className="relative font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8B1E2D]">
        {label}
      </p>
      <p className="relative mt-3 font-body text-[20px] font-medium tracking-[0.14em] text-[#2A2320] [font-feature-settings:'tnum']">
        {number}
      </p>
      <p className="relative mt-1.5 font-body text-[12.5px] text-[#7C7E5E]">a.n. {holder}</p>
      <button
        type="button"
        onClick={() => onCopy(copyKey, number)}
        className="relative mt-5 inline-flex items-center gap-2 rounded-full border border-[#8B1E2D] px-5 py-2 font-body text-[11px] font-medium uppercase tracking-[0.16em] text-[#8B1E2D] transition hover:bg-[#8B1E2D] hover:text-[#F4ECDC]"
      >
        <Icon name={copied ? "check" : "copy"} size={13} />
        {copied ? "Tersalin ✓" : "Salin"}
      </button>
    </div>
  );
}

export function CrimsonGift({ amplop }: CrimsonGiftProps) {
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
    <section className="relative overflow-hidden px-8 py-16 text-center">
      {/* hanging gold ornament crowning the section */}
      <Reveal variant="fade-down" className="pointer-events-none absolute left-1/2 -top-2 w-14 -translate-x-1/2">
        <CrimsonFloralImg asset="gold-ornament" sway swayOrigin="origin-top" />
      </Reveal>

      {/* deep maroon rose accents hugging both top corners */}
      <Reveal variant="fade-right" className="pointer-events-none absolute -left-16 -top-8 w-40">
        <CrimsonFloralImg
          asset="burgundy-roses"
          className="rotate-[16deg]"
          sway
          swayOrigin="origin-bottom-right"
        />
      </Reveal>
      <Reveal variant="fade-left" className="pointer-events-none absolute -right-16 -top-8 w-40">
        <CrimsonFloralImg
          asset="burgundy-roses"
          mirrored
          className="-rotate-[16deg]"
          sway
          swayOrigin="origin-bottom-left"
        />
      </Reveal>

      <div className="relative mt-8">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.34em] text-[#7C7E5E]">
          Tanda Kasih
        </p>
        <h2 className="mt-4 [font-family:var(--font-cormorant)] text-[34px] font-normal tracking-[0.01em] text-[#8B1E2D]">
          Amplop <span className="italic text-[#C9A24B]">digital</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[320px] font-body text-[13px] leading-relaxed text-[#7C7E5E]">
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
        <div className="relative mt-8 rounded-[18px] border border-dashed border-[#C9A24B]/70 bg-[#EFE3CC]/60 px-6 py-6">
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8B1E2D]">
            Kirim Kado
          </p>
          <p className="mx-auto mt-3 max-w-[280px] font-body text-[12.5px] leading-relaxed text-[#7C7E5E]">
            {amplop.giftAddress}
          </p>
        </div>
      )}

      {/* soft peony + greenery bank grounding the foot */}
      <CrimsonFloralImg
        asset="peony-alstroemeria"
        className="pointer-events-none absolute -bottom-2 -left-10 w-52 rotate-[3deg] opacity-95"
        sway
        swayOrigin="origin-bottom-left"
      />
      <CrimsonFloralImg
        asset="peony-alstroemeria"
        mirrored
        className="pointer-events-none absolute -bottom-2 -right-10 w-52 -rotate-[3deg] opacity-95"
        sway
        swayOrigin="origin-bottom-right"
      />

      <CrimsonDivider className="relative mx-auto mt-14 w-52 text-[#C9A24B]" />
    </section>
  );
}

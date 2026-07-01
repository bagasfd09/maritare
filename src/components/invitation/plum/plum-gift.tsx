"use client";
/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */

// Plum wedding gift — ported VERBATIM from <section.wedding-gift-wrap> in the
// Katsudoto "Kinanti" (Arvi & Aditya) reference, so the scoped CSS in
// plum-theme.ts (selectors under `.plum-inv`) styles it byte-identically.
// The single static .bank-item is replaced by one card per
// data.sections.amplop.accounts[] (and ewallets[]), filtered by the viewing
// guest's family side (the CLAUDE.md privacy rule — visibleForSide is identical
// to sienna-/scarlet-gift). The selectize select-bank scaffolding, the sender
// data form, the hidden file inputs, the page-wrap buttons and the whole
// upload-proof picture slide are all dropped. The data-copy
// <i class="ph ph-copy-simple"> becomes a real clipboard button with an inline
// SVG (the Phosphor icon font isn't bundled), like sienna-gift. Accounts label
// the number "No. Rekening", e-wallets "No. Ponsel" (the fragment's static copy).
// Returns null when there are no visible accounts/ewallets.

import { useEffect, useRef, useState } from "react";

import type { PartySide } from "@/lib/invitation/sections";
import type { InvitationView } from "@/server/queries/invitation";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** The viewing guest's family side (from their personalized ?g= link). When
   *  set to groom/bride, only that side's accounts (plus "both") show. Absent or
   *  "both" → show every account (generic link / owner preview). */
  guestSide?: PartySide;
};

// An account shows when the guest has no specific side, or the account is for
// everyone ("both"), or it matches the guest's side.
function visibleForSide(accountSide: PartySide, guestSide?: PartySide): boolean {
  if (!guestSide || guestSide === "both") return true;
  return accountSide === "both" || accountSide === guestSide;
}

export function PlumGift({ data, guestSide }: Props) {
  const { accounts: allAccounts, ewallets: allEwallets } = data.sections.amplop;
  const accounts = allAccounts.filter((a) => visibleForSide(a.side, guestSide));
  const ewallets = allEwallets.filter((w) => visibleForSide(w.side, guestSide));

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  if (accounts.length === 0 && ewallets.length === 0) {
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

  type GiftCard = {
    key: string;
    bank: string;
    number: string;
    holder: string;
    numberLabel: string;
  };
  const cards: GiftCard[] = [
    ...accounts.map((a, i) => ({
      key: `bank-${i}`,
      bank: a.bank,
      number: a.number,
      holder: a.holder,
      numberLabel: "No. Rekening",
    })),
    ...ewallets.map((w, i) => ({
      key: `ewallet-${i}`,
      bank: w.provider,
      number: w.number,
      holder: w.holder,
      numberLabel: "No. Ponsel",
    })),
  ];

  return (
    <section className="wedding-gift-wrap ">
      <div className="wedding-gift-inner">
        <div className="wedding-gift-head">
          <h1 className="wedding-gift-title" data-aos="zoom-in" data-aos-duration="1500">
            Wedding Gift
          </h1>
          <p className="wedding-gift-description" data-aos="fade-up" data-aos-duration="1000">
            Your blessing and coming to our wedding are enough for us. However, if you want to give a
            gift we provide a Digital Envelope to make it easier for you. thank you
          </p>
        </div>

        <div className="wedding-gift-body-wrap">
          <div className="wedding-gift-body no-gifts">
            <div className="wedding-gift-body-inner">
              <div className="wedding-gift-form">
                <form>
                  {/* Details */}
                  <div className="wedding-gift-details wedding-gift__first-slide wedding-gift-slide">
                    <div className="wedding-gift-slide">
                      <div className="wedding-gift-bank-wrap">
                        {cards.map((card) => {
                          const copied = copiedKey === card.key;
                          return (
                            <div className="bank-item show" key={card.key}>
                              <div className="bank-detail">
                                <h3 className="bank-name">{card.bank}</h3>
                                <p className="bank-account-number-label">
                                  {card.numberLabel}
                                  <span className="bank-account-number">{card.number}</span>
                                  <button
                                    type="button"
                                    className="bank-copy"
                                    onClick={() => handleCopy(card.key, card.number)}
                                    aria-label={copied ? "Tersalin" : "Salin"}
                                  >
                                    {copied ? (
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 6 9 17l-5-5" />
                                      </svg>
                                    ) : (
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                      </svg>
                                    )}
                                  </button>
                                </p>
                                <p className="bank-account-name-label">
                                  Pemilik Rekening
                                  <span className="bank-account-name">{card.holder}</span>
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="ornaments-wrapper">
            {/* TOP CENTER */}
            <div className="orn-gift--top tl-1">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="100">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-30-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="orn-gift--bottom tr-1">
              <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="100">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-30-min.png" alt="Ornament" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

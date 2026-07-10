"use client";
/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */

// Sienna wedding gift — the Syakira <section.wedding-gift-wrap.no-form> markup
// with the ivory-parity behavior swapped in:
//   - "Buka Amplop" reveal gated in EVERY mode (previews included), the button
//     inside a taller panel so the closed state keeps visual weight,
//   - bank accounts + ewallets as ONE card list, the bank's/provider's own logo
//     replacing the name text when we ship one (see @/lib/invitation/bank-logos),
//   - all accounts inside ONE internally-scrolling framed box (folk gift-frame
//     pattern) — light rows divided by a hairline, not per-account boxes,
//   - working copy buttons (numbers pasted bank-app ready, "Tersalin" flip),
//   - the shipping address (giftAddress) folded in below the rows ("Kirim
//     Kado" card + Copy Address), behind the same reveal.
// visibleForSide (the CLAUDE.md privacy rule) is identical to scarlet-/ivory-gift.
// Returns null when there are no visible cards AND no giftAddress.

import { useEffect, useRef, useState } from "react";

import { resolveBankLogo } from "@/lib/invitation/bank-logos";
import type { PartySide } from "@/lib/invitation/sections";
import type { InvitationView } from "@/server/queries/invitation";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** The viewing guest's family side (from their personalized ?g= link). When
   *  set to groom/bride, only that side's accounts (plus "both") show. Absent,
   *  "both" or a custom side → show every account (generic link / owner preview). */
  guestSide?: string;
};

// An account shows when the guest has no groom/bride side (incl. custom sides),
// or the account is for everyone ("both"), or it matches the guest's side.
function visibleForSide(accountSide: PartySide, guestSide?: string): boolean {
  if (guestSide !== "groom" && guestSide !== "bride") return true;
  return accountSide === "both" || accountSide === guestSide;
}

export function SiennaGift({ data, guestSide }: Props) {
  const { accounts, ewallets, giftAddress } = data.sections.amplop;
  // Banks and e-wallets share one card list — label is the bank / provider name.
  const cards = [
    ...accounts
      .filter((a) => visibleForSide(a.side, guestSide))
      .map((a, i) => ({ key: `bank-${i}`, label: a.bank, number: a.number, holder: a.holder })),
    ...ewallets
      .filter((w) => visibleForSide(w.side, guestSide))
      .map((w, i) => ({ key: `ewallet-${i}`, label: w.provider, number: w.number, holder: w.holder })),
  ];
  const hasAddress = !!giftAddress?.trim();

  // Gated reveal in EVERY mode (folk gates only public links): the numbers
  // always hide behind the "Buka Amplop" button, previews included.
  const [revealed, setRevealed] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  if (cards.length === 0 && !hasAddress) {
    return null;
  }

  const handleCopy = (key: string, value: string) => {
    // Numbers strip spaces/dashes so the paste is bank-app ready; the address
    // (key "address") is copied verbatim.
    const text = key === "address" ? value : value.replace(/[\s-]/g, "");
    void navigator.clipboard
      .writeText(text)
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
    <section className="wedding-gift-wrap  no-form ">
      <div className="wedding-gift-inner" style={{ ["--border-radius" as string]: "487.5px" }}>
        <div className="ornaments-wrapper">
          <div className="orn-1">
            <div className="orn-2-left">
              <div className="image-wrap" data-aos="fade-right" data-aos-duration="1200" data-aos-delay="400">
                <img loading="lazy" decoding="async" src="/invitation/sienna/orn-gift-2.png" alt="Orn 2" />
              </div>
            </div>
            <div className="orn-2-right">
              <div className="image-wrap" data-aos="fade-right" data-aos-duration="1200" data-aos-delay="400">
                <img loading="lazy" decoding="async" src="/invitation/sienna/orn-gift-2.png" alt="Orn 2" />
              </div>
            </div>
            <div className="image-wrap" data-aos="zoom-out" data-aos-duration="1200" data-aos-delay="200">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-gift-1.png" alt="Orn 1" />
            </div>
          </div>

          <div className="orn-3">
            <div className="orn-2-left">
              <div className="image-wrap" data-aos="fade-left" data-aos-duration="1200" data-aos-delay="400">
                <img loading="lazy" decoding="async" src="/invitation/sienna/orn-gift-2.png" alt="Orn 2" />
              </div>
            </div>
            <div className="orn-2-right">
              <div className="image-wrap" data-aos="fade-left" data-aos-duration="1200" data-aos-delay="400">
                <img loading="lazy" decoding="async" src="/invitation/sienna/orn-gift-2.png" alt="Orn 2" />
              </div>
            </div>
            <div className="image-wrap" data-aos="zoom-out" data-aos-duration="1200" data-aos-delay="200">
              <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-3-min.png" alt="Orn 3" />
            </div>
          </div>
        </div>

        <div className="wedding-gift-content">
          <div className="wedding-gift-head">
            <h1 className="wedding-gift-title" data-aos="zoom-in" data-aos-duration="1500">
              Wedding Gift
            </h1>
            <p className="wedding-gift-description" data-aos="fade-up" data-aos-duration="1000">
              Your blessing and coming to our wedding are enough for us. However, if you want to give a
              gift we provide a Digital Envelope to make it easier for you. thank you
            </p>
          </div>

          <div className="wedding-gift-body">
            <div className="wedding-gift-form">
              <form>
                {/* Details */}
                <div className="wedding-gift-details wedding-gift__first-slide wedding-gift-slide">
                  {!revealed && (
                    <div className="wedding-gift-reveal-panel" data-aos="zoom-in" data-aos-duration="1000">
                      <button
                        type="button"
                        className="wedding-gift-reveal-btn"
                        onClick={() => setRevealed(true)}
                      >
                        Buka Amplop
                      </button>
                    </div>
                  )}
                  {revealed && cards.length > 0 && (
                    // Folk gift-frame pattern: one framed box that scrolls
                    // internally, each account a light row instead of its own
                    // heavy card (so many accounts don't feel cramped).
                    <div className="sienna-gift-scroll">
                      <div className="wedding-gift-bank-wrap">
                        {cards.map((card) => {
                          const copied = copiedKey === card.key;
                          // The bank's/provider's own logo replaces the name text
                          // when we ship one; unknown ones fall back to text.
                          const logo = resolveBankLogo(card.label);
                          return (
                            <div className="bank-item show" key={card.key}>
                              <div className="bank-detail">
                                {logo ? (
                                  <img className="bank-logo" src={logo} alt={card.label} loading="lazy" decoding="async" />
                                ) : (
                                  <h3 className="bank-name">{card.label}</h3>
                                )}
                                <div>
                                  <small className="bank-account-number-label">Account Number</small>
                                  <h4 className="bank-account-number" data-copy={card.number}>
                                    {card.number}{" "}
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
                                  </h4>
                                </div>
                                <div>
                                  <small className="bank-account-name-label">Account Name</small>
                                  <h4 className="bank-account-name">{card.holder}</h4>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Folk-style: the shipping address lives right below the
                      account rows, behind the same reveal. */}
                  {revealed && hasAddress && (
                    <div className="sienna-gift-address">
                      <p className="wedding-gift-address-label">Kirim Kado</p>
                      <p className="inner-address-info">{giftAddress}</p>
                      <button
                        type="button"
                        className="btn-hadiah-copy sienna-copy-address"
                        onClick={() => handleCopy("address", giftAddress ?? "")}
                        aria-label={copiedKey === "address" ? "Tersalin" : "Salin alamat"}
                      >
                        {copiedKey === "address" ? "Tersalin" : "Copy Address"}
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

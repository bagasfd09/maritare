"use client";

// Onyx wedding gift — the reference's `GiftSection`: dark account cards, each
// with a champagne corner glow and a diamond badge, the number set wide, and a
// full-width copy button that flips to a confirmation.
//
// maritare behavior folded in (ivory/sienna parity):
//   - the accounts hide behind a "Buka Amplop" reveal in EVERY mode,
//   - copy strips spaces/dashes so the paste is bank-app ready,
//   - the shipping address (giftAddress) renders below the cards,
//   - visibleForSide — the CLAUDE.md privacy rule — is IDENTICAL to
//     scarlet-/sienna-gift: a guest arriving on their personalized ?g= link only
//     ever sees their own family's accounts.
// The reference's decorative fake-QRIS block is dropped: its 21×21 bit grid was
// not a real code (both branches painted the same color, so it rendered blank),
// and maritare has no QRIS field to bind a real one to.

import { useEffect, useRef, useState } from "react";

import type { PartySide } from "@/lib/invitation/sections";
import type { InvitationView } from "@/server/queries/invitation";

import { OnyxLabel, SECTION_PAD } from "./onyx-atoms";
import { OnyxReveal } from "./onyx-reveal";
import { ONYX, gold, warm } from "./onyx-theme";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** The viewing guest's family side (from their personalized ?g= link). */
  guestSide?: string;
};

// An account shows when the guest has no groom/bride side (incl. custom sides),
// or the account is for everyone ("both"), or it matches the guest's side.
function visibleForSide(accountSide: PartySide, guestSide?: string): boolean {
  if (guestSide !== "groom" && guestSide !== "bride") return true;
  return accountSide === "both" || accountSide === guestSide;
}

export function OnyxGift({ data, guestSide }: Props) {
  const { accounts, ewallets, giftAddress } = data.sections.amplop;
  const cards = [
    ...accounts
      .filter((a) => visibleForSide(a.side, guestSide))
      .map((a, i) => ({ key: `bank-${i}`, label: a.bank, number: a.number, holder: a.holder })),
    ...ewallets
      .filter((w) => visibleForSide(w.side, guestSide))
      .map((w, i) => ({
        key: `ewallet-${i}`,
        label: w.provider,
        number: w.number,
        holder: w.holder,
      })),
  ];
  const hasAddress = !!giftAddress?.trim();

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
    const text = key === "address" ? value : value.replace(/[\s-]/g, "");
    void navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedKey(key);
        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setCopiedKey(null), 2200);
      })
      .catch(() => {
        // Clipboard unavailable (http / old browser) — quietly do nothing.
      });
  };

  return (
    <section id="onyx-gift" style={{ padding: SECTION_PAD }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <OnyxReveal style={{ textAlign: "center", marginBottom: "clamp(3rem, 6vw, 5rem)" }}>
          <OnyxLabel>Wedding Gift</OnyxLabel>
          <h2
            style={{
              fontFamily: ONYX.font.display,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 300,
              color: ONYX.color.warmWhite,
              letterSpacing: "-0.01em",
              marginBottom: "1rem",
            }}
          >
            A Thoughtful Gesture
          </h2>
          <p
            style={{
              fontFamily: ONYX.font.body,
              fontSize: "clamp(0.84rem, 2vw, 0.95rem)",
              color: warm(0.42),
              lineHeight: 1.85,
              fontWeight: 300,
              maxWidth: "520px",
              margin: "0 auto",
            }}
          >
            Kehadiranmu adalah hadiah terindah buat kami. Tapi kalau kamu ingin memberi tanda kasih,
            kami menerimanya dengan senang hati dan penuh rasa syukur.
          </p>
        </OnyxReveal>

        {!revealed && (
          <OnyxReveal style={{ textAlign: "center" }}>
            <button
              type="button"
              onClick={() => setRevealed(true)}
              style={{
                border: `1px solid ${gold(0.45)}`,
                backgroundColor: "transparent",
                color: ONYX.color.warmWhite,
                fontFamily: ONYX.font.body,
                fontSize: "0.62rem",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                padding: "1rem 3rem",
                cursor: "pointer",
                transition: "all 0.35s ease",
              }}
            >
              Buka Amplop
            </button>
          </OnyxReveal>
        )}

        {revealed && cards.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              gap: "clamp(1rem, 2vw, 1.75rem)",
              marginBottom: hasAddress ? "clamp(3rem, 6vw, 5rem)" : 0,
            }}
          >
            {cards.map((card, i) => {
              const copied = copiedKey === card.key;
              return (
                <OnyxReveal key={card.key} delay={i * 100}>
                  <div
                    style={{
                      backgroundColor: i % 2 === 0 ? "rgba(28,28,28,0.88)" : "rgba(22,22,22,0.88)",
                      border: `1px solid ${gold(0.14)}`,
                      padding: "clamp(1.5rem, 3vw, 2.5rem)",
                      position: "relative",
                      overflow: "hidden",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "180px",
                        height: "180px",
                        background: `radial-gradient(circle at top right, ${gold(0.09)} 0%, transparent 60%)`,
                        pointerEvents: "none",
                      }}
                    />
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "1.75rem",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontFamily: ONYX.font.body,
                              fontSize: "0.56rem",
                              letterSpacing: "0.32em",
                              textTransform: "uppercase",
                              color: ONYX.color.champagne,
                              marginBottom: "0.2rem",
                            }}
                          >
                            Transfer
                          </p>
                          <p
                            style={{
                              fontFamily: ONYX.font.display,
                              fontSize: "1.9rem",
                              fontWeight: 300,
                              color: ONYX.color.warmWhite,
                              letterSpacing: "0.05em",
                              margin: 0,
                            }}
                          >
                            {card.label}
                          </p>
                        </div>
                        <div
                          style={{
                            width: "34px",
                            height: "34px",
                            border: `1px solid ${gold(0.28)}`,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ color: ONYX.color.champagne, fontSize: "0.85rem" }}>♦</span>
                        </div>
                      </div>

                      <p
                        style={{
                          fontFamily: ONYX.font.body,
                          fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
                          letterSpacing: "0.12em",
                          color: ONYX.color.warmWhite,
                          marginBottom: "0.5rem",
                          fontWeight: 300,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {card.number}
                      </p>
                      <p
                        style={{
                          fontFamily: ONYX.font.body,
                          fontSize: "0.78rem",
                          color: warm(0.45),
                          marginBottom: "1.75rem",
                          fontWeight: 300,
                        }}
                      >
                        a/n {card.holder}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleCopy(card.key, card.number)}
                        style={{
                          width: "100%",
                          padding: "0.8rem",
                          border: `1px solid ${copied ? ONYX.color.champagne : gold(0.35)}`,
                          backgroundColor: copied ? ONYX.color.champagne : "transparent",
                          color: copied ? ONYX.color.charcoal : warm(0.65),
                          fontFamily: ONYX.font.body,
                          fontSize: "0.58rem",
                          letterSpacing: "0.28em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          transition: "all 0.35s ease",
                        }}
                      >
                        {copied ? "✓  Tersalin" : "Salin Nomor"}
                      </button>
                    </div>
                  </div>
                </OnyxReveal>
              );
            })}
          </div>
        )}

        {revealed && hasAddress && (
          <OnyxReveal
            style={{
              borderTop: `1px solid ${warm(0.06)}`,
              paddingTop: "clamp(2rem, 5vw, 3.5rem)",
              textAlign: "center",
            }}
          >
            <OnyxLabel>Kirim Kado</OnyxLabel>
            <p
              style={{
                fontFamily: ONYX.font.display,
                fontWeight: 300,
                fontSize: "clamp(1rem, 2.5vw, 1.35rem)",
                color: ONYX.color.warmWhite,
                lineHeight: 1.85,
                letterSpacing: "0.01em",
                whiteSpace: "pre-line",
              }}
            >
              {giftAddress}
            </p>
            <button
              type="button"
              onClick={() => handleCopy("address", giftAddress ?? "")}
              style={{
                marginTop: "1.25rem",
                border: `1px solid ${gold(0.35)}`,
                backgroundColor: "transparent",
                color: warm(0.65),
                fontFamily: ONYX.font.body,
                fontSize: "0.58rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                padding: "0.7rem 2rem",
                cursor: "pointer",
              }}
            >
              {copiedKey === "address" ? "✓  Tersalin" : "Salin Alamat"}
            </button>
          </OnyxReveal>
        )}
      </div>
    </section>
  );
}

"use client";

// Onyx guest check-in QR — a maritare section the reference has no equivalent
// for, dressed in Onyx type (champagne micro-caps, thin display heading, a
// hairline-framed card lit from above).
//
// When the guest opens their personalized link (/inv/<slug>?g=<code>) the
// server resolves `checkin` and we encode their guest UUID — the exact payload
// the guestbook kiosk decodes. Without guest context (owner preview / generic
// link) a dimmed sample renders so the section still reads.
//
// The code itself is painted charcoal-on-warm-white inside a light tile: a
// low-contrast "on-brand" QR on a dark card is a QR that phones refuse to scan.

import { useEffect, useState } from "react";
import QRCode from "qrcode";

import { OnyxLabel, SECTION_PAD } from "./onyx-atoms";
import { OnyxReveal } from "./onyx-reveal";
import { ONYX, RADIUS, gold, warm } from "./onyx-theme";

type Props = {
  checkin?: { guestId: string; guestName: string } | null;
};

// Decorative placeholder payload — never a real guest id.
const SAMPLE_PAYLOAD = "MARITARE-CONTOH-QR";

export function OnyxQr({ checkin }: Props) {
  const [qr, setQr] = useState<string | null>(null);
  const isSample = !checkin;
  const payload = checkin?.guestId ?? SAMPLE_PAYLOAD;

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(payload, {
      width: 420,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#171717", light: "#F7F7F5" },
    })
      .then((url) => {
        if (alive) setQr(url);
      })
      .catch(() => {
        if (alive) setQr(null);
      });
    return () => {
      alive = false;
    };
  }, [payload]);

  return (
    <section style={{ padding: SECTION_PAD }}>
      <OnyxReveal style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center" }}>
        <OnyxLabel>Check-in</OnyxLabel>
        <h2
          style={{
            fontFamily: ONYX.font.display,
            fontSize: "clamp(2rem, calc(5 * var(--onyx-vw)), 3.5rem)",
            fontWeight: 300,
            color: ONYX.color.warmWhite,
            letterSpacing: "-0.01em",
            marginBottom: "1rem",
          }}
        >
          Your Entry Pass
        </h2>
        <p
          style={{
            fontFamily: ONYX.font.body,
            fontSize: "clamp(0.82rem, calc(2 * var(--onyx-vw)), 0.92rem)",
            color: warm(0.42),
            lineHeight: 1.85,
            fontWeight: 300,
          }}
        >
          {isSample
            ? "QR check-in kamu akan muncul di sini saat kamu membuka undangan lewat tautan pribadimu."
            : "Tunjukkan QR ini ke petugas buku tamu saat tiba untuk check-in."}
        </p>

        <div
          style={{
            marginTop: "clamp(2rem, calc(4 * var(--onyx-vw)), 3rem)",
            padding: "clamp(1.75rem, calc(4 * var(--onyx-vw)), 2.5rem)",
            backgroundColor: "rgba(23,23,23,0.82)",
            border: `1px solid ${gold(0.16)}`,
            borderRadius: RADIUS,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-40%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "150%",
              height: "150%",
              background: `radial-gradient(ellipse 50% 38% at 50% 0%, ${gold(0.08)} 0%, transparent 60%)`,
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            {!isSample && (
              <p
                style={{
                  fontFamily: ONYX.font.body,
                  fontSize: "0.6rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: ONYX.color.champagne,
                  marginBottom: "1.25rem",
                }}
              >
                {checkin.guestName}
              </p>
            )}
            <div
              style={{
                display: "inline-block",
                padding: "12px",
                backgroundColor: ONYX.color.warmWhite,
                borderRadius: RADIUS,
                aspectRatio: "1/1",
                width: "min(240px, 70%)",
              }}
            >
              {qr && (
                // eslint-disable-next-line @next/next/no-img-element -- client-generated data: URL
                <img
                  src={qr}
                  alt={isSample ? "Contoh QR check-in" : "QR check-in"}
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    opacity: isSample ? 0.3 : 1,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </OnyxReveal>
    </section>
  );
}

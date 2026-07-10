"use client";
/* eslint-disable @next/next/no-img-element -- decorative ornaments + client-generated QR data URL use raw <img> by design */

// Ivory — on-the-spot guest check-in QR. The Aulia reference renders only a bare
// framed QR (<section.general-qrcode>); this adds the FolkQr presentation on top:
// a section head ("QR Check-in" + guest name), the QR in a framed card, and the
// explainer copy — dressed in ivory identity (Orn-ls header flourish, Orn-18
// floral corners, an Orn-kupu butterfly, palette from the ivory preset vars).
// When the guest opens their personalized link (/inv/<slug>?g=<code>), `checkin`
// is resolved server-side and we encode their guest UUID — the exact payload the
// guestbook kiosk decodes. Without guest context (owner preview / generic link)
// we render a dimmed sample QR + a note, so the section is still visible.
// Folk's "Unduh QR" keepsake-card button is NOT ported (the card artwork is
// folk-branded); add an ivory card composer if download is ever wanted.

import { useEffect, useState } from "react";
import QRCode from "qrcode";

const BASE = "/invitation/ivory";

type Props = {
  checkin?: { guestId: string; guestName: string } | null;
  // Accepted for parity with FolkQr's signature (the template passes them);
  // unused until an ivory keepsake card exists.
  brideName: string;
  groomName: string;
  eventDate?: string | null;
};

// Decorative placeholder payload — never a real guest id.
const SAMPLE_PAYLOAD = "MARITARE-CONTOH-QR";

export function IvoryQr({ checkin }: Props) {
  const [qr, setQr] = useState<string | null>(null);
  const isSample = !checkin;
  const payload = checkin?.guestId ?? SAMPLE_PAYLOAD;

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(payload, {
      width: 420,
      margin: 1,
      errorCorrectionLevel: "M",
      // Muted maroon on cream — a subtle red tint (not a loud red); still high
      // contrast so it scans fine.
      color: { dark: "#5C1F1F", light: "#FBF7EC" },
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
    <section className="general-qrcode">
      <div className="qr-inner">
        <div className="qr-head" data-aos="zoom-in" data-aos-duration="1200">
          <div className="qr-orn-header">
            <img loading="lazy" decoding="async" src={`${BASE}/Orn-ls.png`} alt="" />
          </div>
          <h1 className="qr-title">QR Check-in</h1>
          <p className="qr-description">
            {isSample
              ? "QR check-in kamu akan muncul di sini saat kamu membuka undangan lewat tautan pribadimu."
              : "Tunjukkan QR ini ke petugas buku tamu saat tiba untuk check-in."}
          </p>
        </div>

        <div className="qr-card" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
          {/* Ivory floral identity — mirrored corner blooms + a butterfly. */}
          <div className="qr-orn tl">
            <img loading="lazy" decoding="async" src={`${BASE}/Orn-18.png`} alt="" />
          </div>
          <div className="qr-orn br">
            <img loading="lazy" decoding="async" src={`${BASE}/Orn-18.png`} alt="" />
          </div>
          <div className="qr-kupu">
            <img loading="lazy" decoding="async" src={`${BASE}/Orn-kupu-1.png`} alt="" />
          </div>

          {!isSample && <p className="qr-guest">{checkin.guestName}</p>}

          <div className="img-qrcode">
            {qr && (
              <img
                src={qr}
                alt={isSample ? "Contoh QR check-in" : "QR check-in"}
                style={isSample ? { opacity: 0.3 } : undefined}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

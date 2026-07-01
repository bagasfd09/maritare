"use client";

// Ivory — on-the-spot guest check-in QR. Verbatim port of the Katsudoto Aulia
// <section.general-qrcode> fragment: class names match the scoped CSS under
// .ivory-inv so the framed QR renders byte-identically. When the guest opens
// their personalized link (/inv/<slug>?g=<code>), `checkin` is resolved
// server-side and we encode their guest UUID — the exact payload the guestbook
// kiosk decodes. Without guest context (owner preview / generic link) we render
// a dimmed sample QR so the section is still visible. QR-generation logic
// (lib, options, sample fallback) mirrors FolkQr; only the scannable QR image is
// reproduced here — Aulia has no downloadable keepsake-card chrome.

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = {
  checkin?: { guestId: string; guestName: string } | null;
  // Accepted for parity with FolkQr's signature (the template passes them);
  // unused here because Aulia renders only the bare QR, no keepsake card.
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
      <div className="img-qrcode" data-aos="fade-up" data-aos-duration="1200">
        {qr && (
          // eslint-disable-next-line @next/next/no-img-element -- client-generated data URL; next/image cannot optimize a data: src
          <img
            src={qr}
            alt={isSample ? "Contoh QR check-in" : "QR check-in"}
            style={isSample ? { opacity: 0.3 } : undefined}
          />
        )}
      </div>
    </section>
  );
}

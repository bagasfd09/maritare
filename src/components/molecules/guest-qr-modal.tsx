"use client";

// QR modal for the dashboard Tamu list — shows a guest's check-in QR (encodes
// the guest UUID, what the kiosk scanner decodes), with download + a link to the
// guest's public QR page.

import { useEffect, useState } from "react";
import QRCode from "qrcode";

import { Icon } from "@/components/atoms/icon";
import { Button } from "@/components/atoms/button";
import { guestQrUrl } from "@/lib/invite-message";

type QrGuest = { id: string; name: string };

export function GuestQrModal({ guest, onClose }: { guest: QrGuest | null; onClose: () => void }) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    if (!guest) return;
    let alive = true;
    QRCode.toDataURL(guest.id, { width: 360, margin: 2, errorCorrectionLevel: "M" })
      .then((url) => alive && setQr(url))
      .catch(() => alive && setQr(null));
    return () => {
      alive = false;
    };
  }, [guest]);

  if (!guest) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,26,26,0.45)] px-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] bg-paper rounded-2xl border border-line p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="font-display italic text-[20px] text-charcoal">QR Check-in</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-7 h-7 rounded-full inline-flex items-center justify-center text-muted-ink hover:bg-cream cursor-pointer"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
        <div className="text-[12px] text-muted-ink mb-4 truncate">{guest.name}</div>

        <div className="bg-cream rounded-[14px] p-4 inline-flex items-center justify-center mb-4">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element -- client-generated data URL; next/image cannot optimize a data: src
            <img src={qr} alt={`QR ${guest.name}`} width={240} height={240} className="w-[240px] h-[240px]" />
          ) : (
            <div className="w-[240px] h-[240px] flex items-center justify-center text-faint text-[12px]">
              Memuat QR…
            </div>
          )}
        </div>

        <p className="text-[12px] text-muted-ink leading-[1.5] mb-4">
          Dipindai petugas saat check-in. Bagikan ke tamu lewat WhatsApp atau cetak.
        </p>

        <div className="flex gap-2 justify-center">
          {qr && (
            <a href={qr} download={`qr-${guest.name.replace(/\s+/g, "-").toLowerCase()}.png`} className="no-underline">
              <Button size="sm" variant="primary">
                <Icon name="download" size={12} />
                Unduh PNG
              </Button>
            </a>
          )}
          <a href={guestQrUrl(guest.id)} target="_blank" rel="noopener" className="no-underline">
            <Button size="sm" variant="ghost">
              <Icon name="external" size={12} />
              Halaman QR
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

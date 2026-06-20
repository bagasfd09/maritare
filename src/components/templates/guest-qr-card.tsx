"use client";

// Public per-guest QR card (rendered at /qr/<id>). Generates the QR client-side
// from the guest UUID (what the kiosk scanner decodes), shown for the guest to
// present at check-in. Plus the couple + a link to the full invitation.

import { useEffect, useState } from "react";
import QRCode from "qrcode";

import { Logo } from "@/components/atoms/logo";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { Display, Em } from "@/components/atoms/typography";
import { inviteUrl } from "@/lib/invite-message";
import type { GuestQrInfo } from "@/server/queries/guest-qr";

export function GuestQrCard({ info }: { info: GuestQrInfo }) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(info.guestId, { width: 320, margin: 2, errorCorrectionLevel: "M" })
      .then((url) => {
        if (alive) setQr(url);
      })
      .catch(() => {
        if (alive) setQr(null);
      });
    return () => {
      alive = false;
    };
  }, [info.guestId]);

  return (
    <div className="min-h-screen w-full bg-ivory text-charcoal font-body flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-[400px] bg-paper border border-line rounded-[20px] p-7 text-center shadow-[0_24px_60px_-30px_rgba(40,24,12,0.4)]">
        <div className="flex items-center justify-center gap-2 mb-5">
          <Logo size={22} />
          <FlowerMark size={16} />
        </div>

        <span className="text-[11px] tracking-[0.22em] uppercase font-bold text-muted-ink">
          Undangan untuk
        </span>
        <Display as="h1" className="text-[26px] mt-1 leading-[1.1]">
          {info.guestName}
        </Display>
        <div className="font-display italic text-[15px] text-burgundy mt-1">
          {info.groomName} &amp; {info.brideName}
        </div>

        <div className="bg-cream rounded-[14px] p-4 my-6 inline-flex items-center justify-center">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element -- client-generated data URL; next/image cannot optimize a data: src
            <img src={qr} alt="QR check-in" width={240} height={240} className="w-[240px] h-[240px]" />
          ) : (
            <div className="w-[240px] h-[240px] flex items-center justify-center text-faint text-[12px]">
              Memuat QR…
            </div>
          )}
        </div>

        <p className="text-[13px] text-muted-ink leading-[1.6]">
          Tunjukkan <Em className="text-burgundy not-italic font-semibold">QR ini</Em> ke petugas
          saat hadir untuk check-in.
        </p>

        <a
          href={inviteUrl(info.slug)}
          className="inline-flex items-center justify-center mt-5 h-11 px-6 rounded-full bg-burgundy text-cream font-body font-semibold text-[14px] tracking-[0.04em] no-underline"
        >
          Buka undangan →
        </a>
      </div>
    </div>
  );
}

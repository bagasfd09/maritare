"use client";

// Folk Garden — in-invitation check-in QR section. Sits just below the agenda
// (akad & resepsi). When the guest opens their personalized link
// (/inv/<slug>?g=<code>), `checkin` is resolved server-side and we render a QR
// encoding their guest UUID — the exact payload the guestbook kiosk decodes.
// Without guest context (owner preview / generic link) we render a dimmed sample
// QR + a note, so the owner still sees the section in the editor/preview.
//
// Real guests also get an "Unduh QR" button: instead of dumping the bare QR, it
// composes a Folk-Garden keepsake card (florals + gold ornament + the couple's
// names & date) around the QR — see folk-qr-card.ts.

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

import { formatFullDateId } from "./format";
import { Reveal } from "../flora/reveal";
import { downloadFolkQrCard } from "./folk-qr-card";

type Props = {
  checkin?: { guestId: string; guestName: string } | null;
  /** Couple display names (bride-first, matching the cover) for the card. */
  brideName: string;
  groomName: string;
  /** ISO event date (acara first event, else wedding date) for the card. */
  eventDate?: string | null;
};

// Decorative placeholder payload — never a real guest id.
const SAMPLE_PAYLOAD = "MARITARE-CONTOH-QR";

export function FolkQr({ checkin, brideName, groomName, eventDate }: Props) {
  const [qr, setQr] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  // Synchronous re-entrancy lock — React state flips a render too late to stop a
  // fast double-tap from launching the heavy compose twice.
  const busyRef = useRef(false);
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

  async function handleDownload() {
    if (!checkin || !sectionRef.current || busyRef.current) return;
    busyRef.current = true;
    setDownloading(true);
    setError(null);
    try {
      await downloadFolkQrCard({
        payload: checkin.guestId,
        brideName,
        groomName,
        guestName: checkin.guestName,
        dateLabel: eventDate ? formatFullDateId(eventDate) : null,
        fontHost: sectionRef.current,
      });
    } catch (err) {
      console.error("Folk QR card download failed", err);
      setError("Gagal menyiapkan kartu QR-nya. Coba lagi sebentar ya.");
    } finally {
      busyRef.current = false;
      setDownloading(false);
    }
  }

  return (
    <section ref={sectionRef} className="px-5 py-12 text-center">
      <Reveal variant="zoom-in">
        <div className="relative mx-auto max-w-[360px] overflow-hidden rounded-[26px] border border-[#E0D6BE] bg-[#F5EFE0] px-7 pb-8 pt-9 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.45)]">
          <h3 className="font-display text-[26px] font-bold italic leading-[1.1] tracking-[-0.02em] text-[#9E2B62] [font-variation-settings:'opsz'_96]">
            QR Check-in
          </h3>
          {!isSample && (
            <p className="mt-1.5 font-body text-[13px] text-[#52602F]">
              {checkin.guestName}
            </p>
          )}

          <div className="mx-auto mt-6 inline-flex items-center justify-center rounded-[18px] bg-[#FBF7EC] p-3 shadow-[inset_0_0_0_1px_rgba(201,162,75,0.35)]">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element -- client-generated data URL; next/image cannot optimize a data: src
              <img
                src={qr}
                alt={isSample ? "Contoh QR check-in" : "QR check-in"}
                width={208}
                height={208}
                className={cn("h-[208px] w-[208px]", isSample && "opacity-30")}
              />
            ) : (
              <div className="flex h-[208px] w-[208px] items-center justify-center font-body text-[12px] text-[#52602F]">
                Memuat QR…
              </div>
            )}
          </div>

          <div className="mx-auto mt-6 h-px w-12 bg-[#C9A24B]/50" />

          <p className="mx-auto mt-5 max-w-[280px] font-body text-[13px] leading-relaxed text-[#3C471F]">
            {isSample
              ? "QR check-in kamu akan muncul di sini saat kamu membuka undangan lewat tautan pribadimu."
              : "Tunjukkan QR ini ke petugas buku tamu saat tiba untuk check-in."}
          </p>

          {!isSample && (
            <>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading || !qr}
                aria-busy={downloading}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#700F06] px-6 py-2.5 font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-[#E8E1D1] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.55)] transition hover:bg-[#A98534] hover:text-[#F5F2E4] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name="download" size={14} />
                {downloading ? "Menyiapkan…" : "Unduh QR"}
              </button>
              {error && (
                <p
                  role="status"
                  className="mx-auto mt-3 max-w-[280px] rounded-xl border border-[#9E2B62]/40 bg-[#E8A0B8]/30 px-4 py-2 font-body text-[11px] leading-relaxed text-[#7A1E48]"
                >
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </Reveal>
    </section>
  );
}

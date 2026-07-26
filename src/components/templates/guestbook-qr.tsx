"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Icon } from "@/components/atoms/icon";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { GuestbookShell } from "@/components/templates/guestbook-shell";
import { GuestbookButton, GuestbookTabs } from "@/components/molecules/guestbook-primitives";
import type { KioskSync } from "@/lib/kiosk-queue";
import type { KioskGuest, KioskHeader } from "@/server/queries/guestbook";
import { cn } from "@/lib/utils";

// Guestbook 03 · Pindai QR — a REAL camera scanner. getUserMedia feeds a
// <video>; frames are sampled onto an offscreen canvas every ~140ms and run
// through jsQR. A decoded payload is treated as a guest id and resolved
// against the LOCAL guest list (works offline): a match freezes the frame and
// hands the guest to the flow's confirm view, while an unknown payload
// surfaces an error in the aside without stopping the camera — the operator
// can rescan or fall back to manual search.

// Client-side uuid shape check — a non-uuid payload is an unknown QR without
// even hitting the directory.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SCAN_TIPS = [
  "Pastikan layar HP tamu cukup terang",
  "Jaga jarak ±20cm dari kamera",
  "Hindari pantulan cahaya langsung",
];

const SCAN_INTERVAL_MS = 140;
const SAMPLE_WIDTH = 480; // downscale frames before decoding to keep the loop cheap
const REDIRECT_DELAY_MS = 1600;

type ScanStatus = "requesting" | "scanning" | "detected" | "error";

// gb2Eyebrow base (size applied per usage).
const eyebrow = "font-body tracking-[0.24em] uppercase font-semibold text-muted-ink";
// gb2Italic base.
const italic = "font-display italic font-normal tracking-[-0.01em]";

type GuestbookQrProps = {
  header?: KioskHeader | null;
  sync?: KioskSync | null;
  /** Look a decoded guest id up in the flow's local directory. */
  resolveGuest?: (id: string) => KioskGuest | null;
  /** A scanned guest matched — the flow moves to the confirm view. */
  onFound?: (guest: KioskGuest) => void;
  /**
   * A uuid-shaped payload missed the local directory — may be a guest added
   * after the last snapshot, so the flow gets a chance to refresh. The scan
   * loop keeps decoding the same QR, so a successful refresh auto-recovers.
   */
  onUnknown?: () => void;
  onSearch?: () => void;
  onCancel?: () => void;
  onTab?: (tab: "search" | "qr") => void;
};

export function GuestbookQr({ header, sync, resolveGuest, onFound, onUnknown, onSearch, onCancel, onTab }: GuestbookQrProps) {
  const [status, setStatus] = useState<ScanStatus>("requesting");
  const [errorMsg, setErrorMsg] = useState("");
  const [payload, setPayload] = useState<string | null>(null);
  const [match, setMatch] = useState<KioskGuest | null>(null);
  // Set when a decoded payload is NOT a guest-id-shaped uuid; the camera keeps
  // scanning so the operator can simply try the next QR.
  const [qrError, setQrError] = useState(false);
  // Which camera to use. Defaults to the front/user camera (the kiosk faces the
  // guest); the operator can flip to the rear camera via the switch button. The
  // soft facingMode constraint falls back to whatever exists if there's no
  // front camera, so this is safe on single-rear-camera devices too.
  const [facing, setFacing] = useState<"environment" | "user">("user");
  // Whether the device exposes more than one camera — gates the switch button.
  const [multiCam, setMultiCam] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const redirectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mirrors `facing` so startCamera (a stable callback) reads the latest choice
  // without re-creating itself and re-triggering the mount effect.
  const facingRef = useRef<"environment" | "user">("user");
  // Same trick for the flow callbacks: the guest directory changes on every
  // background refresh, and re-creating startCamera would restart the camera.
  const resolveRef = useRef(resolveGuest);
  const foundRef = useRef(onFound);
  const unknownRef = useRef(onUnknown);
  useEffect(() => {
    resolveRef.current = resolveGuest;
    foundRef.current = onFound;
    unknownRef.current = onUnknown;
  }, [resolveGuest, onFound, onUnknown]);
  // The scan loop re-decodes the same held-up QR every ~140ms — only nudge the
  // flow once per distinct missed payload.
  const missedRef = useRef<string | null>(null);

  const stopLoop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    stopLoop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, [stopLoop]);

  // No synchronous setState here — the initial render already shows
  // "requesting", and a missing mediaDevices API simply throws into the catch.
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        // Soft (non-exact) facingMode → falls back gracefully on devices that
        // don't have the requested camera instead of throwing Overconstrained.
        video: { facingMode: facingRef.current, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setStatus("scanning");

      // Permission is granted now, so device labels/list are populated — reveal
      // the camera switch only when there's actually more than one to pick from.
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setMultiCam(devices.filter((d) => d.kind === "videoinput").length > 1);
      } catch {
        // enumerateDevices is non-critical — leave the toggle hidden on failure.
      }

      // Offscreen sampling canvas, created once per session.
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      intervalRef.current = setInterval(() => {
        if (video.readyState < video.HAVE_ENOUGH_DATA || video.videoWidth === 0) return;
        const scale = SAMPLE_WIDTH / video.videoWidth;
        canvas.width = SAMPLE_WIDTH;
        canvas.height = Math.round(video.videoHeight * scale);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "attemptBoth" });
        if (code && code.data) {
          const decoded = code.data.trim();
          const guest = UUID_RE.test(decoded)
            ? (resolveRef.current?.(decoded) ?? null)
            : null;
          if (guest) {
            // Known guest → freeze the frame, then hand off to the confirm view.
            stopLoop();
            video.pause(); // freeze the last frame as visual feedback
            setQrError(false);
            setPayload(decoded);
            setMatch(guest);
            setStatus("detected");
            redirectRef.current = setTimeout(
              () => foundRef.current?.(guest),
              REDIRECT_DELAY_MS,
            );
          } else {
            // Unrecognized payload (or a uuid not in this wedding's list) —
            // keep the camera scanning, surface the error in the aside so the
            // operator can retry or search manually.
            setPayload(decoded);
            setQrError(true);
            if (UUID_RE.test(decoded) && missedRef.current !== decoded) {
              missedRef.current = decoded;
              unknownRef.current?.();
            }
          }
        }
      }, SCAN_INTERVAL_MS);
    } catch (err) {
      setStatus("error");
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError") {
        setErrorMsg("Izin kamera ditolak. Izinkan akses kamera di browser, lalu coba lagi.");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setErrorMsg("Kamera tidak ditemukan di perangkat ini.");
      } else if (name === "NotReadableError") {
        setErrorMsg("Kamera sedang dipakai aplikasi lain. Tutup aplikasi itu, lalu coba lagi.");
      } else if (err instanceof TypeError) {
        setErrorMsg("Browser ini tidak mendukung akses kamera, atau halaman tidak dibuka lewat HTTPS/localhost.");
      } else {
        setErrorMsg("Kamera tidak bisa diakses. Pastikan halaman dibuka lewat HTTPS atau localhost.");
      }
    }
  }, [stopLoop]);

  // Retry from the error panel — state resets live in the click handler so the
  // mount effect stays free of synchronous setState.
  const retry = useCallback(() => {
    setStatus("requesting");
    setErrorMsg("");
    setPayload(null);
    setMatch(null);
    setQrError(false);
    startCamera();
  }, [startCamera]);

  // Flip between the rear and front camera. We tear the live stream down and
  // restart getUserMedia with the new facingMode — re-using the track via
  // applyConstraints isn't reliable across iOS Safari, so a clean restart is
  // the safe path.
  const switchCamera = useCallback(() => {
    const next = facingRef.current === "environment" ? "user" : "environment";
    facingRef.current = next;
    setFacing(next);
    stopCamera();
    setStatus("requesting");
    setQrError(false);
    setPayload(null);
    void startCamera();
  }, [stopCamera, startCamera]);

  useEffect(() => {
    // Deferred so the effect body itself never reaches a setState synchronously
    // (react-hooks/set-state-in-effect) — and the first paint shows "requesting".
    const t = setTimeout(() => void startCamera(), 0);
    return () => {
      clearTimeout(t);
      stopCamera();
      if (redirectRef.current) clearTimeout(redirectRef.current);
    };
  }, [startCamera, stopCamera]);

  const detected = status === "detected";

  return (
    <GuestbookShell eyebrow="Buku Tamu · Pindai QR" header={header} sync={sync}>
      <div className="h-full grid grid-cols-[1fr_330px] gap-[22px] px-12 pt-5 pb-[26px]">
        {/* LEFT: camera viewport */}
        <div className="flex flex-col gap-[14px] min-h-0">
          <div className="flex items-center justify-between gap-[18px]">
            <GuestbookTabs active="qr" compact onSelect={onTab} />
            <h1 className="font-display [font-variation-settings:'opsz'_96] font-extrabold tracking-[-0.025em] leading-[1.04] text-charcoal text-[28px] m-0">
              Arahkan QR ke dalam <span className={cn(italic, "text-burgundy")}>bingkai.</span>
            </h1>
          </div>

          {/* Camera viewport */}
          <div className="flex-1 min-h-0 bg-[#171310] rounded-[18px] relative overflow-hidden shadow-[0_28px_50px_-24px_rgba(26,26,26,0.5)]">
            {/* warm backdrop (visible while requesting / on error) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_62%,rgba(234,211,194,0.18),transparent_55%),radial-gradient(circle_at_76%_28%,rgba(124,45,45,0.35),transparent_55%),linear-gradient(135deg,#262019_0%,#171310_55%,#2A2118_100%)]" />

            {/* live camera feed */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                status === "scanning" || detected ? "opacity-100" : "opacity-0",
                // Un-mirror the front camera's selfie-style preview. CSS only —
                // jsQR decodes the raw (un-flipped) frame from the canvas, so QR
                // reading is unaffected.
                facing === "user" && "-scale-x-100",
              )}
            />

            {status === "error" ? (
              /* error / fallback panel */
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-16 text-center">
                <span className="w-16 h-16 rounded-full bg-[rgba(245,239,230,0.08)] border border-[rgba(245,239,230,0.2)] inline-flex items-center justify-center">
                  <Icon name="image" size={26} stroke="var(--color-peach)" />
                </span>
                <div className="font-display font-bold text-[24px] tracking-[-0.02em] text-cream">
                  Kamera tidak bisa diakses
                </div>
                <p className="font-body text-[14px] leading-[1.6] text-[rgba(245,239,230,0.65)] max-w-[420px] m-0">
                  {errorMsg}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <GuestbookButton kind="cream" h={48} fz={11.5} onClick={retry}>
                    Coba lagi
                  </GuestbookButton>
                  <GuestbookButton
                    kind="ghost"
                    h={48}
                    fz={11.5}
                    className="border-[rgba(245,239,230,0.35)] text-cream"
                    onClick={onSearch}
                  >
                    Cari manual
                  </GuestbookButton>
                </div>
              </div>
            ) : (
              <>
                {/* corner brackets + status pill */}
                <div className="absolute left-1/2 top-1/2 w-[400px] h-[400px] -ml-[200px] -mt-[200px] pointer-events-none">
                  <div className="absolute left-0 top-0 w-14 h-14 border-cream border-solid border-t-[2.5px] border-l-[2.5px] rounded-tl-[14px]" />
                  <div className="absolute right-0 top-0 w-14 h-14 border-cream border-solid border-t-[2.5px] border-r-[2.5px] rounded-tr-[14px]" />
                  <div className="absolute left-0 bottom-0 w-14 h-14 border-cream border-solid border-b-[2.5px] border-l-[2.5px] rounded-bl-[14px]" />
                  <div className="absolute right-0 bottom-0 w-14 h-14 border-cream border-solid border-b-[2.5px] border-r-[2.5px] rounded-br-[14px]" />
                  {status === "scanning" && (
                    <div className="absolute left-3 right-3 h-[2px] animate-gb-scan bg-[linear-gradient(to_right,transparent,var(--color-peach)_30%,#F5EFE6_50%,var(--color-peach)_70%,transparent)] shadow-[0_0_20px_4px_rgba(234,211,194,0.55)]" />
                  )}
                  <div className="absolute left-1/2 -bottom-[52px] -translate-x-1/2 inline-flex items-center gap-[10px] bg-[rgba(26,26,26,0.78)] text-cream py-[9px] px-[18px] rounded-full backdrop-blur-[8px] font-body text-[10.5px] tracking-[0.24em] uppercase font-semibold whitespace-nowrap">
                    <span
                      className={cn(
                        "w-[7px] h-[7px] rounded-full",
                        detected ? "bg-[#4DD891]" : status === "scanning" ? "bg-[#4DD891] animate-dot-pulse" : "bg-terracotta animate-dot-pulse",
                      )}
                    />
                    {detected ? "QR terbaca" : status === "scanning" ? "Mendeteksi…" : "Menyalakan kamera…"}
                  </div>
                </div>

                {/* vignette + camera chip */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_35%,rgba(13,10,7,0.5)_72%,rgba(13,10,7,0.72)_100%)]" />
                <div className="absolute top-4 left-[18px] py-[6px] pr-[13px] pl-[10px] bg-[rgba(26,26,26,0.6)] backdrop-blur-[8px] rounded-full text-peach font-body text-[9.5px] tracking-[0.22em] uppercase font-semibold inline-flex items-center gap-2">
                  <span className={cn("w-[6px] h-[6px] rounded-full", status === "scanning" || detected ? "bg-[#4DD891]" : "bg-terracotta")} />
                  {status === "scanning" || detected ? "Kamera aktif" : "Menyiapkan…"}
                </div>

                {/* camera switch — only when the device has more than one camera
                    and we're not frozen on a detected frame */}
                {multiCam && !detected && (
                  <button
                    type="button"
                    onClick={switchCamera}
                    className="absolute top-4 right-[18px] py-[6px] pr-[13px] pl-[10px] bg-[rgba(26,26,26,0.6)] backdrop-blur-[8px] rounded-full text-peach font-body text-[9.5px] tracking-[0.22em] uppercase font-semibold inline-flex items-center gap-2 border-0 cursor-pointer hover:bg-[rgba(26,26,26,0.78)] transition-colors"
                  >
                    <Icon name="image" size={12} stroke="var(--color-peach)" />
                    {facing === "environment" ? "Kamera depan" : "Kamera belakang"}
                  </button>
                )}
              </>
            )}
          </div>

          {/* bottom toolbar */}
          <div className="flex items-center gap-3">
            <GuestbookButton kind="ghost" h={48} fz={11.5} icon={<Icon name="x" size={12} />} onClick={onCancel}>
              Batal
            </GuestbookButton>
            <div className={cn(italic, "text-[15px] text-faint flex-1 text-center")}>
              QR ada di pesan WhatsApp tamu, di bawah link undangan
            </div>
            <GuestbookButton kind="dark" h={48} fz={11.5} icon={<Icon name="search" size={13} />} onClick={onSearch}>
              Cari manual
            </GuestbookButton>
          </div>
        </div>

        {/* RIGHT: detected guest */}
        <aside className="flex flex-col gap-3 min-h-0">
          {detected && match ? (
            <div className="bg-paper border-[1.5px] border-burgundy rounded-[18px] py-[18px] px-5 shadow-[0_18px_34px_-18px_rgba(124,45,45,0.4)] relative">
              <div className="absolute top-[14px] right-4 inline-flex items-center gap-[6px] bg-[rgba(77,216,145,0.18)] text-[#1c5a36] py-1 px-[10px] rounded-full font-body text-[9px] tracking-[0.16em] uppercase font-bold">
                <Icon name="check" size={10} stroke="#1c5a36" />
                QR cocok
              </div>
              <div className={cn(eyebrow, "text-[9.5px] mb-[14px]")}>QR terbaca</div>
              <div className="flex items-center gap-[14px]">
                <span className="w-[52px] h-[52px] rounded-full bg-burgundy inline-flex items-center justify-center shrink-0">
                  <Icon name="qr" size={22} stroke="var(--color-cream)" />
                </span>
                <div>
                  <div className="font-display font-bold text-[23px] tracking-[-0.025em] leading-[1.05] text-charcoal">
                    {match.name}
                  </div>
                  <div className={cn(eyebrow, "text-[9.5px] tracking-[0.18em] mt-1")}>
                    Menyiapkan konfirmasi…
                  </div>
                </div>
              </div>
              <div className="mt-[14px] py-[10px] px-[14px] bg-cream rounded-[10px] font-body text-[12.5px] text-muted-ink leading-[1.5] break-all">
                Kode tamu: {payload && payload.length > 64 ? `${payload.slice(0, 64)}…` : payload}
              </div>
              <GuestbookButton
                h={52}
                fz={12}
                className="w-full mt-[14px]"
                iconAfter={<Icon name="arrow-r" size={15} />}
                onClick={() => {
                  if (redirectRef.current) clearTimeout(redirectRef.current);
                  onFound?.(match);
                }}
              >
                Lanjut konfirmasi
              </GuestbookButton>
            </div>
          ) : qrError ? (
            // Unrecognized QR — the camera keeps scanning, but the aside guides
            // the operator to retry or fall back to manual search.
            <div className="bg-paper border-[1.5px] border-burgundy/40 rounded-[18px] py-[18px] px-5 relative">
              <div className={cn(eyebrow, "text-[9.5px] mb-[14px] text-burgundy")}>QR tidak dikenal</div>
              <div className="flex items-center gap-[14px]">
                <span className="w-[52px] h-[52px] rounded-full bg-[rgba(124,45,45,0.1)] border border-burgundy/30 inline-flex items-center justify-center shrink-0">
                  <Icon name="x" size={22} stroke="var(--color-burgundy)" />
                </span>
                <div>
                  <div className="font-display font-bold text-[19px] tracking-[-0.02em] leading-[1.15] text-charcoal">
                    QR tidak dikenal — coba cari manual
                  </div>
                  <div className={cn(eyebrow, "text-[9.5px] tracking-[0.18em] mt-1 text-muted-ink")}>
                    Kamera masih aktif · arahkan QR lain
                  </div>
                </div>
              </div>
              <div className="mt-[14px] py-[10px] px-[14px] bg-cream rounded-[10px] font-body text-[12.5px] text-muted-ink leading-[1.5] break-all">
                Kode terbaca: {payload && payload.length > 64 ? `${payload.slice(0, 64)}…` : payload}
              </div>
              <GuestbookButton
                h={52}
                fz={12}
                className="w-full mt-[14px]"
                icon={<Icon name="search" size={14} />}
                onClick={onSearch}
              >
                Cari manual
              </GuestbookButton>
            </div>
          ) : (
            <div className="bg-paper border-[1.5px] border-dashed border-beige rounded-[18px] py-[18px] px-5 relative">
              <div className={cn(eyebrow, "text-[9.5px] mb-[14px]")}>Menunggu QR</div>
              <div className="flex items-center gap-[14px]">
                <span className="w-[52px] h-[52px] rounded-full bg-cream border border-line inline-flex items-center justify-center shrink-0">
                  <Icon name="qr" size={22} stroke="var(--color-faint)" />
                </span>
                <div>
                  <div className="font-display font-bold text-[19px] tracking-[-0.02em] leading-[1.1] text-faint">
                    Belum ada tamu
                  </div>
                  <div className={cn(eyebrow, "text-[9.5px] tracking-[0.18em] mt-1 text-faint")}>
                    Arahkan QR ke kamera
                  </div>
                </div>
              </div>
              <div className="mt-[14px] py-[10px] px-[14px] bg-cream rounded-[10px] font-body text-[12.5px] text-faint leading-[1.5]">
                Data tamu muncul di sini begitu QR terbaca
              </div>
              <GuestbookButton h={52} fz={12} className="w-full mt-[14px] opacity-40 cursor-not-allowed" disabled>
                Lanjut konfirmasi
              </GuestbookButton>
            </div>
          )}

          {/* tips */}
          <div className="bg-ivory border border-line rounded-2xl py-[14px] px-[18px]">
            <div className={cn(eyebrow, "text-[9.5px] mb-2")}>Tip pemindaian</div>
            {SCAN_TIPS.map((tip) => (
              <div key={tip} className="flex gap-[10px] py-[5px] font-body text-[13.5px] text-[#3F3B35] leading-[1.5]">
                <span className="text-terracotta font-bold">·</span>
                {tip}
              </div>
            ))}
          </div>

          {/* stats dark card — live check-in counts from the header when
              present (QR-specific tallies aren't tracked), else the mock. */}
          <div className="bg-charcoal text-cream rounded-2xl py-4 px-[18px] flex-1 relative overflow-hidden">
            <div className="absolute -top-9 -right-[42px] pointer-events-none">
              <FlowerMark size={150} color="rgba(234,211,194,0.07)" core="rgba(234,211,194,0.07)" stamen="transparent" />
            </div>
            <div className="relative">
              <div className={cn(eyebrow, "text-[9.5px] text-peach")}>
                {header ? "Hadir hari ini" : "Pemindaian hari ini"}
              </div>
              <div className="flex items-baseline gap-2 mt-[10px]">
                <span className="font-display [font-variation-settings:'opsz'_144] font-extrabold text-[40px] leading-[0.9] tracking-[-0.04em] text-cream">
                  {header ? header.stats.checkedIn : 89}
                </span>
                <span className={cn(italic, "text-[15px] text-peach")}>
                  {header ? "tamu" : "via QR"}
                </span>
              </div>
              <div className="font-body text-[12.5px] leading-[1.6] text-[rgba(245,239,230,0.6)] mt-2">
                {header
                  ? `${header.stats.walkIns} walk-in · total ${header.stats.invited} tamu`
                  : "+ 53 dicari manual · total 142 tamu"}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </GuestbookShell>
  );
}

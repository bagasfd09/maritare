"use client";

// Kiosk toast — a floating, Apple-style notification for the buku tamu screens
// (login errors, kicked-session notices, etc.). Springs in from the top on a
// frosted-glass card, then fades+lifts away on exit. The fixed wrapper is
// click-through (pointer-events-none) so it never blocks the form behind it;
// only the card itself is interactive. Auto-dismisses after `duration`.

import { useCallback, useEffect, useState } from "react";

import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Logo } from "@/components/atoms/logo";

export type ToastTone = "error" | "success" | "info";

// Keep in sync with --animate-toast-out (0.4s) so the card finishes its exit
// animation before it unmounts.
const EXIT_MS = 400;

const TONES: Record<ToastTone, { icon: IconName; chip: string }> = {
  error: { icon: "x", chip: "bg-burgundy text-cream" },
  success: { icon: "check", chip: "bg-sage text-[#1f2b22]" },
  info: { icon: "bell", chip: "bg-peach text-burgundy-dark" },
};

export function KioskToast({
  tone = "error",
  title,
  message,
  onClose,
  duration = 3600,
}: {
  tone?: ToastTone;
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
}) {
  const [leaving, setLeaving] = useState(false);

  const beginClose = useCallback(() => setLeaving(true), []);

  // Auto-dismiss: start the exit animation after `duration`.
  useEffect(() => {
    const t = window.setTimeout(beginClose, duration);
    return () => window.clearTimeout(t);
  }, [beginClose, duration]);

  // Once exiting, unmount after the exit animation has played.
  useEffect(() => {
    if (!leaving) {
      return;
    }
    const t = window.setTimeout(onClose, EXIT_MS);
    return () => window.clearTimeout(t);
  }, [leaving, onClose]);

  const s = TONES[tone];

  return (
    <div className="fixed top-6 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none">
      <div
        role="alert"
        className={`pointer-events-auto ${
          leaving ? "animate-toast-out" : "animate-toast-in"
        } relative overflow-hidden w-full max-w-[400px] rounded-[18px] border border-white/50 bg-[rgba(252,250,246,0.78)] backdrop-blur-2xl shadow-[0_14px_44px_-10px_rgba(26,26,26,0.28),0_4px_14px_-6px_rgba(26,26,26,0.16)]`}
      >
        {/* Faint floral watermark bleeding from the corner — the kiosk's
            signature decorative language, tying the toast to the brand theme.
            Kept very low-opacity so it never competes with the status icon. */}
        <span aria-hidden className="pointer-events-none absolute -right-5 -top-6 opacity-[0.07]">
          <FlowerMark size={108} color="var(--color-burgundy)" core="var(--color-burgundy)" stamen="transparent" />
        </span>

        <div className="relative flex items-center gap-3 px-[18px] pt-[15px] pb-3">
          <span
            className={`w-9 h-9 rounded-full inline-flex items-center justify-center shrink-0 ${s.chip}`}
          >
            <Icon name={s.icon} size={16} strokeWidth={2.2} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-display text-[15.5px] leading-[1.2] text-charcoal">
              {title}
            </div>
            {message && (
              <div className="text-[12.5px] text-muted-ink mt-[2px] leading-[1.45]">
                {message}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={beginClose}
            aria-label="Tutup"
            className="w-7 h-7 -mr-1 rounded-full inline-flex items-center justify-center text-muted-ink hover:bg-black/[0.05] cursor-pointer shrink-0"
          >
            <Icon name="x" size={13} />
          </button>
        </div>

        {/* Subtle Maritare brand signature — small flower glyph + wordmark. */}
        <div className="relative flex items-center gap-[6px] px-[18px] pb-[11px] pt-1 border-t border-charcoal/[0.06]">
          <FlowerMark size={11} />
          <Logo size={11} className="opacity-60" />
        </div>
      </div>
    </div>
  );
}

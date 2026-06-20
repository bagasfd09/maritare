"use client";

// Attendant login for the kiosk ("Petugas Resepsi"). The token code is the only
// credential — no dashboard account. On success a separate kiosk session cookie
// is set (single active device per token) and we land on the attract screen.
// Failures surface as an animated kiosk toast (plus a shake on the code field).

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { FlowerMark } from "@/components/atoms/flower-mark";
import { Logo } from "@/components/atoms/logo";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { KioskToast, type ToastTone } from "@/components/molecules/kiosk-toast";
import { loginPetugas } from "@/server/actions/petugas";

type Toast = { tone: ToastTone; title: string; message: string };

/** Live-format to the grouped display form "XXXX-XXXX" (uppercase, no symbols). */
function formatCode(raw: string): string {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  return s.length > 4 ? `${s.slice(0, 4)}-${s.slice(4)}` : s;
}

/** Turn a server error string into a friendly, specific toast. */
function errorToast(err: string): Toast {
  if (/tidak ditemukan|dicabut/i.test(err)) {
    return {
      tone: "error",
      title: "Kode tidak ditemukan",
      message: "Periksa lagi kodenya, atau minta kode baru ke pemilik undangan.",
    };
  }
  if (/tidak valid|format/i.test(err)) {
    return {
      tone: "error",
      title: "Format kode salah",
      message: "Kode terdiri dari 8 karakter — contoh: K7P2-MQ9X.",
    };
  }
  return { tone: "error", title: "Gagal masuk", message: err };
}

export function GuestbookLogin({
  initialCode,
  kicked,
}: {
  initialCode: string;
  kicked: boolean;
}) {
  const router = useRouter();
  const [code, setCode] = useState(formatCode(initialCode));
  const [toast, setToast] = useState<Toast | null>(
    kicked
      ? {
          tone: "error",
          title: "Sesi berakhir",
          message: "Kode ini dipakai masuk di perangkat lain. Masuk lagi untuk melanjutkan.",
        }
      : null,
  );
  // Bumped on every new toast so React remounts <KioskToast> and the entrance
  // animation + auto-dismiss timer restart even for repeated identical errors.
  const [toastKey, setToastKey] = useState(0);
  const [shake, setShake] = useState(false);
  const [pending, startTransition] = useTransition();

  const ready = code.replace(/[^A-Z0-9]/g, "").length >= 4;

  function showToast(t: Toast) {
    setToast(t);
    setToastKey((k) => k + 1);
    setShake(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending || !ready) {
      return;
    }
    setToast(null);
    startTransition(async () => {
      const res = await loginPetugas({ code });
      if (res.ok) {
        router.replace("/guestbook");
        router.refresh();
      } else {
        showToast(errorToast(res.error));
      }
    });
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-cream text-charcoal font-body flex items-center justify-center px-5 py-10">
      {/* Ambient floral decoration — giant slow-rotating watermarks (kiosk
          signature) plus a few small swaying accent blooms. Purely decorative. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-[-150px] bottom-[-170px] animate-gb-spin-slow">
          <FlowerMark size={460} color="rgba(176,74,58,0.06)" core="rgba(176,74,58,0.06)" stamen="transparent" />
        </div>
        <div className="absolute left-[-180px] top-[-200px] animate-gb-spin-slow [animation-direction:reverse] [animation-duration:150s]">
          <FlowerMark size={360} color="rgba(124,45,45,0.05)" core="rgba(124,45,45,0.05)" stamen="transparent" />
        </div>
        <div className="absolute left-[12%] top-[16%] opacity-50 animate-inv-sway">
          <FlowerMark size={26} />
        </div>
        <div className="absolute right-[14%] top-[24%] opacity-40 animate-inv-sway [animation-delay:1.4s]">
          <FlowerMark size={20} />
        </div>
        <div className="absolute left-[18%] bottom-[14%] opacity-40 animate-inv-sway [animation-delay:0.7s]">
          <FlowerMark size={34} />
        </div>
        <div className="absolute right-[20%] bottom-[20%] opacity-45 animate-inv-sway [animation-delay:2s]">
          <FlowerMark size={22} />
        </div>
      </div>

      {toast && (
        <KioskToast
          key={toastKey}
          tone={toast.tone}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="flex flex-col items-center text-center mb-7">
          <Logo size={30} />
          <div className="flex items-center gap-[10px] mt-[18px]">
            <FlowerMark size={12} />
            <span className="font-body text-[10px] tracking-[0.28em] uppercase font-semibold text-muted-ink">
              Buku Tamu · Petugas Resepsi
            </span>
            <FlowerMark size={12} />
          </div>
          <h1 className="font-display text-[30px] tracking-[-0.02em] leading-[1.1] mt-3">
            Masuk{" "}
            <span className="font-display italic font-normal text-burgundy">
              petugas.
            </span>
          </h1>
          <p className="text-[13px] text-muted-ink leading-[1.55] mt-3 max-w-[320px]">
            Masukkan kode petugas dari pemilik undangan untuk membuka buku tamu
            di perangkat ini.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-paper border border-line rounded-[16px] px-6 py-6 shadow-[0_18px_50px_-24px_rgba(26,26,26,0.28)]"
        >
          <label
            htmlFor="petugas-code"
            className="font-body text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-ink mb-2 block"
          >
            Kode petugas
          </label>
          <input
            id="petugas-code"
            value={code}
            onChange={(e) => setCode(formatCode(e.target.value))}
            onAnimationEnd={() => setShake(false)}
            placeholder="XXXX-XXXX"
            autoFocus
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            inputMode="text"
            className={`w-full bg-cream border rounded-[12px] px-4 py-[14px] text-center font-display text-[26px] tracking-[0.32em] text-charcoal outline-none uppercase placeholder:text-faint placeholder:tracking-[0.2em] ${
              shake
                ? "animate-shake border-burgundy"
                : "border-beige focus:border-burgundy"
            }`}
          />

          <Button
            type="submit"
            size="lg"
            variant="primary"
            disabled={pending || !ready}
            className="w-full justify-center mt-5"
          >
            {pending ? "Memeriksa…" : "Masuk"}
            {!pending && <Icon name="arrow-r" size={14} />}
          </Button>
        </form>

        <p className="text-center text-[11px] text-faint leading-[1.5] mt-5">
          Satu kode hanya aktif di satu perangkat. Masuk di perangkat baru akan
          mengeluarkan perangkat sebelumnya.
        </p>
      </div>
    </div>
  );
}

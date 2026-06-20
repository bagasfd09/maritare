"use client";

// Folk Garden — attendance confirmation step shown AFTER the guest taps "Buka
// Undangan" on the cover gate, BEFORE the invitation is revealed. Only rendered
// for personalized links (a resolved guest), so the name + headcount are known
// without asking. The guest picks Hadir / Berhalangan; if Hadir, they pick
// sendiri / bersama pasangan / bersama keluarga. The choice is persisted via
// submitGuestRsvp (updates the guest's dashboard status + headcount), then the
// invitation is revealed through onDone().
//
// Rendered as an accessible modal dialog (role/label/focus trap/Escape) layered
// over the still-mounted cover.

import { useEffect, useId, useRef, useState, useTransition } from "react";

import { Icon } from "@/components/atoms/icon";
import type { AcaraEvent } from "@/lib/invitation/sections";
import { cn } from "@/lib/utils";
import { submitGuestRsvp } from "@/server/actions/invitation";

import { formatLongDateId, formatTimeRangeId } from "./format";
import { FolkFloral, FolkGarland } from "./folk-ornaments";

type Props = {
  slug: string;
  guestId: string;
  guestName: string;
  /** Akad/resepsi events shown in the modal so the guest sees when & where. */
  events: AcaraEvent[];
  /** Reveal the invitation (slide the gate up). Called after a saved response. */
  onDone: () => void;
};

type Party = "solo" | "couple" | "family";

const PARTY_OPTIONS: { value: Party; label: string }[] = [
  { value: "solo", label: "Hadir sendiri" },
  { value: "couple", label: "Bersama pasangan" },
  { value: "family", label: "Bersama keluarga" },
];

const optionBase =
  "rounded-full px-5 py-3 font-body text-[12px] font-semibold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-60";
const optionOff =
  "border border-[#E0D6BE] bg-white/70 text-[#52602F] hover:border-[#700F06] hover:text-[#700F06]";

export function FolkRsvp({ slug, guestId, guestName, events, onDone }: Props) {
  // Only events with at least a date or a venue are worth showing in the modal.
  const shownEvents = events.filter((e) => e.date || e.venue);
  const [attending, setAttending] = useState<boolean | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  // Synchronous re-entrancy latch — React's pending state flips a render too late
  // to stop a fast double-tap from double-submitting.
  const submittingRef = useRef(false);

  // Move focus into the dialog on mount so keyboard/SR users land inside it.
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  const canConfirm = attending === false || (attending === true && party !== null);

  function choose(value: boolean) {
    setAttending(value);
    if (!value) setParty(null);
    setError(null);
  }

  function confirm() {
    if (!canConfirm || isPending || attending === null || submittingRef.current) return;
    submittingRef.current = true;
    // Start the music inside this gesture — browsers block autoplay otherwise.
    // (Mirrors the cover gate's original synchronous dispatch.)
    window.dispatchEvent(new Event("maritare:open-invitation"));

    // "Belum menentukan" (attending === false): the guest hasn't decided yet, so
    // record nothing — their status stays pending and they can confirm later —
    // and just reveal the invitation.
    if (attending === false) {
      onDone();
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await submitGuestRsvp({
        slug,
        guestId,
        attending: true,
        party: party ?? undefined,
      });
      if (!res.ok) {
        submittingRef.current = false; // allow a retry
        setError(res.error);
        return;
      }
      onDone(); // success → gate slides away (no latch reset needed)
    });
  }

  // Trap Tab focus within the dialog; Escape mirrors the escape-hatch (reveal).
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onDone();
      return;
    }
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="animate-scrim-in absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-[#2A1712]/55 px-5 py-8 backdrop-blur-sm">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="animate-sheet-in relative w-full max-w-[360px] overflow-hidden rounded-[28px] border border-[#E0D6BE] bg-[#F5EFE0] px-6 pb-8 pt-9 text-center shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] outline-none"
      >
        {/* mirrored florals bleeding from the top corners */}
        <FolkFloral
          name="lily-red"
          className="pointer-events-none absolute -left-9 -top-6 w-[88px] -rotate-12 select-none opacity-90"
        />
        <FolkFloral
          name="lily-red"
          className="pointer-events-none absolute -right-9 -top-6 w-[88px] -scale-x-100 rotate-12 select-none opacity-90"
        />

        <div className="relative">
          <FolkGarland className="mx-auto mb-3 h-auto w-[170px] opacity-95" />
          <h2
            id={titleId}
            className="font-display text-[25px] font-bold tracking-[-0.02em] text-[#700F06] [font-variation-settings:'opsz'_96]"
          >
            Konfirmasi Kehadiran
          </h2>
          <p className="mx-auto mt-3 max-w-[300px] font-body text-[12.5px] leading-relaxed text-[#3C471F]">
            Dengan hormat, kami mohon kesediaan Bapak/Ibu/Saudara/i{" "}
            <span className="font-semibold text-[#700F06]">{guestName}</span> untuk mengonfirmasi
            kehadiran terlebih dahulu sebelum membuka undangan. Atas perhatiannya, kami ucapkan
            terima kasih.
          </p>
        </div>

        {/* Event detail — when & where, so the guest decides before confirming. */}
        {shownEvents.length > 0 && (
          <div className="relative mt-5 space-y-2.5">
            {shownEvents.map((ev, i) => (
              <div
                key={`${ev.name}-${i}`}
                className="rounded-2xl border border-[#E0D6BE] bg-white/55 px-4 py-3 text-left shadow-[0_8px_20px_-16px_rgba(0,0,0,0.4)]"
              >
                <p className="font-display text-[15px] font-bold italic text-[#700F06] [font-variation-settings:'opsz'_96]">
                  {ev.name}
                </p>
                {ev.date && (
                  <div className="mt-1.5 flex items-start gap-2">
                    <Icon name="calendar" size={13} stroke="#C9A24B" className="mt-px" />
                    <span className="font-body text-[11.5px] leading-snug text-[#3C471F]">
                      {formatLongDateId(ev.date)}
                      {ev.timeStart ? ` · ${formatTimeRangeId(ev.timeStart, ev.timeEnd)}` : ""}
                    </span>
                  </div>
                )}
                {ev.venue && (
                  <div className="mt-1 flex items-start gap-2">
                    <Icon name="pin" size={13} stroke="#C9A24B" className="mt-px" />
                    <span className="font-body text-[11.5px] leading-snug text-[#52602F]">
                      {ev.venue}
                      {ev.address ? `, ${ev.address}` : ""}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 1 — Hadir / Belum Menentukan (stacked: the second label is long) */}
        <div className="relative mt-6 grid gap-2.5">
          <button
            type="button"
            onClick={() => choose(true)}
            aria-pressed={attending === true}
            disabled={isPending}
            className={cn(
              optionBase,
              attending === true
                ? "bg-[#700F06] text-[#E8E1D1] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)]"
                : optionOff,
            )}
          >
            Hadir
          </button>
          <button
            type="button"
            onClick={() => choose(false)}
            aria-pressed={attending === false}
            disabled={isPending}
            className={cn(
              optionBase,
              attending === false
                ? "bg-[#700F06] text-[#E8E1D1] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)]"
                : optionOff,
            )}
          >
            Belum Menentukan
          </button>
        </div>

        {/* Step 2 — party size, only when attending */}
        {attending === true && (
          <div className="relative mt-3 space-y-2">
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-[#52602F]">
              Hadir bersama
            </p>
            <div className="grid gap-2">
              {PARTY_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setParty(value);
                    setError(null);
                  }}
                  aria-pressed={party === value}
                  disabled={isPending}
                  className={cn(
                    optionBase,
                    "tracking-[0.1em]",
                    party === value
                      ? "bg-[#700F06] text-[#E8E1D1] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)]"
                      : optionOff,
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="relative mt-4 rounded-xl border border-[#700F06]/40 bg-[#E8A0B8]/25 px-4 py-2.5 font-body text-[11px] leading-relaxed text-[#700F06]"
          >
            {error}
          </p>
        )}

        {/* Confirm → save + reveal the invitation */}
        <button
          type="button"
          onClick={confirm}
          disabled={!canConfirm || isPending}
          aria-busy={isPending}
          className="relative mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#700F06] px-7 py-3.5 font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-[#E8E1D1] shadow-[0_12px_30px_-12px_rgba(0,0,0,0.6)] transition hover:bg-[#A98534] hover:text-[#F5F2E4] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Menyimpan…" : "Lihat Undangan"}
        </button>

        {/* Escape hatch so a save failure never traps the guest. */}
        {error && (
          <button
            type="button"
            onClick={onDone}
            className="relative mx-auto mt-3 block font-body text-[11px] text-[#52602F] underline underline-offset-2 transition hover:text-[#700F06]"
          >
            Lanjut ke undangan tanpa konfirmasi
          </button>
        )}
      </div>
    </div>
  );
}

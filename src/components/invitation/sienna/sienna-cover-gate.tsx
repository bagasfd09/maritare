"use client";

// Sienna opening gate — the template's decorative PRIMARY PANE (the desktop
// left panel: corner ornament stacks, "The Wedding Of {names}" intro, the
// framed cover photo + "Dear," greeting) rendered FULL-SCREEN as the opening
// screen, with a "Buka Undangan" button overlaid at the bottom (the pane itself
// already greets the guest by name). Mirrors ivory-cover-gate's mechanism: the
// `.sienna-gate` CSS overrides (in sienna-embed's extra CSS) make the pane fill
// the overlay in every viewport (its theme rules otherwise pin it fixed at 61%
// on desktop and hide it entirely on mobile). Tapping the button reveals the
// invitation (slides the gate up) and dispatches "maritare:open-invitation",
// which starts the music (ScarletAudio waitForOpen).
//
// The gate root carries the .sienna-inv preset classes so the theme CSS injected
// by the main SiennaEmbed below styles it; it does NOT get `aos-on`, so the
// pane's data-aos ornaments render fully visible without the observer.

import { useEffect, useState } from "react";

import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";
import type { InvitationView } from "@/server/queries/invitation";

import { SiennaPrimaryPane } from "./sienna-primary-pane";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** Sanitized guest name (?g= guest, else ?to=), optional — shown by the
   *  pane's own "Dear," greeting. */
  guestName?: string;
};

const EXIT_MS = 850;

export function SiennaCoverGate({ data, mode, guestName }: Props) {
  const [leaving, setLeaving] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Lock page scroll while the gate is up; restore when it opens/unmounts. Skip
  // in the editor preview — the gate is contained inside the scaled phone frame,
  // so locking document.body would wrongly freeze the whole dashboard.
  useEffect(() => {
    if (hidden || mode === "editorPreview") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [hidden, mode]);

  if (hidden) return null;

  const handleOpen = () => {
    if (leaving) return;
    // Dispatched synchronously inside this click so it counts as the user
    // gesture browsers require for audio.
    window.dispatchEvent(new Event("maritare:open-invitation"));
    setLeaving(true);
    window.setTimeout(() => setHidden(true), EXIT_MS);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] overflow-hidden bg-[#fff8f0]",
        "transition-[transform,opacity] duration-[800ms] ease-[cubic-bezier(.7,0,.3,1)]",
        leaving ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
      )}
    >
      {/* The primary pane, full-screen (see .sienna-gate overrides). */}
      <div className="sienna-inv original preset-original sienna-gate">
        <section className="kat-page__side-to-side">
          <section className="primary-pane">
            <div className="inner">
              <SiennaPrimaryPane data={data} mode={mode} guestName={guestName} />
            </div>
          </section>
        </section>
      </div>

      {/* Open control pinned to the bottom over the pane. */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-6 pb-9 text-center">
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-2 rounded-full bg-[#d6a191] px-7 py-3 font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-[#fff8f0] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.45)] transition hover:bg-[#cb3a31]"
      >
          <Icon name="envelope" size={15} />
          Buka Undangan
        </button>
      </div>
    </div>
  );
}

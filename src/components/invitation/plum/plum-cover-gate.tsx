"use client";

// Plum opening gate — the template's decorative PRIMARY PANE (the desktop left
// panel: forest bg, ornaments, names intro + guest greeting) rendered
// FULL-SCREEN as the opening screen, with an oval cover portrait in the middle
// (the plum pane has no photo of its own — ivory pattern) and a "Buka Undangan"
// button at the bottom (the pane already greets the guest by name, so no extra
// "Kepada Yth" line). Mirrors ivory-/sienna-cover-gate's mechanism: the
// `.plum-gate` CSS overrides (in plum-embed's extra CSS) make the pane fill the
// overlay in every viewport (its theme rules otherwise pin it fixed at 61% on
// desktop and hide it entirely on mobile). Tapping the button reveals the
// invitation (slides the gate up) and dispatches "maritare:open-invitation",
// which starts the music (ScarletAudio waitForOpen).
//
// The gate root carries the .plum-inv preset classes so the theme CSS injected
// by the main PlumEmbed below styles it; it does NOT get `aos-on`, so the
// pane's data-aos ornaments render fully visible without the observer.

import { useEffect, useState } from "react";

import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";
import type { InvitationView } from "@/server/queries/invitation";

import { InvImage } from "../scarlet/inv-image";
import { PlumPrimaryPane } from "./plum-primary-pane";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** Sanitized guest name (?g= guest, else ?to=), optional — shown by the
   *  pane's own greeting. */
  guestName?: string;
};

const EXIT_MS = 850;

export function PlumCoverGate({ data, mode, guestName }: Props) {
  const [leaving, setLeaving] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Cover photo (Sampul editor section) — shown as an oval portrait in the
  // middle of the gate. Absent → the pane illustration stands on its own.
  const coverPhoto = data.photos.find((p) => p.isCover) ?? data.photos[0];

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
        "fixed inset-0 z-[80] overflow-hidden bg-[#f3e4d8]",
        "transition-[transform,opacity] duration-[800ms] ease-[cubic-bezier(.7,0,.3,1)]",
        leaving ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
      )}
    >
      {/* The primary pane, full-screen (see .plum-gate overrides). */}
      <div className="plum-inv original preset-original plum-gate">
        <section className="kat-page__side-to-side">
          <section className="primary-pane">
            <div className="inner">
              <PlumPrimaryPane data={data} mode={mode} guestName={guestName} />
            </div>
          </section>
        </section>
      </div>

      {/* Oval couple portrait in the gate's middle — gold ring + cream halo
          (plum palette). pointer-events-none so it never blocks the button. */}
      {coverPhoto && (
        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center">
          {/* md: smaller + nudged up so it clears the pane's bottom text block
              on desktop. */}
          <div className="w-[56%] max-w-[270px] -translate-y-[10%] md:max-w-[230px] md:-translate-y-[16%]">
            <div className="aspect-[3/4] overflow-hidden rounded-[50%] border-[3px] border-[#d0a25e] shadow-[0_0_0_7px_rgba(255,250,235,0.75),0_22px_44px_-18px_rgba(52,28,38,0.55)]">
              <InvImage
                priority
                src={coverPhoto.url}
                alt={coverPhoto.label ?? "Foto sampul"}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Open control pinned to the bottom over the pane. */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-6 pb-9 text-center">
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-2 rounded-full bg-[#613947] px-7 py-3 font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-[#ece8d8] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.5)] transition hover:bg-[#d0a25e] hover:text-[#3c2430]"
        >
          <Icon name="envelope" size={15} />
          Buka Undangan
        </button>
      </div>
    </div>
  );
}

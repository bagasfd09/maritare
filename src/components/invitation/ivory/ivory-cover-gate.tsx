"use client";

// Ivory opening gate — the template's decorative PRIMARY PANE (the left
// side-to-side panel: bg ornaments, duck/bird flocks, clouds, bottom florals,
// "The Wedding Of {names}" script title) rendered FULL-SCREEN as the opening
// screen, with a "Kepada Yth" line + "Buka Undangan" button overlaid at the
// bottom. The `.ivory-gate` CSS overrides (in ivory-embed's extra CSS) make the
// pane fill the overlay in every viewport (its theme rules otherwise pin it
// fixed at 61% on desktop and hide it entirely on mobile). Tapping the button
// reveals the invitation (slides the gate up) and dispatches
// "maritare:open-invitation", which starts the music (ScarletAudio waitForOpen).
//
// The gate root carries the .ivory-inv preset classes so the theme CSS injected
// by the main IvoryEmbed below styles it; it does NOT get `aos-on`, so the
// pane's data-aos ornaments render fully visible without the observer.

import { useEffect, useState } from "react";

import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";
import type { InvitationView } from "@/server/queries/invitation";

import { InvImage } from "../scarlet/inv-image";
import { IvoryPrimaryPane } from "./ivory-primary-pane";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** Sanitized guest name (?g= guest, else ?to=), optional. */
  guestName?: string;
};

const EXIT_MS = 850;

export function IvoryCoverGate({ data, mode, guestName }: Props) {
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
        "fixed inset-0 z-[80] overflow-hidden bg-[#eaf1e6]",
        "transition-[transform,opacity] duration-[800ms] ease-[cubic-bezier(.7,0,.3,1)]",
        leaving ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
      )}
    >
      {/* The primary pane, full-screen (see .ivory-gate overrides). */}
      <div className="ivory-inv original preset-original ivory-gate">
        <section className="kat-page__side-to-side">
          <section className="primary-pane">
            <div className="inner">
              <IvoryPrimaryPane data={data} mode={mode} />
            </div>
          </section>
        </section>
      </div>

      {/* Oval couple portrait in the gate's middle — gold ring + cream halo
          (the .ls-img-content gold, ivory identity). pointer-events-none so it
          never blocks the button underneath on short screens. */}
      {coverPhoto && (
        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center">
          {/* md: smaller + nudged down so it sits inside the garden arch and
              clears the (much larger) desktop title. */}
          <div className="w-[58%] max-w-[280px] -translate-y-[4%] md:max-w-[230px] md:translate-y-[14%]">
            <div className="aspect-[3/4] overflow-hidden rounded-[50%] border-[3px] border-[#9e8c41] shadow-[0_0_0_7px_rgba(244,237,222,0.75),0_22px_44px_-18px_rgba(46,23,32,0.55)]">
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

      {/* Open control pinned to the bottom over the pane's florals. */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 px-6 pb-10 text-center">
        {guestName && (
          <div>
            <p className="font-body text-[11px] uppercase tracking-[0.24em] text-[#723d4c]/80">
              Kepada Yth.
            </p>
            <p className="mt-1 font-display text-[19px] italic text-[#723d4c]">{guestName}</p>
          </div>
        )}
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-2 rounded-full bg-[#723d4c] px-7 py-3 font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-[#ded19d] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.45)] transition hover:bg-[#526f5c]"
        >
          <Icon name="envelope" size={15} />
          Buka Undangan
        </button>
      </div>
    </div>
  );
}

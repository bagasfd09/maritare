"use client";

// Folk Garden opening gate. Reuses the real ScarletCover (the faithful port of
// the reference's <section class="cover"> — ornaments, gold frame, couple names)
// so the opening screen matches the template, and overlays a "Kepada Yth" line +
// "Buka Undangan" button. Tapping it either:
//   - reveals the invitation directly (generic link / RSVP disabled), or
//   - shows the per-guest attendance confirmation step first (personalized link
//     with a resolved guest), then reveals once the guest responds.
// The reveal slides the gate up; the gesture that reveals also starts the music.
// SSR-rendered with the theme's cream base so it appears instantly.

import { useEffect, useState } from "react";
import { format } from "date-fns";

import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";
import type { InvitationView } from "@/server/queries/invitation";

import { ScarletEmbed } from "../scarlet/scarlet-embed";
import { ScarletCover } from "../scarlet/sections/scarlet-cover";
import { FolkRsvp } from "./folk-rsvp";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** Sanitized guest name from ?to= (optional). */
  guestName?: string;
  /** Resolved guest from the personalized link (?g=<code>); drives the RSVP step. */
  checkin?: { guestId: string; guestName: string; responded: boolean } | null;
};

const EXIT_MS = 850;

// TEMP (testing): show the RSVP step on every open, even after the guest already
// answered. Set back to false to restore the "tampil sekali saja" behavior.
const ALWAYS_SHOW_RSVP = true;

export function FolkCoverGate({ data, mode, guestName, checkin }: Props) {
  const [phase, setPhase] = useState<"cover" | "rsvp">("cover");
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

  const rsvp = data.sections.rsvp;
  const deadlinePassed = rsvp.deadline ? format(new Date(), "yyyy-MM-dd") > rsvp.deadline : false;
  // RSVP step only for a real guest on a live invitation with RSVP open — and
  // only once: a guest who already answered (responded) opens straight through.
  const useRsvp =
    mode === "public" &&
    !!checkin &&
    (ALWAYS_SHOW_RSVP || !checkin.responded) &&
    rsvp.enabled &&
    !deadlinePassed;

  // Slide the gate up to reveal the invitation behind it (visual only).
  const slideUp = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => setHidden(true), EXIT_MS);
  };

  const handleOpen = () => {
    if (leaving) return;
    if (useRsvp) {
      // Show the attendance step first; music + reveal happen on its confirm.
      setPhase("rsvp");
      return;
    }
    // No RSVP step → reveal now. Dispatched synchronously inside this click so it
    // counts as the user gesture browsers require for audio.
    window.dispatchEvent(new Event("maritare:open-invitation"));
    slideUp();
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] overflow-hidden bg-[#F5F2E4]",
        "transition-[transform,opacity] duration-[800ms] ease-[cubic-bezier(.7,0,.3,1)]",
        leaving ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
      )}
    >
      {/* The real reference cover (ornate frame + ornaments + names). */}
      <div className="h-full w-full overflow-y-auto">
        <ScarletEmbed>
          <ScarletCover data={data} mode={mode} />
        </ScarletEmbed>
      </div>

      {phase === "cover" ? (
        /* Open control pinned to the bottom over the cover. */
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-6 pb-9 pt-36 text-center">
          {guestName && (
            <div>
              <p className="font-body text-[11px] uppercase tracking-[0.24em] text-white/85">
                Kepada Yth.
              </p>
              <p className="mt-1 font-display text-[19px] italic text-white">{guestName}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleOpen}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#700F06] px-7 py-3 font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-[#E8E1D1] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)] transition hover:bg-[#A98534] hover:text-[#F5F2E4]"
          >
            <Icon name="envelope" size={15} />
            Buka Undangan
          </button>
        </div>
      ) : (
        checkin && (
          <FolkRsvp
            slug={data.slug}
            guestId={checkin.guestId}
            guestName={checkin.guestName}
            events={data.sections.acara.events}
            onDone={slideUp}
          />
        )
      )}
    </div>
  );
}

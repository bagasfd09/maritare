// Plum — a faithful, data-driven port of the Katsudoto "Kinanti" template
// (reference: "Arvi & Aditya"). Composes the JSX section components (each bound
// to InvitationView) inside the shared PlumEmbed shell, which injects the scoped
// theme CSS, reproduces Kinanti's two-pane skeleton, and drives the scroll
// reveal. Section order mirrors the original top-to-bottom render (cover, story,
// quote, couple, save-the-date, agenda, gallery, QR, gift, wish, footnote). The
// cover monogram/logo + wedding hashtag are dropped (no fields); the footnote is
// text-only (no closing photo). The Maritare footer credit was removed
// (ivory/sienna parity).
//
// NOTE: Katsudoto is the owner's own brand (migration to maritare). Reuses
// ScarletAudio (data-driven, template-agnostic) for the background-music player.

import type { InvitationTemplateProps } from "@/components/invitation/types";

import { ScarletAudio } from "../scarlet/scarlet-audio";
import { PlumAgenda } from "./plum-agenda";
import { PlumCouple } from "./plum-couple";
import { PlumCover } from "./plum-cover";
import { PlumCoverGate } from "./plum-cover-gate";
import { PlumEmbed } from "./plum-embed";
import { PlumFootnote } from "./plum-footnote";
import { PlumGallery } from "./plum-gallery";
import { PlumGift } from "./plum-gift";
import { PlumPrimaryPane } from "./plum-primary-pane";
import { PlumQr } from "./plum-qr";
import { PlumQuote } from "./plum-quote";
import { PlumSaveDate } from "./plum-savedate";
import { PlumStory } from "./plum-story";
import { PlumWishes } from "./plum-wishes";

// First word of the editable "Nama lengkap" (pasangan.fullName), falling back to
// the wedding's top-level name — matches the cover's short-name rendering.
function firstName(fullName: string | undefined, fallback: string): string {
  const n = (fullName ?? "").trim() || fallback;
  return n.split(/\s+/)[0] || fallback;
}

export function PlumTemplate({ data, mode, guestName, checkin }: InvitationTemplateProps) {
  const groomFirst = firstName(data.sections.pasangan.groom.fullName, data.groomName);
  const brideFirst = firstName(data.sections.pasangan.bride.fullName, data.brideName);
  const qrDate = data.sections.acara.events[0]?.date ?? data.eventDate;

  return (
    <>
      {/* Opening "Buka Undangan" gate — the decorative primary pane (the desktop
          left panel, incl. the guest greeting) rendered full-screen with an oval
          cover portrait. Rendered in EVERY mode so the editor preview matches the
          live invitation — its `fixed` overlay is contained by the editor's
          scaled preview frame (a transformed ancestor). */}
      <PlumCoverGate data={data} mode={mode} guestName={checkin?.guestName ?? guestName} />
      <PlumEmbed
        primary={
          <PlumPrimaryPane data={data} mode={mode} guestName={checkin?.guestName ?? guestName} />
        }
        forceMobile={mode === "editorPreview"}
      >
        <PlumCover data={data} mode={mode} />
        <PlumStory data={data} mode={mode} />
        <PlumQuote data={data} mode={mode} />
        <PlumCouple data={data} mode={mode} />
        <PlumSaveDate data={data} mode={mode} />
        <PlumAgenda data={data} mode={mode} />
        <PlumGallery data={data} mode={mode} />
        <PlumQr
          checkin={checkin}
          brideName={brideFirst}
          groomName={groomFirst}
          eventDate={qrDate}
        />
        {/* Folk-style: personalized ?g= links hide the other family's accounts. */}
        <PlumGift data={data} mode={mode} guestSide={checkin?.side} />
        {/* Pre-fill the wish/RSVP name with the invitation's guest (?g= guest, else ?to=);
            checkin keys the RSVP to them (dashboard status + headcount), folk-style. */}
        <PlumWishes data={data} mode={mode} guestName={checkin?.guestName ?? guestName} checkin={checkin} />
        <PlumFootnote data={data} mode={mode} />
        {/* Music starts on the gate's "Buka Undangan" tap (folk-style); the editor
            preview has no meaningful gate gesture, so it doesn't wait there. */}
        <ScarletAudio data={data} mode={mode} waitForOpen={mode !== "editorPreview"} />
      </PlumEmbed>
    </>
  );
}

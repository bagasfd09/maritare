// Sienna — a faithful, data-driven port of the Katsudoto "Syakira" template
// (reference: "Filan & Agung"). Composes the JSX section components (each bound
// to InvitationView) inside the shared SiennaEmbed shell, which injects the
// scoped theme CSS, reproduces Syakira's two-pane skeleton, and drives the scroll
// reveal. Section order mirrors the original top-to-bottom render (cover, couple,
// gallery, story, save-the-date, agenda, QR, gift, wish, quote, footnote); the
// reference's video-gallery is intentionally omitted (no mid-page video field in
// maritare), and the cover monogram/logo is dropped (no field). The Maritare
// footer credit was removed (ivory parity).
//
// NOTE: Katsudoto is the owner's own brand (migration to maritare). Reuses
// ScarletAudio (data-driven, template-agnostic) for the background-music player.

import type { InvitationTemplateProps } from "@/components/invitation/types";

import { ScarletAudio } from "../scarlet/scarlet-audio";
import { SiennaAgenda } from "./sienna-agenda";
import { SiennaCouple } from "./sienna-couple";
import { SiennaCover } from "./sienna-cover";
import { SiennaCoverGate } from "./sienna-cover-gate";
import { SiennaEmbed } from "./sienna-embed";
import { SiennaFootnote } from "./sienna-footnote";
import { SiennaGallery } from "./sienna-gallery";
import { SiennaGift } from "./sienna-gift";
import { SiennaPrimaryPane } from "./sienna-primary-pane";
import { SiennaQr } from "./sienna-qr";
import { SiennaQuote } from "./sienna-quote";
import { SiennaSaveDate } from "./sienna-savedate";
import { SiennaStory } from "./sienna-story";
import { SiennaWishes } from "./sienna-wishes";

// First word of the editable "Nama lengkap" (pasangan.fullName), falling back to
// the wedding's top-level name — matches the cover's short-name rendering.
function firstName(fullName: string | undefined, fallback: string): string {
  const n = (fullName ?? "").trim() || fallback;
  return n.split(/\s+/)[0] || fallback;
}

export function SiennaTemplate({ data, mode, guestName, checkin }: InvitationTemplateProps) {
  const groomFirst = firstName(data.sections.pasangan.groom.fullName, data.groomName);
  const brideFirst = firstName(data.sections.pasangan.bride.fullName, data.brideName);
  const qrDate = data.sections.acara.events[0]?.date ?? data.eventDate;

  return (
    <>
      {/* Opening "Buka Undangan" gate — the decorative primary pane (the desktop
          left panel, incl. the framed cover photo + "Dear," greeting) rendered
          full-screen. Rendered in EVERY mode so the editor preview matches the
          live invitation — its `fixed` overlay is contained by the editor's
          scaled preview frame (a transformed ancestor). */}
      <SiennaCoverGate data={data} mode={mode} guestName={checkin?.guestName ?? guestName} />
      <SiennaEmbed
        primary={
          <SiennaPrimaryPane data={data} mode={mode} guestName={checkin?.guestName ?? guestName} />
        }
        forceMobile={mode === "editorPreview"}
      >
        <SiennaCover data={data} mode={mode} />
        <SiennaCouple data={data} mode={mode} />
        <SiennaGallery data={data} mode={mode} />
        <SiennaStory data={data} mode={mode} />
        <SiennaSaveDate data={data} mode={mode} />
        <SiennaAgenda data={data} mode={mode} />
        {/* Check-in QR — hideable from the RSVP form (rsvp.showQr). */}
        {data.sections.rsvp.showQr && (
          <SiennaQr
            checkin={checkin}
            brideName={brideFirst}
            groomName={groomFirst}
            eventDate={qrDate}
          />
        )}
        {/* Folk-style: personalized ?g= links hide the other family's accounts. */}
        <SiennaGift data={data} mode={mode} guestSide={checkin?.side} />
        {/* Pre-fill the wish/RSVP name with the invitation's guest (?g= guest, else ?to=);
            checkin keys the RSVP to them (dashboard status + headcount), folk-style. */}
        <SiennaWishes data={data} mode={mode} guestName={checkin?.guestName ?? guestName} checkin={checkin} />
        <SiennaQuote data={data} mode={mode} />
        <SiennaFootnote data={data} mode={mode} />
        {/* Music starts on the gate's "Buka Undangan" tap (folk-style); the editor
            preview has no meaningful gate gesture, so it doesn't wait there. */}
        <ScarletAudio data={data} mode={mode} waitForOpen={mode !== "editorPreview"} />
      </SiennaEmbed>
    </>
  );
}

// Ivory — a faithful, data-driven port of the Katsudoto "Aulia" template
// (reference: "Sinta & Fanny"). Composes the JSX section components (each bound
// to InvitationView) inside the shared IvoryEmbed shell, which injects the
// scoped theme CSS, reproduces Aulia's two-pane skeleton, and drives the scroll
// reveal. Section order mirrors the original top-to-bottom render; the reference's
// video-gallery and Instagram-filter sections are intentionally omitted (no data
// home in maritare yet), and the cover monogram/hashtag are dropped (no field).
//
// NOTE: Katsudoto is the owner's own brand (migration to maritare). Reuses
// ScarletAudio (data-driven, template-agnostic) for the background-music player.

import type { InvitationTemplateProps } from "@/components/invitation/types";

import { ScarletAudio } from "../scarlet/scarlet-audio";
import { IvoryAgenda } from "./ivory-agenda";
import { IvoryCouple } from "./ivory-couple";
import { IvoryCover } from "./ivory-cover";
import { IvoryCoverGate } from "./ivory-cover-gate";
import { IvoryEmbed } from "./ivory-embed";
import { IvoryFootnote } from "./ivory-footnote";
import { IvoryGallery } from "./ivory-gallery";
import { IvoryGift } from "./ivory-gift";
import { IvoryNotes } from "./ivory-notes";
import { IvoryPrimaryPane } from "./ivory-primary-pane";
import { IvoryQr } from "./ivory-qr";
import { IvoryQuote } from "./ivory-quote";
import { IvorySaveDate } from "./ivory-savedate";
import { IvoryStory } from "./ivory-story";
import { IvoryWishes } from "./ivory-wishes";

// First word of the editable "Nama lengkap" (pasangan.fullName), falling back to
// the wedding's top-level name — matches the cover's short-name rendering.
function firstName(fullName: string | undefined, fallback: string): string {
  const n = (fullName ?? "").trim() || fallback;
  return n.split(/\s+/)[0] || fallback;
}

export function IvoryTemplate({ data, mode, guestName, checkin }: InvitationTemplateProps) {
  const groomFirst = firstName(data.sections.pasangan.groom.fullName, data.groomName);
  const brideFirst = firstName(data.sections.pasangan.bride.fullName, data.brideName);
  const qrDate = data.sections.acara.events[0]?.date ?? data.eventDate;

  return (
    <>
      {/* Opening "Buka Undangan" gate — the decorative primary pane (the desktop
          left panel) rendered full-screen as its own opening design. Rendered in
          EVERY mode so the editor preview matches the live invitation — its
          `fixed` overlay is contained by the editor's scaled preview frame (a
          transformed ancestor), so it fills the phone rather than the page. */}
      <IvoryCoverGate data={data} mode={mode} guestName={checkin?.guestName ?? guestName} />
      <IvoryEmbed
        primary={<IvoryPrimaryPane data={data} mode={mode} />}
        forceMobile={mode === "editorPreview"}
      >
      <IvoryCover data={data} mode={mode} />
      <IvoryQuote data={data} mode={mode} />
      <IvoryCouple data={data} mode={mode} />
      <IvorySaveDate data={data} mode={mode} />
      <IvoryAgenda data={data} mode={mode} />
      <IvoryQr
        checkin={checkin}
        brideName={brideFirst}
        groomName={groomFirst}
        eventDate={qrDate}
      />
      <IvoryGallery data={data} mode={mode} />
      <IvoryStory data={data} />
      {/* Folk-style: personalized ?g= links hide the other family's accounts. */}
      <IvoryGift data={data} mode={mode} guestSide={checkin?.side} />
      {/* Pre-fill the wish/RSVP name with the invitation's guest (?g= guest, else ?to=);
          checkin keys the RSVP to them (dashboard status + headcount), folk-style. */}
      <IvoryWishes data={data} mode={mode} guestName={checkin?.guestName ?? guestName} checkin={checkin} />
      <IvoryNotes />
      <IvoryFootnote data={data} mode={mode} />
      {/* Music starts on the gate's "Buka Undangan" tap (folk-style); the editor
          preview has no meaningful gate gesture, so it doesn't wait there. */}
      <ScarletAudio data={data} mode={mode} waitForOpen={mode !== "editorPreview"} />
    </IvoryEmbed>
    </>
  );
}

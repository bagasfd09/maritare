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
import { IvoryEmbed } from "./ivory-embed";
import { IvoryFooter } from "./ivory-footer";
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
    <IvoryEmbed primary={<IvoryPrimaryPane data={data} mode={mode} />}>
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
      {/* Pre-fill the wish/RSVP name with the invitation's guest (?g= guest, else ?to=). */}
      <IvoryWishes data={data} mode={mode} guestName={checkin?.guestName ?? guestName} />
      <IvoryNotes />
      <IvoryFootnote data={data} mode={mode} />
      <IvoryFooter />
      {/* No opening gate (cover is inline), so music starts on first interaction. */}
      <ScarletAudio data={data} mode={mode} waitForOpen={false} />
    </IvoryEmbed>
  );
}

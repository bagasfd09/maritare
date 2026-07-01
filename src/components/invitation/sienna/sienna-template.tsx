// Sienna — a faithful, data-driven port of the Katsudoto "Syakira" template
// (reference: "Filan & Agung"). Composes the JSX section components (each bound
// to InvitationView) inside the shared SiennaEmbed shell, which injects the
// scoped theme CSS, reproduces Syakira's two-pane skeleton, and drives the scroll
// reveal. Section order mirrors the original top-to-bottom render (cover, couple,
// gallery, story, save-the-date, agenda, gift, wish, quote, footnote); the
// reference's video-gallery is intentionally omitted (no mid-page video field in
// maritare), and the cover monogram/logo is dropped (no field).
//
// NOTE: Katsudoto is the owner's own brand (migration to maritare). Reuses
// ScarletAudio (data-driven, template-agnostic) for the background-music player.

import type { InvitationTemplateProps } from "@/components/invitation/types";

import { ScarletAudio } from "../scarlet/scarlet-audio";
import { SiennaAgenda } from "./sienna-agenda";
import { SiennaCouple } from "./sienna-couple";
import { SiennaCover } from "./sienna-cover";
import { SiennaEmbed } from "./sienna-embed";
import { SiennaFooter } from "./sienna-footer";
import { SiennaFootnote } from "./sienna-footnote";
import { SiennaGallery } from "./sienna-gallery";
import { SiennaGift } from "./sienna-gift";
import { SiennaPrimaryPane } from "./sienna-primary-pane";
import { SiennaQuote } from "./sienna-quote";
import { SiennaSaveDate } from "./sienna-savedate";
import { SiennaStory } from "./sienna-story";
import { SiennaWishes } from "./sienna-wishes";

export function SiennaTemplate({ data, mode, guestName, checkin }: InvitationTemplateProps) {
  return (
    <SiennaEmbed
      primary={
        <SiennaPrimaryPane data={data} mode={mode} guestName={checkin?.guestName ?? guestName} />
      }
    >
      <SiennaCover data={data} mode={mode} />
      <SiennaCouple data={data} mode={mode} />
      <SiennaGallery data={data} mode={mode} />
      <SiennaStory data={data} mode={mode} />
      <SiennaSaveDate data={data} mode={mode} />
      <SiennaAgenda data={data} mode={mode} />
      {/* Folk-style: personalized ?g= links hide the other family's accounts. */}
      <SiennaGift data={data} mode={mode} guestSide={checkin?.side} />
      {/* Pre-fill the wish/RSVP name with the invitation's guest (?g= guest, else ?to=). */}
      <SiennaWishes data={data} mode={mode} guestName={checkin?.guestName ?? guestName} />
      <SiennaQuote data={data} mode={mode} />
      <SiennaFootnote data={data} mode={mode} />
      <SiennaFooter />
      {/* No opening gate (cover is inline), so music starts on first interaction. */}
      <ScarletAudio data={data} mode={mode} waitForOpen={false} />
    </SiennaEmbed>
  );
}

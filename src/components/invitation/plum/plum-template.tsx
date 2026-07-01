// Plum — a faithful, data-driven port of the Katsudoto "Kinanti" template
// (reference: "Arvi & Aditya"). Composes the JSX section components (each bound
// to InvitationView) inside the shared PlumEmbed shell, which injects the scoped
// theme CSS, reproduces Kinanti's two-pane skeleton, and drives the scroll
// reveal. Section order mirrors the original top-to-bottom render (cover, story,
// quote, couple, save-the-date, agenda, gallery, gift, wish, footnote). The cover
// monogram/logo + wedding hashtag are dropped (no fields); the footnote is
// text-only (no closing photo).
//
// NOTE: Katsudoto is the owner's own brand (migration to maritare). Reuses
// ScarletAudio (data-driven, template-agnostic) for the background-music player.

import type { InvitationTemplateProps } from "@/components/invitation/types";

import { ScarletAudio } from "../scarlet/scarlet-audio";
import { PlumAgenda } from "./plum-agenda";
import { PlumCouple } from "./plum-couple";
import { PlumCover } from "./plum-cover";
import { PlumEmbed } from "./plum-embed";
import { PlumFooter } from "./plum-footer";
import { PlumFootnote } from "./plum-footnote";
import { PlumGallery } from "./plum-gallery";
import { PlumGift } from "./plum-gift";
import { PlumPrimaryPane } from "./plum-primary-pane";
import { PlumQuote } from "./plum-quote";
import { PlumSaveDate } from "./plum-savedate";
import { PlumStory } from "./plum-story";
import { PlumWishes } from "./plum-wishes";

export function PlumTemplate({ data, mode, guestName, checkin }: InvitationTemplateProps) {
  return (
    <PlumEmbed
      primary={
        <PlumPrimaryPane data={data} mode={mode} guestName={checkin?.guestName ?? guestName} />
      }
    >
      <PlumCover data={data} mode={mode} />
      <PlumStory data={data} mode={mode} />
      <PlumQuote data={data} mode={mode} />
      <PlumCouple data={data} mode={mode} />
      <PlumSaveDate data={data} mode={mode} />
      <PlumAgenda data={data} mode={mode} />
      <PlumGallery data={data} mode={mode} />
      {/* Folk-style: personalized ?g= links hide the other family's accounts. */}
      <PlumGift data={data} mode={mode} guestSide={checkin?.side} />
      {/* Pre-fill the wish/RSVP name with the invitation's guest (?g= guest, else ?to=). */}
      <PlumWishes data={data} mode={mode} guestName={checkin?.guestName ?? guestName} />
      <PlumFootnote data={data} mode={mode} />
      <PlumFooter />
      {/* No opening gate (cover is inline), so music starts on first interaction. */}
      <ScarletAudio data={data} mode={mode} waitForOpen={false} />
    </PlumEmbed>
  );
}

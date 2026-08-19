// Onyx — a data-driven port of a cinematic dark editorial invitation reference
// (a React/Vite "Figma Make" project rather than the Katsudoto HTML exports the
// other ports came from, so the design lives in inline style objects and there
// is no vendor stylesheet to scope).
//
// Section order mirrors the reference top-to-bottom: cover gate → hero →
// greeting → couple → story → gallery → events → countdown → venue → gift → QR
// → RSVP → closing → footer. The venue block repeats venue/address/map info the
// event cards also show — that's the reference's own composition, kept on
// request. The one reference section NOT ported is its decorative "QRIS" grid:
// it was never a real code (both bit branches painted the same color, so it
// rendered as a blank square) and there's no field to bind a real one to; the
// QR check-in section covers the scannable-code slot instead.
//
// Photos, the backdrop video and the soundtrack all fall back to the reference's
// own assets (onyx-sample.ts) whenever the couple hasn't uploaded their own.
//
// Reuses ScarletAudio for background music, gated on the opening tap like
// folk/sienna.

import type { InvitationTemplateProps } from "@/components/invitation/types";

import { ScarletAudio } from "../scarlet/scarlet-audio";
import { OnyxAgenda } from "./onyx-agenda";
import { OnyxCountdown } from "./onyx-countdown";
import { OnyxCouple } from "./onyx-couple";
import { OnyxCoverGate } from "./onyx-cover-gate";
import { OnyxEmbed } from "./onyx-embed";
import { OnyxFootnote } from "./onyx-footnote";
import { OnyxGallery } from "./onyx-gallery";
import { OnyxGift } from "./onyx-gift";
import { OnyxGreeting } from "./onyx-greeting";
import { OnyxHero } from "./onyx-hero";
import { OnyxBackToTop, OnyxNav, type OnyxNavLink } from "./onyx-nav";
import { OnyxQr } from "./onyx-qr";
import { ONYX_SAMPLE } from "./onyx-sample";
import { OnyxStory } from "./onyx-story";
import { shortName } from "./onyx-theme";
import { OnyxVenue } from "./onyx-venue";
import { OnyxWishes } from "./onyx-wishes";

export function OnyxTemplate({ data, mode, guestName, checkin }: InvitationTemplateProps) {
  const { pasangan, cerita, acara, amplop } = data.sections;
  const groom = shortName(pasangan.groom.fullName, data.groomName);
  const bride = shortName(pasangan.bride.fullName, data.brideName);

  // Nav links must match what actually renders — each section below self-hides
  // on empty data, so these conditions mirror their own guards.
  const hasStory =
    cerita.items.some((i) => i.title?.trim() || i.body?.trim() || i.photoId) ||
    !!cerita.body?.trim();
  // The gallery always renders — with no curated selection it shows the
  // reference's own eight photos — so its nav link is unconditional.
  const hasEvents = acara.events.length > 0;
  const hasVenue = acara.events.some((e) => e.venue?.trim());
  const hasGift =
    amplop.accounts.length > 0 || amplop.ewallets.length > 0 || !!amplop.giftAddress?.trim();

  const links: OnyxNavLink[] = [
    { label: "Couple", id: "onyx-couple" },
    ...(hasStory ? [{ label: "Story", id: "onyx-story" }] : []),
    { label: "Gallery", id: "onyx-gallery" },
    ...(hasEvents ? [{ label: "Events", id: "onyx-events" }] : []),
    ...(hasVenue ? [{ label: "Venue", id: "onyx-venue" }] : []),
    ...(hasGift ? [{ label: "Gift", id: "onyx-gift" }] : []),
    { label: "RSVP", id: "onyx-rsvp" },
  ];

  return (
    <>
      <OnyxCoverGate data={data} mode={mode} guestName={checkin?.guestName ?? guestName} />
      <OnyxEmbed data={data} mode={mode}>
        <OnyxNav initials={`${groom.charAt(0)} & ${bride.charAt(0)}`} links={links} />
        <OnyxHero data={data} mode={mode} />
        <OnyxGreeting data={data} mode={mode} />
        <OnyxCouple data={data} mode={mode} />
        <OnyxStory data={data} mode={mode} />
        <OnyxGallery data={data} mode={mode} />
        <OnyxAgenda data={data} mode={mode} />
        <OnyxCountdown data={data} mode={mode} />
        <OnyxVenue data={data} mode={mode} />
        {/* Folk-style: personalized ?g= links hide the other family's accounts. */}
        <OnyxGift data={data} mode={mode} guestSide={checkin?.side} />
        <OnyxQr checkin={checkin} />
        {/* Pre-fill the wish/RSVP name with the invitation's guest (?g= guest, else
            ?to=); checkin keys the RSVP to them (dashboard status + headcount). */}
        <OnyxWishes
          data={data}
          mode={mode}
          guestName={checkin?.guestName ?? guestName}
          checkin={checkin}
        />
        <OnyxFootnote data={data} mode={mode} />
        <OnyxBackToTop />
        {/* Music starts on the gate's "Buka Undangan" tap; the editor preview has
            no meaningful gate gesture, so it doesn't wait there. */}
        <ScarletAudio
          data={data}
          mode={mode}
          waitForOpen={mode !== "editorPreview"}
          fallbackSrc={ONYX_SAMPLE.music}
        />
      </OnyxEmbed>
    </>
  );
}

// Folk Garden — renders the (data-driven) Scarlet sections. The cover has TWO
// independent, separately-uploaded parts (folk-only "Sampul" editor section):
//   - GATE: the ornamented framed cover (ScarletCover) using the cover photo
//     (isCover) — the opening "Buka Undangan" screen.
//   - HERO: an OPTIONAL dedicated asset (image OR video) shown FULL-BLEED at the
//     very top after the gate opens. Stored on the hero section (imageUrl /
//     videoUrl), so it's distinct from the gate's cover photo.
//
// NOTE: third-party design assets/CSS used at the owner's explicit request; swap
// for own-licensed art before production.

import type { InvitationTemplateProps } from "@/components/invitation/types";

import { InvImage } from "../scarlet/inv-image";
import { ScarletAudio } from "../scarlet/scarlet-audio";
import { ScarletEmbed } from "../scarlet/scarlet-embed";
import { ScarletAgenda } from "../scarlet/sections/scarlet-agenda";
import { ScarletCouple } from "../scarlet/sections/scarlet-couple";
import { ScarletCover } from "../scarlet/sections/scarlet-cover";
import { ScarletFootnote } from "../scarlet/sections/scarlet-footnote";
import { ScarletGift } from "../scarlet/sections/scarlet-gift";
import { ScarletQuote } from "../scarlet/sections/scarlet-quote";
import { ScarletSaveDate } from "../scarlet/sections/scarlet-savedate";
import { ScarletThankYou } from "../scarlet/sections/scarlet-thankyou";
import { FolkCoverGate } from "./folk-cover-gate";
import { FolkGallery } from "./folk-gallery";
import { FolkHeroVideo } from "./folk-hero-video";
import { FolkMomen } from "./folk-momen";
import { FolkStory } from "./folk-story";
import { FolkQr } from "./folk-qr";
import { FolkWishes } from "./folk-wishes";

// First word of the editable "Nama lengkap" (pasangan.fullName), falling back to
// the wedding's top-level name — matches ScarletCover's hero name rendering.
function firstName(fullName: string | undefined, fallback: string): string {
  const n = (fullName ?? "").trim() || fallback;
  return n.split(/\s+/)[0] || fallback;
}

export function FolkTemplate({ data, mode, guestName, checkin }: InvitationTemplateProps) {
  // Couple names + date for the downloadable QR card (bride-first, like the cover).
  const groomFirst = firstName(data.sections.pasangan.groom.fullName, data.groomName);
  const brideFirst = firstName(data.sections.pasangan.bride.fullName, data.brideName);
  const qrDate = data.sections.acara.events[0]?.date ?? data.eventDate;

  return (
    <>
      {/* Opening "Buka Undangan" gate (the framed cover photo). Rendered in EVERY
          mode so the editor preview matches the live invitation — its `fixed`
          overlay is contained by the editor's scaled preview frame (a transformed
          ancestor), so it fills the phone rather than the whole page. */}
      <FolkCoverGate data={data} mode={mode} guestName={guestName} />
      <ScarletEmbed>
      {/* HERO — two display modes for the dedicated "Hero (Atas)" upload:
          • heroFullWidth → the uploaded image/video FULL-BLEED, edge-to-edge.
          • otherwise (default) → the same ornate cover frame as the gate, but
            using hero.imageUrl instead of the isCover photo (falls back to the
            cover photo when no hero image is uploaded). */}
      {data.sections.hero.heroFullWidth && data.sections.hero.videoUrl ? (
        <FolkHeroVideo src={data.sections.hero.videoUrl} poster={data.sections.hero.imageUrl} />
      ) : data.sections.hero.heroFullWidth && data.sections.hero.imageUrl ? (
        <InvImage
          priority
          src={data.sections.hero.imageUrl}
          alt={`${data.groomName} & ${data.brideName}`}
          className="block w-full object-cover"
        />
      ) : (
        <ScarletCover data={data} mode={mode} imageUrl={data.sections.hero.imageUrl} />
      )}
      {/* Folk shows each name once: big script above the photo. Hide the full
          name that otherwise repeats just above the parents line. */}
      <ScarletCouple data={data} mode={mode} hideFullName />
      {/* "Momen" — folk-only section right after the couple: a custom title + an
          uploaded illustration (e.g. a map). Self-hides when both are empty. */}
      <FolkMomen title={data.sections.momen.title} imageUrl={data.sections.momen.imageUrl} />
      {/* "Cerita kami" (Our Story) — folk slideshow: one swipeable slide per
          chapter (framed photo + maroon panel, olive frame, grass border). Reads
          cerita.items (with photoId resolved against data.photos), falling back to
          the legacy free-text body. Self-hides when empty. */}
      <FolkStory data={data} />
      <FolkGallery data={data} mode={mode} />
      <ScarletSaveDate data={data} mode={mode} />
      <ScarletAgenda data={data} mode={mode} />
      {/* Check-in QR — hideable from the RSVP form (rsvp.showQr). */}
      {data.sections.rsvp.showQr && (
        <FolkQr
          checkin={checkin}
          brideName={brideFirst}
          groomName={groomFirst}
          eventDate={qrDate}
        />
      )}
      {/* Folk shows the bank's logo only (no bank-name text) when a logo exists.
          guestSide hides the other family's accounts on personalized ?g= links. */}
      <ScarletGift data={data} mode={mode} logoOnly plainNumber gated={mode === "public"} guestSide={checkin?.side} />
      {/* Wishes + RSVP (Hadir/Berhalangan pills live in this form). Pre-fill the
          name with the invitation's guest (?g= guest, else ?to=); empty on
          generic links. checkin keys the RSVP to the resolved guest. */}
      <FolkWishes
        data={data}
        mode={mode}
        guestName={checkin?.guestName ?? guestName}
        checkin={checkin}
      />
      {/* Quote / verse (kutipan ayat) — the full Scarlet quote design (gold
          baroque crown + joglo pavilion + burgundy florals), reused here since
          Folk shares ScarletEmbed's theme CSS. Sits right above the closing
          "Thank you"; self-hides when there's no quote. Edited in the Mempelai
          (pasangan) form's quote fields. */}
      <ScarletQuote data={data} mode={mode} className="mt-[30px]" />
      {/* "Thank you" closing message (Katsudoto quote-message section) — the
          arched gratitude panel, just above the footer. */}
      <ScarletThankYou />
      {/* Folk drops the Scarlet logo + baroque ornament cluster in the closing
          section (keeps the closing photo). */}
      <ScarletFootnote data={data} mode={mode} hideOrnaments />
      <ScarletAudio data={data} mode={mode} waitForOpen={mode !== "editorPreview"} />
    </ScarletEmbed>
    </>
  );
}

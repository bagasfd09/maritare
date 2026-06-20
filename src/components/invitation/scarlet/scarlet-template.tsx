// Scarlet Editorial — a faithful, NOW data-driven port of the Katsudoto
// "Anselma & Alvaro" template. Composes the JSX section components (each bound to
// InvitationView) inside the shared ScarletEmbed shell, which injects the exact
// scoped CSS + drives the scroll reveal. The design is byte-identical to the
// original markup; only the content is now dynamic.
//
// NOTE: third-party design assets/CSS used at the owner's explicit request; swap
// for own-licensed art before production.

import type { InvitationTemplateProps } from "@/components/invitation/types";

import { ScarletAudio } from "./scarlet-audio";
import { ScarletEmbed } from "./scarlet-embed";
import { ScarletAgenda } from "./sections/scarlet-agenda";
import { ScarletCouple } from "./sections/scarlet-couple";
import { ScarletCover } from "./sections/scarlet-cover";
import { ScarletFootnote } from "./sections/scarlet-footnote";
import { ScarletGallery } from "./sections/scarlet-gallery";
import { ScarletGift } from "./sections/scarlet-gift";
import { ScarletQuote } from "./sections/scarlet-quote";
import { ScarletSaveDate } from "./sections/scarlet-savedate";
import { ScarletWishes } from "./sections/scarlet-wishes";

export function ScarletTemplate({ data, mode, guestName, checkin }: InvitationTemplateProps) {
  return (
    <ScarletEmbed>
      <ScarletCover data={data} mode={mode} />
      <ScarletCouple data={data} mode={mode} />
      <ScarletGallery data={data} mode={mode} />
      <ScarletSaveDate data={data} mode={mode} />
      <ScarletAgenda data={data} mode={mode} />
      <ScarletGift data={data} mode={mode} />
      {/* Pre-fill the wish form's name with the invitation's guest (?g= guest,
          else ?to=); empty on generic links. The guest can still edit it. */}
      <ScarletWishes data={data} mode={mode} guestName={checkin?.guestName ?? guestName} />
      <ScarletQuote data={data} mode={mode} />
      <ScarletFootnote data={data} mode={mode} />
      <ScarletAudio data={data} mode={mode} />
    </ScarletEmbed>
  );
}

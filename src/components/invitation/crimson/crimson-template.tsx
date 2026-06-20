"use client";

// Crimson Pavilion — a refined, lush Javanese-heritage Maritare template.
//
// Architecturally a sibling of Flora: same data flow from InvitationView, same
// cover-open + audio gesture, the same shared FallingPetals / Reveal mechanics
// (imported from ../flora). Crimson diverges purely in style — a warm parchment
// column on a crimson-tinted ornamental backdrop, a maximalist red-rose + gold +
// sage palette built from its OWN licensed watercolor florals (CrimsonFloralImg),
// tall Cormorant Upright display headings, and its own gold line-art (monogram,
// joglo pavilion, frames) in crimson-ornaments.
//
// Modes: public = forms live; ownerPreview = forms disabled; editorPreview =
// forms disabled, no audio, cover pre-opened so the editor shows content.

import { useEffect, useRef, useState } from "react";

import type { InvitationTemplateProps } from "@/components/invitation/types";
import { MUSIC_TRACKS } from "@/lib/invitation/sections";

import { FallingPetals } from "../flora/flora-ornaments";
import { Reveal } from "../flora/reveal";
import { CrimsonAudioToggle } from "./crimson-audio-toggle";
import { CrimsonFloralImg } from "./crimson-florals";
import { CrimsonCountdown } from "./crimson-countdown";
import { CrimsonCouple } from "./crimson-couple";
import { CrimsonCover } from "./crimson-cover";
import { CrimsonEvents } from "./crimson-events";
import { CrimsonFooter } from "./crimson-footer";
import { CrimsonGallery } from "./crimson-gallery";
import { CrimsonGift } from "./crimson-gift";
import { CrimsonHero } from "./crimson-hero";
import { CrimsonCornerScroll } from "./crimson-ornaments";
import { CrimsonQuote } from "./crimson-quote";
import { CrimsonStory } from "./crimson-story";
import { CrimsonWishes } from "./crimson-wishes";
import { formatFullDateId } from "./format";

export function CrimsonTemplate({ data, guestName, mode }: InvitationTemplateProps) {
  // Cover always greets public/owner views; the editor preview skips straight
  // to the content.
  const [opened, setOpened] = useState(mode === "editorPreview");
  const [playing, setPlaying] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { musik } = data.sections;
  const track =
    musik.enabled && musik.track ? MUSIC_TRACKS.find((t) => t.id === musik.track) : undefined;
  const audioAvailable = Boolean(track) && mode !== "editorPreview" && !audioFailed;

  // Lock page scroll while the cover overlay is up.
  useEffect(() => {
    if (opened) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [opened]);

  const handleOpen = () => {
    setOpened(true);
    // play() must run inside the click gesture or mobile browsers block it.
    if (audioAvailable) {
      void audioRef.current?.play().catch(() => {
        // Autoplay refused — the floating toggle remains as a manual fallback.
      });
    }
  };

  const handleToggleAudio = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      void el.play().catch(() => {});
    }
  };

  const firstEvent = data.sections.acara.events[0];
  const coverDate = firstEvent?.date ?? data.eventDate;
  const coupleLabel = `${data.groomName} & ${data.brideName}`;

  return (
    <div className="relative min-h-screen bg-[#6E1622] font-body text-[#2A2320]">
      {/* Desktop backdrop — crimson-tinted ornamental field (lg+ only). */}
      <div
        aria-hidden="true"
        className="fixed inset-0 hidden overflow-hidden bg-[#6E1622] lg:block"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_30%,rgba(139,30,45,0.55)_0%,#6E1622_70%)]" />
        <CrimsonCornerScroll className="absolute -left-10 -top-10 w-[420px] text-[#C9A24B]/25" />
        <CrimsonCornerScroll className="absolute -bottom-10 -right-10 w-[420px] rotate-180 text-[#C9A24B]/25" />
        <CrimsonFloralImg
          asset="burgundy-roses"
          className="absolute -bottom-24 -left-24 w-[440px] rotate-[10deg] opacity-60"
          sway
          swayOrigin="origin-bottom-left"
        />
        <CrimsonFloralImg
          asset="burgundy-roses"
          mirrored
          className="absolute -bottom-24 -right-24 w-[440px] -rotate-[10deg] opacity-60"
          sway
          swayOrigin="origin-bottom-right"
        />
        <CrimsonFloralImg
          asset="gold-ornament"
          className="absolute -top-6 left-[6%] w-24 rotate-[8deg] opacity-70"
        />
        <CrimsonFloralImg
          asset="gold-ornament"
          mirrored
          className="absolute -top-6 right-[6%] w-24 -rotate-[8deg] opacity-70"
        />
      </div>

      {/* Sparse ambient petals drifting over the whole page once opened. */}
      {opened && <FallingPetals variant="page" className="fixed inset-0 z-30" />}

      {/* Background track — element lives here so the cover can trigger play. */}
      {track && mode !== "editorPreview" && (
        <audio
          ref={audioRef}
          src={track.src}
          loop
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setAudioFailed(true)}
        />
      )}

      <CrimsonCover
        groomName={data.groomName}
        brideName={data.brideName}
        dateLabel={coverDate ? formatFullDateId(coverDate) : undefined}
        guestName={guestName}
        opened={opened}
        onOpen={handleOpen}
      />

      <main className="relative z-10 mx-auto max-w-[440px] overflow-hidden bg-[#F4ECDC] shadow-[0_0_90px_-30px_rgba(20,0,5,0.7)]">
        {/* key flip remounts the hero when the cover opens so its entrance
            reveals replay right as the overlay fades (visual-only). */}
        <CrimsonHero key={opened ? "opened" : "covered"} data={data} />
        <Reveal>
          <CrimsonQuote quote={data.sections.pasangan.quote} />
        </Reveal>
        <Reveal>
          <CrimsonCouple
            pasangan={data.sections.pasangan}
            groomName={data.groomName}
            brideName={data.brideName}
            couplePhotoUrls={data.couplePhotoUrls}
          />
        </Reveal>
        <Reveal>
          <CrimsonStory title={data.sections.cerita.title} body={data.sections.cerita.body} />
        </Reveal>
        <Reveal>
          <CrimsonCountdown event={firstEvent} fallbackDate={data.eventDate} />
        </Reveal>
        <Reveal>
          <CrimsonEvents events={data.sections.acara.events} />
        </Reveal>
        <Reveal>
          <CrimsonGallery photos={data.photos} coupleLabel={coupleLabel} />
        </Reveal>
        <Reveal>
          <CrimsonGift amplop={data.sections.amplop} />
        </Reveal>
        <Reveal>
          <CrimsonWishes
            slug={data.slug}
            wishes={data.wishes}
            rsvp={data.sections.rsvp}
            mode={mode}
          />
        </Reveal>
        <CrimsonFooter groomName={data.groomName} brideName={data.brideName} />
      </main>

      <CrimsonAudioToggle
        available={audioAvailable && opened}
        playing={playing}
        onToggle={handleToggleAudio}
      />
    </div>
  );
}

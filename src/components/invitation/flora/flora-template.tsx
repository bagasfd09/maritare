"use client";

// Flora Atelier — the flagship Maritare invitation template.
//
// Layout: a 430px mobile-first column on an ornamental cream backdrop (the
// backdrop only shows on lg+ screens). The cover overlay sits above everything
// until the guest opens the invitation, which is also the user gesture that
// starts the background audio (browser autoplay policy).
//
// Modes: public = forms live; ownerPreview = forms disabled; editorPreview =
// forms disabled, no audio, cover pre-opened so the editor shows content.

import { useEffect, useRef, useState } from "react";

import type { InvitationTemplateProps } from "@/components/invitation/types";
import { MUSIC_TRACKS } from "@/lib/invitation/sections";

import { FloraAudioToggle } from "./flora-audio-toggle";
import { FloraCountdown } from "./flora-countdown";
import { FloraCouple } from "./flora-couple";
import { FloraCover } from "./flora-cover";
import { FloraEvents } from "./flora-events";
import { FloraFooter } from "./flora-footer";
import { FloraGallery } from "./flora-gallery";
import { FloraGift } from "./flora-gift";
import { FloraHero } from "./flora-hero";
import { FallingPetals, FloralCorner, OrnamentImg } from "./flora-ornaments";
import { FloraQuote } from "./flora-quote";
import { FloraStory } from "./flora-story";
import { FloraWishes } from "./flora-wishes";
import { formatFullDateId } from "./format";
import { Reveal } from "./reveal";

export function FloraTemplate({ data, guestName, mode }: InvitationTemplateProps) {
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
    <div className="relative min-h-screen bg-ivory font-body text-charcoal">
      {/* Desktop backdrop — soft cream field with line-art + painted watermarks. */}
      <div aria-hidden="true" className="fixed inset-0 hidden overflow-hidden bg-cream lg:block">
        <FloralCorner className="absolute -left-24 -top-24 w-[480px] rotate-12 text-rule/60" />
        <FloralCorner className="absolute -bottom-24 -right-24 w-[480px] rotate-[192deg] text-rule/60" />
        <OrnamentImg
          asset="anemone-red"
          className="absolute -bottom-24 -left-20 w-[380px] rotate-[10deg] opacity-40"
          sway
          swayOrigin="origin-bottom-left"
        />
        <OrnamentImg
          asset="anemone-red"
          mirrored
          className="absolute -bottom-24 -right-20 w-[380px] -rotate-[10deg] opacity-40"
          sway
          swayOrigin="origin-bottom-right"
        />
        <OrnamentImg
          asset="rose-white"
          className="absolute -top-16 right-[8%] w-[260px] rotate-[165deg] opacity-30"
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

      <FloraCover
        groomName={data.groomName}
        brideName={data.brideName}
        dateLabel={coverDate ? formatFullDateId(coverDate) : undefined}
        guestName={guestName}
        opened={opened}
        onOpen={handleOpen}
      />

      <main className="relative z-10 mx-auto max-w-[430px] bg-paper shadow-[0_0_80px_-30px_rgba(60,30,10,0.45)]">
        {/* key flip remounts the hero when the cover opens so its entrance
            reveals replay right as the overlay fades (visual-only). */}
        <FloraHero key={opened ? "opened" : "covered"} data={data} />
        <Reveal>
          <FloraQuote quote={data.sections.pasangan.quote} />
        </Reveal>
        <Reveal>
          <FloraCouple
            pasangan={data.sections.pasangan}
            groomName={data.groomName}
            brideName={data.brideName}
            couplePhotoUrls={data.couplePhotoUrls}
          />
        </Reveal>
        <Reveal>
          <FloraStory title={data.sections.cerita.title} body={data.sections.cerita.body} />
        </Reveal>
        <Reveal>
          <FloraCountdown event={firstEvent} fallbackDate={data.eventDate} />
        </Reveal>
        <Reveal>
          <FloraEvents events={data.sections.acara.events} />
        </Reveal>
        <Reveal>
          <FloraGallery photos={data.photos} coupleLabel={coupleLabel} />
        </Reveal>
        <Reveal>
          <FloraGift amplop={data.sections.amplop} />
        </Reveal>
        <Reveal>
          <FloraWishes
            slug={data.slug}
            wishes={data.wishes}
            rsvp={data.sections.rsvp}
            mode={mode}
          />
        </Reveal>
        <FloraFooter groomName={data.groomName} brideName={data.brideName} />
      </main>

      <FloraAudioToggle
        available={audioAvailable && opened}
        playing={playing}
        onToggle={handleToggleAudio}
      />
    </div>
  );
}

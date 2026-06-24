"use client";

// Background-music player for the Scarlet/Folk templates. Reads data.sections.musik
// and renders the floating toggle when music is configured. Sources:
//   • upload  → <audio> from the presigned R2 URL (musik.audioUrl).
//   • preset  → <audio> from a baked-in track in public/audio/.
//   • youtube → a hidden YouTube IFrame Player (loaded via the IFrame API).
//
// Trim window: playback starts at musik.startSec and loops back when it reaches
// musik.endSec (Instagram-style). For <audio> we manage this via currentTime;
// for YouTube via the IFrame API (seekTo + a poll on currentTime).
//
// Default-ON: browsers block autoplay-with-sound until a gesture, so we start on
// the guest's FIRST interaction (skipping taps on the toggle, which is explicit
// play/pause). Nothing is mounted/played in editorPreview.

import { useEffect, useRef, useState } from "react";

import { MUSIC_TRACKS } from "@/lib/invitation/sections";
import { loadYouTubeApi, type YTPlayer } from "@/lib/youtube-iframe";
import type { InvitationView } from "@/server/queries/invitation";

import { ScarletAudioToggle } from "./scarlet-audio-toggle";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /**
   * When true (templates with an opening gate, e.g. Folk Garden), music starts
   * ONLY on the explicit "maritare:open-invitation" event the gate dispatches —
   * never on a stray tap. When false/omitted (no gate), it starts on the guest's
   * first interaction anywhere.
   */
  waitForOpen?: boolean;
};

export function ScarletAudio({ data, mode, waitForOpen = false }: Props) {
  const { musik } = data.sections;
  const isPreview = mode === "editorPreview";

  const fileSrc =
    musik.source === "upload"
      ? musik.audioUrl
      : musik.source === "preset" && musik.track
        ? MUSIC_TRACKS.find((t) => t.id === musik.track)?.src
        : undefined;
  const youtubeId = musik.source === "youtube" ? musik.youtubeId : undefined;
  const startSec = musik.startSec ?? 0;
  const endSec = musik.endSec;

  const configured =
    musik.enabled &&
    Boolean(
      fileSrc ||
        youtubeId ||
        (musik.source === "upload" && musik.audioKey) ||
        (musik.source === "preset" && musik.track),
    );

  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytHostRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const startedRef = useRef(false);
  // Mirror `playing` so the visibility handler reads it without re-registering.
  const playingRef = useRef(false);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  // YouTube IFrame player lifecycle + segment loop.
  useEffect(() => {
    if (isPreview || !youtubeId) return;
    let cancelled = false;
    let poll: ReturnType<typeof setInterval> | null = null;

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !ytHostRef.current) return;
        const player = new YT.Player(ytHostRef.current, {
          videoId: youtubeId,
          playerVars: {
            controls: 0,
            playsinline: 1,
            modestbranding: 1,
            rel: 0,
            disablekb: 1,
            start: Math.floor(startSec),
          },
          events: {
            onReady: (e) => e.target.seekTo(startSec, true),
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.PLAYING) setPlaying(true);
              else if (e.data === YT.PlayerState.PAUSED) setPlaying(false);
              else if (e.data === YT.PlayerState.ENDED) {
                // Natural end with no endSec trim → loop the whole track.
                e.target.seekTo(startSec, true);
                e.target.playVideo();
              }
            },
          },
        });
        ytPlayerRef.current = player;
        // Segment loop: jump back to start once past endSec.
        poll = setInterval(() => {
          const p = ytPlayerRef.current;
          if (!p || endSec == null) return;
          try {
            if (p.getCurrentTime() >= endSec) p.seekTo(startSec, true);
          } catch {
            // player not ready / torn down — ignore
          }
        }, 400);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
      try {
        ytPlayerRef.current?.destroy();
      } catch {
        // already gone
      }
      ytPlayerRef.current = null;
    };
  }, [isPreview, youtubeId, startSec, endSec]);

  // Default-on. Plays once, from startSec.
  useEffect(() => {
    if (isPreview || !configured) return;

    const playFromStart = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      if (youtubeId) {
        ytPlayerRef.current?.seekTo(startSec, true);
        ytPlayerRef.current?.playVideo();
      } else {
        const el = audioRef.current;
        if (el) {
          el.currentTime = startSec;
          void el.play().catch(() => {});
        }
      }
    };

    // Gated templates (Folk): start ONLY on the explicit "Buka Undangan" tap, so
    // a stray tap on the cover never sneaks the music on.
    if (waitForOpen) {
      window.addEventListener("maritare:open-invitation", playFromStart);
      return () => window.removeEventListener("maritare:open-invitation", playFromStart);
    }

    // No gate: start on the guest's first interaction anywhere (skip the toggle).
    const start = (event: Event) => {
      const target = event.target as Element | null;
      if (target?.closest?.("[data-music-toggle]")) return;
      playFromStart();
      remove();
    };
    const remove = () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      window.removeEventListener("touchstart", start);
    };
    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);
    window.addEventListener("touchstart", start);
    return remove;
  }, [isPreview, configured, youtubeId, startSec, waitForOpen]);

  // Tie playback to the active tab: pause when the tab is hidden, resume when
  // it's foregrounded again — but only if it was playing when we left.
  useEffect(() => {
    if (isPreview || !configured) return;
    const wasPlaying = { current: false };
    const onVisibility = () => {
      if (document.hidden) {
        wasPlaying.current = playingRef.current;
        if (!wasPlaying.current) return;
        if (youtubeId) ytPlayerRef.current?.pauseVideo();
        else audioRef.current?.pause();
      } else if (wasPlaying.current) {
        wasPlaying.current = false;
        if (youtubeId) ytPlayerRef.current?.playVideo();
        else void audioRef.current?.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [isPreview, configured, youtubeId]);

  if (!configured) return null;

  // <audio> segment management.
  const onAudioTimeUpdate = () => {
    const el = audioRef.current;
    if (el && endSec != null && el.currentTime >= endSec) {
      el.currentTime = startSec;
    }
  };
  const onAudioEnded = () => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = startSec;
    void el.play().catch(() => {});
  };

  const handleToggle = () => {
    startedRef.current = true; // an explicit tap satisfies the gesture too
    if (youtubeId) {
      const p = ytPlayerRef.current;
      if (!p) return;
      if (playing) {
        p.pauseVideo();
      } else {
        p.seekTo(startSec, true);
        p.playVideo();
      }
      return;
    }
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      el.currentTime = startSec;
      void el.play().catch(() => {});
    }
  };

  return (
    <>
      {!isPreview && youtubeId && (
        // Outer wrapper is React-owned; the inner div is replaced by the YT
        // iframe (so React never fights the API over the same node).
        <div
          aria-hidden
          className="pointer-events-none fixed bottom-0 right-0 h-px w-px overflow-hidden opacity-0"
        >
          <div ref={ytHostRef} />
        </div>
      )}
      {!isPreview && fileSrc && (
        <audio
          ref={audioRef}
          src={fileSrc}
          preload="none"
          onTimeUpdate={onAudioTimeUpdate}
          onEnded={onAudioEnded}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
        />
      )}
      <ScarletAudioToggle available={!failed} playing={playing} onToggle={handleToggle} />
    </>
  );
}

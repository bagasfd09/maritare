"use client";

// Start–end range trimmer for a YouTube background track. Loads the video via the
// IFrame API (hidden) to read its duration + preview the selected window, then
// lets the user drag start/end handles. Calls onChange(start, end) on release.

import { useCallback, useEffect, useRef, useState } from "react";

import { Icon } from "@/components/atoms/icon";
import { loadYouTubeApi, type YTPlayer } from "@/lib/youtube-iframe";

type Props = {
  youtubeId: string;
  startSec?: number;
  endSec?: number;
  onChange: (startSec: number, endSec: number) => void;
};

function fmt(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function YouTubeTrimmer({ youtubeId, startSec, endSec, onChange }: Props) {
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [start, setStart] = useState(startSec ?? 0);
  const [end, setEnd] = useState(endSec ?? 0);
  const [previewing, setPreviewing] = useState(false);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<null | "start" | "end">(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load the hidden player to read duration + drive preview.
  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current) return;
        playerRef.current = new YT.Player(hostRef.current, {
          videoId: youtubeId,
          playerVars: { controls: 0, modestbranding: 1, rel: 0, playsinline: 1 },
          events: {
            onReady: (e) => {
              const d = e.target.getDuration();
              if (cancelled) return;
              setDuration(d);
              setStart(startSec ?? 0);
              setEnd(endSec && endSec > 0 ? endSec : d);
            },
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.PLAYING) setPreviewing(true);
              else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED)
                setPreviewing(false);
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
      try {
        playerRef.current?.destroy();
      } catch {
        // already gone
      }
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeId]);

  const secAtClientX = useCallback(
    (clientX: number): number => {
      const el = trackRef.current;
      if (!el || duration === 0) return 0;
      const rect = el.getBoundingClientRect();
      const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return frac * duration;
    },
    [duration],
  );

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const sec = secAtClientX(e.clientX);
      if (dragRef.current === "start") {
        const s = Math.min(sec, end - 1);
        setStart(s);
        // Live-scrub: restart preview from the new start as you drag it.
        const p = playerRef.current;
        if (p) {
          try {
            p.seekTo(s, true);
            p.playVideo();
          } catch {
            // player not ready
          }
        }
      } else {
        // End handle: don't disturb playback.
        setEnd(Math.max(sec, start + 1));
      }
    };
    const up = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      onChange(Math.max(0, start), Math.min(duration, end));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [secAtClientX, start, end, duration, onChange]);

  function togglePreview() {
    const p = playerRef.current;
    if (!p) return;
    if (previewing) {
      p.pauseVideo();
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    p.seekTo(start, true);
    p.playVideo();
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      const pl = playerRef.current;
      if (!pl) return;
      try {
        if (pl.getCurrentTime() >= end) {
          pl.pauseVideo();
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // not ready
      }
    }, 300);
  }

  const startPct = duration ? (start / duration) * 100 : 0;
  const endPct = duration ? (end / duration) * 100 : 100;

  return (
    <div className="mt-4">
      {/* Hidden player: only for duration + preview. */}
      <div aria-hidden className="pointer-events-none fixed bottom-0 right-0 h-px w-px overflow-hidden opacity-0">
        <div ref={hostRef} />
      </div>

      {error ? (
        <p className="text-[12px] text-[#ff9b8a]">Gagal memuat video YouTube untuk trimmer.</p>
      ) : duration === 0 ? (
        <div className="text-[12px] text-[rgba(245,239,230,0.5)]">Memuat durasi video…</div>
      ) : (
        <>
          <div
            ref={trackRef}
            className="relative h-[44px] w-full select-none rounded-[10px] bg-[rgba(245,239,230,0.06)]"
          >
            {/* selected window */}
            <div
              className="absolute inset-y-0 rounded-[10px] bg-[rgba(234,211,194,0.22)]"
              style={{ left: `${startPct}%`, width: `${Math.max(0, endPct - startPct)}%` }}
            />
            {(["start", "end"] as const).map((which) => (
              <button
                key={which}
                type="button"
                aria-label={which === "start" ? "Geser mulai" : "Geser selesai"}
                onPointerDown={(e) => {
                  e.preventDefault();
                  dragRef.current = which;
                }}
                className="absolute top-1/2 z-10 h-[52px] w-3 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-full border border-[#7c2d2d] bg-peach shadow"
                style={{ left: `${which === "start" ? startPct : endPct}%` }}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={togglePreview}
              className="inline-flex items-center gap-2 rounded-full bg-burgundy px-4 py-2 text-[12px] font-semibold text-cream hover:bg-burgundy-deep"
            >
              <Icon name={previewing ? "x" : "music"} size={13} />
              {previewing ? "Stop" : "Dengar potongan"}
            </button>
            <span className="font-body text-[12px] tabular-nums text-[rgba(245,239,230,0.6)]">
              {fmt(start)} – {fmt(end)}{" "}
              <span className="text-[rgba(245,239,230,0.4)]">/ {fmt(duration)}</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

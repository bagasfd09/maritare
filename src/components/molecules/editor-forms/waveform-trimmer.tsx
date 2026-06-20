"use client";

// Instagram-style waveform trimmer for an uploaded audio file. Decodes the audio
// (Web Audio) into amplitude bars, then lets the user drag start/end handles to
// pick the segment the invitation will loop. A preview button plays just the
// selected window. Calls onChange(start, end) when a handle is released.

import { useCallback, useEffect, useRef, useState } from "react";

import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

type Props = {
  /** Object URL (fresh upload) or presigned URL (reopened editor). */
  src: string;
  startSec?: number;
  endSec?: number;
  onChange: (startSec: number, endSec: number) => void;
};

const BARS = 120;

function fmt(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function WaveformTrimmer({ src, startSec, endSec, onChange }: Props) {
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [start, setStart] = useState(startSec ?? 0);
  const [end, setEnd] = useState(endSec ?? 0);
  const [previewing, setPreviewing] = useState(false);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dragRef = useRef<null | "start" | "end">(null);

  // Decode the audio into normalized amplitude bars + read its duration. All
  // state updates live inside the async callback (the effect body stays
  // setState-free per the repo's react-hooks/set-state-in-effect rule).
  useEffect(() => {
    let alive = true;
    let ctx: AudioContext | null = null;
    void (async () => {
      setPeaks(null);
      setError(false);
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) {
        if (alive) setError(true);
        return;
      }
      ctx = new AC();
      try {
        const buf = await (await fetch(src)).arrayBuffer();
        const audio = await ctx.decodeAudioData(buf);
        if (!alive) return;
        const ch = audio.getChannelData(0);
        const block = Math.max(1, Math.floor(ch.length / BARS));
        const out: number[] = [];
        let max = 0;
        for (let i = 0; i < BARS; i++) {
          let peak = 0;
          for (let j = 0; j < block; j++) {
            const v = Math.abs(ch[i * block + j] ?? 0);
            if (v > peak) peak = v;
          }
          out.push(peak);
          if (peak > max) max = peak;
        }
        const norm = max > 0 ? out.map((v) => v / max) : out;
        setPeaks(norm);
        setDuration(audio.duration);
        // Default the window to the whole track when nothing was set yet.
        setStart(startSec ?? 0);
        setEnd(endSec && endSec > 0 ? endSec : audio.duration);
      } catch {
        if (alive) setError(true);
      } finally {
        // Close here and null it out so the cleanup below never double-closes
        // the same context (an already-closed close() rejects).
        void ctx?.close();
        ctx = null;
      }
    })();
    return () => {
      alive = false;
      try {
        void ctx?.close();
      } catch {
        // already closed
      }
    };
    // startSec/endSec are the initial values only; re-decode solely on src change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

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

  // Drag handling on window so the pointer can leave the track while dragging.
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const sec = secAtClientX(e.clientX);
      // Keep at least a 1s window between handles (matches the YouTube trimmer).
      if (dragRef.current === "start") {
        const s = Math.min(sec, end - 1);
        setStart(s);
        // Live-scrub: restart preview from the new start as you drag it.
        const el = audioRef.current;
        if (el) {
          el.currentTime = s;
          void el.play().catch(() => {});
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

  // Preview: play just the [start, end] window.
  function togglePreview() {
    const el = audioRef.current;
    if (!el) return;
    if (previewing) {
      el.pause();
      return;
    }
    el.currentTime = start;
    void el.play().catch(() => {});
  }
  function onPreviewTime() {
    const el = audioRef.current;
    if (el && el.currentTime >= end) el.pause();
  }

  if (error) {
    return (
      <p className="mt-3 text-[12px] text-[#ff9b8a]">
        Gagal membaca audio untuk trimmer. Kamu tetap bisa pakai lagunya — trimmer butuh file yang
        bisa dibaca browser.
      </p>
    );
  }
  if (!peaks) {
    return <div className="mt-4 text-[12px] text-[rgba(245,239,230,0.5)]">Memuat waveform…</div>;
  }

  const startPct = duration ? (start / duration) * 100 : 0;
  const endPct = duration ? (end / duration) * 100 : 100;

  return (
    <div className="mt-4">
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setPreviewing(true)}
        onPause={() => setPreviewing(false)}
        onTimeUpdate={onPreviewTime}
      />

      <div
        ref={trackRef}
        className="relative h-[64px] w-full select-none rounded-[10px] bg-[rgba(245,239,230,0.04)] px-1"
      >
        {/* bars */}
        <div className="flex h-full items-center gap-px">
          {peaks.map((p, i) => {
            const t = duration ? (i / BARS) * duration : 0;
            const inWindow = t >= start && t <= end;
            return (
              <span
                key={i}
                className={cn(
                  "flex-1 rounded-full",
                  inWindow ? "bg-peach" : "bg-[rgba(245,239,230,0.18)]",
                )}
                style={{ height: `${Math.max(6, p * 100)}%` }}
              />
            );
          })}
        </div>

        {/* dim outside the selected window */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 rounded-l-[10px] bg-[rgba(10,8,6,0.5)]"
          style={{ width: `${startPct}%` }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 rounded-r-[10px] bg-[rgba(10,8,6,0.5)]"
          style={{ width: `${100 - endPct}%` }}
        />

        {/* handles */}
        {(["start", "end"] as const).map((which) => (
          <button
            key={which}
            type="button"
            aria-label={which === "start" ? "Geser mulai" : "Geser selesai"}
            onPointerDown={(e) => {
              e.preventDefault();
              dragRef.current = which;
            }}
            className="absolute top-1/2 z-10 h-[72px] w-3 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-full border border-[#7c2d2d] bg-peach shadow"
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
          {fmt(start)} – {fmt(end)} <span className="text-[rgba(245,239,230,0.4)]">/ {fmt(duration)}</span>
        </span>
      </div>
    </div>
  );
}

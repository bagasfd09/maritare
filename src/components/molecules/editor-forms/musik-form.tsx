"use client";

// Musik latar — background music for the invitation. Two sources:
//   • Upload: an audio file (mp3/m4a/ogg/wav…) PUT straight to R2 via the same
//     presign flow as photos, then stored as `audioKey` (presigned at render).
//   • YouTube: a youtube.com / youtu.be / music.youtube.com link; we extract the
//     11-char video id and the invitation plays it via a hidden IFrame player.
// Both drive the invitation's floating play/pause toggle.

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import type { EditorSaveStatus } from "@/components/molecules/editor-canvas";
import type { MusikData } from "@/lib/invitation/sections";
import { Icon } from "@/components/atoms/icon";
import { UploadProgress } from "@/components/atoms/upload-progress";
import {
  DoneToggle,
  FieldLabel,
  FormHeading,
  Toggle,
} from "@/components/molecules/editor-forms/form-ui";
import { useSectionAutosave } from "@/components/molecules/editor-forms/use-section-autosave";
import { WaveformTrimmer } from "@/components/molecules/editor-forms/waveform-trimmer";
import { YouTubeTrimmer } from "@/components/molecules/editor-forms/youtube-trimmer";
import { uploadToR2 } from "@/lib/upload";

export type MusikValue = { done: boolean; data: MusikData };

type MusikFormProps = {
  value: MusikValue;
  onChange: (next: MusikValue) => void;
  onStatusChange?: (status: EditorSaveStatus) => void;
};

const ACCEPTED_AUDIO = new Set([
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
]);
const MAX_AUDIO_BYTES = 15_000_000;

// Pull the 11-char video id out of any common YouTube / YT Music URL form.
function extractYouTubeId(input: string): string | null {
  const value = input.trim();
  const ID = /^[A-Za-z0-9_-]{11}$/;
  try {
    const u = new URL(value);
    const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return ID.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "music.youtube.com") {
      const v = u.searchParams.get("v");
      if (v && ID.test(v)) return v;
      const m = u.pathname.match(/\/(?:embed|shorts|v)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[1];
    }
  } catch {
    // not a URL — fall through to the raw-id check
  }
  return ID.test(value) ? value : null;
}

function validateAudio(file: File): string | null {
  if (!ACCEPTED_AUDIO.has(file.type)) {
    return `"${file.name}" formatnya nggak didukung. Pakai MP3, M4A, OGG, atau WAV ya.`;
  }
  if (file.size > MAX_AUDIO_BYTES) {
    return `"${file.name}" kegedean (maks 15 MB).`;
  }
  return null;
}

// Persist every stored field — never the server-resolved audioUrl.
function toPayload(data: MusikData): Record<string, unknown> {
  return {
    enabled: data.enabled,
    source: data.source,
    track: data.track,
    audioKey: data.audioKey,
    youtubeId: data.youtubeId,
    title: data.title,
    startSec: data.startSec,
    endSec: data.endSec,
  };
}

export function MusikForm({ value, onChange, onStatusChange }: MusikFormProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ytInput, setYtInput] = useState("");
  // Non-null only while the audio file is streaming → drives the percentage bar.
  const [progress, setProgress] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const buildPayload = useCallback(
    () => ({ data: toPayload(value.data), done: value.done }),
    [value],
  );
  // Music changes are discrete actions (upload done, link saved, toggle) — save
  // immediately via saveNow (flush alone is a no-op without a pending debounce).
  const { saveNow } = useSectionAutosave({ sectionId: "musik", buildPayload, onStatusChange });

  // Active editing mode. Defaults to "upload" unless youtube is already chosen.
  const [mode, setMode] = useState<"upload" | "youtube">(
    value.data.source === "youtube" ? "youtube" : "upload",
  );

  // Local object URL for a freshly-uploaded file (decodes the waveform without a
  // round-trip); on reopen we fall back to the server-presigned audioUrl. Revoked
  // when it changes / on unmount.
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  useEffect(() => {
    return () => {
      if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
    };
  }, [uploadedUrl]);
  const audioSrc = uploadedUrl ?? value.data.audioUrl ?? null;

  function patchData(patch: Partial<MusikData>) {
    const next: MusikValue = { ...value, data: { ...value.data, ...patch } };
    onChange(next);
    saveNow({ data: toPayload(next.data), done: next.done });
  }

  function setDone(done: boolean) {
    const next: MusikValue = { ...value, done };
    onChange(next);
    saveNow({ data: toPayload(next.data), done: next.done });
  }

  async function uploadAudio(file: File): Promise<string | null> {
    const clientError = validateAudio(file);
    if (clientError) return clientError;

    const up = await uploadToR2(file, { kind: "audio", onProgress: setProgress });
    if (!up.ok) return up.error;

    // Decode the waveform from the local file immediately (no round-trip).
    setUploadedUrl(URL.createObjectURL(file));
    // Switch the source to the uploaded file (clears any prior youtube id /
    // legacy preset track + the old trim window). The server frees the previous
    // audioKey from R2 on save.
    patchData({
      source: "upload",
      audioKey: up.objectKey,
      youtubeId: undefined,
      track: undefined,
      title: file.name,
      startSec: undefined,
      endSec: undefined,
    });
    return null;
  }

  function handleFile(fileList: FileList | null) {
    if (busy) return;
    const file = fileList?.[0];
    if (!file) return;
    setError(null);
    setBusy(true);
    setProgress(0);
    startTransition(async () => {
      const err = await uploadAudio(file);
      if (err) {
        setBusy(false);
        setProgress(null);
        setError(err);
        return;
      }
      // Hold the completed 100% bar one beat before clearing, so the finished
      // state is painted (clearing immediately would batch with the 100).
      setProgress(100);
      setTimeout(() => {
        setProgress(null);
        setBusy(false);
      }, 400);
    });
  }

  function saveYouTube() {
    const id = extractYouTubeId(ytInput);
    if (!id) {
      setError("Link YouTube nggak valid. Pastikan kamu menempel link video YouTube / YT Music.");
      return;
    }
    setError(null);
    setYtInput("");
    patchData({
      source: "youtube",
      youtubeId: id,
      audioKey: undefined,
      track: undefined,
      title: undefined,
      startSec: undefined,
      endSec: undefined,
    });
  }

  // Clear the current selection. Keep `source` aligned with the active tab so the
  // stored source stays semantically meaningful (not a stale "upload" after
  // clearing a YouTube link); drop every data field including the legacy track.
  function clearMusic() {
    setError(null);
    setUploadedUrl(null);
    patchData({
      source: mode,
      audioKey: undefined,
      youtubeId: undefined,
      track: undefined,
      title: undefined,
      startSec: undefined,
      endSec: undefined,
    });
  }

  const setTrim = (s: number, e: number) =>
    patchData({ startSec: Math.round(s), endSec: Math.round(e) });

  const hasUpload = value.data.source === "upload" && !!value.data.audioKey;
  const hasYouTube = value.data.source === "youtube" && !!value.data.youtubeId;

  return (
    <div className="max-w-[560px] mx-auto">
      <FormHeading>Musik latar</FormHeading>

      <div className="mb-7">
        <Toggle
          checked={value.data.enabled}
          onChange={(enabled) => patchData({ enabled })}
          label="Putar musik latar di undangan"
        />
      </div>

      {/* Source tabs */}
      <div className="mb-5 inline-flex rounded-[10px] border border-[rgba(245,239,230,0.12)] p-[3px]">
        {(["upload", "youtube"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setError(null);
              setMode(m);
            }}
            className={
              mode === m
                ? "rounded-[8px] bg-[rgba(245,239,230,0.12)] px-4 py-[7px] text-[12px] font-semibold text-cream"
                : "rounded-[8px] px-4 py-[7px] text-[12px] font-semibold text-[rgba(245,239,230,0.5)]"
            }
          >
            {m === "upload" ? "Upload file" : "Link YouTube"}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files);
              e.target.value = "";
            }}
          />
          {progress !== null ? (
            <div className="rounded-[12px] border-[1.5px] border-dashed border-[rgba(245,239,230,0.25)] px-5 py-7">
              <UploadProgress percent={progress} variant="dark" label="Mengunggah audio…" />
            </div>
          ) : hasUpload ? (
            <div className="flex items-center gap-3 rounded-[12px] border border-[rgba(245,239,230,0.15)] bg-[rgba(245,239,230,0.04)] px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy text-cream">
                <Icon name="music" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-cream">
                  {value.data.title ?? "Audio terunggah"}
                </div>
                <div className="text-[11px] text-[rgba(245,239,230,0.5)]">File audio aktif</div>
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="text-[12px] font-semibold text-peach hover:text-cream disabled:opacity-50"
              >
                Ganti
              </button>
              <button
                type="button"
                onClick={clearMusic}
                disabled={busy}
                className="text-[12px] font-semibold text-[rgba(245,239,230,0.55)] hover:text-cream disabled:opacity-50"
              >
                Hapus
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-dashed border-[rgba(245,239,230,0.25)] p-8 transition-colors hover:border-peach disabled:cursor-wait"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-burgundy text-cream">
                <Icon name="upload" size={16} />
              </span>
              <span className="font-display italic text-[15px] text-cream">Upload file musik</span>
              <span className="text-[11px] text-[rgba(245,239,230,0.5)]">
                MP3, M4A, OGG, atau WAV · maks 15 MB
              </span>
            </button>
          )}
          {hasUpload && audioSrc && (
            <WaveformTrimmer
              src={audioSrc}
              startSec={value.data.startSec}
              endSec={value.data.endSec}
              onChange={setTrim}
            />
          )}
        </>
      ) : (
        <>
          {hasYouTube ? (
            <div className="mb-4 flex items-center gap-3 rounded-[12px] border border-[rgba(245,239,230,0.15)] bg-[rgba(245,239,230,0.04)] px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy text-cream">
                <Icon name="music" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-cream">Link YouTube aktif</div>
                <div className="truncate text-[11px] text-[rgba(245,239,230,0.5)]">
                  youtu.be/{value.data.youtubeId}
                </div>
              </div>
              <button
                type="button"
                onClick={clearMusic}
                className="text-[12px] font-semibold text-[rgba(245,239,230,0.55)] hover:text-cream"
              >
                Hapus
              </button>
            </div>
          ) : null}
          {hasYouTube && value.data.youtubeId && (
            <YouTubeTrimmer
              youtubeId={value.data.youtubeId}
              startSec={value.data.startSec}
              endSec={value.data.endSec}
              onChange={setTrim}
            />
          )}
          <FieldLabel>Tempel link YouTube / YT Music</FieldLabel>
          <div className="flex gap-2">
            <input
              type="text"
              value={ytInput}
              onChange={(e) => setYtInput(e.target.value)}
              placeholder="https://youtu.be/…"
              className="flex-1 rounded-[10px] border border-[rgba(245,239,230,0.12)] bg-[rgba(245,239,230,0.04)] px-4 py-3 text-[14px] text-cream outline-none focus:border-[rgba(245,239,230,0.3)]"
            />
            <button
              type="button"
              onClick={saveYouTube}
              className="shrink-0 rounded-[10px] bg-burgundy px-5 text-[13px] font-semibold text-cream hover:bg-burgundy-deep"
            >
              Simpan
            </button>
          </div>
          <p className="mt-2 text-[12px] leading-[1.6] text-[rgba(245,239,230,0.5)]">
            Catatan: iklan bisa muncul sebelum lagu, tergantung videonya.
          </p>
        </>
      )}

      {error && <div className="mt-3 text-[12px] text-[#ff9b8a]">{error}</div>}

      <DoneToggle done={value.done} onChange={setDone} />
    </div>
  );
}

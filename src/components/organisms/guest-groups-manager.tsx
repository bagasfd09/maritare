"use client";

// Grup Tamu manager (client). Lists the wedding's guest groups (the distinct
// free-text guests.group labels) and lets the owner attach a badge icon per
// group — shown beside that group's guests, e.g. on wish cards. The icon
// uploads straight to R2 (presigned PUT via uploadToR2), then setGroupIcon
// registers the objectKey. Groups themselves are created/edited per guest on
// the guest form; this menu only decorates them.

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import {
  removeGroupIcon,
  setGroupIcon,
  setGroupIconStyle,
} from "@/server/actions/guest-groups";
import type { GuestGroupRow } from "@/server/queries/guest-groups";
import { uploadToR2 } from "@/lib/upload";
import { cn } from "@/lib/utils";

// SVG allowed for badges only — rendered exclusively via <img>, where scripts
// never execute. uploadToR2's compressImage passes SVG through untouched.
const ACCEPTED_TYPES = [
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
];
const MAX_BYTES = 2_000_000; // matches the sign route's group-badge cap

// Per-group badge placement on wish cards.
const STYLE_OPTIONS: { value: "name" | "avatar"; label: string }[] = [
  { value: "name", label: "Di nama" },
  { value: "avatar", label: "Di foto" },
];

export function GuestGroupsManager({ groups }: { groups: GuestGroupRow[] }) {
  const router = useRouter();
  // Errors are keyed to the group row they came from — the list can be long,
  // so a message at the top of the page would land out of view.
  const [error, setError] = useState<{ group: string; message: string } | null>(null);
  const [busyGroup, setBusyGroup] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement | null>(null);
  // Which group the (single, shared) file picker was opened for.
  const targetRef = useRef<string | null>(null);

  const disabled = busyGroup !== null || pending;

  function pickIconFor(name: string) {
    if (disabled) return;
    targetRef.current = name;
    fileRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be picked again after an error
    const name = targetRef.current;
    if (!file || !name) return;

    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError({
        group: name,
        message: "Format tidak didukung. Pakai SVG, PNG, JPG, atau WebP ya.",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      setError({ group: name, message: "File kegedean (maks 2 MB)." });
      return;
    }

    setBusyGroup(name);
    const up = await uploadToR2(file, { kind: "group-badge" });
    if (!up.ok) {
      setBusyGroup(null);
      setError({ group: name, message: up.error });
      return;
    }
    const res = await setGroupIcon({ name, objectKey: up.objectKey });
    setBusyGroup(null);
    if (!res.ok) {
      setError({ group: name, message: res.error });
      return;
    }
    router.refresh();
  }

  function handleRemove(name: string) {
    if (disabled) return;
    setError(null);
    startTransition(async () => {
      const res = await removeGroupIcon({ name });
      if (res.ok) {
        router.refresh();
      } else {
        setError({ group: name, message: res.error });
      }
    });
  }

  function handleStyle(name: string, style: "name" | "avatar") {
    if (disabled) return;
    setError(null);
    startTransition(async () => {
      const res = await setGroupIconStyle({ name, style });
      if (res.ok) {
        router.refresh();
      } else {
        setError({ group: name, message: res.error });
      }
    });
  }

  return (
    <div className="max-w-[860px] flex flex-col gap-6">
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFile}
        className="hidden"
      />

      <section className="bg-paper border border-line rounded-[16px] px-[22px] py-[20px]">
        <div className="font-display italic text-[18px] text-charcoal">
          Ikon badge per grup
        </div>
        <p className="text-[13px] text-muted-ink mt-1 leading-[1.55] max-w-[560px]">
          Grup diambil dari kolom <span className="font-semibold">Grup</span> di
          daftar tamu. Pasang ikon (mis. VIP, Sahabat) dan ikonnya tampil di
          samping nama tamu di kartu ucapan. Badge tampil kecil (±16 px) — SVG
          atau gambar sederhana kontras tinggi paling pas.
        </p>
      </section>

      {groups.length === 0 ? (
        <div className="bg-paper border border-dashed border-rule rounded-[16px] px-6 py-12 text-center">
          <div className="font-display italic text-[20px] text-charcoal">
            Belum ada grup tamu
          </div>
          <p className="text-[13px] text-muted-ink mt-2 max-w-[380px] mx-auto leading-[1.55]">
            Isi kolom &quot;Grup&quot; saat menambah atau mengedit tamu (mis.
            Keluarga, VIP, Sahabat), lalu kembali ke sini untuk memasang ikonnya.
          </p>
          <a href="/dashboard/guests" className="no-underline inline-block mt-4">
            <Button variant="ghost" size="sm">Ke daftar tamu →</Button>
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((g) => (
            <div
              key={g.name}
              className="bg-paper border border-line rounded-[14px] px-[18px] py-4 flex flex-wrap items-center gap-[14px]"
            >
              {/* Badge preview (or an empty dashed slot). */}
              {g.iconUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element -- presigned/CDN URL, next/image would break short-lived signatures */
                <img
                  src={g.iconUrl}
                  alt={`Ikon grup ${g.name}`}
                  className="w-10 h-10 rounded-full object-contain border border-line bg-cream p-1 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full border border-dashed border-rule bg-cream flex items-center justify-center shrink-0">
                  <Icon name="image" size={14} className="text-faint" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="font-display italic text-[17px] text-charcoal truncate">
                  {g.name}
                </div>
                <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-muted-ink">
                  {g.guestCount} tamu
                  {g.iconUrl ? " · badge aktif" : ""}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Placement toggle — only meaningful once an icon exists. */}
                {g.iconUrl && (
                  <div
                    role="group"
                    aria-label={`Posisi badge grup ${g.name}`}
                    className="flex rounded-full border border-line bg-cream p-[2px]"
                  >
                    {STYLE_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => handleStyle(g.name, s.value)}
                        aria-pressed={g.iconStyle === s.value}
                        disabled={disabled}
                        className={cn(
                          "cursor-pointer rounded-full px-[10px] py-[5px] text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors disabled:cursor-not-allowed",
                          g.iconStyle === s.value
                            ? "bg-charcoal text-cream"
                            : "bg-transparent text-muted-ink",
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={() => pickIconFor(g.name)}
                >
                  {busyGroup === g.name
                    ? "Mengunggah…"
                    : g.iconUrl
                      ? "Ganti ikon"
                      : "Pasang ikon"}
                </Button>
                {g.iconUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={() => handleRemove(g.name)}
                  >
                    <Icon name="x" size={12} />
                    Hapus
                  </Button>
                )}
              </div>

              {error?.group === g.name && (
                <div
                  role="alert"
                  className="basis-full flex items-start gap-2 text-[12px] text-burgundy"
                >
                  <Icon name="x" size={14} className="mt-[1px]" />
                  <span className="leading-[1.45]">{error.message}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

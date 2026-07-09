"use client";

// Akses Keluarga manager (client). The owner creates family sender codes with a
// per-token side scope (multi-select), shares the code / login link, sees the
// 1-hour window status, and can regenerate the code (new fresh window) or
// revoke. All mutations go through the owner-gated server actions; this
// component only renders state + dispatches. Mirrors petugas-manager.tsx.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { sideDisplayLabel } from "@/lib/guests-csv";
import { cn } from "@/lib/utils";
import {
  createShareToken,
  regenerateShareCode,
  revokeShareToken,
} from "@/server/actions/share";
import type { ShareAccessToken } from "@/server/queries/share";

const INPUT_LABEL =
  "font-body text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-ink mb-2 block";

/** "Aktif · sisa 43 mnt" / "Kedaluwarsa" / "Belum dipakai" for a token row.
 *  Uses the server-computed remainingMinutes (no Date.now() at render, which
 *  would risk an SSR/hydration text mismatch). Shared with the mobile template. */
export function statusLabel(t: ShareAccessToken): string {
  if (t.status === "unused") return "Belum dipakai · timer 1 jam mulai saat masuk";
  if (t.status === "expired") return "Kedaluwarsa · ganti kode untuk sesi baru";
  return `Aktif · sisa ±${t.remainingMinutes ?? 1} menit${t.lastDevice ? ` · ${t.lastDevice}` : ""}`;
}

function shareLink(code: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/kirim/login?t=${encodeURIComponent(code)}`;
}

/** Prefilled WA text the owner forwards to the family member. Shared with the
 *  mobile template. */
export function waShareText(t: ShareAccessToken): string {
  return [
    `Halo, ini akses untuk kirim undangan ke tamu ${t.sides.map(sideDisplayLabel).join(" & ")} ya 🙏`,
    "",
    `Buka: ${shareLink(t.code)}`,
    `Kode: ${t.code}`,
    "",
    "Catatan: waktu kirim 1 jam sejak pertama masuk.",
  ].join("\n");
}

export function ShareAccessManager({
  tokens,
  availableSides,
}: {
  tokens: ShareAccessToken[];
  availableSides: string[];
}) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [sides, setSides] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function refresh() {
    router.refresh();
  }

  function toggleSide(s: string) {
    setSides((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    const trimmed = label.trim();
    if (!trimmed) {
      setError("Nama/label wajib diisi.");
      return;
    }
    if (sides.length === 0) {
      setError("Pilih minimal satu sisi tamu.");
      return;
    }
    startTransition(async () => {
      const res = await createShareToken({ label: trimmed, sides });
      if (res.ok) {
        setLabel("");
        setSides([]);
        refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function runAction(fn: () => Promise<{ ok: boolean; error?: string }>) {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        refresh();
      } else {
        setError(res.error ?? "Terjadi kesalahan. Coba lagi.");
      }
    });
  }

  async function copy(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
    } catch {
      // Clipboard blocked (insecure context / permissions) — silently ignore.
    }
  }

  return (
    <div className="max-w-[860px] flex flex-col gap-6">
      {/* Create */}
      <section className="bg-paper border border-line rounded-[16px] px-[22px] py-[20px]">
        <form onSubmit={handleCreate}>
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-[240px]">
              <label htmlFor="share-label" className={INPUT_LABEL}>
                Tambah akses keluarga
              </label>
              <input
                id="share-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="mis. Ibu Pengantin Pria / Om Budi"
                maxLength={40}
                autoComplete="off"
                className="w-full bg-cream border border-beige rounded-[12px] px-[14px] py-3 font-body text-[14px] text-charcoal outline-none focus:border-burgundy"
              />
            </div>
            <Button type="submit" variant="primary" disabled={pending}>
              <Icon name="plus" size={14} />
              Buat kode
            </Button>
          </div>

          <div className="mt-4">
            <div className={INPUT_LABEL}>Dapat mengirim ke tamu sisi</div>
            <div className="flex flex-wrap gap-2">
              {availableSides.map((s) => {
                const on = sides.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSide(s)}
                    className={cn(
                      "px-3 py-[7px] rounded-full text-[12px] font-semibold border cursor-pointer transition-colors",
                      on
                        ? "bg-charcoal text-cream border-charcoal"
                        : "bg-cream text-muted-ink border-beige hover:border-charcoal",
                    )}
                  >
                    {on && <Icon name="check" size={11} className="inline mr-1" />}
                    {sideDisplayLabel(s)}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-3 flex items-start gap-2 text-[12px] text-burgundy">
            <Icon name="x" size={14} className="mt-[1px]" />
            <span className="leading-[1.45]">{error}</span>
          </div>
        )}
      </section>

      {/* Token list */}
      {tokens.length === 0 ? (
        <div className="bg-paper border border-dashed border-rule rounded-[16px] px-6 py-12 text-center">
          <div className="font-display italic text-[20px] text-charcoal">
            Belum ada akses keluarga
          </div>
          <p className="text-[13px] text-muted-ink mt-2 max-w-[400px] mx-auto leading-[1.55]">
            Buat kode di atas untuk keluarga yang mau ikut menyebar undangan
            lewat WhatsApp mereka sendiri — tanpa akun, cukup kode, berlaku 1
            jam sejak pertama dipakai.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tokens.map((t) => (
            <div
              key={t.id}
              className="bg-paper border border-line rounded-[14px] px-[20px] py-[18px]"
            >
              <div className="flex items-start justify-between gap-5 flex-wrap">
                {/* Identity + scope + status */}
                <div className="min-w-[220px]">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-[9px] h-[9px] rounded-full shrink-0",
                        t.status === "active"
                          ? "bg-sage"
                          : t.status === "expired"
                            ? "bg-terracotta"
                            : "bg-charcoal/20",
                      )}
                    />
                    <span className="font-display text-[18px] text-charcoal leading-none">
                      {t.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-[8px]">
                    {t.sides.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-[3px] rounded-full bg-cream border border-beige text-[10.5px] font-semibold text-muted-ink"
                      >
                        {sideDisplayLabel(s)}
                      </span>
                    ))}
                  </div>
                  <div className="text-[12px] text-muted-ink mt-[8px] leading-[1.5]">
                    {statusLabel(t)}
                    {t.matchCount > 0 ? (
                      <> · {t.matchCount} tamu</>
                    ) : (
                      <span className="text-burgundy">
                        {" "}· Tidak cocok dengan tamu mana pun — cek nama sisi
                      </span>
                    )}
                  </div>
                </div>

                {/* Code + copy */}
                <div className="min-w-[180px]">
                  <div className={INPUT_LABEL}>Kode akses</div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[22px] tracking-[0.18em] text-charcoal">
                      {t.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => copy(`code:${t.id}`, t.code)}
                      title="Salin kode"
                      className="w-7 h-7 rounded-full inline-flex items-center justify-center text-muted-ink hover:bg-cream cursor-pointer shrink-0"
                    >
                      <Icon name={copied === `code:${t.id}` ? "check" : "copy"} size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-[16px] pt-[14px] border-t border-beige flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copy(`link:${t.id}`, waShareText(t))}
                >
                  <Icon name="wa" size={12} />
                  {copied === `link:${t.id}` ? "Tersalin" : "Salin pesan + link"}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => runAction(() => regenerateShareCode({ id: t.id }))}
                >
                  <Icon name="arrow-r" size={12} />
                  {t.status === "expired" ? "Ganti kode (sesi baru)" : "Ganti kode"}
                </Button>

                <div className="flex-1" />

                {confirmRevoke === t.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-muted-ink">Cabut akses ini?</span>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmRevoke(null)}>
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      className="bg-burgundy text-cream"
                      disabled={pending}
                      onClick={() =>
                        runAction(async () => {
                          const res = await revokeShareToken({ id: t.id });
                          setConfirmRevoke(null);
                          return res;
                        })
                      }
                    >
                      Ya, cabut
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmRevoke(t.id)}
                    className="text-[12px] font-semibold tracking-[0.06em] uppercase text-burgundy hover:underline cursor-pointer"
                  >
                    Cabut
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

// Screen Mobile · Akses Keluarga. Same owner flows as the desktop
// ShareAccessManager (create a scoped family sender code, share it, regenerate,
// revoke) redesigned with the mobile primitives: stacked cards, chip
// multi-select for sides, chip-sized row actions.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/atoms/icon";
import {
  MobileButton,
  MobileCard,
  MobileChip,
  MobileEm,
  MobileInput,
} from "@/components/molecules/mobile-primitives";
import { MobileShell } from "@/components/templates/mobile-shell";
import { statusLabel, waShareText } from "@/components/organisms/share-access-manager";
import { sideDisplayLabel } from "@/lib/guests-csv";
import { cn } from "@/lib/utils";
import {
  createShareToken,
  regenerateShareCode,
  revokeShareToken,
} from "@/server/actions/share";
import type { ShareAccessData } from "@/server/queries/share";

const LABEL = "font-body text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-ink";

export function AksesKeluargaMobile({ data }: { data: ShareAccessData }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [sides, setSides] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
        router.refresh();
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
        router.refresh();
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
    <MobileShell
      active="akses-keluarga"
      eyebrow="Akses Keluarga"
      title={
        <>
          Keluarga ikut <MobileEm>menyebar.</MobileEm>
        </>
      }
    >
      {/* Create */}
      <MobileCard>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div>
            <div className={cn(LABEL, "mb-[6px]")}>Tambah akses keluarga</div>
            <MobileInput
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="mis. Ibu Pengantin Pria / Om Budi"
              maxLength={40}
              autoComplete="off"
            />
          </div>
          <div>
            <div className={cn(LABEL, "mb-2")}>Dapat mengirim ke tamu sisi</div>
            <div className="flex flex-wrap gap-2">
              {data.availableSides.map((s) => (
                <MobileChip key={s} active={sides.includes(s)} onClick={() => toggleSide(s)}>
                  {sides.includes(s) && <Icon name="check" size={11} />}
                  {sideDisplayLabel(s)}
                </MobileChip>
              ))}
            </div>
          </div>
          {error && <div className="text-[12px] text-burgundy leading-[1.45]">{error}</div>}
          <MobileButton type="submit" full disabled={pending}>
            <Icon name="plus" size={15} /> Buat kode
          </MobileButton>
        </form>
      </MobileCard>

      {/* Token list */}
      {data.tokens.length === 0 ? (
        <MobileCard className="border-dashed border-rule text-center py-8">
          <div className="font-display italic text-[17px]">Belum ada akses keluarga</div>
          <p className="text-[12px] text-muted-ink mt-2 leading-[1.55]">
            Buat kode di atas untuk keluarga yang mau ikut menyebar undangan
            lewat WhatsApp mereka sendiri — tanpa akun, cukup kode, berlaku 1
            jam sejak pertama dipakai.
          </p>
        </MobileCard>
      ) : (
        data.tokens.map((t) => (
          <MobileCard key={t.id} className="flex flex-col gap-3">
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
              <span className="font-display text-[17px] text-charcoal leading-none">
                {t.label}
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {t.sides.map((s) => (
                <span
                  key={s}
                  className="px-2 py-[3px] rounded-full bg-cream border border-beige text-[10.5px] font-semibold text-muted-ink"
                >
                  {sideDisplayLabel(s)}
                </span>
              ))}
            </div>

            <div className="text-[12px] text-muted-ink leading-[1.5]">
              {statusLabel(t)}
              {t.matchCount > 0 ? (
                <> · {t.matchCount} tamu</>
              ) : (
                <span className="text-burgundy">
                  {" "}· Tidak cocok dengan tamu mana pun — cek nama sisi
                </span>
              )}
            </div>

            {/* Code + copy */}
            <div className="flex items-center justify-between bg-cream border border-beige rounded-[12px] px-[14px] py-[9px]">
              <span className="font-display text-[20px] tracking-[0.18em] text-charcoal">
                {t.code}
              </span>
              <button
                type="button"
                onClick={() => copy(`code:${t.id}`, t.code)}
                aria-label="Salin kode"
                className="w-8 h-8 rounded-full inline-flex items-center justify-center text-muted-ink cursor-pointer"
              >
                <Icon name={copied === `code:${t.id}` ? "check" : "copy"} size={15} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <MobileChip onClick={() => copy(`link:${t.id}`, waShareText(t))}>
                <Icon name="wa" size={12} />
                {copied === `link:${t.id}` ? "Tersalin" : "Salin pesan + link"}
              </MobileChip>
              <MobileChip
                disabled={pending}
                className="disabled:opacity-50"
                onClick={() => runAction(() => regenerateShareCode({ id: t.id }))}
              >
                <Icon name="arrow-r" size={12} /> Ganti kode
              </MobileChip>
              {confirmRevoke === t.id ? (
                <>
                  <MobileChip
                    disabled={pending}
                    className="border-burgundy text-burgundy disabled:opacity-50"
                    onClick={() =>
                      runAction(async () => {
                        const res = await revokeShareToken({ id: t.id });
                        setConfirmRevoke(null);
                        return res;
                      })
                    }
                  >
                    Ya, cabut
                  </MobileChip>
                  <MobileChip onClick={() => setConfirmRevoke(null)}>Batal</MobileChip>
                </>
              ) : (
                <MobileChip
                  className="border-burgundy/40 text-burgundy"
                  onClick={() => setConfirmRevoke(t.id)}
                >
                  Cabut
                </MobileChip>
              )}
            </div>
          </MobileCard>
        ))
      )}
    </MobileShell>
  );
}

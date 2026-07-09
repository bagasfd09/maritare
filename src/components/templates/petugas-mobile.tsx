"use client";

// Screen Mobile · Petugas Resepsi. Same owner flows as the desktop
// PetugasManager (quota, create attendant code, share login link, force
// logout, regenerate, revoke) redesigned with the mobile primitives.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/atoms/icon";
import {
  MobileButton,
  MobileCard,
  MobileChip,
  MobileEm,
  MobileInput,
  MobileProgress,
} from "@/components/molecules/mobile-primitives";
import { MobileShell } from "@/components/templates/mobile-shell";
import { cn } from "@/lib/utils";
import {
  createPetugasToken,
  forcePetugasLogout,
  regeneratePetugasCode,
  revokePetugasToken,
} from "@/server/actions/petugas";
import type { PetugasData } from "@/server/queries/petugas";

const LABEL = "font-body text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-ink";

function guestbookLink(code: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/guestbook/login?t=${encodeURIComponent(code)}`;
}

export function PetugasMobile({ data }: { data: PetugasData }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const quota = data.quota;
  const full = quota.used >= quota.limit;
  const pct = quota.limit > 0 ? Math.min(100, (quota.used / quota.limit) * 100) : 0;

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    const trimmed = label.trim();
    if (!trimmed) {
      setError("Nama petugas wajib diisi.");
      return;
    }
    startTransition(async () => {
      const res = await createPetugasToken({ label: trimmed });
      if (res.ok) {
        setLabel("");
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
      active="petugas"
      eyebrow="Petugas Resepsi"
      title={
        <>
          Penjaga <MobileEm>buku tamu.</MobileEm>
        </>
      }
    >
      {/* Quota + create */}
      <MobileCard className="flex flex-col gap-3">
        <div>
          <div className={LABEL}>Kuota petugas</div>
          <div className="font-display text-[28px] leading-none text-charcoal mt-[6px]">
            {quota.used}
            <span className="text-muted-ink text-[18px]"> / {quota.limit}</span>
          </div>
          <div className="text-[12px] text-muted-ink mt-[4px]">
            Paket {quota.packageName ?? "—"}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MobileProgress
            value={pct}
            className="flex-1"
            fillClassName={full ? "bg-terracotta" : "bg-burgundy"}
          />
          <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-muted-ink shrink-0">
            {full ? "Kuota penuh" : `${quota.limit - quota.used} tersisa`}
          </span>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div>
            <div className={cn(LABEL, "mb-[6px]")}>Tambah petugas baru</div>
            <MobileInput
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="mis. Meja Depan / Mbak Sari"
              maxLength={40}
              autoComplete="off"
              disabled={full}
              className="disabled:opacity-50"
            />
          </div>
          {error && <div className="text-[12px] text-burgundy leading-[1.45]">{error}</div>}
          <MobileButton type="submit" full disabled={pending || full}>
            <Icon name="plus" size={15} /> Tambah petugas
          </MobileButton>
        </form>

        {full && (
          <a
            href="/dashboard/billing"
            className="flex items-center gap-3 px-4 py-3 bg-cream rounded-[10px] border border-dashed border-rule no-underline text-charcoal"
          >
            <span className="w-8 h-8 rounded-lg bg-peach text-burgundy-dark flex items-center justify-center shrink-0">
              <Icon name="sparkle" size={14} />
            </span>
            <span className="flex-1">
              <span className="block font-display italic text-[15px]">
                Butuh lebih banyak petugas?
              </span>
              <span className="block text-[11px] text-muted-ink mt-[2px]">
                Upgrade paket untuk menambah token petugas.
              </span>
            </span>
            <Icon name="chevron-r" size={14} stroke="var(--color-faint)" />
          </a>
        )}
      </MobileCard>

      {/* Token list */}
      {data.tokens.length === 0 ? (
        <MobileCard className="border-dashed border-rule text-center py-8">
          <div className="font-display italic text-[17px]">Belum ada petugas</div>
          <p className="text-[12px] text-muted-ink mt-2 leading-[1.55]">
            Tambah petugas di atas, lalu bagikan kodenya. Petugas masuk lewat
            halaman buku tamu tanpa perlu akun dashboard.
          </p>
        </MobileCard>
      ) : (
        data.tokens.map((t) => (
          <MobileCard key={t.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "w-[9px] h-[9px] rounded-full shrink-0",
                  t.online ? "bg-sage" : "bg-charcoal/20",
                )}
              />
              <span className="font-display text-[17px] text-charcoal leading-none">
                {t.label}
              </span>
            </div>

            <div className="text-[12px] text-muted-ink leading-[1.5]">
              {t.online ? (
                <>Aktif{t.lastDevice ? ` · ${t.lastDevice}` : ""}</>
              ) : t.lastSeenLabel ? (
                <>
                  Terakhir aktif {t.lastSeenLabel}
                  {t.lastDevice ? ` · ${t.lastDevice}` : ""}
                </>
              ) : (
                "Belum pernah dipakai"
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
              <MobileChip onClick={() => copy(`link:${t.id}`, guestbookLink(t.code))}>
                <Icon name="link" size={12} />
                {copied === `link:${t.id}` ? "Tersalin" : "Salin link masuk"}
              </MobileChip>
              {t.online && (
                <MobileChip
                  disabled={pending}
                  className="disabled:opacity-50"
                  onClick={() => runAction(() => forcePetugasLogout({ id: t.id }))}
                >
                  <Icon name="logout" size={12} /> Keluarkan
                </MobileChip>
              )}
              <MobileChip
                disabled={pending}
                className="disabled:opacity-50"
                onClick={() => runAction(() => regeneratePetugasCode({ id: t.id }))}
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
                        const res = await revokePetugasToken({ id: t.id });
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

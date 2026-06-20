"use client";

// Petugas Resepsi manager (client). The owner creates attendant token codes
// (capped by the package quota), shares the code / login link, sees which device
// is signed in, and can force-logout, regenerate the code, or revoke a token.
// All mutations go through the owner-gated server actions; this component only
// renders state + dispatches.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { ProgressBar } from "@/components/atoms/progress-bar";
import {
  createPetugasToken,
  forcePetugasLogout,
  regeneratePetugasCode,
  revokePetugasToken,
} from "@/server/actions/petugas";
import type { PetugasToken } from "@/server/queries/petugas";

const INPUT_LABEL =
  "font-body text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-ink mb-2 block";

type Quota = { used: number; limit: number; packageName: string | null };

export function PetugasManager({
  tokens,
  quota,
}: {
  tokens: PetugasToken[];
  quota: Quota;
}) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const full = quota.used >= quota.limit;
  const pct = quota.limit > 0 ? Math.min(100, (quota.used / quota.limit) * 100) : 0;

  function refresh() {
    router.refresh();
  }

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

  function shareLink(code: string): string {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/guestbook/login?t=${encodeURIComponent(code)}`;
  }

  return (
    <div className="max-w-[860px] flex flex-col gap-6">
      {/* Quota + create */}
      <section className="bg-paper border border-line rounded-[16px] px-[22px] py-[20px]">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="min-w-[200px]">
            <div className={INPUT_LABEL}>Kuota petugas</div>
            <div className="font-display text-[30px] leading-none text-charcoal">
              {quota.used}
              <span className="text-muted-ink text-[20px]"> / {quota.limit}</span>
            </div>
            <div className="text-[12px] text-muted-ink mt-[6px]">
              Paket {quota.packageName ?? "—"}
            </div>
          </div>

          <form onSubmit={handleCreate} className="flex-1 min-w-[280px]">
            <label htmlFor="petugas-label" className={INPUT_LABEL}>
              Tambah petugas baru
            </label>
            <div className="flex items-center gap-2">
              <input
                id="petugas-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="mis. Meja Depan / Mbak Sari"
                maxLength={40}
                autoComplete="off"
                disabled={full}
                className="flex-1 bg-cream border border-beige rounded-[12px] px-[14px] py-3 font-body text-[14px] text-charcoal outline-none focus:border-burgundy disabled:opacity-50"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={pending || full}
              >
                <Icon name="plus" size={14} />
                Tambah
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-[18px] flex items-center gap-3">
          <ProgressBar
            value={pct}
            fillClassName={full ? "bg-terracotta" : "bg-burgundy"}
          />
          <span className="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-ink shrink-0">
            {full ? "Kuota penuh" : `${quota.limit - quota.used} tersisa`}
          </span>
        </div>

        {full && (
          <div className="mt-[14px] flex items-start gap-[14px] px-4 py-[14px] bg-cream rounded-[10px] border border-dashed border-rule">
            <div className="w-8 h-8 rounded-lg bg-peach text-burgundy-dark flex items-center justify-center shrink-0">
              <Icon name="sparkle" size={14} />
            </div>
            <div className="flex-1">
              <div className="font-display italic text-[16px] text-charcoal">
                Butuh lebih banyak petugas?
              </div>
              <div className="text-[12px] text-muted-ink mt-[2px]">
                Upgrade paket untuk menambah token petugas resepsi.
              </div>
            </div>
            <a href="/dashboard/billing" className="no-underline">
              <Button variant="ghost" size="sm">Upgrade →</Button>
            </a>
          </div>
        )}

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
            Belum ada petugas
          </div>
          <p className="text-[13px] text-muted-ink mt-2 max-w-[360px] mx-auto leading-[1.55]">
            Tambah petugas di atas, lalu bagikan kodenya. Petugas masuk lewat
            halaman buku tamu tanpa perlu akun dashboard.
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
                {/* Identity + status */}
                <div className="min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-[9px] h-[9px] rounded-full shrink-0 ${
                        t.online ? "bg-sage" : "bg-charcoal/20"
                      }`}
                    />
                    <span className="font-display text-[18px] text-charcoal leading-none">
                      {t.label}
                    </span>
                  </div>
                  <div className="text-[12px] text-muted-ink mt-[8px] leading-[1.5]">
                    {t.online ? (
                      <>Aktif{t.lastDevice ? ` · ${t.lastDevice}` : ""}</>
                    ) : t.lastSeenLabel ? (
                      <>Terakhir aktif {t.lastSeenLabel}{t.lastDevice ? ` · ${t.lastDevice}` : ""}</>
                    ) : (
                      "Belum pernah dipakai"
                    )}
                  </div>
                </div>

                {/* Code + copy */}
                <div className="min-w-[180px]">
                  <div className={INPUT_LABEL}>Kode masuk</div>
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
                  onClick={() => copy(`link:${t.id}`, shareLink(t.code))}
                >
                  <Icon name="link" size={12} />
                  {copied === `link:${t.id}` ? "Tersalin" : "Salin link masuk"}
                </Button>

                {t.online && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => runAction(() => forcePetugasLogout({ id: t.id }))}
                  >
                    <Icon name="logout" size={12} />
                    Keluarkan perangkat
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => runAction(() => regeneratePetugasCode({ id: t.id }))}
                >
                  <Icon name="arrow-r" size={12} />
                  Ganti kode
                </Button>

                <div className="flex-1" />

                {confirmRevoke === t.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-muted-ink">Cabut petugas ini?</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmRevoke(null)}
                    >
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      className="bg-burgundy text-cream"
                      disabled={pending}
                      onClick={() =>
                        runAction(async () => {
                          const res = await revokePetugasToken({ id: t.id });
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

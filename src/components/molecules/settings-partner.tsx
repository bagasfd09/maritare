"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Avatar, initials } from "@/components/atoms/avatar";
import { Display, Em } from "@/components/atoms/typography";
import { SectionNumber } from "@/components/atoms/section-number";
import type { SettingsData } from "@/server/queries/dashboard";
import { regenerateInviteCode, removePartner } from "@/server/actions/wedding-members";

const INPUT_LABEL =
  "font-body text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-ink mb-2 block";

// Settings · Partner: invite the 2nd owner with a code, and manage co-owners.
// A wedding has at most two equal owners (groom + bride).
export function SettingsPartner({
  inviteCode,
  members,
}: {
  inviteCode: SettingsData["inviteCode"];
  members: SettingsData["members"];
}) {
  const router = useRouter();
  const [code, setCode] = useState(inviteCode ?? "");
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const full = members.length >= 2;

  function handleCopy() {
    if (!code) return;
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable — the code is shown for manual copy */
    }
  }

  function handleRegenerate() {
    setStatus(null);
    startTransition(async () => {
      const result = await regenerateInviteCode();
      if (result.ok) {
        setCode(result.code);
        setStatus({ ok: true, msg: "Kode baru dibuat. Kode lama tidak berlaku lagi." });
      } else {
        setStatus({ ok: false, msg: result.error });
      }
    });
  }

  function handleRemove(userId: string) {
    setStatus(null);
    startTransition(async () => {
      const result = await removePartner({ userId });
      if (result.ok) {
        router.refresh();
      } else {
        setStatus({ ok: false, msg: result.error });
      }
    });
  }

  return (
    <section id="partner" className="scroll-mt-6">
      <SectionNumber className="text-[12px] mb-1">Partner</SectionNumber>
      <Display as="div" className="text-[26px] mb-4">
        Kelola undangan <Em className="text-burgundy">berdua.</Em>
      </Display>

      <div className="bg-paper border border-line rounded-[14px] px-[22px] py-5 flex flex-col gap-[18px]">
        {/* Current owners */}
        <div>
          <span className={INPUT_LABEL}>Pemilik undangan ({members.length}/2)</span>
          <div className="flex flex-col gap-[10px]">
            {members.map((m, i) => (
              <div key={m.userId} className="flex items-center gap-3">
                <Avatar tone={i === 0 ? "burgundy" : "sage"}>{initials(m.name)}</Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-charcoal flex items-center gap-2">
                    <span className="truncate">{m.name}</span>
                    {m.isMe && (
                      <span className="text-[10px] tracking-[0.12em] uppercase font-bold text-muted-ink bg-cream border border-beige rounded-full px-[7px] py-[1px]">
                        Kamu
                      </span>
                    )}
                    {m.isCreator && (
                      <span className="text-[10px] tracking-[0.12em] uppercase font-bold text-burgundy bg-blush/50 rounded-full px-[7px] py-[1px]">
                        Pembuat
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-muted-ink truncate">{m.email}</div>
                </div>
                {!m.isMe && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(m.userId)}
                    disabled={isPending}
                    className="text-burgundy border-burgundy/40 hover:border-burgundy"
                  >
                    Hapus
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Invite code (only while a slot is open) */}
        {full ? (
          <div className="flex items-start gap-[14px] px-4 py-[14px] bg-sage-soft rounded-[10px]">
            <div className="w-8 h-8 rounded-lg bg-[#2E3325] text-cream flex items-center justify-center shrink-0">
              <Icon name="check" size={14} />
            </div>
            <div className="flex-1">
              <div className="font-display italic text-[16px] text-[#2E3325]">
                Undangan ini sudah dikelola berdua.
              </div>
              <div className="text-[12px] text-[#2E3325] mt-[2px]">
                Hapus salah satu pemilik dulu kalau mau mengundang orang lain.
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-line pt-[18px]">
            <label className={INPUT_LABEL} htmlFor="set-invite-code">
              Kode undangan — bagikan ke pasanganmu
            </label>
            <div className="flex items-center gap-2 mb-[10px]">
              <div className="flex-1 flex items-center bg-cream border border-beige rounded-[12px] px-[14px] py-3">
                <span
                  id="set-invite-code"
                  className="flex-1 font-display font-bold text-[18px] tracking-[0.3em] uppercase text-charcoal"
                >
                  {code || "—"}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!code}
                  title="Salin kode"
                  className="inline-flex items-center gap-[6px] text-[12px] font-semibold text-muted-ink hover:text-charcoal cursor-pointer disabled:opacity-40"
                >
                  <Icon name={copied ? "check" : "copy"} size={14} />
                  {copied ? "Tersalin" : "Salin"}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" variant="ghost" onClick={handleRegenerate} disabled={isPending}>
                {isPending ? "Memproses…" : "Buat kode baru"}
              </Button>
              <span className="text-[12px] text-muted-ink">
                Pasanganmu masukkan kode ini saat pertama masuk (pilih “Gabung pakai kode”).
              </span>
            </div>
          </div>
        )}

        {status && (
          <span className={status.ok ? "text-[12px] text-sage" : "text-[12px] text-burgundy"}>
            {status.msg}
          </span>
        )}
      </div>
    </section>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/atoms/icon";
import { Avatar, initials } from "@/components/atoms/avatar";
import { MobileCard, MobileEyebrow } from "@/components/molecules/mobile-primitives";
import type { SettingsData } from "@/server/queries/dashboard";
import { regenerateInviteCode, removePartner } from "@/server/actions/wedding-members";

// Mobile · Partner: show co-owners + the invite code (share with the partner so
// they can join from their own phone via onboarding → "Gabung pakai kode").
export function SettingsPartnerMobile({
  inviteCode,
  members,
}: {
  inviteCode: SettingsData["inviteCode"];
  members: SettingsData["members"];
}) {
  const router = useRouter();
  const [code, setCode] = useState(inviteCode ?? "");
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const full = members.length >= 2;

  function handleCopy() {
    if (!code) return;
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  }

  function handleRegenerate() {
    setMsg(null);
    startTransition(async () => {
      const result = await regenerateInviteCode();
      if (result.ok) setCode(result.code);
      else setMsg(result.error);
    });
  }

  function handleRemove(userId: string) {
    setMsg(null);
    startTransition(async () => {
      const result = await removePartner({ userId });
      if (result.ok) router.refresh();
      else setMsg(result.error);
    });
  }

  return (
    <div>
      <MobileEyebrow className="px-1 pb-2">Partner ({members.length}/2)</MobileEyebrow>
      <MobileCard flush>
        {members.map((m, i) => (
          <div
            key={m.userId}
            className="flex items-center gap-3 px-4 py-[13px] border-b border-line last:border-b-0"
          >
            <Avatar tone={i === 0 ? "burgundy" : "sage"} size={34} className="text-[13px]">
              {initials(m.name)}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">
                {m.name}
                {m.isMe && <span className="text-[11px] text-muted-ink"> · Kamu</span>}
                {m.isCreator && <span className="text-[11px] text-burgundy"> · Pembuat</span>}
              </div>
              <div className="text-[11.5px] text-muted-ink truncate">{m.email}</div>
            </div>
            {!m.isMe && (
              <button
                type="button"
                onClick={() => handleRemove(m.userId)}
                disabled={isPending}
                className="text-[12px] font-semibold text-burgundy disabled:opacity-50"
              >
                Hapus
              </button>
            )}
          </div>
        ))}

        {full ? (
          <div className="px-4 py-[13px] text-[12px] text-muted-ink">
            Undangan ini sudah dikelola berdua.
          </div>
        ) : (
          <div className="px-4 py-[14px]">
            <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-ink mb-2">
              Kode undangan
            </div>
            <div className="flex items-center gap-2 bg-cream border border-beige rounded-[12px] px-[14px] py-[10px] mb-[10px]">
              <span className="flex-1 font-display font-bold text-[18px] tracking-[0.3em] uppercase">
                {code || "—"}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!code}
                className="inline-flex items-center gap-[6px] text-[12px] font-semibold text-muted-ink disabled:opacity-40"
              >
                <Icon name={copied ? "check" : "copy"} size={14} />
                {copied ? "Tersalin" : "Salin"}
              </button>
            </div>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isPending}
              className="text-[12px] font-semibold text-charcoal underline disabled:opacity-50"
            >
              {isPending ? "Memproses…" : "Buat kode baru"}
            </button>
            <p className="text-[11.5px] text-muted-ink mt-2">
              Bagikan kode ini ke pasanganmu. Dia masukkan saat pertama masuk (pilih “Gabung
              pakai kode”).
            </p>
          </div>
        )}

        {msg && <div className="px-4 py-2 text-[12px] text-burgundy">{msg}</div>}
      </MobileCard>
    </div>
  );
}

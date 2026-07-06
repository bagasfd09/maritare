"use client";

// Family WhatsApp quick-send (/kirim). A share-token session lands here: only
// the guests whose side is in the token's scope, one big "Kirim" button per
// guest that opens wa.me with the prefilled invite from the sender's OWN
// WhatsApp, then marks the guest invited. Mobile-first — family members do
// this from their phones. The 1-hour window counts down in the header; when it
// hits zero we refresh and the server bounces to /kirim/login?expired=1.

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Avatar, initials } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import { Logo } from "@/components/atoms/logo";
import { buildFamilyInviteMessage, waMeLink } from "@/lib/invite-message";
import { sideDisplayLabel } from "@/lib/guests-csv";
import { normalizePhoneIntl } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { endShareSession, markGuestInvitedViaShare } from "@/server/actions/share";
import type { ShareSendData } from "@/server/queries/share";

const AVATAR_TONES = ["peach", "sage", "blush", "burgundy", "dark"] as const;

function mmss(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ShareSend({ data }: { data: ShareSendData }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sentLocal, setSentLocal] = useState<Set<string>>(new Set());
  // null until mounted — Date.now() at render would differ between the SSR
  // pass and hydration, so the first real value comes from the effect.
  const [remaining, setRemaining] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // 1-second countdown. Past zero the interval stays alive and keeps polling
  // refresh (every 3rd tick) until the SERVER agrees the session is dead and
  // redirects — a client clock ahead of the server would otherwise strand the
  // page frozen at 00:00. Navigation unmounts us, which clears the interval.
  useEffect(() => {
    let ticksPastZero = 0;
    const tick = () => {
      const left = data.expiresAtMs - Date.now();
      setRemaining(left);
      if (left <= 0 && ticksPastZero++ % 3 === 0) {
        router.refresh();
      }
    };
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, [data.expiresAtMs, router]);

  const isSent = (g: ShareSendData["guests"][number]) =>
    g.invitationStatus !== "none" || sentLocal.has(g.id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.guests;
    return data.guests.filter(
      (g) => g.name.toLowerCase().includes(q) || (g.group ?? "").toLowerCase().includes(q),
    );
  }, [data.guests, query]);

  const sendable = data.guests.filter((g) => normalizePhoneIntl(g.phone) !== null);
  const noPhoneCount = data.guests.length - sendable.length;
  const sentCount = sendable.filter(isSent).length;

  function handleSend(g: ShareSendData["guests"][number]) {
    const target = normalizePhoneIntl(g.phone);
    if (!target) return;
    const message = buildFamilyInviteMessage({
      guestName: g.name,
      groomName: data.groomName,
      brideName: data.brideName,
      slug: data.weddingSlug,
      guestCode: g.code ?? undefined,
    });
    window.open(waMeLink(target, message), "_blank", "noopener");
    setSentLocal((prev) => new Set(prev).add(g.id));
    startTransition(async () => {
      const res = await markGuestInvitedViaShare({ guestId: g.id });
      if (!res.ok) {
        // Dead session (expired/kicked/revoked) or transient failure — roll the
        // row back and refresh: a dead session bounces to /kirim/login with the
        // right explanation instead of accumulating false "Terkirim" rows.
        setSentLocal((prev) => {
          const next = new Set(prev);
          next.delete(g.id);
          return next;
        });
        router.refresh();
      }
    });
  }

  const lowTime = remaining !== null && remaining <= 5 * 60 * 1000;

  return (
    <div className="relative min-h-screen w-full bg-cream text-charcoal font-body">
      {/* Sticky header: just logo + countdown + logout — identity lives in the
          page heading below so the bar stays clean on small screens. */}
      <header className="sticky top-0 z-20 bg-paper/95 backdrop-blur border-b border-line">
        <div className="max-w-[560px] mx-auto px-5 py-3 flex items-center gap-3">
          <Logo size={22} />
          <div className="flex-1" />
          <span
            className={cn(
              "inline-flex items-center gap-1 px-3 py-[6px] rounded-full text-[12px] font-semibold tabular-nums",
              lowTime ? "bg-peach text-burgundy-dark" : "bg-cream text-charcoal border border-line",
            )}
          >
            <Icon name="calendar" size={12} />
            {remaining === null ? "--:--" : mmss(remaining)}
          </span>
          <form action={endShareSession}>
            <button
              type="submit"
              title="Keluar"
              className="w-8 h-8 rounded-full inline-flex items-center justify-center text-muted-ink hover:bg-cream cursor-pointer"
            >
              <Icon name="logout" size={14} />
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-[560px] mx-auto px-5 py-5 pb-16">
        <div className="flex items-center gap-[10px] mb-2">
          <FlowerMark size={12} />
          <span className="text-[10px] tracking-[0.28em] uppercase font-semibold text-muted-ink">
            Kirim undangan via WhatsApp
          </span>
        </div>
        <h1 className="font-display text-[26px] tracking-[-0.02em] leading-[1.15]">
          {data.groomName} <span className="italic font-normal text-burgundy">&</span>{" "}
          {data.brideName}
        </h1>
        <div className="text-[12px] text-muted-ink mt-1">Dikirim oleh {data.senderLabel}</div>
        <p className="text-[13px] text-muted-ink leading-[1.55] mt-3 mb-4">
          Tekan <em className="font-display">Kirim</em> — WhatsApp terbuka dengan
          pesan undangan yang sudah jadi, tinggal kirim dari nomormu sendiri.
        </p>

        {/* Search + progress */}
        <div className="flex items-center gap-[10px] bg-paper border border-line rounded-full px-4 py-[10px] mb-3">
          <Icon name="search" size={14} stroke="var(--color-muted-ink)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama atau grup…"
            className="flex-1 border-none bg-transparent outline-none font-body text-[14px]"
          />
        </div>
        <div className="text-[11px] text-muted-ink tracking-[0.08em] uppercase font-semibold mb-3">
          {sentCount} / {sendable.length} terkirim
          {noPhoneCount > 0 && (
            <span className="normal-case tracking-normal font-normal text-faint">
              {" "}· {noPhoneCount} tamu tanpa nomor
            </span>
          )}
        </div>

        {/* Guest list */}
        {filtered.length === 0 ? (
          <div className="bg-paper border border-dashed border-rule rounded-[16px] px-6 py-10 text-center">
            <div className="font-display italic text-[18px]">Tidak ada tamu</div>
            <p className="text-[12px] text-muted-ink mt-1">
              {data.guests.length === 0
                ? "Belum ada tamu di sisi yang kamu pegang."
                : "Tidak ada yang cocok dengan pencarianmu."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((g, i) => {
              const sent = isSent(g);
              const hasPhone = normalizePhoneIntl(g.phone) !== null;
              return (
                <div
                  key={g.id}
                  className="bg-paper border border-line rounded-[14px] px-4 py-3 flex items-center gap-3"
                >
                  <Avatar tone={AVATAR_TONES[i % AVATAR_TONES.length]} size={38}>
                    {initials(g.name)}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium truncate">{g.name}</div>
                    <div className="text-[11px] text-muted-ink truncate">
                      {[g.group, sideDisplayLabel(g.side)].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  {sent && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1c5a36]">
                      <Icon name="check" size={12} /> Terkirim
                    </span>
                  )}
                  {hasPhone ? (
                    <Button size="sm" variant={sent ? "ghost" : "primary"} onClick={() => handleSend(g)}>
                      <Icon name="wa" size={13} />
                      {sent ? "Ulang" : "Kirim"}
                    </Button>
                  ) : (
                    // Tooltip-only hints are invisible on touch — say it inline.
                    <span className="text-[11px] text-muted-ink italic whitespace-nowrap">
                      Nomor belum ada
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

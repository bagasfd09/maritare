"use client";

// Family WhatsApp quick-send (/kirim, the "Kirim" tab). Only the guests whose
// side is in the token's scope, one big "Kirim" button per guest that opens
// wa.me with the prefilled invite from the sender's OWN WhatsApp, then marks
// the guest invited. Mobile-first — family members do this from their phones.
// The shared chrome (countdown header, floral decor, bottom nav) lives in
// ShareShell.

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Avatar, initials } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import { ShareShell } from "@/components/organisms/share-shell";
import { familyInviteTemplate, fillFamilyTemplate, waMeLink } from "@/lib/invite-message";
import { sideDisplayLabel } from "@/lib/guests-csv";
import { normalizePhoneIntl } from "@/lib/phone";
import { useGuestFeed } from "@/lib/use-guest-feed";
import {
  loadShareSendGuests,
  markGuestInvitedViaShare,
  saveShareTemplate,
} from "@/server/actions/share";
import type { ShareSendData, ShareSendGuest } from "@/server/queries/share";

const AVATAR_TONES = ["peach", "sage", "blush", "burgundy", "dark"] as const;

export function ShareSend({ data }: { data: ShareSendData }) {
  const router = useRouter();
  const [sentLocal, setSentLocal] = useState<Set<string>>(new Set());
  // Ids counted into the optimistic "terkirim" number — only rows still unsent
  // at page load, so the server aggregate is never double-counted.
  const [newlySent, setNewlySent] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();
  // Server-paged guest feed: search runs server-side, more pages stream in as
  // the list scrolls.
  const { rows, query, setQuery, sentinelRef, loading } = useGuestFeed({
    initialRows: data.guests,
    initialCursor: data.nextCursor,
    fetchPage: loadShareSendGuests,
  });

  // WA message template — the sender's saved copy, or the generated default.
  const defaultTpl = useMemo(
    () => familyInviteTemplate({ groomName: data.groomName, brideName: data.brideName }),
    [data.groomName, data.brideName],
  );
  const [template, setTemplate] = useState(data.savedTemplate ?? defaultTpl);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(template);
  const [tplMsg, setTplMsg] = useState<string | null>(null);
  const [savingTpl, startSaveTpl] = useTransition();
  const isCustom = template !== defaultTpl;

  function openEditor() {
    setDraft(template);
    setTplMsg(null);
    setEditing(true);
  }

  function saveTemplate() {
    const text = draft.trim();
    if (!text) {
      setTplMsg("Pesan tidak boleh kosong.");
      return;
    }
    if (!text.includes("{link}")) {
      setTplMsg("Pesan harus memuat {link}.");
      return;
    }
    // Mirror wa-blast's diff-store: text equal to the default persists null, so
    // an unchanged save doesn't silently detach from live couple-name edits.
    const toSave = text === defaultTpl ? null : text;
    startSaveTpl(async () => {
      const res = await saveShareTemplate({ template: toSave });
      if (res.ok) {
        setTemplate(toSave ?? defaultTpl);
        setEditing(false);
        setTplMsg(null);
      } else {
        setTplMsg(res.error);
      }
    });
  }

  function resetTemplate() {
    startSaveTpl(async () => {
      const res = await saveShareTemplate({ template: null });
      if (res.ok) {
        setTemplate(defaultTpl);
        setDraft(defaultTpl);
        setTplMsg(null);
      } else {
        setTplMsg(res.error);
      }
    });
  }

  const isSent = (g: ShareSendGuest) =>
    g.invitationStatus !== "none" || sentLocal.has(g.id);

  // Aggregates come from the server snapshot (the list is paged); newlySent
  // adds this session's sends on top. When a router.refresh() delivers a NEW
  // aggregate it already includes those sends — drop the optimistic
  // increments so they don't double-count. Reset-during-render (not an
  // effect) per the React "adjusting state when a prop changes" pattern.
  // (The feed rows are client state and survive the refresh; their
  // "Terkirim" display comes from sentLocal.)
  const baseSendableSent = data.counts.sendableSent;
  const [prevBaseSent, setPrevBaseSent] = useState(baseSendableSent);
  if (prevBaseSent !== baseSendableSent) {
    setPrevBaseSent(baseSendableSent);
    setNewlySent(new Set());
  }
  const sentCount = baseSendableSent + newlySent.size;
  const noPhoneCount = data.counts.noPhone;
  const totalGuests = data.counts.sendable + data.counts.noPhone;

  function handleSend(g: ShareSendGuest) {
    const target = normalizePhoneIntl(g.phone);
    if (!target) return;
    const message = fillFamilyTemplate(template, {
      guestName: g.name,
      slug: data.weddingSlug,
      guestCode: g.code ?? undefined,
    });
    window.open(waMeLink(target, message), "_blank", "noopener");
    const countIt = g.invitationStatus === "none" && !sentLocal.has(g.id);
    setSentLocal((prev) => new Set(prev).add(g.id));
    if (countIt) {
      setNewlySent((prev) => new Set(prev).add(g.id));
    }
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
        if (countIt) {
          setNewlySent((prev) => {
            const next = new Set(prev);
            next.delete(g.id);
            return next;
          });
        }
        router.refresh();
      }
    });
  }

  return (
    <ShareShell active="kirim" expiresAtMs={data.expiresAtMs}>
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

      {/* WA message template editor — per-sender, persisted to their code. */}
      <div className="bg-paper border border-line rounded-[14px] px-4 py-3 mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase font-semibold text-muted-ink">
            <Icon name="wa" size={13} /> Pesan WhatsApp
            {isCustom && (
              <span className="normal-case tracking-normal text-[10px] px-2 py-[1px] rounded-full bg-cream border border-line text-charcoal">
                Diubah
              </span>
            )}
          </div>
          {!editing && (
            <button
              type="button"
              onClick={openEditor}
              className="text-[12px] font-semibold text-burgundy hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <Icon name="edit" size={12} /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="mt-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={12}
              maxLength={2000}
              className="w-full bg-cream border border-beige rounded-[12px] px-3 py-3 font-body text-[13px] leading-[1.5] text-charcoal outline-none focus:border-burgundy resize-y"
            />
            <div className="text-[11px] text-muted-ink mt-2 leading-[1.5]">
              <code className="bg-cream px-1 rounded">{"{nama}"}</code> = nama tamu ·{" "}
              <code className="bg-cream px-1 rounded">{"{link}"}</code> = link undangan
              (wajib ada, otomatis terisi per tamu)
            </div>
            {tplMsg && <div className="text-[12px] text-burgundy mt-2">{tplMsg}</div>}
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" variant="primary" disabled={savingTpl} onClick={saveTemplate}>
                {savingTpl ? "Menyimpan…" : "Simpan pesan"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={savingTpl}
                onClick={() => {
                  setEditing(false);
                  setTplMsg(null);
                }}
              >
                Batal
              </Button>
              <div className="flex-1" />
              {isCustom && (
                <button
                  type="button"
                  onClick={resetTemplate}
                  disabled={savingTpl}
                  className="text-[12px] font-semibold text-muted-ink hover:underline cursor-pointer disabled:opacity-50"
                >
                  Kembalikan ke default
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-[12px] text-muted-ink mt-2 leading-[1.5] line-clamp-2 whitespace-pre-line">
            {fillFamilyTemplate(template, { guestName: "Nama Tamu", slug: data.weddingSlug })}
          </p>
        )}
      </div>

      {/* Search + progress */}
      <div className="flex items-center gap-[10px] bg-paper border border-line rounded-full px-4 py-[10px] mb-3">
        <Icon name="search" size={14} stroke="var(--color-muted-ink)" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={120}
          placeholder="Cari nama atau grup…"
          className="flex-1 border-none bg-transparent outline-none font-body text-[14px]"
        />
      </div>
      <div className="text-[11px] text-muted-ink tracking-[0.08em] uppercase font-semibold mb-3">
        {sentCount} / {data.counts.sendable} terkirim
        {noPhoneCount > 0 && (
          <span className="normal-case tracking-normal font-normal text-faint">
            {" "}· {noPhoneCount} tamu tanpa nomor
          </span>
        )}
      </div>

      {/* Guest list */}
      {rows.length === 0 ? (
        <div className="bg-paper border border-dashed border-rule rounded-[16px] px-6 py-10 text-center">
          <div className="font-display italic text-[18px]">Tidak ada tamu</div>
          <p className="text-[12px] text-muted-ink mt-1">
            {totalGuests === 0
              ? "Belum ada tamu di sisi yang kamu pegang."
              : "Tidak ada yang cocok dengan pencarianmu."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((g, i) => {
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

      {/* Infinite scroll: the next page loads as this sentinel nears view. */}
      <div ref={sentinelRef} aria-hidden />
      {loading && (
        <div className="py-4 text-center text-[11px] tracking-[0.18em] uppercase font-semibold text-muted-ink">
          Memuat…
        </div>
      )}
    </ShareShell>
  );
}

"use client";

// Family guest dashboard (/kirim/tamu) — the landing page of a share-token
// session. Read-only overview of the guests in the sender's sides: stat
// tiles, per-guest invitation + RSVP status, and a shortcut to /kirim when
// sendable guests still need their invite. Mobile-first, wrapped in
// ShareShell. Data is the stripped ShareGuestsData projection — no phone
// numbers or invite codes reach this page's client payload.

import Link from "next/link";

import { Avatar, initials } from "@/components/atoms/avatar";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import { MobileStat } from "@/components/molecules/mobile-primitives";
import { ShareShell } from "@/components/organisms/share-shell";
import { sideDisplayLabel } from "@/lib/guests-csv";
import { useGuestFeed } from "@/lib/use-guest-feed";
import { cn } from "@/lib/utils";
import { loadShareGuestRows } from "@/server/actions/share";
import type { ShareGuestsData, ShareGuestRow } from "@/server/queries/share";

const AVATAR_TONES = ["peach", "sage", "blush", "burgundy", "dark"] as const;

function invitationPill(g: ShareGuestRow): { label: string; className: string } {
  switch (g.invitationStatus) {
    case "opened":
      return { label: "Dibuka", className: "bg-sage-soft text-[#1c5a36]" };
    case "sent":
      return { label: "Terkirim", className: "bg-cream border border-line text-charcoal" };
    default:
      // Phone-less guests can't be sent from the Kirim tab — say why inline
      // instead of a "Belum dikirim" the family member can do nothing about.
      return g.hasPhone
        ? { label: "Belum dikirim", className: "bg-cream border border-line text-muted-ink" }
        : { label: "Nomor belum ada", className: "bg-cream border border-line text-faint" };
  }
}

export function ShareGuests({ data }: { data: ShareGuestsData }) {
  // Server-paged guest feed: search runs server-side, more pages stream in as
  // the list scrolls. Stats are wedding-wide aggregates from the server —
  // never derived from the (partial) loaded rows.
  const { rows, query, setQuery, sentinelRef, loading } = useGuestFeed({
    initialRows: data.guests,
    initialCursor: data.nextCursor,
    fetchPage: loadShareGuestRows,
  });
  const { total, sent, opened, confirmed, unsent } = data.stats;

  return (
    <ShareShell active="tamu" expiresAtMs={data.expiresAtMs}>
      <div className="flex items-center gap-[10px] mb-2">
        <FlowerMark size={12} />
        <span className="text-[10px] tracking-[0.28em] uppercase font-semibold text-muted-ink">
          Dashboard Tamu · Akses Keluarga
        </span>
      </div>
      <h1 className="font-display text-[26px] tracking-[-0.02em] leading-[1.15]">
        {data.groomName} <span className="italic font-normal text-burgundy">&</span>{" "}
        {data.brideName}
      </h1>
      <div className="text-[12px] text-muted-ink mt-1">
        Kamu masuk sebagai {data.senderLabel}
      </div>

      {/* The guest sides this token holds. */}
      <div className="flex flex-wrap gap-[6px] mt-3 mb-5">
        {data.sides.map((s) => (
          <span
            key={s}
            className="text-[11px] font-semibold px-3 py-[4px] rounded-full bg-paper border border-line text-charcoal"
          >
            {sideDisplayLabel(s)}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MobileStat v={total} l="Total tamu" tone="cream" />
        <MobileStat v={sent} l="Terkirim" />
        <MobileStat v={opened} l="Dibuka" tone="sage" />
        <MobileStat v={confirmed} l="Konfirmasi hadir" />
      </div>

      {unsent > 0 && (
        <Link
          href="/kirim"
          className="flex items-center gap-3 px-4 py-[13px] rounded-[14px] bg-burgundy text-cream no-underline shadow-[0_6px_16px_-6px_rgba(124,45,45,0.6)] hover:bg-burgundy-deep transition-colors mb-5"
        >
          <Icon name="wa" size={16} />
          <span className="flex-1 text-[13px] font-semibold">
            Kirim undangan ke {unsent} tamu
          </span>
          <Icon name="arrow-r" size={14} />
        </Link>
      )}

      {/* Search */}
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

      {/* Guest list — read-only status; sending lives on the Kirim tab. */}
      {rows.length === 0 ? (
        <div className="bg-paper border border-dashed border-rule rounded-[16px] px-6 py-10 text-center">
          <div className="font-display italic text-[18px]">Tidak ada tamu</div>
          <p className="text-[12px] text-muted-ink mt-1">
            {total === 0
              ? "Belum ada tamu di sisi yang kamu pegang."
              : "Tidak ada yang cocok dengan pencarianmu."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((g, i) => {
            const pill = invitationPill(g);
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
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-[3px] rounded-full",
                      pill.className,
                    )}
                  >
                    {pill.label}
                  </span>
                  {g.status !== "pending" && (
                    <span
                      className={cn(
                        "text-[10px] font-semibold",
                        g.status === "confirmed" ? "text-[#1c5a36]" : "text-muted-ink",
                      )}
                    >
                      {g.status === "confirmed" ? "✓ Hadir" : "Berhalangan"}
                    </span>
                  )}
                </div>
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

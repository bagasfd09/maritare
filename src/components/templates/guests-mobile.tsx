import { MobileShell } from "@/components/templates/mobile-shell";
import {
  MobileButton,
  MobileCard,
  MobileChip,
  MobileChipRow,
  MobileEm,
  MobileSearch,
} from "@/components/molecules/mobile-primitives";
import { Icon } from "@/components/atoms/icon";
import { Avatar, initials } from "@/components/atoms/avatar";
import { GuestStatus } from "@/components/molecules/guest-status";
import { buildInviteMessage, waMeLink } from "@/lib/invite-message";
import { normalizePhoneIntl } from "@/lib/phone";
import type { DashboardChrome, GuestsData } from "@/server/queries/dashboard";

const FILTERS = ["Semua", "Hadir", "Belum", "Tidak"];

const AVATAR_TONES = ["burgundy", "peach", "blush", "dark"] as const;

type GuestsMobileProps = {
  data: GuestsData;
  chrome: DashboardChrome | null;
};

// Screen Mobile 03 · Daftar Tamu. `chrome` is accepted for a consistent page
// contract but MobileShell has no chrome region, so it is intentionally unused.
export function GuestsMobile({ data }: GuestsMobileProps) {
  // Couple names for the prefilled WhatsApp invite (per-row quick-send). The
  // wa.me link is a plain anchor so this stays a server component.
  const groomName = data.chrome?.groomName ?? "";
  const brideName = data.chrome?.brideName ?? "";

  // RSVP summary — dot colors mirror GuestStatus so the card reads as a legend
  // for the list below it.
  const rsvpStats = [
    { v: data.stats.confirmed, label: "Hadir", num: "text-[#1c5a36]", dot: "bg-[#4DD891]" },
    { v: data.stats.pending, label: "Belum", num: "text-[#5a2a18]", dot: "bg-terracotta" },
    { v: data.stats.declined, label: "Tidak", num: "text-burgundy", dot: "bg-burgundy" },
  ];

  return (
    <MobileShell
      active="tamu"
      eyebrow="Daftar Tamu"
      title={
        <>
          Tamu <MobileEm>kamu.</MobileEm>
        </>
      }
    >
      <MobileSearch placeholder="Cari nama tamu…" />

      <MobileChipRow>
        {FILTERS.map((f) => (
          <MobileChip key={f} active={f === "Semua"}>
            {f}
          </MobileChip>
        ))}
      </MobileChipRow>

      {/* One segmented summary card instead of three cramped tiles — each
          stat gets a full third of the width, separated by hairline dividers. */}
      <MobileCard flush>
        <div className="grid grid-cols-3 divide-x divide-line">
          {rsvpStats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-[6px] py-4">
              <div
                className={`font-display font-extrabold [font-variation-settings:'opsz'_144] text-[26px] leading-none tracking-[-0.03em] ${s.num}`}
              >
                {s.v}
              </div>
              <div className="flex items-center gap-[5px] text-[10px] tracking-[0.14em] uppercase font-semibold text-muted-ink">
                <span className={`w-[7px] h-[7px] rounded-full ${s.dot}`} />
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </MobileCard>

      <a
        href="/dashboard/guests/sebar"
        className="inline-flex items-center justify-center gap-2 w-full h-[46px] rounded-full text-cream text-[13px] font-semibold tracking-[0.04em] no-underline shadow-[0_8px_18px_-12px_rgba(31,168,85,0.9)]"
        style={{ background: "#1FA855" }}
      >
        <Icon name="wa" size={16} stroke="#fff" /> Sebar via WhatsApp
      </a>

      {data.guests.length > 0 && (
        <p className="text-[11px] text-muted-ink px-1 -mt-1">
          Atau ketuk ikon WhatsApp di tiap tamu untuk kirim cepat.
        </p>
      )}

      <MobileCard flush>
        {data.guests.length === 0 ? (
          <div className="px-4 py-8 text-center font-display italic text-[14px] text-faint">
            Belum ada tamu. Tambah tamu pertamamu.
          </div>
        ) : (
          data.guests.map((g, i) => {
            // wa.me deep link with the prefilled invite — null when no valid number.
            const target = normalizePhoneIntl(g.phone);
            const waHref = target
              ? waMeLink(
                  target,
                  buildInviteMessage({
                    guestName: g.name,
                    groomName,
                    brideName,
                    slug: data.weddingSlug,
                    guestCode: g.code ?? undefined,
                  }),
                )
              : null;
            return (
              <div
                key={g.id}
                className="flex items-center gap-[10px] px-4 py-[13px] border-b border-line last:border-b-0"
              >
                <Avatar tone={AVATAR_TONES[i % 4]} size={38}>
                  {initials(g.name)}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{g.name}</div>
                  <div className="text-[11px] text-muted-ink truncate">
                    {g.group ?? "—"}
                    {g.phone ? ` · ${g.phone}` : " · tanpa nomor"}
                  </div>
                </div>
                <GuestStatus status={g.status} />
                {waHref ? (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener"
                    aria-label={`Kirim WhatsApp ke ${g.name}`}
                    className="w-9 h-9 rounded-full bg-[#1FA855] inline-flex items-center justify-center shrink-0"
                  >
                    <Icon name="wa" size={15} stroke="#fff" />
                  </a>
                ) : (
                  <span
                    aria-hidden
                    title="Tamu belum punya nomor"
                    className="w-9 h-9 rounded-full bg-cream border border-line inline-flex items-center justify-center shrink-0 opacity-50"
                  >
                    <Icon name="wa" size={15} stroke="var(--color-faint)" />
                  </span>
                )}
              </div>
            );
          })
        )}
      </MobileCard>

      <MobileButton variant="ghost" full>
        <Icon name="plus" size={16} /> Tambah tamu
      </MobileButton>
    </MobileShell>
  );
}

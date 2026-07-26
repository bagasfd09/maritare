import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import { GuestbookCounter } from "@/components/molecules/guestbook-primitives";
import type { KioskSync } from "@/lib/kiosk-queue";
import { endPetugasSession } from "@/server/actions/petugas";
import type { KioskHeader } from "@/server/queries/guestbook";

type GuestbookShellProps = {
  eyebrow?: string;
  // Live header from the session-owned wedding. When omitted / null the shell
  // falls back to the hardcoded prototype mock (Andi & Putri · 142 / 280) so
  // the design degrades gracefully before any data resolves.
  header?: KioskHeader | null;
  // Offline/queue state from the flow. The chip only renders when something
  // needs the operator's awareness (offline, or check-ins waiting to sync).
  sync?: KioskSync | null;
  children: React.ReactNode;
};

// Chip colors per surface: "light" sits on the cream shell header; "dark"
// sits on the idle screen's burgundy gradient (the light variants are
// unreadable there — sage-on-burgundy is ~1:1 contrast).
const CHIP_COLORS = {
  light: {
    syncing: "bg-[rgba(124,126,94,0.16)] text-[#4a4c34]",
    syncingDot: "bg-[#4a4c34]",
    offline: "bg-burgundy text-cream",
    offlineDot: "bg-peach",
  },
  dark: {
    syncing: "bg-[rgba(245,239,230,0.16)] text-cream",
    syncingDot: "bg-cream",
    offline: "bg-cream text-burgundy-dark",
    offlineDot: "bg-burgundy",
  },
} as const;

/** "Offline · 3 tersimpan" / "Menyinkronkan 3…" chip — quiet when all is well. */
export function KioskSyncChip({
  sync,
  tone = "light",
}: {
  sync?: KioskSync | null;
  tone?: keyof typeof CHIP_COLORS;
}) {
  if (!sync || (sync.online && sync.queued === 0)) return null;
  const colors = CHIP_COLORS[tone];
  const base =
    "inline-flex items-center gap-2 rounded-full py-[7px] px-[13px] font-body text-[9.5px] tracking-[0.18em] uppercase font-bold whitespace-nowrap";
  return (
    <div className={`${base} ${sync.online ? colors.syncing : colors.offline}`}>
      <span
        className={`w-[7px] h-[7px] rounded-full animate-dot-pulse ${
          sync.online ? colors.syncingDot : colors.offlineDot
        }`}
      />
      {sync.online
        ? `Menyinkronkan ${sync.queued}…`
        : sync.queued > 0
          ? `Offline · ${sync.queued} tersimpan`
          : "Offline · check-in tetap jalan"}
    </div>
  );
}

// Kiosk shell — cream stage with the brand header (couple, date, attendant,
// live counter). The design is a 1280×800 tablet-landscape app: it fills the
// viewport and falls back to scrolling below the native size so the layout
// never squishes. The attendant ("Penjaga") shows the signed-in token's label
// from the live header, falling back to a neutral "Petugas" label.
export function GuestbookShell({ eyebrow = "Buku Tamu · Resepsi", header, sync, children }: GuestbookShellProps) {
  // Couple, date·venue, and the HADIR counter derive from the live header when
  // present; otherwise the hardcoded mock renders EXACTLY as before.
  const groomName = header?.groomName ?? "Andi";
  const brideName = header?.brideName ?? "Putri";

  // Date · venue line from the real labels. When a real wedding has no date/venue
  // set yet, show nothing (never a fake date). The prototype string renders only
  // when there is NO header at all (preview/no-session degradation).
  const contextLine = header
    ? [header.dateLabel, header.venueLabel].filter(Boolean).join(" · ")
    : "Sabtu · 14 Juni 2026 · Pendopo Kayon";

  // Attendant ("Penjaga") — the label of the token signed in on this device.
  // Falls back to a neutral generic label when no header was supplied at all.
  const attendantName = header?.attendantName ?? "Petugas";

  return (
    <div className="w-full h-screen min-w-[1280px] min-h-[800px] bg-cream text-charcoal font-body relative overflow-hidden flex flex-col">
      {/* Ambient floral watermarks — slow-rotating, very faint, behind content
          so the kiosk screens read warm rather than blank. Purely decorative. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute right-[-160px] bottom-[-190px] animate-gb-spin-slow">
          <FlowerMark size={420} color="rgba(124,45,45,0.04)" core="rgba(124,45,45,0.04)" stamen="transparent" />
        </div>
        <div className="absolute left-[-170px] top-[70px] animate-gb-spin-slow [animation-direction:reverse] [animation-duration:160s]">
          <FlowerMark size={300} color="rgba(176,74,58,0.035)" core="rgba(176,74,58,0.035)" stamen="transparent" />
        </div>
      </div>

      <header className="relative z-10 flex items-center justify-between px-11 py-5 border-b border-beige shrink-0 gap-6">
        <div className="flex items-center gap-[14px]">
          <FlowerMark size={26} color="var(--color-terracotta)" core="var(--color-burgundy)" stamen="var(--color-peach)" />
          <div>
            <div className="font-body text-[9.5px] tracking-[0.28em] uppercase font-semibold text-muted-ink">
              {eyebrow}
            </div>
            <div className="font-display font-bold text-[21px] tracking-[-0.025em] text-charcoal leading-[1.1] mt-[2px]">
              {groomName} <span className="font-display italic font-normal tracking-[-0.01em] text-terracotta">&amp;</span> {brideName}
            </div>
          </div>
        </div>
        <div className="font-body text-[11px] tracking-[0.2em] uppercase font-semibold text-faint">
          {contextLine}
        </div>
        <div className="flex items-center gap-[18px]">
          <KioskSyncChip sync={sync} />
          <div className="text-right">
            <div className="font-body text-[9px] tracking-[0.26em] uppercase font-semibold text-faint">Penjaga</div>
            <div className="font-body font-semibold text-[13.5px] text-charcoal mt-[2px]">{attendantName}</div>
          </div>
          {/* Attendant logout — ends the token session on this device. The kiosk
              is always a token session, so this shows whenever a header resolved. */}
          {header?.viaToken && (
            <form action={endPetugasSession} className="contents">
              <button
                type="submit"
                title="Keluar petugas"
                className="w-8 h-8 rounded-full inline-flex items-center justify-center shrink-0 text-muted-ink hover:bg-burgundy hover:text-cream transition-colors cursor-pointer"
              >
                <Icon name="logout" size={15} />
              </button>
            </form>
          )}
          <span className="w-px h-[30px] bg-beige" />
          {header ? (
            <GuestbookCounter now={header.stats.checkedIn} total={header.stats.invited} />
          ) : (
            <GuestbookCounter />
          )}
        </div>
      </header>
      {/* Every kiosk screen enters with the prototype's view-fade. */}
      <div className="flex-1 min-h-0 relative z-10 animate-gb-fade-up">{children}</div>
    </div>
  );
}

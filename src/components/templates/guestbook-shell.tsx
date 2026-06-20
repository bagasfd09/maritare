import { FlowerMark } from "@/components/atoms/flower-mark";
import { Icon } from "@/components/atoms/icon";
import { GuestbookCounter } from "@/components/molecules/guestbook-primitives";
import { endPetugasSession } from "@/server/actions/petugas";
import type { KioskHeader } from "@/server/queries/guestbook";

type GuestbookShellProps = {
  eyebrow?: string;
  // Live header from the session-owned wedding. When omitted / null the shell
  // falls back to the hardcoded prototype mock (Andi & Putri · 142 / 280) so
  // the design degrades gracefully before any data resolves.
  header?: KioskHeader | null;
  children: React.ReactNode;
};

// Kiosk shell — cream stage with the brand header (couple, date, attendant,
// live counter). The design is a 1280×800 tablet-landscape app: it fills the
// viewport and falls back to scrolling below the native size so the layout
// never squishes. The attendant ("Penjaga") shows the signed-in token's label
// from the live header, falling back to a neutral "Petugas" label.
export function GuestbookShell({ eyebrow = "Buku Tamu · Resepsi", header, children }: GuestbookShellProps) {
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

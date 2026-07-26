import Link from "next/link";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Avatar, initials } from "@/components/atoms/avatar";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { GuestbookShell } from "@/components/templates/guestbook-shell";
import type { KioskGuest, KioskHeader } from "@/server/queries/guestbook";
import { cn } from "@/lib/utils";

// Guestbook 08 · Panel Penjaga — attendant/staff overview during the event.
// Ported from `Gb2_Attendant`; the stat cards (incl. the "per 15 menit"
// throughput, counted live in the data layer) and the recent check-in feed are
// all wired to live data (header stats + checked-in guests). When no data
// resolves the whole panel falls back to the prototype sample so the design
// never renders empty.

// Couple fallback when no live header (matches the prototype t = {Andi, Putri}).
const FALLBACK_COUPLE = { groom: "Andi", bride: "Putri" };

type AvatarTone = "sage" | "peach" | "blush" | "burgundy" | "dark";

// Deterministic tone rotation so each guest gets a stable, varied avatar color.
const TONE_CYCLE: AvatarTone[] = ["burgundy", "sage", "peach", "blush", "dark"];

type RecentRow = {
  key: string;
  name: string;
  group: string;
  count: number;
  time: string;
  tone: AvatarTone;
  walkin: boolean;
};

// ── Prototype sample feed (rendered only when no live data resolves) ──
const SAMPLE_RECENT: RecentRow[] = [
  { key: "s1", name: "Reza Hartono", group: "Keluarga Andi", count: 4, time: "12 detik lalu", tone: "burgundy", walkin: false },
  { key: "s2", name: "Sari & Iqbal", group: "Sahabat Pasangan", count: 2, time: "1 menit lalu", tone: "sage", walkin: false },
  { key: "s3", name: "Tante Dewi", group: "Keluarga Putri", count: 3, time: "3 menit lalu", tone: "peach", walkin: false },
  { key: "s4", name: "Bayu Pratama", group: "Teman SMA Andi", count: 1, time: "5 menit lalu", tone: "blush", walkin: false },
  { key: "s5", name: "Pak Sutrisno", group: "Walk-in", count: 2, time: "7 menit lalu", tone: "dark", walkin: true },
  { key: "s6", name: "Tiara Maharani", group: "Teman Kuliah Putri", count: 2, time: "12 menit lalu", tone: "sage", walkin: false },
];

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;
const fallbackDateFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

// Relative time in Bahasa (mirrors the wishes feed helper): "Baru saja",
// "x detik lalu", "x menit lalu", "x jam lalu", "x hari lalu", else short date.
function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 10_000) {
    return "Baru saja";
  }
  if (diff < MINUTE) {
    return `${Math.floor(diff / 1000)} detik lalu`;
  }
  if (diff < HOUR) {
    return `${Math.floor(diff / MINUTE)} menit lalu`;
  }
  if (diff < DAY) {
    return `${Math.floor(diff / HOUR)} jam lalu`;
  }
  const days = Math.floor(diff / DAY);
  if (days === 1) {
    return "Kemarin";
  }
  if (days <= 7) {
    return `${days} hari lalu`;
  }
  return fallbackDateFmt.format(date);
}

type AttendantAction = {
  icon: IconName;
  label: string;
  sub: string;
  href: string;
};

// gb2Eyebrow base (size applied per usage).
const eyebrow = "font-body tracking-[0.24em] uppercase font-semibold text-muted-ink";
// num(size, color) — gb2Display at opsz 144 (size/color applied per usage).
const num = "font-display [font-variation-settings:'opsz'_144] font-extrabold tracking-[-0.04em] leading-[0.9] m-0";

type GuestbookAttendantProps = {
  header?: KioskHeader | null;
  guests?: KioskGuest[] | null;
};

export function GuestbookAttendant({ header, guests }: GuestbookAttendantProps) {
  const groomName = header?.groomName ?? FALLBACK_COUPLE.groom;
  const brideName = header?.brideName ?? FALLBACK_COUPLE.bride;

  // Live stats when a header resolved, else the prototype numbers.
  const checkedIn = header?.stats.checkedIn ?? 142;
  const invited = header?.stats.invited ?? 280;
  const walkIns = header?.stats.walkIns ?? 12;
  // Real throughput: guests checked in within the last 15 minutes. Falls back
  // to the prototype number only when no header resolved (mock mode).
  const throughput = header?.stats.lastFifteenMin ?? 18;
  const pct = invited > 0 ? Math.round((checkedIn / invited) * 100) : 0;

  // Latest check-ins: only guests with a timestamp, newest first, top 6.
  const live = guests
    ? guests
        .filter((g): g is KioskGuest & { checkedInAt: Date } => g.checkedInAt != null)
        .sort((a, b) => b.checkedInAt.getTime() - a.checkedInAt.getTime())
        .slice(0, 6)
        .map<RecentRow>((g, i) => ({
          key: g.id,
          name: g.name,
          group: g.group ?? (g.isWalkIn ? "Walk-in" : "Tamu"),
          count: g.checkedInPartySize ?? g.partySize ?? 1,
          time: relativeTime(g.checkedInAt),
          tone: TONE_CYCLE[i % TONE_CYCLE.length],
          walkin: g.isWalkIn,
        }))
    : null;

  // null guests → prototype sample; resolved (possibly empty) → live list.
  const recent = live ?? SAMPLE_RECENT;

  const ACTIONS: AttendantAction[] = [
    { icon: "search", label: "Cari tamu di daftar", sub: `Status semua ${invited} tamu`, href: "/guestbook?v=search" },
    { icon: "plus", label: "Tambah walk-in manual", sub: "Tamu yang belum terdaftar", href: "/guestbook?v=notfound" },
    { icon: "download", label: "Export check-in CSV", sub: "Kirim ke email pasangan", href: "#" },
    { icon: "settings", label: "Pengaturan kiosk", sub: "Auto-lock, bahasa, layar", href: "#" },
  ];

  return (
    <GuestbookShell eyebrow="Buku Tamu · Panel Penjaga" header={header}>
      <div className="h-full grid grid-cols-[1.3fr_1fr] gap-[22px] px-12 pt-[22px] pb-[26px]">
        {/* Left: stats + recent */}
        <div className="flex flex-col gap-[14px] min-h-0">
          <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-3">
            <div className="bg-charcoal text-cream rounded-2xl px-[18px] py-4">
              <div className={cn(eyebrow, "text-[9px] text-peach")}>Tamu hadir</div>
              <div className="flex items-baseline gap-[6px] mt-[10px]">
                <span className={cn(num, "text-[38px] text-cream tabular-nums")}>{checkedIn}</span>
                <span className="font-display font-normal text-[17px] text-cream/50">/ {invited}</span>
              </div>
              <div className="h-1 bg-cream/[0.18] rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-peach" style={{ width: `${pct}%` }} />
              </div>
              <div className="font-body text-[11.5px] leading-[1.6] text-cream/60 mt-2">{pct}% sudah check-in</div>
            </div>
            <div className="bg-paper border border-line rounded-2xl px-[18px] py-4">
              <div className={cn(eyebrow, "text-[9px]")}>Walk-in baru</div>
              <div className={cn(num, "text-[38px] text-burgundy mt-[10px] tabular-nums")}>{walkIns}</div>
              <div className="font-body text-[11.5px] leading-[1.6] text-faint mt-[10px]">tamu tak terdaftar</div>
            </div>
            {/* Throughput: real count of guests checked in within the last 15
                minutes (from the live header). */}
            <div className="bg-paper border border-line rounded-2xl px-[18px] py-4">
              <div className={cn(eyebrow, "text-[9px]")}>Per 15 menit</div>
              <div className={cn(num, "text-[38px] text-charcoal mt-[10px] tabular-nums")}>{throughput}</div>
              <div className="font-body text-[11.5px] leading-[1.6] text-faint mt-[10px]">tamu check-in</div>
            </div>
          </div>

          {/* Recent check-ins */}
          <div className="bg-paper border border-line rounded-2xl flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="px-5 pt-[14px] pb-3 border-b border-line flex items-center justify-between">
              <div className="font-display font-semibold text-[17px] tracking-[-0.015em] text-charcoal">
                Check-in terakhir
              </div>
              <a href="#" className={cn(eyebrow, "text-[9.5px] text-burgundy font-bold no-underline")}>
                Lihat semua →
              </a>
            </div>
            {recent.length > 0 ? (
              <ul className="list-none p-0 m-0 flex-1 overflow-hidden">
                {recent.map((r) => (
                  <li
                    key={r.key}
                    className="flex items-center gap-[13px] px-5 py-[9px] border-b border-charcoal/5 last:border-b-0"
                  >
                    <Avatar tone={r.tone} size={34}>
                      {initials(r.name)}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-body font-semibold text-[14.5px] text-charcoal">{r.name}</span>
                        {r.walkin && (
                          <span className="font-body font-bold text-[8.5px] tracking-[0.16em] uppercase text-burgundy-dark bg-peach px-2 py-[2px] rounded-full">
                            Walk-in
                          </span>
                        )}
                      </div>
                      <div className={cn(eyebrow, "text-[9px] tracking-[0.14em] text-faint mt-[2px]")}>
                        {r.group} · {r.count} orang
                      </div>
                    </div>
                    <div className="font-body text-[12px] leading-[1.6] text-faint shrink-0">{r.time}</div>
                    <button className="w-[30px] h-[30px] rounded-full border border-charcoal/[0.15] bg-transparent text-muted-ink cursor-pointer flex items-center justify-center shrink-0">
                      <Icon name="more" size={11} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-2">
                <span className="w-12 h-12 rounded-full bg-cream border border-line inline-flex items-center justify-center">
                  <Icon name="users" size={20} stroke="var(--color-faint)" />
                </span>
                <div className="font-display font-semibold text-[16px] tracking-[-0.015em] text-charcoal mt-1">
                  Belum ada check-in
                </div>
                <div className="font-body text-[12.5px] leading-[1.55] text-faint max-w-[280px]">
                  Tamu yang sudah check-in akan muncul di sini secara real-time.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <aside className="flex flex-col gap-3 min-h-0">
          <Link
            href="/guestbook"
            className="bg-burgundy text-cream px-[22px] py-5 rounded-[18px] cursor-pointer flex items-center gap-[14px] text-left no-underline shadow-[0_18px_32px_-16px_rgba(124,45,45,0.55)]"
          >
            <div className="w-[46px] h-[46px] rounded-full bg-cream/[0.16] flex items-center justify-center shrink-0">
              <Icon name="plus" size={20} className="text-peach" />
            </div>
            <div className="flex-1">
              <div className="font-display font-semibold text-[19px] tracking-[-0.02em] text-cream leading-[1.1]">
                Mulai check-in tamu
              </div>
              <div className={cn(eyebrow, "text-[9px] text-cream/[0.65] mt-[5px]")}>Kembali ke layar utama</div>
            </div>
            <Icon name="arrow-r" size={18} className="text-cream" />
          </Link>

          <div className="bg-paper border border-line rounded-2xl px-1.5 py-2">
            {ACTIONS.map((a) =>
              a.href === "#" ? (
                <a
                  key={a.label}
                  href="#"
                  className="flex items-center gap-3 px-[14px] py-[10px] border-b border-charcoal/5 last:border-b-0 no-underline"
                >
                  <AttendantActionBody action={a} />
                </a>
              ) : (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-center gap-3 px-[14px] py-[10px] border-b border-charcoal/5 last:border-b-0 no-underline"
                >
                  <AttendantActionBody action={a} />
                </Link>
              ),
            )}
          </div>

          <div className="bg-charcoal text-cream rounded-2xl px-[18px] py-4 flex-1 min-h-0 relative overflow-hidden">
            <div className="absolute -top-10 -right-12 pointer-events-none">
              <FlowerMark size={170} color="rgba(234,211,194,0.07)" core="rgba(234,211,194,0.07)" stamen="transparent" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-[10px] mb-[10px]">
                <span className="w-2 h-2 rounded-full bg-[#4DD891] animate-dot-pulse" />
                <span className={cn(eyebrow, "text-[9.5px] text-peach")}>Sinkron live</span>
              </div>
              <div className="font-body text-[14px] leading-[1.55] text-cream/[0.85]">
                Data check-in tersinkron real-time ke dashboard pasangan. {groomName} &amp; {brideName} bisa
                lihat siapa yang sudah hadir dari ponsel.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </GuestbookShell>
  );
}

// Shared inner layout for the quick-action rows (real route vs. placeholder).
function AttendantActionBody({ action }: { action: AttendantAction }) {
  return (
    <>
      <div className="w-[34px] h-[34px] rounded-[10px] bg-cream text-charcoal flex items-center justify-center shrink-0">
        <Icon name={action.icon} size={14} />
      </div>
      <div className="flex-1">
        <div className="font-body font-semibold text-[13.5px] text-charcoal leading-[1.2]">{action.label}</div>
        <div className="font-body text-[11.5px] leading-[1.3] text-faint mt-[2px]">{action.sub}</div>
      </div>
      <Icon name="chevron-r" size={13} className="text-faint" />
    </>
  );
}

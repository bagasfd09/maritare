// Relative-time formatting in Bahasa Indonesia (informal), for activity feeds
// and "X waktu lalu" labels. Computed at request time (server) — fine for SSR.

const shortDateFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });

const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

/**
 * "baru saja" / "5 mnt lalu" / "3 jam lalu" / "kemarin" / "4 hari lalu" /
 * "14 Jun" — a complete phrase, used as-is by callers (no extra suffix).
 */
export function relativeTimeId(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < MIN) return "baru saja";
  if (diff < HOUR) return `${Math.floor(diff / MIN)} mnt lalu`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} jam lalu`;
  const days = Math.floor(diff / DAY);
  if (days === 1) return "kemarin";
  if (days < 7) return `${days} hari lalu`;
  return shortDateFmt.format(date);
}

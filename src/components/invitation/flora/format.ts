// Small Bahasa Indonesia date/time formatters for the Flora template.
// date-fns + id locale keep server and client output identical (hydration-safe).

import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

/** "2026-06-13" → "Sabtu, 13 Juni 2026" */
export function formatFullDateId(date: string): string {
  return format(parseISO(date), "EEEE, dd MMMM yyyy", { locale: id });
}

/** "2026-06-13" → "13 Juni 2026" */
export function formatLongDateId(date: string): string {
  return format(parseISO(date), "dd MMMM yyyy", { locale: id });
}

/** ISO timestamp → "13 Jun 2026" */
export function formatShortDateId(iso: string): string {
  return format(new Date(iso), "dd MMM yyyy", { locale: id });
}

/** ("08:00", "10:00") → "08.00 – 10.00 WIB"; no end → "08.00 WIB – selesai" */
export function formatTimeRangeId(timeStart: string, timeEnd?: string): string {
  const start = timeStart.replace(":", ".");
  if (!timeEnd) {
    return `${start} WIB – selesai`;
  }
  return `${start} – ${timeEnd.replace(":", ".")} WIB`;
}

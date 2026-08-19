// Small Bahasa Indonesia date/time formatters, shared by every template
// (crimson/folk re-export this module; ivory/onyx/plum import it directly).
// date-fns + id locale keep server and client output identical (hydration-safe).
//
// EVERY function here tolerates a blank or unparseable value and returns "".
// That is not politeness — it is what keeps the editor alive. The editor's live
// preview renders the draft on every keystroke, and a half-filled event row
// (the normal state right after "Tambah acara") carries `date: ""`. date-fns
// `format()` THROWS `RangeError: Invalid time value` on an invalid date, which
// is an uncaught render error: the whole preview tree unmounts behind the Next
// error overlay and the section looks like it disappeared. Guarding here fixes
// it for all callers at once — most of them (crimson/flora/scarlet events and
// heroes, onyx agenda + countdown) call these bare.

import { format, isValid, parseISO } from "date-fns";
import { id } from "date-fns/locale";

/** "2026-06-13" → "Sabtu, 13 Juni 2026"; blank/invalid → "" */
export function formatFullDateId(date: string): string {
  const d = parseISO(date ?? "");
  return isValid(d) ? format(d, "EEEE, dd MMMM yyyy", { locale: id }) : "";
}

/** "2026-06-13" → "13 Juni 2026"; blank/invalid → "" */
export function formatLongDateId(date: string): string {
  const d = parseISO(date ?? "");
  return isValid(d) ? format(d, "dd MMMM yyyy", { locale: id }) : "";
}

/** ISO timestamp → "13 Jun 2026"; blank/invalid → "" */
export function formatShortDateId(iso: string): string {
  const d = new Date(iso ?? "");
  return isValid(d) ? format(d, "dd MMM yyyy", { locale: id }) : "";
}

/** ("08:00", "10:00") → "08.00 – 10.00 WIB"; no end → "08.00 WIB – selesai";
 *  no start → "" (an unfinished row must not render a bare " WIB – selesai"). */
export function formatTimeRangeId(timeStart: string, timeEnd?: string): string {
  const start = (timeStart ?? "").trim().replace(":", ".");
  if (!start) {
    return "";
  }
  if (!timeEnd) {
    return `${start} WIB – selesai`;
  }
  return `${start} – ${timeEnd.replace(":", ".")} WIB`;
}

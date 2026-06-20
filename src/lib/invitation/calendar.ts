// Pure Google Calendar deep-link builder for invitation events.
//
// Times are sent as floating wall-clock values pinned to Asia/Jakarta via the
// `ctz` parameter, so the link is correct no matter where the server or the
// guest's browser lives.

import { addDays, addHours, format } from "date-fns";

export type GoogleCalendarEventInput = {
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM (24h) */
  timeStart: string;
  /** HH:MM (24h) — absent → start + 2 hours */
  timeEnd?: string;
  venue?: string;
  address?: string;
};

const GCAL_STAMP = "yyyyMMdd'T'HHmmss";

export function buildGoogleCalendarUrl(input: GoogleCalendarEventInput): string {
  // Parsed as local time; only the wall-clock components are formatted back,
  // so the server timezone never leaks into the result.
  const start = new Date(`${input.date}T${input.timeStart}:00`);
  let end = input.timeEnd
    ? new Date(`${input.date}T${input.timeEnd}:00`)
    : addHours(start, 2);
  // An end before the start means the event crosses midnight.
  if (end <= start) {
    end = addDays(end, 1);
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${format(start, GCAL_STAMP)}/${format(end, GCAL_STAMP)}`,
    ctz: "Asia/Jakarta",
  });

  const location = [input.venue, input.address].filter(Boolean).join(", ");
  if (location) {
    params.set("location", location);
  }

  const details = input.venue ? `${input.title} — ${input.venue}` : input.title;
  params.set("details", details);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

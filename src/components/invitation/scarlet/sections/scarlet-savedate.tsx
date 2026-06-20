"use client";
/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */

// Scarlet save-the-date â€” ported VERBATIM from <section.save-date-wrap> in
// scarlet-body.ts. Decorative ornament markup is kept byte-for-byte; only the
// countdown numbers and the "Add to Calendar" link are data-bound.
//
// The live countdown targets the first acara event (date + timeStart), falling
// back to data.eventDate. The remaining time is only computed in a client effect
// after mount â€” the server (and first client) render shows "â€”" placeholders, so
// there is never a hydration mismatch (same pattern as flora-countdown).

import { useEffect, useState } from "react";

import { buildGoogleCalendarUrl } from "@/lib/invitation/calendar";

import type { InvitationView } from "@/server/queries/invitation";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function computeRemaining(target: number): Remaining | "passed" {
  const diff = target - Date.now();
  if (diff <= 0) return "passed";
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
}

export function ScarletSaveDate({ data }: Props) {
  const event = data.sections.acara.events[0];
  // Guard incomplete draft rows: the editor preview feeds in-progress events with
  // empty date/timeStart; `new Date("T:00")` / parseISO("") throw or yield NaN.
  const targetIso =
    event && event.date && event.timeStart
      ? `${event.date}T${event.timeStart}:00`
      : data.eventDate
        ? `${data.eventDate}T00:00:00`
        : null;

  // null = not mounted yet â†’ "â€”" placeholders.
  const [remaining, setRemaining] = useState<Remaining | "passed" | null>(null);

  useEffect(() => {
    if (!targetIso) return;
    const target = new Date(targetIso).getTime();
    const tick = () => setRemaining(computeRemaining(target));
    // First tick deferred a frame so the effect body stays setState-free
    // (placeholders render for one paint at most).
    const initial = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [targetIso]);

  const live = remaining && remaining !== "passed" ? remaining : null;
  const day = live ? live.days : "â€”";
  const hour = live ? live.hours : "â€”";
  const minute = live ? live.minutes : "â€”";
  const second = live ? live.seconds : "â€”";

  const calendarUrl =
    event && event.date && event.timeStart
      ? buildGoogleCalendarUrl({
          title: event.name,
          date: event.date,
          timeStart: event.timeStart,
          timeEnd: event.timeEnd,
          venue: event.venue,
          address: event.address,
        })
      : null;

  return (
    <section className="save-date-wrap">
      <div className="ornaments-wrapper">
        <div className="orn-sd-bg">
          <div className="image-wrap" data-aos="zoom-out" data-aos-duration="1200" data-aos-delay="500">
            <img loading="lazy" decoding="async" src="/invitation/scarlet/bg-sd.webp" alt="" />
          </div>
        </div>
      </div>
      <div className="save-date-head">
        <h1 className="save-date-title" data-aos="zoom-in" data-aos-duration="1000">
          Time is Knocking at the door
        </h1>
      </div>

      <div className="save-date-frame">
        <div className="ornaments-wrapper">
          <div className="orn-sd-5">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="500">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-36.webp" alt="" />
            </div>
          </div>
        </div>

        <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000">
          <img loading="lazy" decoding="async" src="/invitation/scarlet/frame-sd.webp" alt="" />
        </div>

        <div className="ornaments-wrapper">
          <div className="orn-sd-4">
            <div className="orn-sd-4-1">
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="500">
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-35.webp" alt="" />
              </div>
            </div>
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="500">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-34.webp" alt="" />
            </div>
          </div>
          <div className="orn-sd-3">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="500">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-14.webp" alt="" />
            </div>
          </div>
          <div className="orn-sd-2">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="500">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-33.webp" alt="" />
            </div>
          </div>
          <div className="orn-sd-1">
            <div className="orn-sd-1-1">
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="500">
                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-11.webp" alt="" />
              </div>
            </div>
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="500">
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-32.webp" alt="" />
            </div>
          </div>
        </div>

        <div className="save-date">
          <div className="save-date-body">
            <div className="countdown">
              <div className="count-item" data-aos="fade-down-right" data-aos-duration="1200" data-aos-delay="100">
                <h2 className="count-num count-day">{day}</h2>
                <small className="count-text">Days</small>
              </div>
              <div className="count-item" data-aos="fade-down-left" data-aos-duration="1200" data-aos-delay="300">
                <h2 className="count-num count-hour">{hour}</h2>
                <small className="count-text">Hours</small>
              </div>
              <div className="count-item" data-aos="fade-up-right" data-aos-duration="1200" data-aos-delay="500">
                <h2 className="count-num count-minute">{minute}</h2>
                <small className="count-text">Minutes</small>
              </div>
              <div className="count-item" data-aos="fade-up-left" data-aos-duration="1200" data-aos-delay="700">
                <h2 className="count-num count-second">{second}</h2>
                <small className="count-text">Seconds</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      {calendarUrl && (
        <div className="add-to-calendar-wrap" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="1100">
          <a
            className="add-to-calendar"
            href={calendarUrl}
            target="_blank"
            rel="nofollow noopener noreferrer"
            id="addToCalendar"
          >
            Add to Calendar
          </a>
        </div>
      )}
    </section>
  );
}

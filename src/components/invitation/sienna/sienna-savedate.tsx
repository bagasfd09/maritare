"use client";
/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */

// Sienna save-the-date — verbatim Syakira port of <section.save-date-wrap data-section-order="save_the_date">.
// Decorative ornament markup is kept byte-for-byte; only the formatted event date,
// the live countdown numbers, and the "Add to Calendar" link are data-bound to
// InvitationView.
//
// The countdown targets the first acara event (date + timeStart) and falls back to
// data.eventDate at midnight. It is initialized to 0 and only recomputed in a client
// effect after mount, so the server and first client render agree (no hydration
// mismatch). The target is parsed as a LOCAL wall-clock date.

import { useEffect, useState } from "react";

import { buildGoogleCalendarUrl } from "@/lib/invitation/calendar";

import { formatLongDateId } from "../flora/format";

import type { InvitationView } from "@/server/queries/invitation";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

export function SiennaSaveDate({ data }: Props) {
  const event = data.sections.acara.events[0];
  // Guard incomplete draft rows: the editor preview may feed in-progress events
  // with an empty date; fall back to the wedding's eventDate (midnight) in that case.
  const dateStr = event?.date || data.eventDate;
  const targetIso = dateStr ? `${dateStr}T${event?.timeStart || "00:00"}:00` : null;

  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!targetIso) return;
    const target = new Date(targetIso).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor(diff / 3600000) % 24,
        m: Math.floor(diff / 60000) % 60,
        s: Math.floor(diff / 1000) % 60,
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

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
    <section className="save-date-wrap" data-section-order="save_the_date">
      <div className="save-date" data-aos="zoom-out" data-aos-duration="1200">
        <div className="save-date-head">
          <h1 className="save-date-title" data-aos="zoom-in" data-aos-duration="1000">
            Save The Date
          </h1>
        </div>

        <div className="save-date-body">
          <div className="ornaments-wrapper">
            <div className="orn-1-left">
              <div className="image-wrap" data-aos="fade-up-left" data-aos-duration="1200">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/invitation/sienna/orn-save-date-1.png"
                  alt="Orn 1"
                />
              </div>
            </div>
            <div className="orn-1-right">
              <div className="image-wrap" data-aos="fade-up-left" data-aos-duration="1200">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/invitation/sienna/orn-save-date-1.png"
                  alt="Orn 1"
                />
              </div>
            </div>
          </div>

          <div
            className="save-date-box"
            data-aos="zoom-out"
            data-aos-duration="1200"
            data-aos-delay="200"
          >
            <p
              className="save-date-event"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="300"
            >
              {dateStr ? formatLongDateId(dateStr) : null}
            </p>

            <div className="countdown">
              <div
                className="count-item"
                data-aos="fade-up"
                data-aos-duration="1200"
                data-aos-delay="100"
              >
                <h2 className="count-num count-day">{time.d}</h2>
                <small className="count-text">Days</small>
              </div>
              <div
                className="count-item"
                data-aos="fade-up"
                data-aos-duration="1200"
                data-aos-delay="300"
              >
                <h2 className="count-num count-hour">{time.h}</h2>
                <small className="count-text">Hours</small>
              </div>
              <div
                className="count-item"
                data-aos="fade-up"
                data-aos-duration="1200"
                data-aos-delay="500"
              >
                <h2 className="count-num count-minute">{time.m}</h2>
                <small className="count-text">Minutes</small>
              </div>
              <div
                className="count-item"
                data-aos="fade-up"
                data-aos-duration="1200"
                data-aos-delay="700"
              >
                <h2 className="count-num count-second">{time.s}</h2>
                <small className="count-text">Seconds</small>
              </div>
            </div>

            {calendarUrl && (
              <div
                className="add-to-calendar-wrap"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="800"
              >
                <a
                  className="add-to-calendar"
                  href={calendarUrl}
                  target="_blank"
                  rel="nofollow"
                  id="addToCalendar"
                >
                  Add to Calendar
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

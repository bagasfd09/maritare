"use client";
/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */

// Plum save-the-date — verbatim Kinanti port of <section.save-date-wrap data-section-order="save_the_date">.
// Decorative ornament markup is kept byte-for-byte; only the formatted event date,
// the live countdown numbers, and the "Tambah ke Kalender" link are data-bound to
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

export function PlumSaveDate({ data }: Props) {
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
      <div className="save-date-inner">
        <div className="orn-filter--top tc-1">
          <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
            <img
              loading="lazy"
              decoding="async"
              src="/invitation/plum/orn-25-min.png"
              alt="Ornament"
            />
          </div>
        </div>

        <div className="save-date-head">
          <h1 className="save-date-title" data-aos="zoom-in" data-aos-duration="1000">
            Hari Yang Ditunggu
          </h1>
          <p className="save-date-event" data-aos="fade-up" data-aos-duration="1000">
            {dateStr ? formatLongDateId(dateStr) : null}
          </p>
        </div>

        <div className="save-date-frame">
          <div className="ornaments-wrapper">
            {/* CENTER */}
            <div className="orn-savedate--top tc-1">
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="100">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/invitation/plum/orn-29-min.png"
                  alt="Ornament"
                />
              </div>
            </div>

            <div className="orn-savedate--top tl-1">
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="200">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/invitation/plum/orn-35-min.png"
                  alt="Ornament"
                />
              </div>
            </div>
            <div className="orn-savedate--top tr-1">
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="300">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/invitation/plum/orn-35-min.png"
                  alt="Ornament"
                />
              </div>
            </div>
          </div>
          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="400">
            <img
              loading="lazy"
              decoding="async"
              src="/invitation/plum/orn-frame-3-min.png"
              alt="Ornament"
            />
          </div>

          <div className="ornaments-wrapper">
            <div className="orn-savedate--bottom bl-1">
              <div className="orn-savedate--bottom bl-4">
                <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="100">
                  <img
                    loading="lazy"
                    decoding="async"
                    src="/invitation/plum/orn-2-min.png"
                    alt="Ornament"
                  />
                </div>
              </div>
              <div className="orn-savedate--bottom bl-3">
                <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="200">
                  <img
                    loading="lazy"
                    decoding="async"
                    src="/invitation/plum/orn-3-min.png"
                    alt="Ornament"
                  />
                </div>
              </div>
              <div className="orn-savedate--bottom bl-2">
                <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="300">
                  <img
                    loading="lazy"
                    decoding="async"
                    src="/invitation/plum/orn-4-min.png"
                    alt="Ornament"
                  />
                </div>
              </div>
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="400">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/invitation/plum/orn-12-min.png"
                  alt="Ornament"
                />
              </div>
            </div>

            <div className="orn-savedate--bottom br-1">
              <div className="orn-savedate--bottom bl-4">
                <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="100">
                  <img
                    loading="lazy"
                    decoding="async"
                    src="/invitation/plum/orn-2-min.png"
                    alt="Ornament"
                  />
                </div>
              </div>
              <div className="orn-savedate--bottom bl-3">
                <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="200">
                  <img
                    loading="lazy"
                    decoding="async"
                    src="/invitation/plum/orn-3-min.png"
                    alt="Ornament"
                  />
                </div>
              </div>
              <div className="orn-savedate--bottom bl-2">
                <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="300">
                  <img
                    loading="lazy"
                    decoding="async"
                    src="/invitation/plum/orn-4-min.png"
                    alt="Ornament"
                  />
                </div>
              </div>
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="400">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/invitation/plum/orn-12-min.png"
                  alt="Ornament"
                />
              </div>
            </div>
          </div>

          <div className="save-date">
            <div className="save-date-body">
              <div className="countdown">
                <div
                  className="count-item"
                  data-aos="fade-down-right"
                  data-aos-duration="1200"
                  data-aos-delay="100"
                >
                  <h2 className="count-num count-day">{time.d}</h2>
                  <small className="count-text">Hari</small>
                </div>
                <div
                  className="count-item"
                  data-aos="fade-down-left"
                  data-aos-duration="1200"
                  data-aos-delay="300"
                >
                  <h2 className="count-num count-hour">{time.h}</h2>
                  <small className="count-text">Jam</small>
                </div>
                <div
                  className="count-item"
                  data-aos="fade-up-right"
                  data-aos-duration="1200"
                  data-aos-delay="500"
                >
                  <h2 className="count-num count-minute">{time.m}</h2>
                  <small className="count-text">Menit</small>
                </div>
                <div
                  className="count-item"
                  data-aos="fade-up-left"
                  data-aos-duration="1200"
                  data-aos-delay="700"
                >
                  <h2 className="count-num count-second">{time.s}</h2>
                  <small className="count-text">Detik</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {calendarUrl && (
          <div
            className="add-to-calendar-wrap"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-delay="1100"
          >
            <a
              className="add-to-calendar"
              href={calendarUrl}
              target="_blank"
              rel="nofollow"
              id="addToCalendar"
            >
              Tambah ke Kalender
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

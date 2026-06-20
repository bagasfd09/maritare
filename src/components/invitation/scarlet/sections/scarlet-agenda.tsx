/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */
// Scarlet agenda section â€” markup ported VERBATIM from scarlet-body.ts
// (<section class="agenda-wrap">). One event-item is generated per
// data.sections.acara.events[], keeping the exact event-item markup
// (ornaments + frame). Styled by .scarlet-inv selectors in scarlet-theme.ts.

import type { InvitationView } from "@/server/queries/invitation";

import { formatFullDateId, formatTimeRangeId } from "../../flora/format";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

export function ScarletAgenda({ data }: Props) {
  const events = data.sections.acara.events;
  // Editable heading + sub-line; fall back to the template's original copy.
  const title = data.sections.acara.title?.trim() || "Love is Calling,";
  const subtitle = data.sections.acara.subtitle?.trim() || "Save the Date!";

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="agenda-wrap">
      <div className="agenda-inner">
        <div className="agenda-head">
          <div className="orn-agenda-top">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="600"
            >
              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-01.webp" alt="orn-cover" />
            </div>
          </div>
          <h2 className="agenda-title" data-aos="zoom-in" data-aos-duration="1500">
            {title}
          </h2>
          <p className="agenda-description" data-aos="fade-up" data-aos-duration="1200">
            {subtitle}
          </p>
        </div>

        <div className="agenda-body">
          {events.map((event, i) => (
            <div className={`event-item ev-${i} `} key={`${event.name}-${i}`}>
              <div className="event-head"></div>
              <div className="activity-wrap ">
                <div className="activity-item">
                  <div className="activity-frame">
                    <div className="ornaments-wrapper">
                      <div className="orn-event-8 center">
                        <div
                          className="image-wrap"
                          data-aos="zoom-out"
                          data-aos-duration="1600"
                          data-aos-delay="1200"
                        >
                          <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-48.webp" alt="Orn" />
                        </div>
                      </div>
                      <div className="orn-event-7 left">
                        <div
                          className="image-wrap"
                          data-aos="fade-up"
                          data-aos-duration="1600"
                          data-aos-delay="1200"
                        >
                          <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-47.webp" alt="Orn" />
                        </div>
                      </div>
                      <div className="orn-event-7 right">
                        <div
                          className="image-wrap"
                          data-aos="fade-up"
                          data-aos-duration="1600"
                          data-aos-delay="1200"
                        >
                          <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-47.webp" alt="Orn" />
                        </div>
                      </div>
                    </div>

                    <div
                      className="frame-wrap"
                      data-aos="zoom-in"
                      data-aos-duration="1000"
                      data-aos-delay="500"
                    >
                      <img loading="lazy" decoding="async" src="/invitation/scarlet/frame-event.webp" alt="" width="100" />
                    </div>
                  </div>
                  <div className="activity-content">
                    <div className="activity-head">
                      <div
                        className="activity-title-wrap"
                        data-aos="zoom-in"
                        data-aos-duration="1000"
                        data-aos-delay="450"
                        data-aos-anchor-placement="top-bottom"
                      >
                        <h3 className="activity-title">{event.name}</h3>
                      </div>
                      <p
                        className="ev-day"
                        data-aos="fade-up"
                        data-aos-duration="1000"
                        data-aos-delay="600"
                      >
                        {event.date ? formatFullDateId(event.date) : ""}
                      </p>
                      <div className="cp-top">
                        <div
                          className="image-wrap"
                          data-aos="fade-up"
                          data-aos-duration="1000"
                          data-aos-delay="600"
                        >
                          <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-cp.webp" alt="orn-cover" />
                        </div>
                      </div>
                    </div>
                    <p
                      className="activity-time"
                      data-aos="zoom-in"
                      data-aos-duration="1000"
                      data-aos-delay="450"
                      data-aos-anchor-placement="top-bottom"
                    >
                      {event.timeStart ? formatTimeRangeId(event.timeStart, event.timeEnd) : ""}
                    </p>
                    <div className="activity-details">
                      <p
                        className="activity-hall"
                        data-aos="zoom-in"
                        data-aos-duration="1000"
                        data-aos-delay="450"
                        data-aos-anchor-placement="top-bottom"
                      >
                        {event.venue}
                      </p>
                      {event.address && (
                        <p
                          className="activity-address"
                          data-aos="zoom-in"
                          data-aos-duration="1000"
                          data-aos-delay="450"
                          data-aos-anchor-placement="top-bottom"
                        >
                          {event.address}
                        </p>
                      )}
                      {event.mapsUrl && (
                        <div
                          className="activity-link-wrap"
                          data-aos="zoom-in"
                          data-aos-duration="1000"
                          data-aos-delay="450"
                          data-aos-anchor-placement="top-bottom"
                        >
                          <a
                            href={event.mapsUrl}
                            className="activity-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Maps
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ornaments-wrapper">
                    <div className="orn-event-6 center">
                      <div
                        className="image-wrap"
                        data-aos="fade-up"
                        data-aos-duration="1600"
                        data-aos-delay="1200"
                      >
                        <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-46.webp" alt="Orn" />
                      </div>
                    </div>
                    <div className="orn-event-5">
                      <div
                        className="image-wrap"
                        data-aos="fade-up"
                        data-aos-duration="1600"
                        data-aos-delay="1200"
                      >
                        <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-17.webp" alt="Orn" />
                      </div>
                    </div>
                    <div className="orn-event-4">
                      <div
                        className="image-wrap"
                        data-aos="fade-up"
                        data-aos-duration="1600"
                        data-aos-delay="1200"
                      >
                        <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-45.webp" alt="Orn" />
                      </div>
                    </div>

                    <div className="orn-event-3">
                      <div className="orn-event-3-1">
                        <div className="orn-event-3-1-1">
                          <div
                            className="image-wrap"
                            data-aos="fade-up"
                            data-aos-duration="1600"
                            data-aos-delay="1100"
                          >
                            <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-36.webp" alt="Orn" />
                          </div>
                          <div className="orn-event-3-1-1-1">
                            <div className="orn-event-3-1-1-1-1">
                              <div
                                className="image-wrap"
                                data-aos="fade-up"
                                data-aos-duration="1500"
                                data-aos-delay="1000"
                              >
                                <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-34.webp" alt="Orn" />
                              </div>
                            </div>
                            <div
                              className="image-wrap"
                              data-aos="fade-up"
                              data-aos-duration="1300"
                              data-aos-delay="900"
                            >
                              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-40.webp" alt="Orn" />
                            </div>
                          </div>
                        </div>
                        <div
                          className="image-wrap"
                          data-aos="fade-up"
                          data-aos-duration="1200"
                          data-aos-delay="800"
                        >
                          <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-10.webp" alt="Orn" />
                        </div>
                      </div>
                      <div
                        className="image-wrap"
                        data-aos="fade-right"
                        data-aos-duration="1000"
                        data-aos-delay="600"
                      >
                        <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-44.webp" alt="Orn" />
                      </div>
                    </div>

                    <div className="orn-event-2">
                      <div
                        className="image-wrap"
                        data-aos="fade-up"
                        data-aos-duration="1600"
                        data-aos-delay="1000"
                      >
                        <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-43.webp" alt="Orn" />
                      </div>
                    </div>
                    <div className="orn-event-1">
                      <div className="orn-event-1-1">
                        <div className="orn-event-1-1-1">
                          <div className="orn-event-1-1-1-1">
                            <div
                              className="image-wrap"
                              data-aos="fade-up"
                              data-aos-duration="1600"
                              data-aos-delay="1000"
                            >
                              <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-08.webp" alt="Orn" />
                            </div>
                          </div>
                          <div
                            className="image-wrap"
                            data-aos="fade-up"
                            data-aos-duration="1400"
                            data-aos-delay="900"
                          >
                            <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-42.webp" alt="Orn" />
                          </div>
                        </div>
                        <div
                          className="image-wrap"
                          data-aos="fade-up"
                          data-aos-duration="1200"
                          data-aos-delay="700"
                        >
                          <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-09.webp" alt="Orn" />
                        </div>
                      </div>
                      <div
                        className="image-wrap"
                        data-aos="fade-left"
                        data-aos-duration="1000"
                        data-aos-delay="600"
                      >
                        <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-41.webp" alt="Orn" />
                      </div>
                    </div>

                    <div className="orn-event-9 burung-1">
                      <div
                        className="image-wrap"
                        data-aos="zoom-in"
                        data-aos-duration="1600"
                        data-aos-delay="1000"
                      >
                        <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-burung-1.webp" alt="Orn" />
                      </div>
                    </div>
                    <div className="orn-event-10 burung-2">
                      <div
                        className="image-wrap"
                        data-aos="zoom-in"
                        data-aos-duration="1600"
                        data-aos-delay="1000"
                      >
                        <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-burung-2.webp" alt="Orn" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

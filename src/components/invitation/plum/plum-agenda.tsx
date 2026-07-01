/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */
// Plum agenda — markup ported VERBATIM from the Katsudoto Kinanti
// `<section class="agenda-wrap">` fragment so the scoped CSS under `.plum-inv`
// styles the `orn-event--head` cluster + the `activity-frame` flower clusters
// byte-identically. One full `event-item` (its own date header + a single
// `activity-item`) is produced per `data.sections.acara.events[]`; the fragment's
// two hardcoded ceremonies (Akad / Resepsi) collapse to one templated activity
// block and the shared `ic-rings` icon is reused for every event.
//
// Forced deviation from byte-for-byte: the fragment splits the date into an
// `event-day` (weekday "Jumat") heading + an `event-schedule-wrapper`
// month/day-number/year card. maritare only exposes a single ISO date plus
// `formatFullDateId` (which already yields "Jumat, 12 Juni 2026"), so — exactly
// like sienna-agenda / ivory-agenda — the date is rendered as one string in the
// `event-day` heading and the `event-schedule-wrapper` split block is dropped
// (it would otherwise carry hardcoded couple data with no maritare field).
//
// The plum fragment's `agenda-head` has no title/description element (only the
// `orn-event--head` ornament cluster), so — unlike sienna — no `acara.title` /
// `acara.subtitle` is rendered here; the head is the ornament cluster only.
//
// Data-bound parts only:
//   - event-day       = formatFullDateId(event.date),
//   - activity-title  = event.name,
//   - activity-time   = formatTimeRangeId(event.timeStart, event.timeEnd),
//   - activity-hall    = event.venue,
//   - activity-address = event.address (conditional),
//   - activity-city    = data.city (the events have no per-event city; conditional),
//   - activity-link    = event.mapsUrl (conditional — the whole link-wrap is omitted).
// The maps link keeps the fragment's literal Bahasa copy "Lihat Peta" verbatim
// (rule 3/8 + AGENTS.md guest-facing copy in Bahasa); the spec's "View Maps" is
// the binding-line identifier, not a render directive.
//
// The per-event icon container id + every AOS anchor that points at it are
// indexed (`activityIcon-${i}`) so up to 4 repeats stay unique. The frame/flower
// ornaments carry only `data-aos-delay` (no anchor) so they self-anchor and need
// no indexing; the `ic-rings` SVG has no clipPath so nothing to suffix there.

import type { InvitationView } from "@/server/queries/invitation";

import { formatFullDateId, formatTimeRangeId } from "../flora/format";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

export function PlumAgenda({ data }: Props) {
  const events = data.sections.acara.events;

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="agenda-wrap" data-section-order="event">
      <div className="agenda-inner">
        <div className="agenda-head">
          <div className="orn-event--head relative">
            <div className="orn-event--top tl-1">
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="100">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-30-min.png" alt="Ornament" />
              </div>
            </div>
            <div className="orn-event--top tr-1">
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="200">
                <img loading="lazy" decoding="async" src="/invitation/plum/orn-30-min.png" alt="Ornament" />
              </div>
            </div>
          </div>
        </div>

        <div className="agenda-body">
          {events.map((event, i) => (
            <div className="event-item" id={`event-item-${i}`} key={`${event.name}-${i}`}>
              <div className="event-head">
                <p className="event-day" data-aos="fade-up" data-aos-duration="1000">
                  {event.date ? formatFullDateId(event.date) : ""}
                </p>
              </div>
              <div className="activity-wrap ">
                <div className="activity-item">
                  {/* FRAME */}
                  <div className={`activity-frame ${i === 0 ? "first" : ""}`}>
                    <div className="image-wrap" data-aos="zoom-out" data-aos-duration="2000">
                      <img loading="lazy" decoding="async" src="/invitation/plum/orn-frame-2-min.png" alt="Ornament" />
                    </div>
                    {/* FLOWERS WRAPPER */}
                    <div className="ornaments-wrapper">
                      <div className="orn-event--bottom bl-1">
                        <div className="orn-event--bottom bl-8">
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="100">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-2-min.png" alt="Ornament" />
                          </div>
                        </div>
                        <div className="orn-event--bottom bl-7">
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="200">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-16-min.png" alt="Ornament" />
                          </div>
                        </div>
                        <div className="orn-event--bottom bl-6">
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="300">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-13-min.png" alt="Ornament" />
                          </div>
                        </div>
                        <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="400">
                          <img loading="lazy" decoding="async" src="/invitation/plum/orn-26-min.png" alt="Ornament" />
                        </div>
                        <div className="orn-event--bottom bl-2">
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="100">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-28-min.png" alt="Ornament" />
                          </div>
                        </div>
                        <div className="orn-event--bottom bl-3">
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="200">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-3-min.png" alt="Ornament" />
                          </div>
                        </div>
                        <div className="orn-event--bottom bl-4">
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="300">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-14-min.png" alt="Ornament" />
                          </div>
                        </div>
                        <div className="orn-event--bottom bl-5">
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="400">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-8-min.png" alt="Ornament" />
                          </div>
                        </div>
                      </div>
                      <div className="orn-event--bottom br-1">
                        <div className="orn-event--bottom br-3">
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="100">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-1-min.png" alt="Ornament" />
                          </div>
                        </div>
                        <div className="orn-event--bottom br-2">
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="200">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-32-min.png" alt="Ornament" />
                          </div>
                        </div>
                        <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="300">
                          <img loading="lazy" decoding="async" src="/invitation/plum/orn-26-min.png" alt="Ornament" />
                        </div>
                        <div className="orn-event--bottom bl-2">
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="100">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-28-min.png" alt="Ornament" />
                          </div>
                        </div>
                        <div className="orn-event--bottom bl-3">
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="200">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-3-min.png" alt="Ornament" />
                          </div>
                        </div>
                        <div className="orn-event--bottom bl-4">
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="300">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-14-min.png" alt="Ornament" />
                          </div>
                        </div>
                        <div className="orn-event--bottom bl-5">
                          <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="400">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-8-min.png" alt="Ornament" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="activity-content">
                    <div className="scrollable-y">
                      <div className="activity-head">
                        <div id={`activityIcon-${i}`} data-aos="fade-up" data-aos-duration="1200">
                          <svg
                            className="activity-icon ic-rings"
                            viewBox="0 0 512 512"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M322.656 180C318.656 180 314.736 180.24 310.896 180.48C316.684 187.936 321.848 195.856 326.336 204.16C359.969 205.08 391.885 219.212 415.174 243.494C438.464 267.776 451.251 300.254 450.767 333.896C450.283 367.538 436.567 399.635 412.589 423.238C388.611 446.84 356.301 460.047 322.656 460C288.719 459.964 256.183 446.467 232.186 422.47C208.189 398.473 194.692 365.937 194.656 332C194.763 307.79 201.686 284.099 214.632 263.641C227.578 243.182 246.023 226.783 267.856 216.32C262.787 209.693 256.99 203.655 250.576 198.32C215.726 217.068 189.57 248.678 177.676 286.421C165.783 324.164 169.09 365.059 186.896 400.4C199.641 425.478 219.059 446.552 243.013 461.302C266.966 476.052 294.525 483.907 322.656 484C362.969 484 401.63 467.986 430.136 439.48C458.642 410.975 474.656 372.313 474.656 332C474.656 291.687 458.642 253.025 430.136 224.52C401.63 196.014 362.969 180 322.656 180Z"
                              fill="black"
                            />
                            <path
                              d="M326.336 204.16C321.848 195.856 316.684 187.936 310.896 180.48C301.929 180.427 277.311 183.92 250.576 198.32C256.99 203.655 262.787 209.693 267.856 216.32C291.656 204.914 295.656 204.16 326.336 204.16Z"
                              fill="black"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M88.1948 193.539C64.1998 217.534 50.6999 250.066 50.6554 284C50.7034 317.286 63.7079 349.246 86.9137 373.108C110.12 396.971 141.704 410.863 174.975 411.84C179.463 420.144 190.415 435.52 190.415 435.52C190.415 435.52 182.655 436 178.655 436C139.887 435.912 102.618 421.014 74.4718 394.354C46.3258 367.693 29.4305 331.286 27.2425 292.579C25.0544 253.873 37.739 215.793 62.7011 186.13C87.6632 156.468 123.016 137.465 161.527 133.008C168.656 132.183 188.156 132.141 195.791 133C231.547 137.024 264.698 153.659 289.295 179.92C299.376 190.515 307.84 202.537 314.415 215.6C332.221 250.941 335.529 291.836 323.635 329.579C311.741 367.322 285.585 398.932 250.735 417.68C244.321 412.345 238.525 406.307 233.455 399.68C255.288 389.217 273.734 372.818 286.679 352.359C299.625 331.901 306.548 308.21 306.655 284C306.619 250.063 293.122 217.527 269.125 193.53C245.128 169.533 212.592 156.036 178.655 156C144.721 156.044 112.19 169.544 88.1948 193.539Z"
                              fill="black"
                            />
                            <path
                              d="M250.735 417.68C244.321 412.345 238.525 406.307 233.455 399.68C224.735 404.513 200.831 413.712 174.975 411.84C179.463 420.144 190.415 435.52 190.415 435.52C223.656 432.5 228.156 429.827 250.735 417.68Z"
                              fill="black"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M333.641 182.592L352.093 184.446L368.016 189.279L368.501 147.421L393.841 155.379L370.306 189.998L386.134 195.137L402.333 204.165L456.302 172.229C457.596 171.479 458.653 170.379 459.35 169.056C460.048 167.732 460.358 166.239 460.245 164.747L456.965 121.791C456.846 120.193 456.249 118.668 455.253 117.413C454.257 116.158 452.906 115.231 451.377 114.753L344.523 81.1935C342.995 80.7119 341.358 80.7003 339.823 81.1602C338.288 81.62 336.927 82.5301 335.915 83.7726L308.665 117.141C307.719 118.3 307.119 119.702 306.935 121.187C306.75 122.672 306.989 124.178 307.622 125.534L333.641 182.592ZM386.134 195.137L409.716 160.365L432.766 167.605L386.134 195.137ZM352.093 184.446L329.576 135.196L352.625 142.435L352.093 184.446ZM441.393 128.388L436.508 126.854L420.158 146.874L443.361 154.161L441.393 128.388ZM403.672 141.697L420.022 121.676L366.29 104.8L368.258 130.574L403.672 141.697ZM349.804 99.6225L344.919 98.0884L328.569 118.109L351.772 125.396L349.804 99.6225Z"
                              fill="black"
                            />
                            <path
                              d="M418.763 71.8016L424.765 46.9105C426.059 41.5418 422.755 36.1381 417.389 34.8458C412.019 33.5515 406.618 36.8545 405.324 42.2227L399.322 67.1138C398.238 71.6104 400.378 76.1293 404.256 78.2398C405.008 78.649 405.826 78.9683 406.698 79.1785C412.068 80.4728 417.469 77.1711 418.763 71.8016Z"
                              fill="black"
                            />
                            <path
                              d="M369.406 67.3112L362.091 39.0568C360.708 33.7114 355.251 30.498 349.905 31.8827C344.559 33.2666 341.347 38.7229 342.731 44.0688L350.046 72.3232C350.769 75.1142 352.601 77.3236 354.949 78.6014C357.097 79.7706 359.678 80.1589 362.233 79.4978C367.578 78.1143 370.789 72.6566 369.406 67.3112Z"
                              fill="black"
                            />
                            <path
                              d="M477.463 66.9405C473.293 63.3221 466.976 63.7665 463.357 67.9378L444.67 89.467C441.049 93.6374 441.497 99.9527 445.667 103.573C446.227 104.059 446.824 104.47 447.45 104.81C451.484 107.006 456.639 106.186 459.773 102.576L478.46 81.0463C482.081 76.8759 481.633 70.5602 477.463 66.9405Z"
                              fill="black"
                            />
                          </svg>
                        </div>
                        <h3
                          className="activity-title"
                          data-aos-anchor={`#activityIcon-${i}`}
                          data-aos="fade-up"
                          data-aos-duration="1000"
                          data-aos-delay="100"
                        >
                          {event.name}
                        </h3>

                        <p
                          className="activity-time"
                          data-aos-anchor={`#activityIcon-${i}`}
                          data-aos="fade-up"
                          data-aos-duration="1000"
                          data-aos-delay="200"
                        >
                          {event.timeStart ? formatTimeRangeId(event.timeStart, event.timeEnd) : ""}
                        </p>
                      </div>
                      <div className="activity-details">
                        <p
                          className="activity-hall"
                          data-aos-anchor={`#activityIcon-${i}`}
                          data-aos="fade-up"
                          data-aos-duration="1000"
                          data-aos-delay="250"
                        >
                          {event.venue}
                        </p>
                        {event.address && (
                          <p
                            className="activity-address"
                            data-aos-anchor={`#activityIcon-${i}`}
                            data-aos="fade-up"
                            data-aos-duration="1000"
                            data-aos-delay="300"
                          >
                            {event.address}
                          </p>
                        )}
                        {data.city && (
                          <p
                            className="activity-city"
                            data-aos-anchor={`#activityIcon-${i}`}
                            data-aos="fade-up"
                            data-aos-duration="1000"
                            data-aos-delay="350"
                          >
                            {data.city}
                          </p>
                        )}
                        {event.mapsUrl && (
                          <div
                            className="activity-link-wrap"
                            data-aos-anchor={`#activityIcon-${i}`}
                            data-aos="fade-up"
                            data-aos-duration="1000"
                            data-aos-delay="400"
                          >
                            <a
                              href={event.mapsUrl}
                              className="activity-link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Lihat Peta
                            </a>
                          </div>
                        )}
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

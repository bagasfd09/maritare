/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */
// Sienna agenda ("It's a Wedding Day") — markup ported VERBATIM from the
// Katsudoto Syakira `<section class="agenda-wrap">` fragment so the scoped CSS
// under `.sienna-inv` styles the pillar + ornament cluster byte-identically. One
// full `event-item` (its own date header + the pill-shaped `event-content` with
// its activity block) is produced per `data.sections.acara.events[]`.
//
// Forced deviation from byte-for-byte: the fragment splits the date into an
// `event-day` (weekday "Friday,") heading + an `event-date` ("June 12th, 2026")
// line with a <sup> ordinal. maritare only exposes a single ISO date plus
// `formatFullDateId` (which already yields "Jumat, 12 Juni 2026"), so — exactly
// like ivory-agenda — the date is rendered as one string in the `event-day`
// heading and the `event-date` split block (incl. its <sup>) is dropped.
//
// Data-bound parts only:
//   - agenda-title / agenda-description = editable title / subtitle (fallbacks),
//   - event-day      = formatFullDateId(event.date),
//   - activity-title = event.name,
//   - activity-time  = formatTimeRangeId(event.timeStart, event.timeEnd),
//   - activity-hall    = event.venue,
//   - activity-address = event.address (conditional),
//   - activity-city    = data.city (the events have no per-event city; conditional),
//   - activity-link    = event.mapsUrl (conditional — the whole link-wrap is omitted).
// The per-event item id + every AOS anchor (and the pillar's data-anchor-id
// top/bottom) are indexed (`event-item-${i}`, `top-${i}`, `bottom-${i}`) so up to
// 4 repeats stay unique; the SVG icon's clipPath id is suffixed with `i` too.

import type { InvitationView } from "@/server/queries/invitation";

import { formatFullDateId, formatTimeRangeId } from "../flora/format";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

export function SiennaAgenda({ data }: Props) {
  const events = data.sections.acara.events;
  // Editable heading + sub-line; fall back to the template's original copy.
  const title = data.sections.acara.title?.trim() || "It's a Wedding Day";
  const subtitle =
    data.sections.acara.subtitle?.trim() ||
    "Kami memohon kehadiran Bapak/Ibu/Saudara/i dalam pelaksanaan resepsi pernikahan yang akan diselenggarakan pada:";

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="agenda-wrap" data-section-order="event">
      <div className="agenda-inner">
        <div className="agenda-head">
          <h1 className="agenda-title" data-aos="zoom-in" data-aos-duration="1500">
            {title}
          </h1>
          <p className="agenda-description" data-aos="fade-up" data-aos-duration="1200">
            {subtitle}
          </p>
        </div>

        <div className="agenda-body">
          {events.map((event, i) => (
            <div
              className="event-item"
              id={`event-item-${i}`}
              data-aos="fade-up"
              data-aos-duration="1200"
              key={`${event.name}-${i}`}
            >
              <div className="event-head">
                <h1 className="event-day" data-aos="fade-up" data-aos-duration="1000">
                  {event.date ? formatFullDateId(event.date) : ""}
                </h1>
              </div>
              <div className="event-content" style={{ minHeight: "654px", borderRadius: "231px" }}>
                <div className="activity-wrap">
                  <div className="activity-item">
                    <div className="activity-head">
                      <div data-aos="fade-up" data-aos-duration="1000">
                        <svg
                          className="activity-icon"
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          viewBox="0 0 48 48"
                          fill="none"
                        >
                          <g clipPath={`url(#clip0_45_7559_${i})`}>
                            <path
                              d="M31.0218 15.9485C30.6021 15.9485 30.1908 15.9737 29.7879 15.9988C30.3953 16.7811 30.9371 17.6122 31.408 18.4834C34.9368 18.58 38.2857 20.0627 40.7292 22.6105C43.1728 25.1583 44.5145 28.566 44.4637 32.0959C44.413 35.6257 42.9738 38.9935 40.458 41.4699C37.9421 43.9464 34.552 45.3322 31.0218 45.3272C27.4611 45.3234 24.0472 43.9072 21.5294 41.3894C19.0115 38.8715 17.5953 35.4577 17.5916 31.8969C17.6029 29.3567 18.3292 26.871 19.6876 24.7244C21.0459 22.5778 22.9812 20.8571 25.272 19.7593C24.7401 19.064 24.132 18.4305 23.4589 17.8707C19.8023 19.8378 17.0579 23.1545 15.81 27.1146C14.5621 31.0748 14.9092 35.3656 16.7774 39.0737C18.1146 41.705 20.1521 43.9162 22.6654 45.4638C25.1787 47.0115 28.0703 47.8356 31.0218 47.8454C35.2516 47.8454 39.3082 46.1651 42.2991 43.1742C45.29 40.1833 46.9703 36.1267 46.9703 31.8969C46.9703 27.6671 45.29 23.6106 42.2991 20.6197C39.3082 17.6288 35.2516 15.9485 31.0218 15.9485Z"
                              fill="black"
                            />
                            <path
                              d="M31.408 18.4834C30.9371 17.6122 30.3953 16.7811 29.7879 15.9988C28.8471 15.9933 26.2641 16.3598 23.4589 17.8707C24.132 18.4305 24.7401 19.064 25.272 19.7593C27.7692 18.5626 28.1889 18.4834 31.408 18.4834Z"
                              fill="black"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M6.4208 17.3689C3.90315 19.8866 2.48668 23.2999 2.48202 26.8604C2.48706 30.3529 3.85153 33.7062 6.28638 36.21C8.72123 38.7138 12.0352 40.1714 15.5262 40.2739C15.997 41.1452 17.1462 42.7585 17.1462 42.7585C17.1462 42.7585 16.332 42.8088 15.9123 42.8088C11.8446 42.7996 7.93412 41.2365 4.98093 38.4391C2.02774 35.6418 0.255021 31.8218 0.0254412 27.7606C-0.204138 23.6993 1.12677 19.7039 3.7459 16.5916C6.36502 13.4792 10.0744 11.4853 14.1151 11.0177C14.8631 10.9312 16.9091 10.9267 17.7103 11.0169C21.4619 11.4391 24.9402 13.1845 27.5211 15.9399C28.5787 17.0516 29.4668 18.313 30.1567 19.6836C32.025 23.3917 32.372 27.6826 31.1241 31.6427C29.8762 35.6029 27.1318 38.9195 23.4752 40.8866C22.8021 40.3268 22.194 39.6933 21.6621 38.998C23.9529 37.9002 25.8882 36.1795 27.2466 34.0329C28.6049 31.8863 29.3313 29.4006 29.3425 26.8604C29.3388 23.2996 27.9226 19.8858 25.4047 17.368C22.8869 14.8501 19.473 13.4339 15.9123 13.4302C12.3518 13.4348 8.93845 14.8513 6.4208 17.3689Z"
                              fill="black"
                            />
                            <path
                              d="M23.4752 40.8866C22.8021 40.3268 22.194 39.6933 21.6621 38.998C20.7471 39.5051 18.239 40.4703 15.5262 40.2739C15.997 41.1452 17.1462 42.7585 17.1462 42.7585C20.6339 42.4416 21.1061 42.1611 23.4752 40.8866Z"
                              fill="black"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M32.1735 16.2203L34.1095 16.4148L35.7803 16.9219L35.8311 12.53L38.4899 13.3651L36.0205 16.9974L37.6812 17.5366L39.3809 18.4839L45.0435 15.133C45.1793 15.0543 45.2902 14.9389 45.3634 14.8C45.4366 14.6612 45.4691 14.5045 45.4572 14.3479L45.1132 9.84079C45.1006 9.67315 45.038 9.51313 44.9335 9.38147C44.8289 9.24982 44.6873 9.15258 44.5268 9.10236L33.3153 5.58119C33.155 5.53066 32.9832 5.52944 32.8221 5.57769C32.6611 5.62594 32.5182 5.72143 32.4121 5.8518L29.5529 9.35289C29.4536 9.47452 29.3907 9.62168 29.3714 9.77746C29.352 9.93324 29.377 10.0913 29.4435 10.2335L32.1735 16.2203ZM37.6812 17.5366L40.1556 13.8882L42.5741 14.6478L37.6812 17.5366ZM34.1095 16.4148L31.7469 11.2473L34.1654 12.0069L34.1095 16.4148ZM43.4793 10.533L42.9667 10.372L41.2512 12.4727L43.6857 13.2373L43.4793 10.533ZM39.5214 11.9294L41.237 9.82875L35.5992 8.0581L35.8056 10.7624L39.5214 11.9294ZM33.8694 7.51483L33.3568 7.35386L31.6413 9.45452L34.0758 10.2191L33.8694 7.51483Z"
                              fill="black"
                            />
                            <path
                              d="M41.1091 4.59649L41.7388 1.98482C41.8746 1.42152 41.5279 0.85454 40.9649 0.718943C40.4015 0.583145 39.8348 0.929708 39.699 1.49296L39.0692 4.10463C38.9554 4.57644 39.18 5.05057 39.5869 5.27201C39.6658 5.31495 39.7517 5.34845 39.8431 5.37051C40.4065 5.50631 40.9733 5.15989 41.1091 4.59649Z"
                              fill="black"
                            />
                            <path
                              d="M35.9278 4.12468L35.1602 1.16012C35.0151 0.599263 34.4426 0.262099 33.8816 0.407392C33.3207 0.552592 32.9837 1.12509 33.1289 1.686L33.8965 4.65056C33.9723 4.94341 34.1645 5.17523 34.4108 5.30929C34.6363 5.43198 34.9071 5.47271 35.1752 5.40334C35.736 5.25819 36.0729 4.68554 35.9278 4.12468Z"
                              fill="black"
                            />
                            <path
                              d="M47.2619 4.08431C46.8244 3.70466 46.1616 3.75128 45.7818 4.18895L43.8211 6.44788C43.4412 6.88546 43.4881 7.54808 43.9258 7.92792C43.9845 7.97889 44.0471 8.02206 44.1128 8.05777C44.5361 8.28814 45.0769 8.20215 45.4058 7.82328L47.3665 5.56435C47.7465 5.12678 47.6994 4.4641 47.2619 4.08431Z"
                              fill="black"
                            />
                          </g>
                          <defs>
                            <clipPath id={`clip0_45_7559_${i}`}>
                              <rect width="48" height="48" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                      <h1 className="activity-title" data-aos="fade-up" data-aos-duration="1000">
                        {event.name}
                      </h1>

                      <p className="activity-time" data-aos="fade-up" data-aos-duration="1000">
                        {event.timeStart ? formatTimeRangeId(event.timeStart, event.timeEnd) : ""}
                      </p>
                    </div>
                    <div className="activity-details">
                      <p className="activity-hall" data-aos="fade-up" data-aos-duration="1000">
                        {event.venue}
                      </p>
                      {event.address && (
                        <p className="activity-address" data-aos="fade-up" data-aos-duration="1000">
                          {event.address}
                        </p>
                      )}
                      {data.city && (
                        <p className="activity-city" data-aos="fade-up" data-aos-duration="1000">
                          {data.city}
                        </p>
                      )}
                      {event.mapsUrl && (
                        <div
                          className="activity-link-wrap"
                          data-aos="fade-up"
                          data-aos-duration="1000"
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
                </div>
                <div className="ornaments-wrapper">
                  <div className="orn-pillar">
                    <div className="pillar-top" data-anchor-id={`top-${i}`}>
                      <div className="image-wrap">
                        <img
                          loading="lazy"
                          decoding="async"
                          src="/invitation/sienna/pillar-top.png"
                          alt="Pillar Top"
                        />
                      </div>
                    </div>
                    <div className="pillar-center">
                      <div className="image-wrap">
                        <img
                          loading="lazy"
                          decoding="async"
                          src="/invitation/sienna/pillar-center.png"
                          alt="Pillar Center"
                        />
                      </div>
                    </div>
                    <div className="pillar-bottom" data-anchor-id={`bottom-${i}`}>
                      <div className="image-wrap">
                        <img
                          loading="lazy"
                          decoding="async"
                          src="/invitation/sienna/pillar-top.png"
                          alt="Pillar Bottom"
                        />
                      </div>
                    </div>

                    <div className="orn-bl">
                      <div className="orn-1">
                        <div
                          className="image-wrap"
                          data-aos="fade-left"
                          data-aos-duration="1000"
                          data-aos-delay="800"
                          data-aos-anchor={`#event-item-${i}`}
                          data-aos-anchor-placement="bottom-bottom"
                        >
                          <img
                            loading="lazy"
                            decoding="async"
                            src="/invitation/sienna/orn-gift-1.png"
                            alt="Orn Gift 1"
                          />
                        </div>
                      </div>
                      <div className="orn-2">
                        <div
                          className="image-wrap"
                          data-aos="fade-up-right"
                          data-aos-duration="1000"
                          data-aos-delay="1050"
                          data-aos-anchor={`#event-item-${i}`}
                          data-aos-anchor-placement="bottom-bottom"
                        >
                          <img
                            loading="lazy"
                            decoding="async"
                            src="/invitation/sienna/orn-event-1.png"
                            alt="Orn Event 1"
                          />
                        </div>
                      </div>
                      <div className="orn-3">
                        <div
                          className="image-wrap"
                          data-aos="fade-right"
                          data-aos-duration="1000"
                          data-aos-delay="1000"
                          data-aos-anchor={`#event-item-${i}`}
                          data-aos-anchor-placement="bottom-bottom"
                        >
                          <img
                            loading="lazy"
                            decoding="async"
                            src="/invitation/sienna/orn-event-2.png"
                            alt="Orn Event 2"
                          />
                        </div>
                      </div>
                      <div className="orn-4">
                        <div
                          className="image-wrap"
                          data-aos="fade-left"
                          data-aos-duration="1000"
                          data-aos-delay="950"
                          data-aos-anchor={`#event-item-${i}`}
                          data-aos-anchor-placement="bottom-bottom"
                        >
                          <img
                            loading="lazy"
                            decoding="async"
                            src="/invitation/sienna/orn-footer-2.png"
                            alt="Orn Footer 2"
                          />
                        </div>
                      </div>
                      <div
                        className="image-wrap"
                        data-aos="fade-right"
                        data-aos-duration="1000"
                        data-aos-delay="850"
                        data-aos-anchor={`#event-item-${i}`}
                        data-aos-anchor-placement="bottom-bottom"
                      >
                        <img
                          loading="lazy"
                          decoding="async"
                          src="/invitation/sienna/orn-footer-3-min.png"
                          alt="Orn Footer 3"
                        />
                      </div>
                      <div className="orn-5">
                        <div
                          className="image-wrap"
                          data-aos="fade-left"
                          data-aos-duration="1000"
                          data-aos-delay="900"
                          data-aos-anchor={`#event-item-${i}`}
                          data-aos-anchor-placement="bottom-bottom"
                        >
                          <img
                            loading="lazy"
                            decoding="async"
                            src="/invitation/sienna/orn-wish-1.png"
                            alt="Orn Wish 5"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="orn-br">
                      <div className="orn-1">
                        <div
                          className="image-wrap"
                          data-aos="fade-up-right"
                          data-aos-duration="1000"
                          data-aos-anchor={`#event-item-${i}`}
                          data-aos-anchor-placement="bottom-bottom"
                        >
                          <img
                            loading="lazy"
                            decoding="async"
                            src="/invitation/sienna/orn-event-5.png"
                            alt="Orn Event 5"
                          />
                        </div>
                      </div>
                      <div className="orn-2">
                        <div
                          className="image-wrap"
                          data-aos="fade-up-left"
                          data-aos-duration="1000"
                          data-aos-delay="200"
                          data-aos-anchor={`#event-item-${i}`}
                          data-aos-anchor-placement="bottom-bottom"
                        >
                          <img
                            loading="lazy"
                            decoding="async"
                            src="/invitation/sienna/orn-event-4.png"
                            alt="Orn Event 4"
                          />
                        </div>
                      </div>
                      <div className="orn-3">
                        <div
                          className="image-wrap"
                          data-aos="fade-up-right"
                          data-aos-duration="1000"
                          data-aos-delay="250"
                          data-aos-anchor={`#event-item-${i}`}
                          data-aos-anchor-placement="bottom-bottom"
                        >
                          <img
                            loading="lazy"
                            decoding="async"
                            src="/invitation/sienna/orn-event-3.png"
                            alt="Orn Event 3"
                          />
                        </div>
                      </div>
                      <div className="orn-4">
                        <div
                          className="image-wrap"
                          data-aos="fade-up"
                          data-aos-duration="1000"
                          data-aos-delay="350"
                          data-aos-anchor={`#event-item-${i}`}
                          data-aos-anchor-placement="bottom-bottom"
                        >
                          <img
                            loading="lazy"
                            decoding="async"
                            src="/invitation/sienna/orn-footer-2.png"
                            alt="Orn Footer 2"
                          />
                        </div>
                      </div>
                      <div
                        className="image-wrap"
                        data-aos="fade-down-right"
                        data-aos-duration="1000"
                        data-aos-delay="300"
                        data-aos-anchor={`#event-item-${i}`}
                        data-aos-anchor-placement="bottom-bottom"
                      >
                        <img
                          loading="lazy"
                          decoding="async"
                          src="/invitation/sienna/orn-footer-7.png"
                          alt="Orn Footer 7"
                        />
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

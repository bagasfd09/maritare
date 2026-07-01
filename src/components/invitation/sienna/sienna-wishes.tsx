"use client";
/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */

// Sienna wishes + RSVP — ported from <section.wedding-wish-wrap> in the syakira
// "wishes" fragment so the scoped CSS in sienna-theme (.sienna-inv .*) styles it
// byte-identically. Structure mirrors ivory-wishes (the submit-critical flow is
// identical), with three fragment-specific adjustments: a `.wish-flower`
// ornament before `.wedding-wish-inner`, no `.wedding-wish-description`, and the
// comments/more-button render as direct children of `.wedding-wish-body`.
// The reference's <form action="…katsudoto.id"> is rewired to our
// `submitInvitationResponse` Server Action: live ONLY in `public` mode; previews
// disable it and show a notice. RSVP attendance (enabled / maxPartySize /
// deadline) is bound inline. Static sample comments → data.wishes.map(...) into
// the exact .comment-item markup, paginated behind "Show more comments".

import { useState, useTransition } from "react";
import { format } from "date-fns";

import { submitInvitationResponse } from "@/server/actions/invitation";
import type { InvitationView } from "@/server/queries/invitation";

import { formatShortDateId } from "../flora/format";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** Guest's name — resolved ?g= guest first, else the ?to= display name. Pre-fills
   *  (but doesn't lock) the name field. Absent on generic links. */
  guestName?: string;
};

type WishItem = InvitationView["wishes"][number] & { pendingModeration?: boolean };

type Attendance = "hadir" | "tidak" | "ragu";

const ATTENDANCE_OPTIONS: { value: Attendance; label: string }[] = [
  { value: "hadir", label: "Hadir" },
  { value: "tidak", label: "Tidak Hadir" },
  { value: "ragu", label: "Masih Ragu" },
];

const MESSAGE_MAX = 600;
// Wishes revealed initially + per "Show more comments" click (data-start="6").
const WISHES_PAGE = 6;

export function SiennaWishes({ data, mode, guestName }: Props) {
  const slug = data.slug;
  const rsvp = data.sections.rsvp;
  const live = mode === "public";

  // Date-only deadline check — the deadline day itself still counts.
  const deadlinePassed = rsvp.deadline ? format(new Date(), "yyyy-MM-dd") > rsvp.deadline : false;
  const showAttendance = rsvp.enabled && !deadlinePassed;

  // Pre-fill the name with the invitation's guest (editable). Same prop on server
  // + client, so the controlled input hydrates without a mismatch.
  const [name, setName] = useState(guestName ?? "");
  const [attendance, setAttendance] = useState<Attendance>("hadir");
  const [partySize, setPartySize] = useState(1);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — humans never see it
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [list, setList] = useState<WishItem[]>(data.wishes);
  const [isPending, startTransition] = useTransition();

  const disabled = !live || isPending;

  // Show wishes in batches; "Show more comments" reveals the next batch.
  const [visible, setVisible] = useState(WISHES_PAGE);
  const shown = list.slice(0, visible);
  const hasMore = list.length > shown.length;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!live) return;
    setError(null);
    setNotice(null);

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName) {
      setError("Nama wajib diisi dulu ya.");
      return;
    }
    const attending = showAttendance
      ? attendance === "hadir"
        ? true
        : attendance === "tidak"
          ? false
          : undefined
      : undefined;
    if (attending === undefined && !trimmedMessage) {
      setError("Isi kehadiran atau tulis ucapan dulu ya.");
      return;
    }

    startTransition(async () => {
      const result = await submitInvitationResponse({
        slug,
        name: trimmedName,
        attending,
        partySize: attending === true ? partySize : undefined,
        message: trimmedMessage || undefined,
        website,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (trimmedMessage) {
        // Optimistic prepend — the real wish appears publicly after moderation.
        setList((prev) => [
          {
            fromName: trimmedName,
            body: trimmedMessage,
            createdAt: new Date().toISOString(),
            pendingModeration: true,
          },
          ...prev,
        ]);
      }
      // Reset to the pre-filled guest name (empty on generic links) so a second
      // submission keeps the convenience without carrying an edited name over.
      setName(guestName ?? "");
      setAttendance("hadir");
      setPartySize(1);
      setMessage("");
      setNotice("Terima kasih! Ucapanmu akan tampil setelah disetujui pasangan.");
    });
  };

  return (
    <section className="wedding-wish-wrap" data-template="" data-section-order="wedding_wish">
      <div className="wish-flower">
        <div className="image-wrap" data-aos="zoom-out" data-aos-duration="1200" data-aos-delay="200">
          <img loading="lazy" decoding="async" src="/invitation/sienna/orn-wish-1.png" alt="Orn 1" />
        </div>
      </div>

      <div className="wedding-wish-inner">
        <div className="wedding-wish-head">
          <h1 className="wedding-wish-title" data-aos="fade-up" data-aos-duration="1200">
            Wedding Wish
          </h1>
        </div>

        <div className="wedding-wish-body">
          <div className="wedding-wish-form">
            <form onSubmit={handleSubmit} className="" method="POST" id="weddingWishForm">
              {!live && (
                <div
                  className="form-group"
                  data-aos="fade-up"
                  data-aos-duration="1200"
                  data-aos-delay="100"
                >
                  Form aktif setelah dipublikasikan.
                </div>
              )}

              <div
                className="form-group guest-name-wrap"
                data-aos="fade-up"
                data-aos-duration="1200"
                data-aos-delay="200"
              >
                <input
                  type="text"
                  name="name"
                  className="form-control guest-name"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  disabled={disabled}
                />
              </div>

              {showAttendance && (
                <div
                  className="form-group guest-attendance-wrap"
                  data-aos="fade-up"
                  data-aos-duration="1200"
                  data-aos-delay="250"
                >
                  <select
                    className="form-control guest-attendance"
                    name="attendance"
                    value={attendance}
                    onChange={(e) => setAttendance(e.target.value as Attendance)}
                    disabled={disabled}
                  >
                    {ATTENDANCE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {attendance === "hadir" && (
                    <select
                      className="form-control guest-party-size"
                      name="partySize"
                      value={partySize}
                      onChange={(e) => setPartySize(Number(e.target.value))}
                      disabled={disabled}
                    >
                      {Array.from({ length: rsvp.maxPartySize }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} orang
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div
                className="form-group guest-comment-wrap"
                data-aos="fade-up"
                data-aos-duration="1200"
                data-aos-delay="300"
              >
                <textarea
                  className="form-control guest-comment"
                  name="comment"
                  rows={1}
                  placeholder="Give your wish"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={MESSAGE_MAX}
                  disabled={disabled}
                />
              </div>

              {/* Honeypot — visually hidden; bots that fill it are silently dropped. */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px" }}
              />

              {error && (
                <div
                  className="form-group"
                  data-aos="fade-up"
                  data-aos-duration="1200"
                  data-aos-delay="350"
                >
                  {error}
                </div>
              )}
              {notice && (
                <div
                  className="form-group"
                  data-aos="fade-up"
                  data-aos-duration="1200"
                  data-aos-delay="350"
                >
                  {notice}
                </div>
              )}

              <div
                className="submit-comment-wrap"
                data-aos="fade-up"
                data-aos-duration="1200"
                data-aos-delay="400"
              >
                <button
                  type="submit"
                  className="submit submit-comment"
                  data-last=""
                  disabled={disabled}
                >
                  {isPending ? "Sending…" : "Send"}
                </button>
              </div>
            </form>
          </div>

          {list.length > 0 && (
            <div className="comment-wrap show">
              {shown.map((wish, i) => (
                <div
                  className="comment-item"
                  id={`comment${i}`}
                  key={`${wish.createdAt}-${i}`}
                  data-aos="fade-up"
                  data-aos-duration="1200"
                >
                  <div className="comment-head">
                    <div className="ch-name-wrap">
                      <h3 className="comment-name">{wish.fromName}</h3>
                    </div>
                    <small className="comment-date">{formatShortDateId(wish.createdAt)}</small>
                  </div>
                  <div className="comment-body">
                    <p className="comment-caption">{wish.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="more-comment-wrap show" data-aos="fade-up" data-aos-duration="1200">
              <button
                type="button"
                id="moreComment"
                data-template=""
                data-start="6"
                data-load-text="Loading"
                onClick={() => setVisible((v) => v + WISHES_PAGE)}
              >
                Show more comments
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

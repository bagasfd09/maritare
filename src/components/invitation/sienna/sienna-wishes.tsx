"use client";
/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */

// Sienna wishes + RSVP — the Syakira "wishes" section markup (wish-flower
// ornament, .comment-item list) with the FOLK interaction model swapped in
// wholesale (mirrors ivory-wishes): Hadir/Berhalangan pills + a "datang bersama
// siapa" row (Sendiri/Partner/Keluarga) instead of <select>s, a keyed guest
// (?g=) sees a "sudah konfirmasi" summary card with "Ubah jawaban", the wish is
// required (folk validation), a successful submit bursts confetti (sienna
// palette) instead of a thank-you line, and optimistic wishes show "Menunggu
// persetujuan". Only the look stays sienna — panel/pill colors come from the
// sienna palette (terracotta #d6a191 / cream #fff8f0 / red #cb3a31; the ported
// Syakira CSS never defines the --background/--text palette vars, so plain
// hexes are used like the reveal button does).

import { useRef, useState, useTransition } from "react";
import { format } from "date-fns";

import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";
import { submitInvitationResponse } from "@/server/actions/invitation";
import type { InvitationCheckin } from "@/server/queries/guest-qr";
import type { InvitationView } from "@/server/queries/invitation";

import { formatShortDateId } from "../flora/format";
import { burstConfetti } from "../folk/folk-wishes";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** Guest's name — resolved ?g= guest first, else the ?to= display name. Pre-fills
   *  (but doesn't lock) the name field. Absent on generic links. */
  guestName?: string;
  /** Resolved ?g= guest — keys the RSVP to them (dashboard status + headcount). */
  checkin?: InvitationCheckin | null;
};

type WishItem = InvitationView["wishes"][number] & { pendingModeration?: boolean };

type Party = "solo" | "couple" | "family";

const PARTY_OPTIONS: { value: Party; label: string }[] = [
  { value: "solo", label: "Sendiri" },
  { value: "couple", label: "Partner" },
  { value: "family", label: "Keluarga" },
];
// Attendance choice → headcount, mirroring folk (1/2/4 estimates).
const PARTY_SIZE: Record<Party, number> = { solo: 1, couple: 2, family: 4 };
// …and back, for prefilling from a recorded headcount (checkin.partySize).
const partyFromSize = (size: number | null): Party =>
  size !== null && size >= 3 ? "family" : size === 2 ? "couple" : "solo";

// A recorded RSVP — from the personalized link's guest on load, or from a
// successful submit this session. Non-null flips the attendance panel from
// the pill form to a "sudah konfirmasi" summary card.
type Answered = { attending: boolean; party: Party };

const SUMMARY_LABEL: Record<Party, string> = {
  solo: "Hadir · Sendiri",
  couple: "Hadir · Bersama Partner",
  family: "Hadir · Bersama Keluarga",
};

// Selectable pills — folk structure, sienna palette (terracotta on cream).
const pillBase =
  "rounded-full border px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-60";
const pillOn = "border-[#d6a191] bg-[#d6a191] text-[#fff8f0] shadow-[0_10px_24px_-14px_rgba(0,0,0,0.5)]";
const pillOff = "border-[#d6a191]/50 bg-white/60 text-[#8a6a5c] hover:border-[#cb3a31] hover:text-[#cb3a31]";

// Sienna-preset confetti (terracotta / cream / red / warm browns).
const CONFETTI_COLORS = ["#d6a191", "#fff8f0", "#cb3a31", "#8a6a5c", "#e8c9bd"];

const MESSAGE_MAX = 600;
// Wishes revealed per "show more" click (folk parity).
const WISHES_PAGE = 5;

export function SiennaWishes({ data, mode, guestName, checkin }: Props) {
  const slug = data.slug;
  const live = mode === "public";

  // Pre-fill the name with the invitation's guest (editable). Same prop on server
  // + client, so the controlled input hydrates without a mismatch.
  const [name, setName] = useState(guestName ?? "");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [party, setParty] = useState<Party>("solo");
  // Initialized from the guest's recorded dashboard status (same on server +
  // client, so it hydrates cleanly); generic links start unanswered.
  const [answered, setAnswered] = useState<Answered | null>(() =>
    checkin && checkin.attending !== null
      ? { attending: checkin.attending, party: partyFromSize(checkin.partySize) }
      : null,
  );
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — humans never see it
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [list, setList] = useState<WishItem[]>(data.wishes);
  const [isPending, startTransition] = useTransition();
  const submitRef = useRef<HTMLButtonElement | null>(null);

  const disabled = !live || isPending;

  // Attendance pills only while RSVP is open (host toggle + deadline) — the
  // action re-enforces them server-side. Deadline day itself still counts.
  const rsvp = data.sections.rsvp;
  const deadlinePassed = rsvp.deadline ? format(new Date(), "yyyy-MM-dd") > rsvp.deadline : false;
  const showAttendance = rsvp.enabled && !deadlinePassed;

  // Show wishes in batches; the show-more button reveals the next batch.
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
    // Attendance pills are asked only while unanswered; once answered the panel
    // shows the summary card. A wish-only submit still re-asserts the recorded
    // answer, so its wishes row carries the right attendance badge in the
    // dashboard (rsvps is append-only — latest wins — so re-asserting is fine).
    const collecting = showAttendance && answered === null;
    if (collecting && attending === null) {
      setError("Pilih dulu ya: hadir atau berhalangan.");
      return;
    }
    const rsvpChoice = collecting
      ? attending !== null
        ? { attending, party }
        : null
      : answered;
    // The wish is required — it also carries the guest's name, which an
    // anonymous rsvps row can't (no name column), so the couple always sees
    // WHO. Exception: a keyed guest (?g=) answering the pills is already
    // attributable, so their RSVP may go out without a new wish.
    if (!trimmedMessage && !(collecting && rsvpChoice && checkin)) {
      setError("Tulis ucapan dan doamu dulu ya.");
      return;
    }

    // Preserve an exact recorded headcount (hosts can set e.g. 3 pax in the
    // dashboard) when the guest resubmits the same choice; only a genuinely
    // changed choice re-maps to the 1/2/4 estimates.
    const sizeFor = (p: Party) =>
      checkin?.partySize != null && partyFromSize(checkin.partySize) === p
        ? checkin.partySize
        : PARTY_SIZE[p];

    startTransition(async () => {
      const result = await submitInvitationResponse({
        slug,
        name: trimmedName,
        message: trimmedMessage || undefined,
        ...(showAttendance && rsvpChoice
          ? {
              attending: rsvpChoice.attending,
              partySize: rsvpChoice.attending ? sizeFor(rsvpChoice.party) : undefined,
              guestId: checkin?.guestId,
            }
          : {}),
        website,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Optimistic prepend — the real wish appears publicly after moderation.
      if (trimmedMessage) {
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
      // Flip the panel to its "sudah konfirmasi" summary — only for keyed
      // guests (on a generic link the next guest on a shared device must not
      // inherit this answer) and only when the server actually recorded it.
      if (collecting && rsvpChoice && checkin && result.attendanceSaved) {
        setAnswered(rsvpChoice);
      }
      // Reset to the pre-filled guest name (empty on generic links) — a second
      // wish keeps the convenience, but an edited name (or a picked attendance)
      // isn't carried over to a different guest on a shared device.
      setName(guestName ?? "");
      setMessage("");
      setAttending(null);
      setParty("solo");
      // Success feedback is the confetti burst (plus the summary card / the
      // optimistic wish in the list) — no thank-you text. The only text kept is
      // the honest warning when a closed RSVP made the server drop attendance.
      const rsvpDropped = collecting && rsvpChoice !== null && !result.attendanceSaved;
      if (rsvpDropped) {
        setNotice(
          "Ucapanmu tersimpan! Tapi konfirmasi kehadiran sudah ditutup, jadi jawabannya tidak ikut tercatat.",
        );
      } else {
        burstConfetti(submitRef.current, CONFETTI_COLORS);
      }
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
                  placeholder="Nama kamu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  disabled={disabled}
                />
              </div>

              {/* RSVP — folk pills: picking "Hadir" reveals the companion row,
                  pre-answered with "Sendiri" so most guests need one tap. Panel
                  inherits the sienna body font; colors are the sienna palette. */}
              {showAttendance && (
                <div
                  className="form-group guest-attendance-wrap mb-3"
                  data-aos="fade-up"
                  data-aos-duration="1200"
                  data-aos-delay="250"
                >
                  {/* Cream panel; sienna identity = a pair of small wish-flower
                      sprigs tucked behind the content. */}
                  <div className="relative flex min-h-[200px] flex-col justify-center overflow-hidden rounded-2xl border border-[#d6a191]/40 bg-[#fff8f0]/70 px-4 py-5 shadow-[0_8px_20px_-16px_rgba(0,0,0,0.35)] [font-family:var(--body-text-family)]">
                    <img
                      loading="lazy"
                      decoding="async"
                      src="/invitation/sienna/orn-wish-1.png"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute -left-4 -top-3 z-0 w-16 -scale-x-100 select-none opacity-60"
                    />
                    <img
                      loading="lazy"
                      decoding="async"
                      src="/invitation/sienna/orn-wish-1.png"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-3 -right-4 z-0 w-16 select-none opacity-60"
                    />
                    <div className="relative z-10 mb-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a6a5c]">
                      Konfirmasi kehadiran
                    </div>
                    {answered ? (
                      /* Already responded (recorded status, or sent just now) —
                         show the summary instead of asking again. */
                      <div className="relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#d6a191] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#fff8f0] shadow-[0_10px_24px_-14px_rgba(0,0,0,0.5)]">
                          <Icon name="check" size={13} stroke="#fff8f0" />
                          {answered.attending ? SUMMARY_LABEL[answered.party] : "Berhalangan Hadir"}
                        </div>
                        <div className="mt-2 text-[11px] leading-relaxed text-[#8a6a5c]">
                          Terima kasih, konfirmasi kehadiranmu sudah kami terima.
                        </div>
                        {live && (
                          <button
                            type="button"
                            onClick={() => {
                              setAttending(answered.attending);
                              setParty(answered.party);
                              setAnswered(null);
                              setError(null);
                              setNotice(null);
                            }}
                            className="mt-1 text-[11px] text-[#8a6a5c] underline underline-offset-2 transition hover:text-[#cb3a31]"
                          >
                            Ubah jawaban
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <div role="group" aria-label="Konfirmasi kehadiran" className="relative z-10 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAttending(true);
                              setError(null);
                            }}
                            aria-pressed={attending === true}
                            disabled={disabled}
                            className={cn(pillBase, attending === true ? pillOn : pillOff)}
                          >
                            Hadir
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAttending(false);
                              setError(null);
                            }}
                            aria-pressed={attending === false}
                            disabled={disabled}
                            className={cn(pillBase, attending === false ? pillOn : pillOff)}
                          >
                            Berhalangan
                          </button>
                        </div>
                        {attending === true && (
                          <div className="relative z-10 mt-3">
                            <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a6a5c]">
                              Datang bersama siapa?
                            </div>
                            <div role="group" aria-label="Datang bersama siapa" className="grid grid-cols-3 gap-2">
                              {PARTY_OPTIONS.map(({ value, label }) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setParty(value)}
                                  aria-pressed={party === value}
                                  disabled={disabled}
                                  className={cn(pillBase, "px-2", party === value ? pillOn : pillOff)}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
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
                  placeholder="Tulis ucapan dan doamu…"
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

              {/* No data-aos here — these mount on demand, and the scroll-reveal
                  animation would delay freshly shown feedback. */}
              {error && (
                <div role="alert" className="form-group">
                  {error}
                </div>
              )}
              {notice && (
                <div role="status" className="form-group">
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
                  ref={submitRef}
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
                    <small className="comment-date">
                      {wish.pendingModeration
                        ? "Menunggu persetujuan"
                        : formatShortDateId(wish.createdAt)}
                    </small>
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
                Muat ucapan lainnya
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

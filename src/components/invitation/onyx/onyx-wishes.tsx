"use client";

// Onyx RSVP + wishes — the reference's `RSVPSection` (a two-column grid: the
// form on the left, the wish list on the right) with maritare's real submission
// wired in. The submit path, validation order, headcount mapping, optimistic
// prepend and "sudah konfirmasi" summary are copied from sienna-wishes so every
// template records an RSVP identically — only the presentation is Onyx
// (champagne micro-caps, hairline-bordered fields, no rounded corners).
//
// The reference's <select> dropdowns are replaced by the folk pill model
// (Hadir / Berhalangan, then Sendiri / Partner / Keluarga), which is what the
// dashboard's headcount expects.

import { useRef, useState, useTransition } from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { submitInvitationResponse } from "@/server/actions/invitation";
import type { InvitationCheckin } from "@/server/queries/guest-qr";
import type { InvitationView } from "@/server/queries/invitation";

import { formatShortDateId } from "../flora/format";
import { burstConfetti } from "../folk/folk-wishes";
import { OnyxLabel, SECTION_PAD } from "./onyx-atoms";
import { OnyxReveal } from "./onyx-reveal";
import { ONYX, gold, warm } from "./onyx-theme";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** Guest's name — resolved ?g= guest first, else the ?to= display name. */
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
const PARTY_SIZE: Record<Party, number> = { solo: 1, couple: 2, family: 4 };
const partyFromSize = (size: number | null): Party =>
  size !== null && size >= 3 ? "family" : size === 2 ? "couple" : "solo";

type Answered = { attending: boolean; party: Party };

const SUMMARY_LABEL: Record<Party, string> = {
  solo: "Hadir · Sendiri",
  couple: "Hadir · Bersama Partner",
  family: "Hadir · Bersama Keluarga",
};

const MESSAGE_MAX = 600;
const WISHES_PAGE = 5;

// Onyx confetti — champagne, warm white, deep golds.
const CONFETTI_COLORS = ["#C9A96E", "#F7F7F5", "#A5854F", "#E8E8E6", "#6B6B6B"];

const pillBase =
  "border px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-60";
const pillOn = "border-[#C9A96E] bg-[#C9A96E] text-[#171717]";
const pillOff =
  "border-[rgba(201,169,110,0.35)] bg-transparent text-[rgba(247,247,245,0.6)] hover:border-[#C9A96E] hover:text-[#C9A96E]";

export function OnyxWishes({ data, mode, guestName, checkin }: Props) {
  const slug = data.slug;
  const live = mode === "public";

  const [name, setName] = useState(guestName ?? "");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [party, setParty] = useState<Party>("solo");
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

  const rsvp = data.sections.rsvp;
  const deadlinePassed = rsvp.deadline ? format(new Date(), "yyyy-MM-dd") > rsvp.deadline : false;
  const showAttendance = rsvp.enabled && !deadlinePassed;

  const [visible, setVisible] = useState(WISHES_PAGE);
  const shown = list.slice(0, visible);
  const hasMore = list.length > shown.length;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.9rem 1rem",
    border: `1px solid ${gold(0.22)}`,
    backgroundColor: "rgba(255,255,255,0.03)",
    fontFamily: ONYX.font.body,
    fontSize: "0.86rem",
    color: ONYX.color.warmWhite,
    outline: "none",
    fontWeight: 300,
    boxSizing: "border-box",
    borderRadius: 0,
    WebkitAppearance: "none",
    appearance: "none",
  };

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
    const collecting = showAttendance && answered === null;
    if (collecting && attending === null) {
      setError("Pilih dulu ya: hadir atau berhalangan.");
      return;
    }
    const rsvpChoice = collecting ? (attending !== null ? { attending, party } : null) : answered;
    if (!trimmedMessage && !(collecting && rsvpChoice && checkin)) {
      setError("Tulis ucapan dan doamu dulu ya.");
      return;
    }

    // Preserve an exact recorded headcount when the guest resubmits the same
    // choice; only a genuinely changed choice re-maps to the 1/2/4 estimates.
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
      if (collecting && rsvpChoice && checkin && result.attendanceSaved) {
        setAnswered(rsvpChoice);
      }
      setName(guestName ?? "");
      setMessage("");
      setAttending(null);
      setParty("solo");

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
    <section id="onyx-rsvp" style={{ padding: SECTION_PAD }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <OnyxReveal style={{ textAlign: "center", marginBottom: "clamp(3rem, 6vw, 5rem)" }}>
          <OnyxLabel>RSVP</OnyxLabel>
          <h2
            style={{
              fontFamily: ONYX.font.display,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 300,
              color: ONYX.color.warmWhite,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            Will You Join Us?
          </h2>
        </OnyxReveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))",
            gap: "clamp(3rem, 6vw, 7rem)",
          }}
        >
          <OnyxReveal>
            <form onSubmit={handleSubmit}>
              <p
                style={{
                  fontFamily: ONYX.font.body,
                  fontSize: "0.58rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: warm(0.4),
                  marginBottom: "1.75rem",
                }}
              >
                Konfirmasi Kehadiran &amp; Kirim Ucapan
              </p>

              {!live && (
                <p
                  style={{
                    fontFamily: ONYX.font.body,
                    fontSize: "0.78rem",
                    color: warm(0.4),
                    marginBottom: "1rem",
                  }}
                >
                  Form aktif setelah dipublikasikan.
                </p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Nama kamu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  disabled={disabled}
                  style={inputStyle}
                />

                {showAttendance && (
                  <div
                    style={{
                      border: `1px solid ${gold(0.18)}`,
                      backgroundColor: "rgba(23,23,23,0.6)",
                      padding: "1.25rem 1rem",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: ONYX.font.body,
                        fontSize: "0.55rem",
                        letterSpacing: "0.28em",
                        textTransform: "uppercase",
                        color: ONYX.color.champagne,
                        textAlign: "center",
                        marginBottom: "0.9rem",
                      }}
                    >
                      Konfirmasi kehadiran
                    </div>

                    {answered ? (
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            display: "inline-block",
                            border: `1px solid ${ONYX.color.champagne}`,
                            backgroundColor: ONYX.color.champagne,
                            color: ONYX.color.charcoal,
                            fontFamily: ONYX.font.body,
                            fontSize: "0.6rem",
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            fontWeight: 600,
                            padding: "0.6rem 1.4rem",
                          }}
                        >
                          {answered.attending
                            ? SUMMARY_LABEL[answered.party]
                            : "Berhalangan Hadir"}
                        </div>
                        <p
                          style={{
                            fontFamily: ONYX.font.body,
                            fontSize: "0.72rem",
                            color: warm(0.45),
                            marginTop: "0.6rem",
                            lineHeight: 1.6,
                          }}
                        >
                          Terima kasih, konfirmasi kehadiranmu sudah kami terima.
                        </p>
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
                            style={{
                              marginTop: "0.4rem",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontFamily: ONYX.font.body,
                              fontSize: "0.72rem",
                              color: ONYX.color.champagne,
                              textDecoration: "underline",
                              textUnderlineOffset: "3px",
                            }}
                          >
                            Ubah jawaban
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <div
                          role="group"
                          aria-label="Konfirmasi kehadiran"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "0.5rem",
                          }}
                        >
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
                          <div style={{ marginTop: "0.9rem" }}>
                            <div
                              style={{
                                fontFamily: ONYX.font.body,
                                fontSize: "0.55rem",
                                letterSpacing: "0.28em",
                                textTransform: "uppercase",
                                color: warm(0.4),
                                textAlign: "center",
                                marginBottom: "0.6rem",
                              }}
                            >
                              Datang bersama siapa?
                            </div>
                            <div
                              role="group"
                              aria-label="Datang bersama siapa"
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: "0.5rem",
                              }}
                            >
                              {PARTY_OPTIONS.map(({ value, label }) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setParty(value)}
                                  aria-pressed={party === value}
                                  disabled={disabled}
                                  className={cn(
                                    pillBase,
                                    "px-2",
                                    party === value ? pillOn : pillOff,
                                  )}
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
                )}

                <textarea
                  name="comment"
                  placeholder="Tulis ucapan dan doamu…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={MESSAGE_MAX}
                  disabled={disabled}
                  style={{ ...inputStyle, minHeight: "140px", resize: "vertical" }}
                />

                {/* Honeypot — visually hidden; bots that fill it are dropped. */}
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
                  <p
                    role="alert"
                    style={{ fontFamily: ONYX.font.body, fontSize: "0.78rem", color: "#E0A0A0" }}
                  >
                    {error}
                  </p>
                )}
                {notice && (
                  <p
                    role="status"
                    style={{ fontFamily: ONYX.font.body, fontSize: "0.78rem", color: warm(0.6) }}
                  >
                    {notice}
                  </p>
                )}

                <button
                  ref={submitRef}
                  type="submit"
                  disabled={disabled}
                  style={{
                    padding: "1rem",
                    backgroundColor: ONYX.color.champagne,
                    color: ONYX.color.charcoal,
                    border: "none",
                    fontFamily: ONYX.font.body,
                    fontSize: "0.62rem",
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.55 : 1,
                    transition: "all 0.35s ease",
                  }}
                >
                  {isPending ? "Mengirim…" : "Kirim"}
                </button>
              </div>
            </form>
          </OnyxReveal>

          <OnyxReveal delay={150}>
            <div>
              <p
                style={{
                  fontFamily: ONYX.font.body,
                  fontSize: "0.58rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: warm(0.4),
                  marginBottom: "1.75rem",
                }}
              >
                Wedding Wishes · {list.length}
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                  maxHeight: "560px",
                  overflowY: "auto",
                  paddingRight: "0.25rem",
                }}
              >
                {shown.map((wish, i) => (
                  <div
                    key={`${wish.createdAt}-${i}`}
                    style={{ borderLeft: `1px solid ${gold(0.3)}`, paddingLeft: "1.25rem" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: ONYX.font.body,
                          fontSize: "0.82rem",
                          fontWeight: 500,
                          color: ONYX.color.warmWhite,
                          margin: 0,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {wish.fromName}
                      </p>
                      <span
                        style={{
                          fontFamily: ONYX.font.body,
                          fontSize: "0.52rem",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: wish.pendingModeration ? warm(0.35) : ONYX.color.champagne,
                          border: `1px solid ${wish.pendingModeration ? warm(0.2) : gold(0.4)}`,
                          padding: "0.2rem 0.55rem",
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {wish.pendingModeration
                          ? "Menunggu"
                          : formatShortDateId(wish.createdAt)}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: ONYX.font.body,
                        fontSize: "0.84rem",
                        color: warm(0.5),
                        lineHeight: 1.75,
                        fontWeight: 300,
                        margin: 0,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {wish.body}
                    </p>
                  </div>
                ))}
              </div>

              {hasMore && (
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + WISHES_PAGE)}
                  style={{
                    marginTop: "1.5rem",
                    background: "none",
                    border: `1px solid ${gold(0.3)}`,
                    color: warm(0.6),
                    fontFamily: ONYX.font.body,
                    fontSize: "0.58rem",
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    padding: "0.7rem 1.6rem",
                    cursor: "pointer",
                  }}
                >
                  Muat ucapan lainnya
                </button>
              )}
            </div>
          </OnyxReveal>
        </div>
      </div>
    </section>
  );
}

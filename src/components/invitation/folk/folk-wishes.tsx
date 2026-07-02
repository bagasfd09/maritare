"use client";
/* eslint-disable @next/next/no-img-element -- decorative ornaments use raw <img> by design (next/image would re-proxy them) */

// Folk Garden wishes — "Ucapan & Doa". Reuses the Scarlet .wedding-wish-wrap
// markup/CSS (the Folk template renders inside .scarlet-inv) for the maroon-on-
// cream look. The RSVP lives HERE (the old opening-gate modal was removed):
// Hadir / Berhalangan pills, plus a "datang bersama siapa" row revealed only
// when Hadir is picked (defaulting to Sendiri, so one tap answers it). On a
// personalized link (?g=) the response also flips the guest's dashboard status.
// The form is live only in `public` mode.

import { useState, useTransition } from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { submitInvitationResponse } from "@/server/actions/invitation";
import type { InvitationCheckin } from "@/server/queries/guest-qr";
import type { InvitationView } from "@/server/queries/invitation";

import { formatShortDateId } from "./format";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** Guest's name — resolved ?g= guest first, else the ?to= display name. Used to
   *  pre-fill (but not lock) the wish form's name field. Absent on generic links. */
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
// Attendance choice → headcount (keluarga is a fixed estimate, as in the old
// gate modal). ponytail: ignores rsvp.maxPartySize; switch to a numeric input
// if hosts need exact counts.
const PARTY_SIZE: Record<Party, number> = { solo: 1, couple: 2, family: 4 };

// Selectable pills, matching the Folk maroon-on-cream option styling.
const pillBase =
  "rounded-full border px-3 py-2.5 font-body text-[11px] font-semibold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-60";
const pillOn =
  "border-[#700F06] bg-[#700F06] text-[#E8E1D1] shadow-[0_10px_24px_-14px_rgba(0,0,0,0.6)]";
const pillOff = "border-[#E0D6BE] bg-white/70 text-[#52602F] hover:border-[#700F06] hover:text-[#700F06]";

const MESSAGE_MAX = 600;
// Wishes revealed per "Muat ucapan lainnya" click on the invitation.
const WISHES_PAGE = 5;

export function FolkWishes({ data, mode, guestName, checkin }: Props) {
  const slug = data.slug;
  const live = mode === "public";

  // Pre-fill the name with the invitation's guest (editable — they can change it).
  // Same prop on server + client, so the controlled input hydrates without a mismatch.
  const [name, setName] = useState(guestName ?? "");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [party, setParty] = useState<Party>("solo");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — humans never see it
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [list, setList] = useState<WishItem[]>(data.wishes);
  const [isPending, startTransition] = useTransition();

  const disabled = !live || isPending;

  // Attendance pills only while RSVP is open (host toggle + deadline) — same
  // rules the old gate modal followed; the action re-enforces them server-side.
  const rsvp = data.sections.rsvp;
  const deadlinePassed = rsvp.deadline ? format(new Date(), "yyyy-MM-dd") > rsvp.deadline : false;
  const showAttendance = rsvp.enabled && !deadlinePassed;

  // Show wishes in batches; a "Muat ucapan lainnya" button reveals the next batch.
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
    if (showAttendance && attending === null) {
      setError("Pilih dulu ya: hadir atau berhalangan.");
      return;
    }
    // The wish is always required — it also carries the guest's name, which an
    // anonymous rsvps row can't (no name column), so the couple always sees WHO.
    if (!trimmedMessage) {
      setError("Tulis ucapan dan doamu dulu ya.");
      return;
    }

    const sendAttendance = showAttendance && attending !== null;
    startTransition(async () => {
      const result = await submitInvitationResponse({
        slug,
        name: trimmedName,
        message: trimmedMessage,
        ...(sendAttendance
          ? {
              attending,
              partySize: attending ? PARTY_SIZE[party] : undefined,
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
      setList((prev) => [
        {
          fromName: trimmedName,
          body: trimmedMessage,
          createdAt: new Date().toISOString(),
          pendingModeration: true,
        },
        ...prev,
      ]);
      // Reset to the pre-filled guest name (empty on generic links) — a second
      // wish keeps the convenience, but an edited name (or a picked attendance)
      // isn't carried over to a different guest on a shared device.
      setName(guestName ?? "");
      setMessage("");
      setAttending(null);
      setParty("solo");
      setNotice(
        sendAttendance
          ? "Terima kasih! Kehadiranmu sudah tercatat, dan ucapanmu tampil setelah disetujui mempelai."
          : "Terima kasih! Ucapanmu akan tampil setelah disetujui mempelai.",
      );
    });
  };

  return (
    <section className="wedding-wish-wrap folk-wish" data-template="">
      <div className="orn-wish-1 right">
        <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="500">
          <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-52.webp" alt="" />
        </div>
      </div>
      <div className="orn-wish-1 left">
        <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="500">
          <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-52.webp" alt="" />
        </div>
      </div>

      <div className="wedding-wish-inner">
        <div className="wedding-wish-head">
          <h1 className="wedding-wish-title" data-aos="fade-up" data-aos-duration="1200">
            Ucapan &amp; Doa
          </h1>
          <p
            className="wedding-wish-description"
            data-aos="fade-up"
            data-aos-duration="1200"
            data-aos-delay="100"
          >
            Berikan ucapan dan do&rsquo;a terbaik untuk kedua mempelai
          </p>
        </div>

        <div className="wedding-wish-body">
          <div className="wedding-wish-form">
            <form onSubmit={handleSubmit} method="POST" id="weddingWishForm">
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

              {/* RSVP — two pills; picking "Hadir" reveals the companion row,
                  pre-answered with "Sendiri" so most guests need one tap.
                  mb-3 mirrors the 12px rhythm .form-control margins give the
                  other fields; labels are <div>s because the theme's
                  `.scarlet-inv p/span` rules out-specificity Tailwind sizing. */}
              {showAttendance && (
                <div
                  className="form-group guest-attendance-wrap mb-3"
                  data-aos="fade-up"
                  data-aos-duration="1200"
                  data-aos-delay="250"
                >
                  {/* Cream panel + mirrored batik-cloud accents (Orn-01), echoing
                      the template's ornamented cards so the pills don't sit bare. */}
                  <div className="rounded-2xl border border-[#E0D6BE] bg-white/45 px-4 pb-4 pt-3 shadow-[0_8px_20px_-16px_rgba(0,0,0,0.4)]">
                    <div className="mb-2.5 flex items-center justify-center gap-2">
                      <img
                        loading="lazy"
                        decoding="async"
                        src="/invitation/scarlet/Orn-01.webp"
                        alt=""
                        className="w-10 select-none"
                      />
                      <div className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-[#52602F]">
                        Konfirmasi kehadiran
                      </div>
                      <img
                        loading="lazy"
                        decoding="async"
                        src="/invitation/scarlet/Orn-01.webp"
                        alt=""
                        className="w-10 -scale-x-100 select-none"
                      />
                    </div>
                    <div role="group" aria-label="Konfirmasi kehadiran" className="grid grid-cols-2 gap-2">
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
                      <div className="mt-3">
                        <div className="mb-2 text-center font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-[#52602F]">
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
                  animation would delay (or swallow) freshly shown feedback. */}
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
              {hasMore && (
                <div className="wish-more">
                  <button type="button" onClick={() => setVisible((v) => v + WISHES_PAGE)}>
                    Muat ucapan lainnya
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

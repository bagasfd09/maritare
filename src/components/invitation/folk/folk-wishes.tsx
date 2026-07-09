"use client";
/* eslint-disable @next/next/no-img-element -- decorative ornaments use raw <img> by design (next/image would re-proxy them) */

// Folk Garden wishes — "Ucapan & Doa". Reuses the Scarlet .wedding-wish-wrap
// markup/CSS (the Folk template renders inside .scarlet-inv) for the maroon-on-
// cream look. The RSVP lives HERE (the old opening-gate modal was removed):
// Hadir / Berhalangan pills, plus a "datang bersama siapa" row revealed only
// when Hadir is picked (defaulting to Sendiri, so one tap answers it). On a
// personalized link (?g=) the response also flips the guest's dashboard status,
// and a guest who already answered (recorded status, or a submit this session)
// sees a "sudah konfirmasi" summary card with an "Ubah jawaban" escape instead
// of being asked again. The form is live only in `public` mode.

import { useRef, useState, useTransition } from "react";
import { format } from "date-fns";

import { initials } from "@/components/atoms/avatar";
import { Icon } from "@/components/atoms/icon";
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

// Selectable pills, matching the Folk maroon-on-cream option styling.
const pillBase =
  "rounded-full border px-3 py-2.5 font-body text-[11px] font-semibold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-60";
const pillOn =
  "border-[#700F06] bg-[#700F06] text-[#E8E1D1] shadow-[0_10px_24px_-14px_rgba(0,0,0,0.6)]";
const pillOff = "border-[#E0D6BE] bg-white/70 text-[#52602F] hover:border-[#700F06] hover:text-[#700F06]";

// Initial-medallion tones cycled per card — maroon, olive, gold (Folk palette).
const AVATAR_TONES = ["bg-[#700F06]", "bg-[#52602F]", "bg-[#A98534]"];

const MESSAGE_MAX = 600;
// Wishes revealed per "Muat ucapan lainnya" click on the invitation.
const WISHES_PAGE = 5;

// Checkout-style celebration on a successful submit — hand-rolled with the Web
// Animations API (no dependency). Palette particles fan out from the submit
// button, arc down under "gravity", and the layer self-cleans. Exported so other
// templates (ivory) can reuse it with their own palette; defaults to Folk's.
export function burstConfetti(
  origin: HTMLElement | null,
  colors: string[] = ["#700F06", "#C9A24B", "#52602F", "#A98534", "#E8A0B8", "#F5EFE0"],
) {
  if (!origin || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const { left, top, width, height } = origin.getBoundingClientRect();
  const cx = left + width / 2;
  const cy = top + height / 2;
  const layer = document.createElement("div");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:99;";
  document.body.appendChild(layer);
  const COUNT = 42;
  for (let i = 0; i < COUNT; i++) {
    const piece = document.createElement("div");
    const w = 5 + Math.random() * 4;
    piece.style.cssText =
      `position:absolute;left:${cx}px;top:${cy}px;width:${w}px;` +
      `height:${(w * (0.45 + Math.random() * 0.55)).toFixed(1)}px;` +
      `background:${colors[i % colors.length]};` +
      `border-radius:${Math.random() < 0.3 ? "50%" : "1.5px"};will-change:transform,opacity;`;
    layer.appendChild(piece);
    const angle = (i / COUNT) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 70 + Math.random() * 130;
    const dx = Math.cos(angle) * distance;
    const rise = Math.sin(angle) * distance - (30 + Math.random() * 60); // biased upward
    const fall = 140 + Math.random() * 160;
    const spin = (Math.random() - 0.5) * 720;
    piece.animate(
      [
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(${dx * 0.8}px, ${rise}px) rotate(${spin * 0.6}deg)`,
          opacity: 1,
          offset: 0.45,
        },
        { transform: `translate(${dx}px, ${rise + fall}px) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 500, easing: "cubic-bezier(0.15, 0.6, 0.4, 1)", fill: "forwards" },
    );
  }
  window.setTimeout(() => layer.remove(), 1500);
}

export function FolkWishes({ data, mode, guestName, checkin }: Props) {
  const slug = data.slug;
  const live = mode === "public";

  // Pre-fill the name with the invitation's guest (editable — they can change it).
  // Same prop on server + client, so the controlled input hydrates without a mismatch.
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
    // Attendance pills are asked only while unanswered; once answered the panel
    // shows the summary card. A wish-only submit still re-asserts the recorded
    // answer, so its wishes row carries the right attendance badge in the
    // dashboard (rsvps is append-only — latest wins — so re-asserting is fine).
    const collecting = showAttendance && answered === null;
    if (collecting && attending === null) {
      setError("Pilih dulu ya: hadir atau berhalangan.");
      return;
    }
    const rsvp = collecting
      ? attending !== null
        ? { attending, party }
        : null
      : answered;
    // The wish is required — it also carries the guest's name, which an
    // anonymous rsvps row can't (no name column), so the couple always sees
    // WHO. Exception: a keyed guest (?g=) answering the pills is already
    // attributable, so their RSVP may go out without a new wish.
    if (!trimmedMessage && !(collecting && rsvp && checkin)) {
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
        ...(showAttendance && rsvp
          ? {
              attending: rsvp.attending,
              partySize: rsvp.attending ? sizeFor(rsvp.party) : undefined,
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
      if (collecting && rsvp && checkin && result.attendanceSaved) {
        setAnswered(rsvp);
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
      const rsvpDropped = collecting && rsvp !== null && !result.attendanceSaved;
      if (rsvpDropped) {
        setNotice(
          "Ucapanmu tersimpan! Tapi konfirmasi kehadiran sudah ditutup, jadi jawabannya tidak ikut tercatat.",
        );
      } else {
        burstConfetti(submitRef.current);
      }
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
                    {answered ? (
                      /* Already responded (recorded status, or sent just now) —
                         show the summary instead of asking again. */
                      <div className="animate-sheet-in text-center">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#700F06] px-5 py-2.5 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[#E8E1D1] shadow-[0_10px_24px_-14px_rgba(0,0,0,0.6)]">
                          <Icon name="check" size={13} stroke="#E8E1D1" />
                          {answered.attending ? SUMMARY_LABEL[answered.party] : "Berhalangan Hadir"}
                        </div>
                        <div className="mt-2 font-body text-[11px] leading-relaxed text-[#3C471F]">
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
                            className="mt-1 font-body text-[11px] text-[#52602F] underline underline-offset-2 transition hover:text-[#700F06]"
                          >
                            Ubah jawaban
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
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

          {/* Guest wishes — Folk-themed cards (bordered cream panel, initial
              medallion, display-italic name, decorative gold quote) instead of
              the port's bare white boxes. All divs: the theme's element rules
              (`.scarlet-inv p/h3/small`) would out-specificity Tailwind. No
              data-aos on items — optimistically prepended cards mount after
              AOS's initial scan and would stay invisible. */}
          {list.length > 0 && (
            <div className="comment-wrap show">
              <div className="space-y-3">
                {shown.map((wish, i) => (
                  <div
                    key={`${wish.createdAt}-${i}`}
                    className="relative overflow-hidden rounded-2xl border border-[#E0D6BE] bg-white/55 px-5 py-4 shadow-[0_8px_20px_-16px_rgba(0,0,0,0.4)]"
                  >
                    {/* Quote ink sits in the top ~40% of the em box, so a small
                        positive top offset keeps it whole inside the card
                        (overflow-hidden would crop any negative offset). */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute right-4 top-2 select-none font-display text-[44px] font-bold italic leading-none text-[#C9A24B]/35"
                    >
                      &rdquo;
                    </div>
                    <div className="relative flex items-center gap-3 pr-9">
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-[13px] font-bold italic text-[#F5EFE0]",
                          AVATAR_TONES[i % AVATAR_TONES.length],
                        )}
                      >
                        {initials(wish.fromName)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-display text-[16px] font-bold italic text-[#700F06] [font-variation-settings:'opsz'_96]">
                          {wish.fromName}
                        </div>
                        <div className="mt-0.5 font-body text-[9px] font-semibold uppercase tracking-[0.18em] text-[#52602F]">
                          {wish.pendingModeration
                            ? "Menunggu persetujuan"
                            : formatShortDateId(wish.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-2.5 font-body text-[13px] leading-relaxed text-[#3C471F]">
                      {wish.body}
                    </div>
                  </div>
                ))}
              </div>
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

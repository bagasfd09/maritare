"use client";

// RSVP + wishes ("ucapan & doa") — the only interactive form on the page.
// Forms are live only in `public` mode; previews render everything disabled.

import { useState, useTransition } from "react";
import { format } from "date-fns";

import type { RsvpData } from "@/lib/invitation/sections";
import { submitInvitationResponse } from "@/server/actions/invitation";
import type { InvitationView } from "@/server/queries/invitation";

import { FloraDivider, OrnamentImg } from "./flora-ornaments";
import { formatShortDateId } from "./format";
import { Reveal } from "./reveal";

type FloraWishesProps = {
  slug: string;
  wishes: InvitationView["wishes"];
  rsvp: RsvpData;
  mode: "public" | "ownerPreview" | "editorPreview";
};

type WishItem = InvitationView["wishes"][number] & { pendingModeration?: boolean };

type Attendance = "hadir" | "tidak" | "ragu";

const ATTENDANCE_OPTIONS: { value: Attendance; label: string }[] = [
  { value: "hadir", label: "Hadir" },
  { value: "tidak", label: "Tidak Hadir" },
  { value: "ragu", label: "Masih Ragu" },
];

const MESSAGE_MAX = 600;

const inputClass =
  "w-full rounded-xl border border-line bg-ivory px-4 py-3 font-body text-[13.5px] text-charcoal placeholder:text-faint focus:border-burgundy focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

export function FloraWishes({ slug, wishes, rsvp, mode }: FloraWishesProps) {
  const live = mode === "public";

  // Date-only deadline check — the deadline day itself still counts.
  const deadlinePassed = rsvp.deadline ? format(new Date(), "yyyy-MM-dd") > rsvp.deadline : false;
  const showAttendance = rsvp.enabled && !deadlinePassed;

  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<Attendance>("hadir");
  const [partySize, setPartySize] = useState(1);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — humans never see it
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [list, setList] = useState<WishItem[]>(wishes);
  const [isPending, startTransition] = useTransition();

  const disabled = !live || isPending;

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
      setName("");
      setAttendance("hadir");
      setPartySize(1);
      setMessage("");
      setNotice("Terima kasih! Ucapanmu akan tampil setelah disetujui pasangan.");
    });
  };

  return (
    <section className="relative overflow-hidden px-8 py-16">
      {/* peony pair flanking the heading */}
      <Reveal variant="fade-right" className="pointer-events-none absolute -left-12 -top-4 w-32">
        <OrnamentImg asset="peony-blush" className="rotate-[24deg]" sway swayOrigin="origin-bottom-right" />
      </Reveal>
      <Reveal variant="fade-left" className="pointer-events-none absolute -right-12 -top-4 w-32">
        <OrnamentImg
          asset="peony-blush"
          mirrored
          className="-rotate-[24deg]"
          sway
          swayOrigin="origin-bottom-left"
        />
      </Reveal>

      <div className="relative text-center">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-ink">
          RSVP
        </p>
        <h2 className="mt-4 font-display text-[28px] font-bold tracking-[-0.02em] text-charcoal [font-variation-settings:'opsz'_96]">
          Ucapan &amp; <span className="font-normal italic text-burgundy">doa</span>
        </h2>
      </div>

      <Reveal delay={120} className="relative">
        <form onSubmit={handleSubmit} className="mt-9 space-y-4">
        {!live && (
          <p className="rounded-xl border border-dashed border-rule bg-cream/70 px-4 py-3 text-center font-body text-[12px] text-muted-ink">
            Form aktif setelah undangan dipublikasikan.
          </p>
        )}

        <div>
          <label
            htmlFor="flora-wish-name"
            className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-ink"
          >
            Nama
          </label>
          <input
            id="flora-wish-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Nama kamu"
            disabled={disabled}
            className={inputClass}
          />
        </div>

        {showAttendance ? (
          <div>
            <span className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-ink">
              Kehadiran
            </span>
            <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-line bg-ivory p-1.5">
              {ATTENDANCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAttendance(option.value)}
                  disabled={disabled}
                  aria-pressed={attendance === option.value}
                  className={
                    attendance === option.value
                      ? "rounded-lg bg-burgundy px-2 py-2 font-body text-[11px] font-medium text-ivory transition disabled:cursor-not-allowed disabled:opacity-60"
                      : "rounded-lg px-2 py-2 font-body text-[11px] font-medium text-muted-ink transition hover:text-burgundy disabled:cursor-not-allowed disabled:opacity-60"
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>

            {attendance === "hadir" && (
              <div className="mt-4">
                <label
                  htmlFor="flora-wish-party"
                  className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-ink"
                >
                  Jumlah Tamu
                </label>
                <select
                  id="flora-wish-party"
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                  disabled={disabled}
                  className={inputClass}
                >
                  {Array.from({ length: rsvp.maxPartySize }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} orang
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ) : (
          rsvp.enabled &&
          deadlinePassed && (
            <p className="rounded-xl border border-line bg-cream/70 px-4 py-3 text-center font-body text-[12px] text-muted-ink">
              Waktu konfirmasi kehadiran sudah berakhir.
            </p>
          )
        )}

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label
              htmlFor="flora-wish-message"
              className="block font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-ink"
            >
              Ucapan
            </label>
            <span className="font-body text-[10px] text-faint [font-feature-settings:'tnum']">
              {message.length}/{MESSAGE_MAX}
            </span>
          </div>
          <textarea
            id="flora-wish-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MESSAGE_MAX}
            rows={4}
            placeholder="Tulis ucapan dan doa terbaikmu…"
            disabled={disabled}
            className={inputClass}
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
          className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0"
        />

        {error && (
          <p className="rounded-xl border border-burgundy/40 bg-blush/30 px-4 py-3 text-center font-body text-[12px] text-burgundy">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-xl border border-sage/40 bg-sage-soft/40 px-4 py-3 text-center font-body text-[12px] text-forest">
            {notice}
          </p>
        )}

          <button
            type="submit"
            disabled={disabled}
            className="w-full rounded-full bg-burgundy py-3.5 font-body text-[12px] font-medium uppercase tracking-[0.18em] text-ivory transition hover:bg-burgundy-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Mengirim…" : "Kirim"}
          </button>
        </form>
      </Reveal>

      {list.length > 0 && (
        <div className="mt-12 space-y-4">
          <p className="text-center font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-faint">
            {list.length} ucapan
          </p>
          <ul className="space-y-3.5">
            {list.map((wish, i) => (
              <li
                key={`${wish.createdAt}-${i}`}
                className="rounded-2xl border border-line bg-ivory px-5 py-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-[15px] font-semibold text-charcoal">
                    {wish.fromName}
                  </span>
                  <span className="shrink-0 font-body text-[10.5px] text-faint">
                    {formatShortDateId(wish.createdAt)}
                  </span>
                </div>
                <p className="mt-1.5 font-body text-[13px] leading-relaxed text-muted-ink">
                  {wish.body}
                </p>
                {wish.pendingModeration && (
                  <span className="mt-2.5 inline-block rounded-full bg-peach/60 px-3 py-1 font-body text-[9.5px] font-semibold uppercase tracking-[0.14em] text-terracotta">
                    menunggu moderasi
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <FloraDivider className="mx-auto mt-14 w-48 text-rule" />
    </section>
  );
}

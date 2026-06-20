"use client";

// RSVP + wishes ("ucapan & doa") — the only interactive form on the page.
// Submit/honeypot/optimistic-pending logic is identical to Flora; forms are
// live only in `public` mode and disabled in previews. Restyled to crimson/gold.

import { useState, useTransition } from "react";
import { format } from "date-fns";

import type { RsvpData } from "@/lib/invitation/sections";
import { submitInvitationResponse } from "@/server/actions/invitation";
import type { InvitationView } from "@/server/queries/invitation";

import { Reveal } from "../flora/reveal";
import { CrimsonFloralImg } from "./crimson-florals";
import { CrimsonDivider } from "./crimson-ornaments";
import { formatShortDateId } from "./format";

type CrimsonWishesProps = {
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
  "w-full rounded-xl border border-[#C9A24B]/50 bg-[#F4ECDC] px-4 py-3 font-body text-[13.5px] text-[#2A2320] placeholder:text-[#7C7E5E]/70 focus:border-[#8B1E2D] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

export function CrimsonWishes({ slug, wishes, rsvp, mode }: CrimsonWishesProps) {
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
    <section className="relative overflow-hidden bg-[#EFE3CC]/70 px-8 py-16">
      {/* hanging gold ornament crowning the section */}
      <Reveal variant="fade-down" className="pointer-events-none absolute left-1/2 -top-2 w-14 -translate-x-1/2">
        <CrimsonFloralImg asset="gold-ornament" sway swayOrigin="origin-top" />
      </Reveal>

      {/* maroon rose + soft peony pair flanking the heading */}
      <Reveal variant="fade-right" className="pointer-events-none absolute -left-14 top-4 w-36">
        <CrimsonFloralImg asset="burgundy-roses" className="rotate-[24deg]" sway swayOrigin="origin-bottom-right" />
      </Reveal>
      <Reveal variant="fade-left" className="pointer-events-none absolute -right-14 top-4 w-36">
        <CrimsonFloralImg
          asset="burgundy-roses"
          mirrored
          className="-rotate-[24deg]"
          sway
          swayOrigin="origin-bottom-left"
        />
      </Reveal>

      <div className="relative mt-8 text-center">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.34em] text-[#7C7E5E]">
          RSVP
        </p>
        <h2 className="mt-4 [font-family:var(--font-cormorant)] text-[34px] font-normal tracking-[0.01em] text-[#8B1E2D]">
          Ucapan &amp; <span className="italic text-[#C9A24B]">doa</span>
        </h2>
      </div>

      <Reveal delay={120} className="relative">
        <form onSubmit={handleSubmit} className="mt-9 space-y-4">
          {!live && (
            <p className="rounded-xl border border-dashed border-[#C9A24B]/60 bg-[#F4ECDC]/80 px-4 py-3 text-center font-body text-[12px] text-[#7C7E5E]">
              Form aktif setelah undangan dipublikasikan.
            </p>
          )}

          <div>
            <label
              htmlFor="crimson-wish-name"
              className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7C7E5E]"
            >
              Nama
            </label>
            <input
              id="crimson-wish-name"
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
              <span className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7C7E5E]">
                Kehadiran
              </span>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#C9A24B]/50 bg-[#F4ECDC] p-1.5">
                {ATTENDANCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAttendance(option.value)}
                    disabled={disabled}
                    aria-pressed={attendance === option.value}
                    className={
                      attendance === option.value
                        ? "rounded-lg bg-[#8B1E2D] px-2 py-2 font-body text-[11px] font-medium text-[#F4ECDC] transition disabled:cursor-not-allowed disabled:opacity-60"
                        : "rounded-lg px-2 py-2 font-body text-[11px] font-medium text-[#7C7E5E] transition hover:text-[#8B1E2D] disabled:cursor-not-allowed disabled:opacity-60"
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {attendance === "hadir" && (
                <div className="mt-4">
                  <label
                    htmlFor="crimson-wish-party"
                    className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7C7E5E]"
                  >
                    Jumlah Tamu
                  </label>
                  <select
                    id="crimson-wish-party"
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
              <p className="rounded-xl border border-[#C9A24B]/50 bg-[#F4ECDC]/80 px-4 py-3 text-center font-body text-[12px] text-[#7C7E5E]">
                Waktu konfirmasi kehadiran sudah berakhir.
              </p>
            )
          )}

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label
                htmlFor="crimson-wish-message"
                className="block font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7C7E5E]"
              >
                Ucapan
              </label>
              <span className="font-body text-[10px] text-[#7C7E5E]/70 [font-feature-settings:'tnum']">
                {message.length}/{MESSAGE_MAX}
              </span>
            </div>
            <textarea
              id="crimson-wish-message"
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
            <p className="rounded-xl border border-[#8B1E2D]/40 bg-[#8B1E2D]/10 px-4 py-3 text-center font-body text-[12px] text-[#8B1E2D]">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-xl border border-[#7C7E5E]/40 bg-[#7C7E5E]/10 px-4 py-3 text-center font-body text-[12px] text-[#5d5f44]">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={disabled}
            className="w-full rounded-full border border-[#C9A24B] bg-[#8B1E2D] py-3.5 font-body text-[12px] font-medium uppercase tracking-[0.18em] text-[#F4ECDC] transition hover:bg-[#6E1622] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Mengirim…" : "Kirim"}
          </button>
        </form>
      </Reveal>

      {list.length > 0 && (
        <div className="mt-12 space-y-4">
          <p className="text-center font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7C7E5E]">
            {list.length} ucapan
          </p>
          <ul className="space-y-3.5">
            {list.map((wish, i) => (
              <li
                key={`${wish.createdAt}-${i}`}
                className="rounded-2xl border border-[#C9A24B]/40 bg-[#F4ECDC] px-5 py-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="[font-family:var(--font-cormorant)] text-[18px] font-medium text-[#8B1E2D]">
                    {wish.fromName}
                  </span>
                  <span className="shrink-0 font-body text-[10.5px] text-[#7C7E5E]/70">
                    {formatShortDateId(wish.createdAt)}
                  </span>
                </div>
                <p className="mt-1.5 font-body text-[13px] leading-relaxed text-[#2A2320]/85">
                  {wish.body}
                </p>
                {wish.pendingModeration && (
                  <span className="mt-2.5 inline-block rounded-full bg-[#C9A24B]/20 px-3 py-1 font-body text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#8B1E2D]">
                    menunggu moderasi
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <CrimsonDivider className="mx-auto mt-14 w-52 text-[#C9A24B]" />
    </section>
  );
}

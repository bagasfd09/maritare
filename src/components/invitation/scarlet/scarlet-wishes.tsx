"use client";

// RSVP + wishes ("ucapan & doa") — the only interactive form on the page.
// Forms are live only in `public` mode; previews render everything disabled.

import { useState, useTransition } from "react";
import { format } from "date-fns";

import type { RsvpData } from "@/lib/invitation/sections";
import { submitInvitationResponse } from "@/server/actions/invitation";
import type { InvitationView } from "@/server/queries/invitation";

import { formatShortDateId } from "./format";
import { DIVIDER_GOLD, SHIELD_RED, ScarletImg } from "./scarlet-ornaments";
import { Reveal } from "../flora/reveal";

type ScarletWishesProps = {
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
  "w-full rounded-[2px] border border-[#cdbb9a] bg-[#fcf9f4] px-4 py-3 text-[13.5px] text-[#2a221c] placeholder:text-[#9c8f7c] focus:border-[#700f06] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

export function ScarletWishes({ slug, wishes, rsvp, mode }: ScarletWishesProps) {
  const live = mode === "public";

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
    <section className="relative overflow-hidden bg-[#fcf9f4] px-8 py-20">
      <div className="relative text-center">
        <ScarletImg name={SHIELD_RED} className="mx-auto mb-5 w-11" />
        <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-[#8a643c]">RSVP</p>
        <h2 className="mt-4 [font-family:var(--font-cormorant)] text-[34px] font-light leading-tight text-[#2a221c]">
          Ucapan &amp; <span className="italic text-[#700f06]">doa</span>
        </h2>
      </div>

      <Reveal delay={120} className="relative">
        <form onSubmit={handleSubmit} className="mt-9 space-y-4">
          {!live && (
            <p className="rounded-[2px] border border-dashed border-[#cdbb9a] bg-[#f5f2e4] px-4 py-3 text-center text-[12px] text-[#6f6253]">
              Form aktif setelah undangan dipublikasikan.
            </p>
          )}

          <div>
            <label
              htmlFor="scarlet-wish-name"
              className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.24em] text-[#6f6253]"
            >
              Nama
            </label>
            <input
              id="scarlet-wish-name"
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
              <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.24em] text-[#6f6253]">
                Kehadiran
              </span>
              <div className="grid grid-cols-3 gap-1.5 rounded-[2px] border border-[#cdbb9a] bg-[#fcf9f4] p-1.5">
                {ATTENDANCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAttendance(option.value)}
                    disabled={disabled}
                    aria-pressed={attendance === option.value}
                    className={
                      attendance === option.value
                        ? "rounded-[1px] bg-[#700f06] px-2 py-2 text-[11px] font-medium text-[#f5f2e4] transition disabled:cursor-not-allowed disabled:opacity-60"
                        : "rounded-[1px] px-2 py-2 text-[11px] font-medium text-[#6f6253] transition hover:text-[#700f06] disabled:cursor-not-allowed disabled:opacity-60"
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {attendance === "hadir" && (
                <div className="mt-4">
                  <label
                    htmlFor="scarlet-wish-party"
                    className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.24em] text-[#6f6253]"
                  >
                    Jumlah Tamu
                  </label>
                  <select
                    id="scarlet-wish-party"
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
              <p className="rounded-[2px] border border-[#cdbb9a] bg-[#f5f2e4] px-4 py-3 text-center text-[12px] text-[#6f6253]">
                Waktu konfirmasi kehadiran sudah berakhir.
              </p>
            )
          )}

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label
                htmlFor="scarlet-wish-message"
                className="block text-[10px] font-medium uppercase tracking-[0.24em] text-[#6f6253]"
              >
                Ucapan
              </label>
              <span className="text-[10px] text-[#9c8f7c] [font-feature-settings:'tnum']">
                {message.length}/{MESSAGE_MAX}
              </span>
            </div>
            <textarea
              id="scarlet-wish-message"
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
            <p className="rounded-[2px] border border-[#700f06]/40 bg-[#700f06]/5 px-4 py-3 text-center text-[12px] text-[#700f06]">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-[2px] border border-[#a98534]/50 bg-[#a98534]/10 px-4 py-3 text-center text-[12px] text-[#5b4636]">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={disabled}
            className="w-full rounded-full bg-[#700f06] py-3.5 text-[12px] font-medium uppercase tracking-[0.22em] text-[#f5f2e4] transition hover:bg-[#560b04] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Mengirim…" : "Kirim"}
          </button>
        </form>
      </Reveal>

      {list.length > 0 && (
        <div className="mt-12 space-y-4">
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.3em] text-[#9c8f7c]">
            {list.length} ucapan
          </p>
          <ul className="space-y-3">
            {list.map((wish, i) => (
              <li key={`${wish.createdAt}-${i}`} className="border border-[#e0d6c2] bg-[#f5f2e4] px-5 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="[font-family:var(--font-cormorant)] text-[18px] text-[#700f06]">
                    {wish.fromName}
                  </span>
                  <span className="shrink-0 text-[10.5px] text-[#9c8f7c]">
                    {formatShortDateId(wish.createdAt)}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#6f6253]">{wish.body}</p>
                {wish.pendingModeration && (
                  <span className="mt-2.5 inline-block rounded-full bg-[#a98534]/20 px-3 py-1 text-[9.5px] font-medium uppercase tracking-[0.14em] text-[#8a643c]">
                    menunggu moderasi
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ScarletImg name={DIVIDER_GOLD} className="mx-auto mt-12 w-48" />
    </section>
  );
}

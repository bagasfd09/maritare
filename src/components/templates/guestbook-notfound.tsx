"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/atoms/icon";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { GuestbookShell } from "@/components/templates/guestbook-shell";
import { GuestbookButton, GuestbookStep } from "@/components/molecules/guestbook-primitives";
import { addWalkInGuest } from "@/server/actions/guestbook";
import type { KioskHeader } from "@/server/queries/guestbook";
import { cn } from "@/lib/utils";

// Guestbook 05 · Tidak Terdaftar — walk-in guest registration.
// Ported from `Gb2_NotFound`, now a working form: name + side + headcount +
// note + quick-group chips are all stateful; the submit CTA stays disabled
// until a name is entered. On submit the walk-in is persisted via
// `addWalkInGuest` (ownership re-derived server-side) and we hand off to the
// wish screen carrying the new guest id.

// Couple fallback when no live header (matches the prototype t = {Andi, Putri}).
const FALLBACK_COUPLE = { groom: "Andi", bride: "Putri" };

const MIN_GUESTS = 1;
const MAX_GUESTS = 20;

// gb2Eyebrow at label scale (fontSize 9.5, marginBottom 8).
const label = "font-body text-[9.5px] tracking-[0.24em] uppercase font-semibold text-muted-ink mb-2";

type GuestSide = "groom" | "bride" | "both";

export function GuestbookNotFound({ header }: { header?: KioskHeader | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const groomName = header?.groomName ?? FALLBACK_COUPLE.groom;
  const brideName = header?.brideName ?? FALLBACK_COUPLE.bride;

  // Side labels map to the DB enum: groom's side / bride's side / both ("—").
  const sides: { label: string; value: GuestSide }[] = [
    { label: groomName, value: "groom" },
    { label: brideName, value: "bride" },
    { label: "—", value: "both" },
  ];

  const quickGroups = [
    `Keluarga ${groomName}`,
    `Keluarga ${brideName}`,
    "Teman SMA",
    "Teman Kuliah",
    "Kantor",
    "Tetangga",
  ];

  const [name, setName] = useState("");
  const [sideIndex, setSideIndex] = useState(0);
  const [count, setCount] = useState(2);
  const [note, setNote] = useState("");
  const [group, setGroup] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && !pending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setError(null);
    startTransition(async () => {
      const result = await addWalkInGuest({
        name: name.trim(),
        side: sides[sideIndex].value,
        partySize: count,
        // Free-text note goes to `note`; the quick-group chip (if any) to `group`.
        note: note.trim() ? note.trim() : undefined,
        group: group ?? undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/guestbook/thankyou?guest=${result.guestId}`);
    });
  };

  return (
    <GuestbookShell eyebrow="Buku Tamu · Tamu tambahan" header={header}>
      <div className="h-full grid grid-cols-2 gap-11 px-14 pt-9 pb-8">
        {/* Left: gentle message */}
        <div className="flex flex-col justify-center">
          <GuestbookStep>02 · tamu tak terdaftar</GuestbookStep>
          <h1 className="font-display [font-variation-settings:'opsz'_96] font-extrabold tracking-[-0.03em] leading-[1.02] text-charcoal text-[58px] m-0 mt-4">
            Tidak apa-apa.
            <br />
            <span className="font-display italic font-normal tracking-[-0.01em] text-burgundy">
              Mari kita catat.
            </span>
          </h1>
          <p className="font-body text-[16.5px] leading-[1.6] text-[#3F3B35] max-w-[440px] mt-[18px] mb-[26px] mx-0">
            Sepertinya namamu belum tercantum dalam daftar tamu. Tidak masalah &mdash; silakan
            tambahkan, kami akan menyambut kamu dengan senang hati.
          </p>

          <div className="bg-peach rounded-2xl px-5 py-4 flex gap-[14px] items-start max-w-[480px]">
            <FlowerMark
              size={20}
              color="var(--color-burgundy)"
              core="var(--color-burgundy-dark)"
              stamen="var(--color-peach)"
            />
            <div className="flex-1">
              <div className="font-display font-semibold text-[16.5px] tracking-[-0.015em] text-burgundy-dark">
                Tip dari penjaga
              </div>
              <div className="font-body text-[13.5px] leading-[1.55] text-[#5a4a3e] mt-1">
                Coba minta tamu cek WhatsApp &mdash; undangan biasanya dikirim dari nomor pasangan.
                Atau cek ejaan nama (Reza vs Rezha).
              </div>
            </div>
          </div>
        </div>

        {/* Right: walk-in form */}
        <div className="bg-paper border border-line rounded-[18px] px-7 pt-6 pb-[22px] flex flex-col gap-4">
          <div>
            <div className={label}>Nama tamu</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Contoh: Pak Sutrisno (mertua tante)"
              aria-label="Nama tamu"
              className="w-full bg-transparent outline-none border-0 border-b-[1.5px] border-charcoal font-display font-semibold text-[25px] tracking-[-0.02em] text-charcoal py-1 px-0 placeholder:text-faint placeholder:font-normal"
            />
          </div>

          <div className="grid grid-cols-2 gap-[14px]">
            <div>
              <div className={label}>Pihak</div>
              <div className="flex gap-[5px]">
                {sides.map((s, i) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSideIndex(i)}
                    className={cn(
                      "flex-1 h-11 rounded-full font-body text-[11px] font-semibold tracking-[0.12em] uppercase cursor-pointer transition-colors",
                      sideIndex === i
                        ? "border border-transparent bg-burgundy text-cream"
                        : "border border-charcoal/20 bg-transparent text-charcoal",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className={label}>Jumlah orang</div>
              <div className="flex items-center gap-[10px] bg-cream rounded-full p-1 h-11">
                <button
                  type="button"
                  onClick={() => setCount((c) => Math.max(MIN_GUESTS, c - 1))}
                  disabled={count <= MIN_GUESTS}
                  aria-label="Kurangi jumlah orang"
                  className="w-9 h-9 border-none rounded-full bg-transparent font-body text-[20px] text-charcoal cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  &minus;
                </button>
                <div className="flex-1 text-center font-display font-bold text-[22px] text-charcoal tabular-nums">
                  {count}
                </div>
                <button
                  type="button"
                  onClick={() => setCount((c) => Math.min(MAX_GUESTS, c + 1))}
                  disabled={count >= MAX_GUESTS}
                  aria-label="Tambah jumlah orang"
                  className="w-9 h-9 border-none rounded-full bg-charcoal text-cream font-body text-[20px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className={label}>Grup / catatan (opsional)</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Tante Wati dari Pak Sutrisno"
              aria-label="Grup atau catatan"
              rows={2}
              className="w-full bg-cream rounded-xl px-4 py-3 font-body text-[14.5px] leading-[1.6] text-charcoal min-h-[56px] border-none outline-none resize-none placeholder:text-faint"
            />
          </div>

          <div>
            <div className={label}>Grup cepat</div>
            <div className="flex flex-wrap gap-[7px]">
              {quickGroups.map((g) => {
                const on = group === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGroup(on ? null : g)}
                    className={cn(
                      "px-[14px] py-2 rounded-full font-body font-medium text-[11px] tracking-[0.08em] uppercase cursor-pointer transition-colors",
                      on
                        ? "border border-transparent bg-charcoal text-cream"
                        : "border border-beige bg-transparent text-muted-ink",
                    )}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit error — burgundy line, never leaks internals. */}
          {error && (
            <div className="font-body text-[12.5px] leading-[1.5] text-burgundy" role="alert">
              {error}
            </div>
          )}

          <div className="flex gap-[10px] mt-auto pt-[6px]">
            <Link href="/guestbook/search" className="flex-1 no-underline">
              <GuestbookButton kind="ghost" h={54} fz={12} className="w-full" tabIndex={-1}>
                Batal
              </GuestbookButton>
            </Link>
            <GuestbookButton
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              h={54}
              fz={12.5}
              className={cn("flex-[2] w-auto", !canSubmit && "opacity-40 cursor-not-allowed")}
              iconAfter={<Icon name="arrow-r" size={16} />}
            >
              {pending ? "Menyimpan…" : "Tambahkan & check-in"}
            </GuestbookButton>
          </div>
        </div>
      </div>
    </GuestbookShell>
  );
}

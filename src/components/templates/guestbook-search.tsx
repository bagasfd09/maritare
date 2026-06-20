"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/atoms/icon";
import { Avatar, initials } from "@/components/atoms/avatar";
import { GuestbookShell } from "@/components/templates/guestbook-shell";
import { GuestbookButton, GuestbookTabs } from "@/components/molecules/guestbook-primitives";
import type { KioskGuest, KioskHeader } from "@/server/queries/guestbook";

type Row = {
  id: string | null; // null = mock fallback row (no real guest to confirm against)
  name: string;
  group: string;
  side: string;
  tone: "burgundy" | "sage" | "peach";
  checkedIn: boolean;
};

type GuestbookSearchProps = {
  header?: KioskHeader | null;
  guests?: KioskGuest[];
};

// Ports `Gb2_Search` — name search with live suggestions. The directory now
// renders the session-owned wedding's real guests; the mock list below is the
// design fallback used only when the kiosk has no data yet.
const FALLBACK_DIRECTORY: Row[] = [
  { id: null, name: "Reza Hartono", group: "Keluarga Mempelai Pria", side: "Andi", tone: "burgundy", checkedIn: false },
  { id: null, name: "Reza Bayu Pratama", group: "Teman SMA Andi", side: "Andi", tone: "sage", checkedIn: false },
  { id: null, name: "Rezaldi & Sari", group: "Sahabat Pasangan", side: "—", tone: "peach", checkedIn: false },
  { id: null, name: "Maya Lestari", group: "Kantor Putri", side: "Putri", tone: "burgundy", checkedIn: false },
  { id: null, name: "Bayu Pratama", group: "Teman SMA Andi", side: "Andi", tone: "sage", checkedIn: false },
  { id: null, name: "Sari Wijaya", group: "Keluarga Mempelai Wanita", side: "Putri", tone: "peach", checkedIn: false },
  { id: null, name: "Dina Permata", group: "Sahabat Pasangan", side: "—", tone: "burgundy", checkedIn: false },
  { id: null, name: "Tiara Maharani", group: "Teman Kuliah Putri", side: "Putri", tone: "sage", checkedIn: false },
];

const ROW_TONES = ["burgundy", "sage", "peach"] as const;

export function GuestbookSearch({ header, guests }: GuestbookSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const isIdle = query.trim() === "";

  // Map real guests onto the row presentation. The side label resolves to the
  // couple's first names (groom/bride) so it reads exactly like the prototype;
  // tone cycles deterministically to keep the avatar palette varied. When the
  // kiosk has no data (no header / empty guest list) the mock fallback renders.
  const directory = useMemo<Row[]>(() => {
    if (!guests || guests.length === 0) {
      return FALLBACK_DIRECTORY;
    }
    const groom = header?.groomName ?? "Andi";
    const bride = header?.brideName ?? "Putri";
    return guests.map((g, i) => ({
      id: g.id,
      name: g.name,
      group: g.group ?? "Tamu Undangan",
      side: g.side === "groom" ? groom : g.side === "bride" ? bride : "—",
      tone: ROW_TONES[i % ROW_TONES.length],
      checkedIn: g.checkedInAt !== null,
    }));
  }, [guests, header]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return []; // no list until the guest starts typing
    return directory.filter((s) => s.name.toLowerCase().includes(q));
  }, [query, directory]);

  // Build the /guestbook/confirm href for a row. Mock fallback rows have no
  // real guest id, so they route to a bare confirm (which redirects to search
  // server-side) — the real rows carry their guest id.
  const confirmHref = (id: string | null) =>
    id ? `/guestbook/confirm?guest=${id}` : "/guestbook/confirm";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const first = matches[0];
    if (first) router.push(confirmHref(first.id));
  };

  return (
    <GuestbookShell eyebrow="Buku Tamu · Check-in" header={header}>
      <div className="px-14 pt-5 pb-[26px] h-full flex flex-col">
        {/* Tabs + heading */}
        <div className="flex justify-center mb-[18px]">
          <GuestbookTabs active="search" />
        </div>
        <h1 className="font-display [font-variation-settings:'opsz'_96] font-extrabold tracking-[-0.03em] leading-[1.04] text-charcoal text-[46px] m-0 text-center mb-5">
          Selamat datang. Siapa{" "}
          <span className="font-display italic font-normal tracking-[-0.01em] text-burgundy">namamu?</span>
        </h1>

        {/* Search bar */}
        <form onSubmit={onSubmit} className="flex justify-center mb-4">
          <div className="w-[740px] flex items-center gap-4 bg-paper border-[1.5px] border-charcoal rounded-full py-[9px] pr-[9px] pl-7 shadow-[0_16px_32px_-20px_rgba(26,26,26,0.35)]">
            <Icon name="search" size={20} stroke="var(--color-faint)" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              placeholder="Ketik nama kamu…"
              aria-label="Cari nama tamu"
              className="flex-1 bg-transparent border-none outline-none font-body font-medium text-[24px] text-charcoal tracking-[-0.01em] placeholder:text-faint"
            />
            <GuestbookButton type="submit" h={46} fz={12}>
              Cari
            </GuestbookButton>
          </div>
        </form>

        {/* Suggestions */}
        <div className="flex justify-center">
          <div className="w-[740px] flex flex-col gap-[7px]">
            {isIdle ? (
              <div className="animate-gb-fade-up font-display italic font-normal tracking-[-0.01em] text-[16px] text-faint text-center py-6">
                Mulai ketik namamu — daftar tamu yang cocok muncul di sini.
              </div>
            ) : matches.length > 0 ? (
              <>
                <div className="font-body text-[10px] tracking-[0.24em] uppercase font-semibold text-muted-ink px-4 mb-[2px]">
                  {matches.length} nama cocok
                </div>
                {matches.map((s, i) =>
                  s.id === null ? (
                    /* Mock fallback row (no real guest behind it) — not clickable,
                       so a tap never silently round-trips back to search. */
                    <div
                      key={s.name}
                      title="Contoh tampilan — tamu asli muncul setelah daftar tamu terisi"
                      style={{ animationDelay: `${i * 70}ms` }}
                      className="animate-gb-fade-up bg-paper border border-line rounded-[14px] py-[11px] px-5 flex items-center gap-4 opacity-70"
                    >
                      <Avatar tone={s.tone} size={42} className="text-[15px]">
                        {initials(s.name)}
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-display font-semibold text-[19px] tracking-[-0.02em] text-charcoal leading-[1.1]">
                          {s.name}
                        </div>
                        <div className="font-body text-[9.5px] tracking-[0.18em] uppercase font-semibold text-muted-ink mt-[3px]">
                          {s.group} · Pihak {s.side}
                        </div>
                      </div>
                      <span className="font-body text-[9px] tracking-[0.16em] uppercase font-semibold text-faint">
                        Contoh
                      </span>
                    </div>
                  ) : (
                  <Link
                    key={s.id}
                    href={confirmHref(s.id)}
                    style={{ animationDelay: `${i * 70}ms` }}
                    className={
                      i === 0
                        ? "animate-gb-fade-up bg-ivory border border-burgundy rounded-[14px] py-[11px] px-5 flex items-center gap-4 cursor-pointer text-left no-underline"
                        : "animate-gb-fade-up bg-paper border border-line rounded-[14px] py-[11px] px-5 flex items-center gap-4 cursor-pointer text-left no-underline"
                    }
                  >
                    <Avatar tone={s.tone} size={42} className="text-[15px]">
                      {initials(s.name)}
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-display font-semibold text-[19px] tracking-[-0.02em] text-charcoal leading-[1.1]">
                        {s.name}
                      </div>
                      <div className="font-body text-[9.5px] tracking-[0.18em] uppercase font-semibold text-muted-ink mt-[3px]">
                        {s.group} · Pihak {s.side}
                      </div>
                    </div>
                    {/* Already checked in → a subtle sage pill instead of the
                        arrow. The row still links to confirm (re-confirm OK). */}
                    {s.checkedIn ? (
                      <span className="inline-flex items-center gap-[6px] bg-[rgba(124,126,94,0.16)] text-[#4a4c34] py-[5px] px-[11px] rounded-full font-body text-[9px] tracking-[0.16em] uppercase font-bold whitespace-nowrap">
                        <Icon name="check" size={10} stroke="#4a4c34" />
                        Sudah check-in
                      </span>
                    ) : (
                      i === 0 && <Icon name="arrow-r" size={18} stroke="var(--color-burgundy)" />
                    )}
                  </Link>
                ))}
              </>
            ) : (
              <div className="bg-paper border border-line rounded-[14px] py-6 px-5 text-center">
                <div className="font-display italic text-[18px] text-charcoal">
                  Nama <span className="text-burgundy">&ldquo;{query.trim()}&rdquo;</span> tidak ditemukan.
                </div>
                <Link
                  href="/guestbook/notfound"
                  className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.18em] uppercase font-semibold text-burgundy no-underline mt-3"
                >
                  Daftarkan sebagai walk-in <Icon name="arrow-r" size={14} stroke="var(--color-burgundy)" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </GuestbookShell>
  );
}

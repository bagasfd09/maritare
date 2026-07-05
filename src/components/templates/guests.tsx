"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { DashboardShell } from "@/components/templates/dashboard-shell";
import { DashboardTopBar } from "@/components/organisms/dashboard-topbar";
import { Button } from "@/components/atoms/button";
import { CircleButton } from "@/components/atoms/circle-button";
import { Icon } from "@/components/atoms/icon";
import { Avatar, initials } from "@/components/atoms/avatar";
import { Em, Num } from "@/components/atoms/typography";
import { GuestStatus } from "@/components/molecules/guest-status";
import { GuestsImportModal } from "@/components/molecules/guests-import-modal";
import { GuestQrModal } from "@/components/molecules/guest-qr-modal";
import { GuestFormModal } from "@/components/molecules/guest-form-modal";
import { customSides } from "@/lib/guests-csv";
import { buildInviteMessage, waMeLink } from "@/lib/invite-message";
import { normalizePhoneIntl } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { markGuestInvited } from "@/server/actions/guests";
import type { DashboardChrome, GuestsData } from "@/server/queries/dashboard";

type GuestRow = GuestsData["guests"][number];

const AVATAR_TONES = ["peach", "sage", "blush", "burgundy", "dark"] as const;

// Status filter pills — label → guest status (null = no filter).
const FILTERS: { label: string; status: GuestRow["status"] | null }[] = [
  { label: "Semua", status: null },
  { label: "Hadir", status: "confirmed" },
  { label: "Belum", status: "pending" },
  { label: "Tidak", status: "declined" },
];

// Side filter pills — label → bride/groom side (null = no filter). Custom
// sides present in the guest list get appended dynamically.
const SIDE_FILTERS: { label: string; side: GuestRow["side"] | null }[] = [
  { label: "Semua", side: null },
  { label: "Wanita", side: "bride" },
  { label: "Pria", side: "groom" },
];

// Rows per page — small enough that the seeded list demonstrates real paging.
const PAGE_SIZE = 6;

// Windowed page numbers with gaps so the bar stays short: 1 … 4 5 6 … 20.
function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  const out: (number | "…")[] = [1];
  if (start > 2) out.push("…");
  for (let n = start; n <= end; n++) out.push(n);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

const TH = "font-body text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-ink px-[14px] py-3 border-b border-beige";
const TD = "p-[14px] border-b border-line align-middle";

function sideLabel(side: GuestRow["side"]) {
  return side === "bride"
    ? "Pengantin Wanita"
    : side === "groom"
      ? "Pengantin Pria"
      : side === "both"
        ? "Bersama"
        : side;
}

type GuestsProps = {
  data: GuestsData;
  chrome: DashboardChrome | null;
};

// Screen 03 · Daftar Tamu (Guests). Renders real guest data from the server.
export function Guests({ data, chrome }: GuestsProps) {
  const rows = data.guests;
  const stats = data.stats;
  const respondedPct =
    stats.invited > 0 ? Math.round((stats.confirmed / stats.invited) * 100) : 0;

  // Live search + status filter + pagination over the (real or fallback) rows.
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<GuestRow["status"] | null>(null);
  const [sideFilter, setSideFilter] = useState<GuestRow["side"] | null>(null);
  const [page, setPage] = useState(1);
  const [importOpen, setImportOpen] = useState(false);
  const [qrGuest, setQrGuest] = useState<{ id: string; name: string } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editGuest, setEditGuest] = useState<GuestRow | null>(null);
  const [formNonce, setFormNonce] = useState(0);
  const [blastMsg, setBlastMsg] = useState<string | null>(null);
  const [, startBlast] = useTransition();
  const router = useRouter();

  const groomName = chrome?.groomName ?? "";
  const brideName = chrome?.brideName ?? "";

  function openAddGuest() {
    setFormMode("add");
    setEditGuest(null);
    setFormNonce((n) => n + 1);
    setFormOpen(true);
  }
  function openEditGuest(g: GuestRow) {
    setFormMode("edit");
    setEditGuest(g);
    setFormNonce((n) => n + 1);
    setFormOpen(true);
  }

  // Manual: open wa.me with a prefilled invite, then mark the guest as invited.
  function handleManualWa(g: GuestRow) {
    const target = normalizePhoneIntl(g.phone);
    if (!target) {
      setBlastMsg(`${g.name} belum punya nomor WhatsApp yang valid.`);
      return;
    }
    const message = buildInviteMessage({
      guestName: g.name,
      groomName,
      brideName,
      slug: data.weddingSlug,
      guestCode: g.code ?? undefined,
    });
    window.open(waMeLink(target, message), "_blank", "noopener");
    startBlast(async () => {
      await markGuestInvited({ guestId: g.id });
      router.refresh();
    });
  }

  const extraSides = useMemo(() => customSides(rows.map((g) => g.side)), [rows]);
  const sideFilters = useMemo(
    () => [...SIDE_FILTERS, ...extraSides.map((s) => ({ label: s, side: s }))],
    [extraSides],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((g) => {
      if (statusFilter && g.status !== statusFilter) return false;
      if (sideFilter && g.side !== sideFilter) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        (g.group ?? "").toLowerCase().includes(q) ||
        (g.phone ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter, sideFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp instead of resetting state so stale page values can never overflow.
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = (safePage - 1) * PAGE_SIZE + pageRows.length;

  const STAT_CARDS = [
    { value: stats.invited, label: "Total diundang", sub: "Termasuk pasangan", surface: "bg-paper border border-line", numClass: "text-charcoal", labelClass: "text-muted-ink", subClass: "text-faint" },
    { value: stats.confirmed, label: "Akan hadir", sub: `${respondedPct}% konfirmasi`, surface: "bg-sage-soft", numClass: "text-[#1c5a36]", labelClass: "text-[#2E3325]", subClass: "text-[#2E3325]" },
    { value: stats.pending, label: "Belum balas", sub: "Kirim reminder?", surface: "bg-peach", numClass: "text-burgundy-dark", labelClass: "text-[#5a2a18]", subClass: "text-[#5a2a18]" },
    { value: stats.declined, label: "Tidak hadir", sub: "—", surface: "bg-paper border border-line", numClass: "text-burgundy", labelClass: "text-muted-ink", subClass: "text-faint" },
  ];

  return (
    <DashboardShell active="guests" chrome={chrome}>
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          num="§ IV"
          eyebrow="Daftar Tamu"
          title={<>{stats.invited} nama, <Em className="text-burgundy">satu cerita.</Em></>}
          actions={
            <>
              <Button
                variant="ghost"
                onClick={() => { window.location.href = "/api/guests/export"; }}
              >
                <Icon name="download" size={14} />Export
              </Button>
              <Button variant="ghost" onClick={() => setImportOpen(true)}>
                <Icon name="upload" size={14} />Import .csv
              </Button>
              <Button variant="ghost" onClick={openAddGuest}><Icon name="plus" size={14} />Tambah tamu</Button>
              <Button
                onClick={() => router.push("/dashboard/guests/sebar")}
                className="bg-[#1FA855] text-white border-transparent hover:bg-[#1b9a4d] shadow-[0_8px_18px_-10px_rgba(31,168,85,0.8)]"
              >
                <Icon name="wa" size={14} stroke="#fff" />
                Sebar via WhatsApp
              </Button>
            </>
          }
        />

        <div className="flex-1 px-10 py-[26px] overflow-y-auto flex flex-col">
          {/* Stat strip */}
          <div className="grid grid-cols-4 gap-[14px] mb-[22px]">
            {STAT_CARDS.map((s) => (
              <div key={s.label} className={cn("rounded-[14px] px-[18px] py-4 flex items-center gap-[14px]", s.surface)}>
                <Num className={cn("text-[38px]", s.numClass)}>{s.value}</Num>
                <div>
                  <div className={cn("text-[10px] tracking-[0.2em] uppercase font-semibold", s.labelClass)}>{s.label}</div>
                  <div className={cn("text-[11px] mt-[2px] italic font-display", s.subClass)}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-[10px] bg-paper border border-line rounded-full px-4 py-2 flex-1 max-w-[360px]">
              <Icon name="search" size={14} stroke="var(--color-muted-ink)" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Cari nama, grup, atau nomor…"
                className="flex-1 border-none bg-transparent outline-none font-body text-[13px]"
              />
            </div>
            <Button variant="ghost" size="sm"><Icon name="filter" size={12} />Filter</Button>
            <div className="flex gap-1 bg-paper border border-line rounded-full p-[3px]">
              {FILTERS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => { setStatusFilter(t.status); setPage(1); }}
                  className={cn(
                    "px-3 py-[6px] rounded-full text-[11px] tracking-[0.1em] uppercase font-semibold cursor-pointer transition-colors",
                    statusFilter === t.status ? "text-cream bg-charcoal" : "text-muted-ink bg-transparent",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-paper border border-line rounded-full p-[3px]">
              {sideFilters.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => { setSideFilter(t.side); setPage(1); }}
                  className={cn(
                    "px-3 py-[6px] rounded-full text-[11px] tracking-[0.1em] uppercase font-semibold cursor-pointer transition-colors",
                    sideFilter === t.side ? "text-cream bg-charcoal" : "text-muted-ink bg-transparent",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            {blastMsg && <span className="text-[11px] text-muted-ink">{blastMsg}</span>}
          </div>

          {/* Table — the card fills the remaining height; rows scroll INSIDE it
              (sticky header) so the pagination footer is always visible. */}
          <div className="flex-1 min-h-[280px] bg-paper border border-line rounded-2xl overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto">
            <table className="w-full border-separate border-spacing-0 text-[13px] [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:hover_td]:bg-[rgba(124,45,45,0.03)] [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:bg-paper [&_thead_th]:z-10">
              <thead>
                <tr>
                  <th className={cn(TH, "text-left w-10 pl-[22px]")}><input type="checkbox" /></th>
                  <th className={cn(TH, "text-left")}>Nama tamu</th>
                  <th className={cn(TH, "text-left")}>Grup</th>
                  <th className={cn(TH, "text-left")}>Nomor</th>
                  <th className={cn(TH, "text-left")}>RSVP</th>
                  <th className={cn(TH, "text-center")}>Bawa</th>
                  <th className={cn(TH, "text-left")}>Makanan</th>
                  <th className={cn(TH, "text-left")}>Undangan</th>
                  <th className={cn(TH, "w-10")} />
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center font-display italic text-[15px] text-faint">
                      Tidak ada tamu yang cocok dengan pencarian ini.
                    </td>
                  </tr>
                )}
                {pageRows.map((g, i) => (
                  <tr key={g.id}>
                    <td className={cn(TD, "pl-[22px]")}><input type="checkbox" /></td>
                    <td className={TD}>
                      <div className="flex items-center gap-3">
                        <Avatar tone={AVATAR_TONES[i % 5]}>{initials(g.name)}</Avatar>
                        <div>
                          <div className="font-semibold text-[13px]">{g.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className={TD}>
                      <div className="text-[12px]">{g.group ?? "—"}</div>
                      <div className="text-[10px] text-muted-ink tracking-[0.18em] uppercase mt-[2px]">
                        {sideLabel(g.side)}
                      </div>
                    </td>
                    <td className={TD}>
                      <span className={cn("text-[12px]", g.phone ? "text-charcoal" : "text-faint")}>{g.phone ?? "—"}</span>
                    </td>
                    <td className={TD}><GuestStatus status={g.status} /></td>
                    <td className={cn(TD, "text-center font-display font-bold text-[16px]")}>
                      {g.partySize !== null ? g.partySize : <span className="text-faint">—</span>}
                    </td>
                    <td className={TD}>
                      <span className={cn("text-[12px]", g.foodChoice ? "text-charcoal" : "text-faint")}>{g.foodChoice ?? "—"}</span>
                    </td>
                    <td className={TD}>
                      {g.invitationStatus === "none" ? (
                        <span className="text-[11px] tracking-[0.12em] uppercase font-semibold inline-flex items-center gap-[5px] text-faint">
                          <Icon name="envelope" size={11} />
                          Belum dikirim
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "text-[11px] tracking-[0.12em] uppercase font-semibold inline-flex items-center gap-[5px]",
                            g.invitationStatus === "opened" ? "text-[#1c5a36]" : "text-muted-ink",
                          )}
                        >
                          <Icon name={g.invitationStatus === "opened" ? "eye" : "envelope"} size={11} />
                          {g.invitationStatus === "opened" ? "Dibuka" : "Terkirim"}
                        </span>
                      )}
                    </td>
                    <td className={TD}>
                      <div className="flex items-center gap-[6px] justify-end">
                        <CircleButton
                          size={28}
                          title={g.phone ? "Kirim WhatsApp (manual)" : "Tamu belum punya nomor"}
                          onClick={() => handleManualWa(g)}
                          disabled={!g.phone}
                          className="disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Icon name="wa" size={12} />
                        </CircleButton>
                        <CircleButton
                          size={28}
                          title="QR check-in"
                          onClick={() => setQrGuest({ id: g.id, name: g.name })}
                        >
                          <Icon name="qr" size={12} />
                        </CircleButton>
                        <CircleButton size={28} title="Edit tamu" onClick={() => openEditGuest(g)}>
                          <Icon name="edit" size={12} />
                        </CircleButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {/* Footer — outside the scroller, pinned to the card bottom */}
            <div className="px-[22px] py-3 border-t border-line flex items-center justify-between bg-cream shrink-0">
              <div className="text-[11px] text-muted-ink tracking-[0.16em] uppercase font-semibold">
                Menampilkan {rangeStart}–{rangeEnd} dari {filtered.length} · halaman {safePage} / {totalPages}
              </div>
              <div className="flex gap-[6px]">
                <CircleButton
                  size={30}
                  onClick={() => setPage(Math.max(1, safePage - 1))}
                  disabled={safePage <= 1}
                  className="disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ‹
                </CircleButton>
                {pageList(safePage, totalPages).map((n, i) =>
                  n === "…" ? (
                    <span
                      key={`gap-${i}`}
                      className="min-w-[30px] h-[30px] grid place-items-center text-[12px] text-muted-ink select-none"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={cn(
                        "min-w-[30px] h-[30px] rounded-full border border-[rgba(26,26,26,0.18)]",
                        "text-[12px] font-display font-bold cursor-pointer transition-colors",
                        n === safePage ? "bg-charcoal text-cream" : "bg-transparent text-charcoal",
                      )}
                    >
                      {n}
                    </button>
                  ),
                )}
                <CircleButton
                  size={30}
                  onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                  disabled={safePage >= totalPages}
                  className="disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ›
                </CircleButton>
              </div>
            </div>
          </div>
        </div>
      </main>

      <GuestsImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <GuestQrModal key={qrGuest?.id ?? "none"} guest={qrGuest} onClose={() => setQrGuest(null)} />
      <GuestFormModal
        key={`${formMode}-${editGuest?.id ?? "new"}-${formNonce}`}
        mode={formMode}
        guest={editGuest}
        customSides={extraSides}
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </DashboardShell>
  );
}

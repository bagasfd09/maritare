"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AdminShell } from "@/components/templates/admin-shell";
import { AdminTopBar } from "@/components/organisms/admin-topbar";
import { Button } from "@/components/atoms/button";
import { CircleButton } from "@/components/atoms/circle-button";
import { Icon } from "@/components/atoms/icon";
import { Avatar } from "@/components/atoms/avatar";
import { rupiahShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { adminSetUserActive } from "@/server/actions/admin-user";
import type { AdminUserRow } from "@/server/queries/admin";

type StatusFilter = "" | "active" | "inactive";
type StatTone = "default" | "sage" | "muted" | "peach";

type Stat = { l: string; tone: StatTone; filter: StatusFilter | "withInv" };

const STATS: Stat[] = [
  { l: "Total", tone: "default", filter: "" },
  { l: "Aktif", tone: "sage", filter: "active" },
  { l: "Nonaktif", tone: "muted", filter: "inactive" },
  { l: "Punya undangan", tone: "peach", filter: "withInv" },
];

const STAT_SURFACE: Record<StatTone, string> = {
  default: "bg-paper border border-line",
  sage: "bg-sage-soft",
  muted: "bg-cream",
  peach: "bg-peach",
};

const AVATAR_TONES = ["peach", "sage", "blush", "burgundy", "dark"] as const;

const SELECT =
  "px-[14px] py-[7px] rounded-full border border-line bg-paper font-body text-[11px] font-semibold text-charcoal tracking-[0.06em]";
const TH =
  "font-body text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-ink text-left px-[14px] py-3 border-b border-beige";
const TD = "p-[14px] border-b border-line align-middle";
const MENU_ITEM =
  "w-full flex items-center gap-2 px-3 py-[7px] text-left text-[11px] font-semibold text-charcoal hover:bg-cream cursor-pointer no-underline";

const PAGE_SIZE = 12;

type SortKey = "newest" | "az" | "za" | "spent_desc" | "inv_desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Diurut · Terbaru" },
  { value: "az", label: "Diurut · A–Z" },
  { value: "za", label: "Diurut · Z–A" },
  { value: "spent_desc", label: "Diurut · Belanja tertinggi" },
  { value: "inv_desc", label: "Diurut · Undangan terbanyak" },
];

function csvEscape(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(rows: AdminUserRow[], filename: string) {
  const header = ["id", "name", "email", "phone", "joined", "weddings", "spent", "status"];
  const lines = [
    header.join(","),
    ...rows.map((u) =>
      [u.id, u.name, u.email, u.phone, u.joined, u.weddings, u.spent, u.active ? "aktif" : "nonaktif"]
        .map(csvEscape)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] text-[10px] font-bold tracking-[0.12em] uppercase px-2 py-[3px] rounded-full",
        active ? "bg-sage-soft text-[#1c2818]" : "bg-cream text-muted-ink border border-line",
      )}
    >
      <span className={cn("w-[6px] h-[6px] rounded-full", active ? "bg-sage" : "bg-faint")} />
      {active ? "Aktif" : "Nonaktif"}
    </span>
  );
}

// Admin screen · User — account-centric master table of all customers.
export function AdminUsers({ users }: { users: AdminUserRow[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [withInvOnly, setWithInvOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const runAction = (action: () => Promise<{ ok: true } | { ok: false; error: string }>) => {
    setActionError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setActionError(result.error);
        return;
      }
      setOpenMenuId(null);
      setConfirmId(null);
      router.refresh();
    });
  };

  const setActive = (u: AdminUserRow, active: boolean) =>
    runAction(() => adminSetUserActive({ id: u.id, active }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenuId(null);
        setConfirmId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const counts = useMemo(() => {
    let active = 0;
    let withInv = 0;
    for (const u of users) {
      if (u.active) active += 1;
      if (u.weddings > 0) withInv += 1;
    }
    return { total: users.length, active, inactive: users.length - active, withInv };
  }, [users]);

  const statValue = (filter: Stat["filter"]): number =>
    filter === "" ? counts.total
    : filter === "active" ? counts.active
    : filter === "inactive" ? counts.inactive
    : counts.withInv;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = users.filter((u) => {
      if (statusFilter === "active" && !u.active) return false;
      if (statusFilter === "inactive" && u.active) return false;
      if (withInvOnly && u.weddings === 0) return false;
      if (q && !`${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q)) return false;
      return true;
    });
    switch (sortKey) {
      case "az":
        rows.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        rows.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "spent_desc":
        rows.sort((a, b) => b.spent - a.spent);
        break;
      case "inv_desc":
        rows.sort((a, b) => b.weddings - a.weddings);
        break;
      case "newest":
        // Rows arrive newest-first from the query; keep source order.
        break;
    }
    return rows;
  }, [users, query, statusFilter, withInvOnly, sortKey]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const effectivePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((effectivePage - 1) * PAGE_SIZE, effectivePage * PAGE_SIZE);
  const rangeStart = total === 0 ? 0 : (effectivePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(effectivePage * PAGE_SIZE, total);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const goToPage = (n: number) => setPage(Math.min(Math.max(1, n), totalPages));

  const copyEmail = (u: AdminUserRow) => {
    navigator.clipboard.writeText(u.email).catch(() => {});
    setCopiedId(u.id);
    window.setTimeout(() => {
      setCopiedId(null);
      setOpenMenuId(null);
    }, 900);
  };

  return (
    <AdminShell active="users">
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {openMenuId !== null && (
          <div
            className="fixed inset-0 z-20"
            onClick={() => {
              setOpenMenuId(null);
              setConfirmId(null);
            }}
          />
        )}
        <AdminTopBar
          crumbs={["Admin", "User"]}
          title={`${counts.total} pelanggan terdaftar`}
          eyebrow={`${counts.active} aktif · ${counts.inactive} nonaktif · ${counts.withInv} punya undangan`}
          actions={
            <Button variant="ghost" size="sm" onClick={() => downloadCsv(filtered, "maritare-users.csv")}>
              <Icon name="download" size={12} />Export CSV
            </Button>
          }
        />

        <div className="flex-1 px-9 py-[22px] overflow-y-auto flex flex-col">
          {/* Stat strip — each card is a filter shortcut */}
          <div className="grid grid-cols-4 gap-[10px] mb-4">
            {STATS.map((s) => {
              const active =
                s.filter === "withInv"
                  ? withInvOnly
                  : s.filter !== "" && statusFilter === s.filter;
              return (
                <button
                  key={s.l}
                  type="button"
                  onClick={() => {
                    if (s.filter === "withInv") {
                      setWithInvOnly((v) => !v);
                    } else {
                      setStatusFilter((prev) => (prev === s.filter ? "" : (s.filter as StatusFilter)));
                    }
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-xl px-4 py-[14px] text-left cursor-pointer",
                    STAT_SURFACE[s.tone],
                    active && "ring-2 ring-burgundy/60",
                  )}
                >
                  <div className="text-[10px] text-muted-ink tracking-[0.18em] uppercase font-semibold">{s.l}</div>
                  <div className="font-display font-extrabold text-[28px] leading-none tracking-[-0.02em] text-charcoal mt-1">
                    {statValue(s.filter)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-[10px] mb-[14px]">
            <div className="flex items-center gap-2 bg-paper border border-line rounded-full px-[14px] py-[7px] flex-1 max-w-[340px]">
              <Icon name="search" size={13} stroke="var(--color-muted-ink)" />
              <input
                placeholder="Cari nama, email, atau telepon…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="flex-1 border-none bg-transparent outline-none text-[12px]"
              />
            </div>
            <select
              className={SELECT}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPage(1);
              }}
            >
              <option value="">Semua status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
            <div className="flex-1" />
            <select
              value={sortKey}
              onChange={(e) => {
                setSortKey(e.target.value as SortKey);
                setPage(1);
              }}
              className="text-[11px] text-muted-ink tracking-[0.18em] [font-variant:small-caps] appearance-none bg-transparent border-none outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="flex-1 min-h-[280px] bg-paper border border-line rounded-[14px] overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <table className="w-full border-separate border-spacing-0 text-[13px] [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:hover_td]:bg-[rgba(124,45,45,0.03)] [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:bg-cream [&_thead_th]:z-10">
                <thead>
                  <tr>
                    <th className={cn(TH, "pl-[22px]")}>Pengguna</th>
                    <th className={TH}>Telepon</th>
                    <th className={TH}>Daftar</th>
                    <th className={cn(TH, "text-right")}>Undangan</th>
                    <th className={cn(TH, "text-right")}>Total bayar</th>
                    <th className={TH}>Status</th>
                    <th className={cn(TH, "w-[60px]")} />
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-[22px] py-10 text-center text-[12px] text-muted-ink font-display italic">
                        {users.length === 0
                          ? "Belum ada pelanggan."
                          : "Tidak ada pelanggan yang cocok dengan filter ini."}
                      </td>
                    </tr>
                  )}
                  {pageRows.map((u, i) => (
                    <tr key={u.id} className={cn(!u.active && "opacity-60")}>
                      <td className={cn(TD, "pl-[22px]")}>
                        <div className="flex items-center gap-3">
                          <Avatar tone={AVATAR_TONES[i % 5]} size={30} className="text-[11px]">
                            {u.initials}
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-semibold text-[13px] text-charcoal truncate">{u.name}</div>
                            <div className="text-[10px] text-muted-ink mt-[2px] truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className={cn(TD, "text-[12px] text-muted-ink")}>{u.phone}</td>
                      <td className={cn(TD, "text-[12px] text-charcoal font-display italic")}>{u.joined}</td>
                      <td className={cn(TD, "text-right font-display font-bold text-[13px]")}>
                        {u.weddings > 0 ? u.weddings : <span className="text-faint font-normal">0</span>}
                      </td>
                      <td className={cn(TD, "text-right font-display font-bold text-[13px] tracking-[-0.01em]")}>
                        {u.spent ? rupiahShort(u.spent) : <span className="text-faint italic font-normal">—</span>}
                      </td>
                      <td className={TD}><StatusPill active={u.active} /></td>
                      <td className={TD}>
                        <div className="flex gap-[3px] relative justify-end">
                          <CircleButton
                            size={26}
                            title="Lainnya"
                            onClick={() => {
                              setOpenMenuId(openMenuId === u.id ? null : u.id);
                              setConfirmId(null);
                            }}
                          >
                            <Icon name="more" size={11} />
                          </CircleButton>
                          {openMenuId === u.id && (
                            <div
                              className={cn(
                                "absolute right-0 z-30 min-w-[180px] bg-paper border border-line rounded-[10px] shadow-lg py-1",
                                i >= pageRows.length - 2 && pageRows.length >= 5 ? "bottom-[30px]" : "top-[30px]",
                              )}
                            >
                              <Link
                                href={`/admin/weddings?q=${encodeURIComponent(u.email)}`}
                                className={MENU_ITEM}
                              >
                                <Icon name="list" size={11} />Lihat undangan ({u.weddings})
                              </Link>
                              <button type="button" className={MENU_ITEM} onClick={() => copyEmail(u)}>
                                <Icon name="copy" size={11} />{copiedId === u.id ? "Tersalin!" : "Salin email"}
                              </button>
                              {u.active ? (
                                confirmId === u.id ? (
                                  <div className="px-3 py-2 border-t border-line">
                                    <div className="text-[10px] text-muted-ink mb-2">Nonaktifkan akun ini?</div>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        disabled={isPending}
                                        className="flex-1 rounded-md bg-burgundy text-cream text-[10px] font-bold tracking-[0.06em] uppercase py-[5px] cursor-pointer disabled:opacity-50"
                                        onClick={() => setActive(u, false)}
                                      >
                                        {isPending ? "Memproses…" : "Ya, nonaktifkan"}
                                      </button>
                                      <button
                                        type="button"
                                        className="flex-1 rounded-md border border-line text-[10px] font-bold tracking-[0.06em] uppercase py-[5px] cursor-pointer"
                                        onClick={() => setConfirmId(null)}
                                      >
                                        Batal
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    className={cn(MENU_ITEM, "text-burgundy hover:bg-[rgba(124,45,45,0.06)]")}
                                    onClick={() => setConfirmId(u.id)}
                                  >
                                    <Icon name="x" size={11} />Nonaktifkan
                                  </button>
                                )
                              ) : (
                                <button
                                  type="button"
                                  className={cn(MENU_ITEM, "text-[#1c5a36]", isPending && "opacity-50 pointer-events-none")}
                                  onClick={() => setActive(u, true)}
                                >
                                  <Icon name="check" size={11} />Aktifkan kembali
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Footer */}
            <div className="mt-auto px-[22px] py-3 border-t border-line bg-cream flex items-center justify-between shrink-0">
              <div className="text-[11px] text-muted-ink tracking-[0.12em]">
                {total === 0
                  ? "Menampilkan 0 dari 0"
                  : `Menampilkan ${rangeStart}–${rangeEnd} dari ${total} · halaman ${effectivePage} dari ${totalPages}`}
              </div>
              <div className="flex gap-[5px]">
                <CircleButton
                  size={28}
                  onClick={() => goToPage(effectivePage - 1)}
                  disabled={effectivePage === 1}
                  className={cn(effectivePage === 1 && "opacity-40 pointer-events-none")}
                >
                  ‹
                </CircleButton>
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => goToPage(n)}
                    className={cn(
                      "min-w-[28px] h-[28px] rounded-full border border-[rgba(26,26,26,0.18)]",
                      "text-[11px] font-display font-bold cursor-pointer",
                      n === effectivePage ? "bg-forest-deep text-cream" : "bg-transparent text-charcoal",
                    )}
                  >
                    {n}
                  </button>
                ))}
                <CircleButton
                  size={28}
                  onClick={() => goToPage(effectivePage + 1)}
                  disabled={effectivePage === totalPages}
                  className={cn(effectivePage === totalPages && "opacity-40 pointer-events-none")}
                >
                  ›
                </CircleButton>
              </div>
            </div>
          </div>
        </div>

        {actionError && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 bg-burgundy text-cream rounded-full px-[18px] py-[10px] shadow-lg">
            <span className="text-[11px] font-semibold tracking-[0.04em]">{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-[10px] font-bold tracking-[0.14em] uppercase cursor-pointer hover:opacity-80"
            >
              Tutup
            </button>
          </div>
        )}
      </main>
    </AdminShell>
  );
}

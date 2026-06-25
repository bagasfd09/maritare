"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/atoms/avatar";
import { Icon } from "@/components/atoms/icon";
import {
  AdminMobileCard,
  AdminMobileChip,
  AdminMobileHead,
  AdminMobileHScroll,
  AdminMobileIconMini,
} from "@/components/molecules/admin-mobile-primitives";
import { AdminMobileShell } from "@/components/templates/admin-mobile-shell";
import { rupiah, rupiahShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { adminSetUserActive } from "@/server/actions/admin-user";
import type { AdminUserRow } from "@/server/queries/admin";

// Design avatar tone cycle (shared with the other admin mobile screens).
const AV = ["peach", "sage", "blush", "burgundy", "dark"] as const;

type StatTone = "paper" | "sage" | "cream" | "peach";
type FilterValue = "all" | "active" | "inactive" | "withInv";

const STATS: { l: string; tone: StatTone; filter: FilterValue }[] = [
  { l: "Total", tone: "paper", filter: "all" },
  { l: "Aktif", tone: "sage", filter: "active" },
  { l: "Nonaktif", tone: "cream", filter: "inactive" },
  { l: "Punya undangan", tone: "peach", filter: "withInv" },
];

const STAT_TONE: Record<StatTone, string> = {
  paper: "bg-paper border border-line",
  sage: "bg-sage-soft",
  cream: "bg-cream",
  peach: "bg-peach",
};

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "Semua", value: "all" },
  { label: "Aktif", value: "active" },
  { label: "Nonaktif", value: "inactive" },
  { label: "Punya undangan", value: "withInv" },
];

const PAGE_SIZE = 8;

const SHEET_MENU_ITEM =
  "w-full flex items-center gap-3 px-[18px] py-[13px] text-left text-[13.5px] font-semibold text-charcoal border-b border-line last:border-b-0 cursor-pointer no-underline";

function ControlledSearch({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex items-center gap-[9px] bg-paper border border-line rounded-full px-[15px] py-[10px]">
      <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="var(--color-faint)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-5-5" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 border-none bg-transparent outline-none font-body text-[13px] text-charcoal placeholder:text-faint"
      />
    </div>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] text-[9.5px] font-bold tracking-[0.12em] uppercase px-2 py-[3px] rounded-full shrink-0",
        active ? "bg-sage-soft text-[#1c2818]" : "bg-cream text-muted-ink border border-line",
      )}
    >
      <span className={cn("w-[5px] h-[5px] rounded-full", active ? "bg-sage" : "bg-faint")} />
      {active ? "Aktif" : "Nonaktif"}
    </span>
  );
}

// Admin mobile · User — account-centric master list of all customers.
export function AdminUsersMobile({ users }: { users: AdminUserRow[] }) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menuUser, setMenuUser] = useState<AdminUserRow | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuUser(null);
        setConfirmDeactivate(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeMenu = () => {
    setMenuUser(null);
    setConfirmDeactivate(false);
    setCopied(false);
  };

  const runAction = (action: () => Promise<{ ok: true } | { ok: false; error: string }>) => {
    setActionError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setActionError(result.error);
        return;
      }
      closeMenu();
      router.refresh();
    });
  };

  const copyEmail = (u: AdminUserRow) => {
    navigator.clipboard.writeText(u.email).catch(() => {});
    setCopied(true);
    window.setTimeout(() => closeMenu(), 900);
  };

  const counts = useMemo(() => {
    let active = 0;
    let withInv = 0;
    for (const u of users) {
      if (u.active) active += 1;
      if (u.weddings > 0) withInv += 1;
    }
    return { total: users.length, active, inactive: users.length - active, withInv };
  }, [users]);

  const statValue = (filter: FilterValue): number =>
    filter === "all" ? counts.total
    : filter === "active" ? counts.active
    : filter === "inactive" ? counts.inactive
    : counts.withInv;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQuery =
        q === "" || [u.name, u.email, u.phone].some((f) => f.toLowerCase().includes(q));
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "active" && u.active) ||
        (activeFilter === "inactive" && !u.active) ||
        (activeFilter === "withInv" && u.weddings > 0);
      return matchesQuery && matchesFilter;
    });
  }, [users, query, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const applyFilter = (value: FilterValue) => {
    setActiveFilter(value);
    setPage(1);
  };

  const handleSearch = (next: string) => {
    setQuery(next);
    setPage(1);
  };

  return (
    <AdminMobileShell active="users">
      <AdminMobileHead
        eyebrow={`${counts.total} pelanggan`}
        title="Semua pelanggan"
        sub={`${counts.active} aktif · ${counts.inactive} nonaktif`}
      />

      {/* stat chips — doubles as a filter shortcut row */}
      <AdminMobileHScroll className="px-[18px] pt-[14px] pb-[2px]">
        {STATS.map((s) => (
          <button
            key={s.l}
            type="button"
            onClick={() => applyFilter(s.filter)}
            className={cn(
              "flex-none min-w-[96px] rounded-xl px-[14px] py-3 text-left cursor-pointer",
              STAT_TONE[s.tone],
              activeFilter === s.filter && s.filter !== "all" && "ring-2 ring-forest-deep",
            )}
          >
            <div className="text-[9px] text-muted-ink tracking-[0.16em] uppercase font-semibold">{s.l}</div>
            <div className="font-display font-extrabold text-[26px] leading-none tracking-[-0.02em] text-charcoal mt-1">
              {statValue(s.filter)}
            </div>
          </button>
        ))}
      </AdminMobileHScroll>

      {/* search */}
      <div className="px-[18px] pt-3">
        <ControlledSearch placeholder="Cari nama, email, telepon…" value={query} onChange={handleSearch} />
      </div>

      {/* filter chips */}
      <AdminMobileHScroll className="px-[18px] pt-3">
        {FILTERS.map((f) => (
          <AdminMobileChip key={f.value} on={activeFilter === f.value} onClick={() => applyFilter(f.value)}>
            {f.label}
          </AdminMobileChip>
        ))}
      </AdminMobileHScroll>

      {/* list */}
      <div className="px-[18px] pt-4 flex flex-col gap-2">
        {pageRows.map((u, i) => (
          <AdminMobileCard
            key={u.id}
            className={cn("p-[14px] cursor-pointer", !u.active && "opacity-60")}
            onClick={() => setExpandedId((prev) => (prev === u.id ? null : u.id))}
          >
            <div className="flex items-center gap-3">
              <Avatar tone={AV[i % 5]} size={40}>
                {u.initials}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14.5px] text-charcoal truncate">{u.name}</div>
                <div className="text-[10.5px] text-muted-ink mt-[2px] truncate">{u.email}</div>
              </div>
              <StatusPill active={u.active} />
              <AdminMobileIconMini
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDeactivate(false);
                  setCopied(false);
                  setMenuUser(u);
                }}
                aria-label={`Aksi untuk ${u.name}`}
                title="Aksi"
                className="w-8 h-8"
              >
                <Icon name="more" size={14} />
              </AdminMobileIconMini>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-line">
              <span className="text-[10.5px] px-2 py-[3px] rounded bg-cream border border-line font-medium text-muted-ink">
                {u.weddings} undangan
              </span>
              <div className="flex-1" />
              <span className="font-display italic text-[12px] text-muted-ink">{u.joined}</span>
              <span className="font-display font-bold text-[14px]">
                {u.spent ? rupiahShort(u.spent) : <span className="text-faint">—</span>}
              </span>
            </div>
            {expandedId === u.id && (
              <div className="mt-3 pt-3 border-t border-line flex flex-col gap-[6px] text-[11.5px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-ink">Telepon</span>
                  <span className="font-semibold text-charcoal truncate">{u.phone}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-ink">Total bayar</span>
                  <span className="font-semibold text-charcoal">{u.spent ? rupiah(u.spent) : "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-ink">Undangan</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/weddings?q=${encodeURIComponent(u.email)}`);
                    }}
                    className="font-semibold text-burgundy"
                  >
                    Lihat {u.weddings} undangan →
                  </button>
                </div>
              </div>
            )}
          </AdminMobileCard>
        ))}
        {pageRows.length === 0 && (
          <div className="text-center py-8 font-display italic text-[12.5px] text-muted-ink">
            {users.length === 0
              ? "Belum ada pelanggan."
              : "Tidak ada pelanggan yang cocok. Coba ubah kata kunci atau filternya, ya."}
          </div>
        )}
        <div className="flex items-center justify-center gap-3 pt-[10px]">
          <AdminMobileIconMini
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Halaman sebelumnya"
            className="w-7 h-7 disabled:opacity-40 disabled:cursor-default"
          >
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </AdminMobileIconMini>
          <div className="text-center text-[11px] text-muted-ink tracking-[0.1em]">
            {filtered.length === 0
              ? "Menampilkan 0 dari 0"
              : `Menampilkan ${rangeStart}–${rangeEnd} dari ${filtered.length}`}
          </div>
          <AdminMobileIconMini
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Halaman berikutnya"
            className="w-7 h-7 disabled:opacity-40 disabled:cursor-default"
          >
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </AdminMobileIconMini>
        </div>
      </div>

      {/* Per-card action sheet */}
      {menuUser && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40" onClick={closeMenu}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Aksi pengguna ${menuUser.name}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] bg-paper rounded-t-[20px] overflow-hidden shadow-[0_-12px_40px_rgba(27,31,24,0.25)]"
          >
            <div className="px-[18px] pt-4 pb-3 border-b border-line">
              <div className="font-display italic font-semibold text-[15px] text-charcoal truncate">{menuUser.name}</div>
              <div className="text-[11px] text-muted-ink mt-[2px] truncate">{menuUser.email}</div>
            </div>
            <button
              type="button"
              className={SHEET_MENU_ITEM}
              onClick={() => {
                const email = menuUser.email;
                closeMenu();
                router.push(`/admin/weddings?q=${encodeURIComponent(email)}`);
              }}
            >
              <Icon name="list" size={15} />Lihat undangan ({menuUser.weddings})
            </button>
            <button type="button" className={SHEET_MENU_ITEM} onClick={() => copyEmail(menuUser)}>
              <Icon name="copy" size={15} />{copied ? "Tersalin!" : "Salin email"}
            </button>
            {menuUser.active ? (
              confirmDeactivate ? (
                <div className="px-[18px] py-3 border-b border-line">
                  <div className="text-[12px] text-muted-ink mb-[10px]">Nonaktifkan akun ini? Akun disembunyikan dari daftar aktif.</div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      className="flex-1 rounded-full bg-burgundy text-cream text-[11px] font-bold tracking-[0.08em] uppercase py-[10px] cursor-pointer disabled:opacity-50"
                      onClick={() => runAction(() => adminSetUserActive({ id: menuUser.id, active: false }))}
                    >
                      {isPending ? "Memproses…" : "Ya, nonaktifkan"}
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-full border border-line text-[11px] font-bold tracking-[0.08em] uppercase py-[10px] cursor-pointer"
                      onClick={() => setConfirmDeactivate(false)}
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={cn(SHEET_MENU_ITEM, "text-burgundy")}
                  onClick={() => setConfirmDeactivate(true)}
                >
                  <Icon name="x" size={15} />Nonaktifkan
                </button>
              )
            ) : (
              <button
                type="button"
                className={cn(SHEET_MENU_ITEM, "text-[#1c5a36]", isPending && "opacity-50 pointer-events-none")}
                onClick={() => runAction(() => adminSetUserActive({ id: menuUser.id, active: true }))}
              >
                <Icon name="check" size={15} />Aktifkan kembali
              </button>
            )}
            <button
              type="button"
              className="w-full px-[18px] py-[14px] text-center text-[12px] font-bold tracking-[0.12em] uppercase text-muted-ink cursor-pointer"
              onClick={closeMenu}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Inline error toast */}
      {actionError && (
        <div className="fixed bottom-[84px] left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 bg-burgundy text-cream rounded-full px-[18px] py-[10px] shadow-lg">
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
    </AdminMobileShell>
  );
}

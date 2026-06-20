"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/templates/admin-shell";
import { AdminTopBar } from "@/components/organisms/admin-topbar";
import { AdminStatus, PkgBadge } from "@/components/molecules/admin-badges";
import { Button } from "@/components/atoms/button";
import { CircleButton } from "@/components/atoms/circle-button";
import { Icon, type IconName } from "@/components/atoms/icon";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { Avatar } from "@/components/atoms/avatar";
import type {
  AdminOverview as AdminOverviewData,
  AdminUser,
  AdminWeddingRow,
} from "@/server/queries/admin";
import { rupiahShort } from "@/lib/format";
import { cn } from "@/lib/utils";

const AVATAR_TONES = ["peach", "sage", "blush", "burgundy", "dark"] as const;

// Detail rows shown in the wedding drawer, derived from the full record.
const WEDDING_FIELDS: { label: string; value: (w: AdminWeddingRow) => React.ReactNode }[] = [
  { label: "Pasangan", value: (w) => w.couple },
  { label: "Slug", value: (w) => `/inv/${w.slug}` },
  { label: "Paket", value: (w) => <PkgBadge pkg={w.pkg} /> },
  { label: "Status", value: (w) => <AdminStatus status={w.status} /> },
  { label: "Tanggal acara", value: (w) => w.date },
  { label: "Pembayaran", value: (w) => (w.paid ? rupiahShort(w.paid) : "—") },
  { label: "Customer", value: (w) => w.customer },
  { label: "Kota", value: (w) => w.city },
  { label: "Template", value: (w) => w.template },
];

// Quote a CSV cell when it contains commas, quotes or newlines.
function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

type AdminOverviewProps = {
  data: AdminOverviewData;
  adminUser: AdminUser | null;
};

// Admin screen 1 · Overview — KPIs, ops status, recent activity, all from real data.
export function AdminOverview({ data, adminUser }: AdminOverviewProps) {
  const [bellOpen, setBellOpen] = useState(false);
  const [selectedWedding, setSelectedWedding] = useState<AdminWeddingRow | null>(null);

  // Escape dismisses the bell popover and the wedding detail panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setBellOpen(false);
        setSelectedWedding(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { recentWeddings, recentTransactions } = data;

  // Secondary KPI cards next to the revenue hero (real fields only).
  const kpiCards: { label: string; value: string; sub: string; icon: IconName; warn?: boolean }[] = [
    {
      label: "Undangan aktif",
      value: String(data.weddingsLive),
      sub: `dari ${data.weddingsTotal} undangan`,
      icon: "users",
    },
    {
      label: "Signup baru",
      value: String(data.signupsThisWeek),
      sub: "minggu ini",
      icon: "sparkle",
    },
    {
      label: "Konversi",
      value: `${data.conversionPct}%`,
      sub: "live / total",
      icon: "arrow-ur",
    },
    {
      label: "Support open",
      value: String(data.supportOpen),
      sub: "tiket aktif",
      icon: "bell",
      warn: data.supportOpen > 0,
    },
  ];

  const greetingName = adminUser?.name ?? "Admin";

  // Export both real datasets as a single two-section CSV.
  const handleExport = () => {
    const lines: string[] = [];
    lines.push("id,couple,pkg,status,date,paid,city");
    for (const w of recentWeddings) {
      lines.push([w.id, w.couple, w.pkg, w.status, w.date, w.paid, w.city].map(csvCell).join(","));
    }
    lines.push("");
    lines.push("id,customer,couple,pkg,amount,method,status,time");
    for (const t of recentTransactions) {
      lines.push(
        [t.id, t.customer, t.couple, t.pkg, t.amount, t.method, t.status, t.time].map(csvCell).join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "maritare-overview-export.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell active="overview">
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminTopBar
          crumbs={["Admin", "Overview"]}
          title={`Halo, ${greetingName}.`}
          eyebrow="Ringkasan platform"
          actions={
            <>
              <div className="relative">
                <CircleButton
                  aria-expanded={bellOpen}
                  aria-label="Notifikasi"
                  onClick={() => setBellOpen((open) => !open)}
                >
                  <Icon name="bell" size={14} />
                </CircleButton>
                {bellOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[320px] bg-paper border border-line rounded-[14px] shadow-[0_18px_40px_rgba(27,31,24,0.14)] overflow-hidden">
                    <div className="px-4 py-3 border-b border-line bg-cream flex items-center justify-between">
                      <span className="font-display italic font-semibold text-[13px] text-charcoal">
                        Support open · {data.supportOpen} tiket
                      </span>
                    </div>
                    <div className="px-4 py-4 font-display italic text-[12px] text-muted-ink">
                      Belum ada notifikasi.
                    </div>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleExport}>
                <Icon name="download" size={12} />Export
              </Button>
            </>
          }
        />

        <div className="flex-1 overflow-y-auto px-9 py-6">
          {/* KPI strip */}
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-3 mb-[18px]">
            {/* Revenue — hero */}
            <div className="bg-charcoal text-cream rounded-[14px] px-[22px] py-5 relative overflow-hidden">
              <div className="absolute -top-[30px] -right-[30px] w-[130px] h-[130px] opacity-[0.06]">
                <FlowerMark size={130} color="var(--color-peach)" core="var(--color-peach)" stamen="var(--color-terracotta)" />
              </div>
              <div className="relative z-[2]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-peach tracking-[0.24em] uppercase font-semibold">Revenue · bulan ini</span>
                </div>
                <div className="font-display font-extrabold text-[44px] leading-none tracking-[-0.035em] text-peach mt-3">
                  {rupiahShort(data.revenueThisMonth)}
                </div>
                <div className="font-display italic text-[13px] text-[rgba(245,239,230,0.7)] mt-1">
                  Hari ini: {rupiahShort(data.revenueToday)}
                </div>
              </div>
            </div>

            {kpiCards.map((k) => (
              <div key={k.label} className="bg-paper border border-line rounded-[14px] px-[18px] pt-[18px] pb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-muted-ink tracking-[0.22em] uppercase font-semibold">{k.label}</span>
                  <Icon name={k.icon} size={13} stroke={k.warn ? "var(--color-terracotta)" : "var(--color-muted-ink)"} />
                </div>
                <div className={cn("font-display font-extrabold text-[32px] leading-none tracking-[-0.03em]", k.warn ? "text-terracotta" : "text-charcoal")}>
                  {k.value}
                </div>
                <div className="text-[11px] text-muted-ink font-display italic mt-[6px]">{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Recent weddings + transactions side-by-side */}
          <div className="grid grid-cols-[1.1fr_1fr] gap-[14px]">
            {/* Recent weddings */}
            <div className="bg-paper border border-line rounded-[14px] overflow-hidden">
              <div className="px-5 py-[14px] border-b border-line bg-cream flex items-center justify-between">
                <div className="font-display italic font-semibold text-base text-charcoal">Undangan baru</div>
                <Link href="/admin/weddings" className="text-[10px] text-burgundy font-bold tracking-[0.18em] uppercase no-underline">
                  Lihat semua →
                </Link>
              </div>
              {recentWeddings.length === 0 ? (
                <div className="px-5 py-8 font-display italic text-[13px] text-muted-ink text-center">
                  Belum ada data
                </div>
              ) : (
                <table className="w-full border-separate border-spacing-0 text-[12px] [&_td]:p-[14px] [&_td]:border-b [&_td]:border-line [&_td]:align-middle [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:hover_td]:bg-[rgba(124,45,45,0.03)]">
                  <tbody>
                    {recentWeddings.map((w, i) => (
                      <tr key={w.id}>
                        <td className="pl-5!">
                          <div className="flex items-center gap-[10px]">
                            <Avatar tone={AVATAR_TONES[i % 5]} size={28} className="text-[10px]">
                              {w.couple.split(" & ").map((p) => p[0]).join("")}
                            </Avatar>
                            <div>
                              <div className="font-semibold text-xs">{w.couple}</div>
                              <div className="text-[10px] text-muted-ink">{w.city} · {w.date}</div>
                            </div>
                          </div>
                        </td>
                        <td><PkgBadge pkg={w.pkg} /></td>
                        <td><AdminStatus status={w.status} /></td>
                        <td className="text-right font-display font-bold text-xs pr-[18px]!">
                          {w.paid ? rupiahShort(w.paid) : <span className="text-faint">—</span>}
                        </td>
                        <td className="w-10 pr-4! pl-0!">
                          <CircleButton
                            size={26}
                            aria-label={`Lihat detail ${w.couple}`}
                            onClick={() => setSelectedWedding(w)}
                          >
                            <Icon name="arrow-ur" size={11} />
                          </CircleButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Recent transactions */}
            <div className="bg-paper border border-line rounded-[14px] overflow-hidden">
              <div className="px-5 py-[14px] border-b border-line bg-cream flex items-center justify-between">
                <div className="font-display italic font-semibold text-base text-charcoal">Transaksi terakhir</div>
                <span className="text-[11px] text-muted-ink">
                  Hari ini:{" "}
                  <strong className="font-display text-charcoal">
                    {rupiahShort(data.revenueToday)}
                  </strong>
                </span>
              </div>
              {recentTransactions.length === 0 ? (
                <div className="px-5 py-8 font-display italic text-[13px] text-muted-ink text-center">
                  Belum ada data
                </div>
              ) : (
                <ul className="list-none p-0 m-0">
                  {recentTransactions.map((t, i) => {
                    const icon: IconName =
                      t.status === "paid" ? "check" : t.status === "failed" ? "x" : t.status === "refunded" ? "arrow-d" : "card";
                    return (
                      <li
                        key={t.id}
                        className={cn(
                          "flex items-center gap-3 px-5 py-3",
                          i < recentTransactions.length - 1 ? "border-b border-line" : "border-b-0",
                        )}
                      >
                        <div
                          className={cn(
                            "w-[30px] h-[30px] rounded-lg flex items-center justify-center shrink-0",
                            t.status === "paid"
                              ? "bg-[rgba(77,216,145,0.15)] text-[#1c5a36]"
                              : t.status === "failed"
                                ? "bg-[rgba(124,45,45,0.12)] text-burgundy"
                                : t.status === "refunded"
                                  ? "bg-cream text-muted-ink"
                                  : "bg-peach text-terracotta",
                          )}
                        >
                          <Icon name={icon} size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-charcoal">{t.couple} · {t.pkg}</div>
                          <div className="text-[10px] text-muted-ink tracking-[0.04em]">{t.method} · {t.time}</div>
                        </div>
                        <div
                          className={cn(
                            "font-display font-bold text-[13px] tracking-[-0.01em]",
                            t.status === "refunded" ? "text-muted-ink line-through" : "text-charcoal",
                          )}
                        >
                          {rupiahShort(t.amount)}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Wedding detail panel */}
        {selectedWedding && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40"
            onClick={() => setSelectedWedding(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Detail undangan ${selectedWedding.couple}`}
              onClick={(e) => e.stopPropagation()}
              className="w-[380px] max-w-[90vw] bg-paper border border-line rounded-[14px] overflow-hidden shadow-[0_24px_60px_rgba(27,31,24,0.25)]"
            >
              <div className="px-5 py-[14px] border-b border-line bg-cream flex items-center justify-between">
                <div className="font-display italic font-semibold text-base text-charcoal">
                  Detail undangan
                </div>
                <CircleButton size={28} aria-label="Tutup detail" onClick={() => setSelectedWedding(null)}>
                  <Icon name="x" size={12} />
                </CircleButton>
              </div>
              <div className="px-5 py-4 flex flex-col gap-[10px]">
                {WEDDING_FIELDS.map((f) => (
                  <div key={f.label} className="flex items-center justify-between gap-4">
                    <span className="text-[10px] text-muted-ink tracking-[0.18em] uppercase font-semibold shrink-0">
                      {f.label}
                    </span>
                    <span className="text-xs font-semibold text-charcoal text-right min-w-0 break-words">
                      {f.value(selectedWedding)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </AdminShell>
  );
}

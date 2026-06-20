import { MobileShell } from "@/components/templates/mobile-shell";
import {
  MobileButton,
  MobileCard,
  MobileChip,
  MobileChipRow,
  MobileEm,
  MobileSearch,
} from "@/components/molecules/mobile-primitives";
import { Icon } from "@/components/atoms/icon";
import { Avatar, initials } from "@/components/atoms/avatar";
import { GuestStatus } from "@/components/molecules/guest-status";
import type { DashboardChrome, GuestsData } from "@/server/queries/dashboard";

const FILTERS = ["Semua", "Hadir", "Belum", "Tidak"];

const AVATAR_TONES = ["burgundy", "peach", "blush", "dark"] as const;

type GuestsMobileProps = {
  data: GuestsData;
  chrome: DashboardChrome | null;
};

// Screen Mobile 03 · Daftar Tamu. `chrome` is accepted for a consistent page
// contract but MobileShell has no chrome region, so it is intentionally unused.
export function GuestsMobile({ data }: GuestsMobileProps) {
  // RSVP summary — dot colors mirror GuestStatus so the card reads as a legend
  // for the list below it.
  const rsvpStats = [
    { v: data.stats.confirmed, label: "Hadir", num: "text-[#1c5a36]", dot: "bg-[#4DD891]" },
    { v: data.stats.pending, label: "Belum", num: "text-[#5a2a18]", dot: "bg-terracotta" },
    { v: data.stats.declined, label: "Tidak", num: "text-burgundy", dot: "bg-burgundy" },
  ];

  return (
    <MobileShell
      active="tamu"
      eyebrow="Daftar Tamu"
      title={
        <>
          Tamu <MobileEm>kamu.</MobileEm>
        </>
      }
    >
      <MobileSearch placeholder="Cari nama tamu…" />

      <MobileChipRow>
        {FILTERS.map((f) => (
          <MobileChip key={f} active={f === "Semua"}>
            {f}
          </MobileChip>
        ))}
      </MobileChipRow>

      {/* One segmented summary card instead of three cramped tiles — each
          stat gets a full third of the width, separated by hairline dividers. */}
      <MobileCard flush>
        <div className="grid grid-cols-3 divide-x divide-line">
          {rsvpStats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-[6px] py-4">
              <div
                className={`font-display font-extrabold [font-variation-settings:'opsz'_144] text-[26px] leading-none tracking-[-0.03em] ${s.num}`}
              >
                {s.v}
              </div>
              <div className="flex items-center gap-[5px] text-[10px] tracking-[0.14em] uppercase font-semibold text-muted-ink">
                <span className={`w-[7px] h-[7px] rounded-full ${s.dot}`} />
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </MobileCard>

      <MobileCard flush>
        {data.guests.length === 0 ? (
          <div className="px-4 py-8 text-center font-display italic text-[14px] text-faint">
            Belum ada tamu. Tambah tamu pertamamu.
          </div>
        ) : (
          data.guests.map((g, i) => (
            <div
              key={g.id}
              className="flex items-center gap-3 px-4 py-[13px] border-b border-line last:border-b-0"
            >
              <Avatar tone={AVATAR_TONES[i % 4]} size={38}>
                {initials(g.name)}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{g.name}</div>
                <div className="text-[11px] text-muted-ink">
                  {g.group ?? "—"} · {g.partySize !== null ? `${g.partySize} orang` : "—"}
                </div>
              </div>
              <GuestStatus status={g.status} />
            </div>
          ))
        )}
      </MobileCard>

      <MobileButton variant="ghost" full>
        <Icon name="plus" size={16} /> Tambah tamu
      </MobileButton>
    </MobileShell>
  );
}

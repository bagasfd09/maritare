import { Icon, type IconName } from "@/components/atoms/icon";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { StatusPill } from "@/components/atoms/status-pill";
import { MobileShell } from "@/components/templates/mobile-shell";
import {
  MobileButton,
  MobileCard,
  MobileCardHead,
  MobileEm,
  MobileEyebrow,
  MobileHeading,
  MobileProgress,
  MobileSecLabel,
  MobileStat,
} from "@/components/molecules/mobile-primitives";
import type {
  ActivityItem,
  ActivityKind,
  DashboardChrome,
  OverviewData,
} from "@/server/queries/dashboard";

type OverviewMobileProps = {
  data: OverviewData;
  chrome: DashboardChrome | null;
};

// Badge palette + glyph per activity kind, reusing the existing mobile palette.
const ACTIVITY_STYLE: Record<ActivityKind, { icon: IconName; tone: string }> = {
  rsvp_yes: { icon: "check", tone: "bg-sage-soft text-[#2E3325]" },
  rsvp_no: { icon: "x", tone: "bg-peach text-[#5a2a18]" },
  wish: { icon: "heart", tone: "bg-blush text-burgundy-dark" },
  photo: { icon: "image", tone: "bg-cream text-charcoal" },
};

// "<bold> <muted rest>" copy parts per activity kind.
function activityCopy(item: ActivityItem): { strong: string; rest: string } {
  switch (item.kind) {
    case "rsvp_yes":
      return { strong: item.name, rest: " konfirmasi hadir" };
    case "rsvp_no":
      return { strong: item.name, rest: " tidak bisa hadir" };
    case "wish":
      return { strong: item.name, rest: " menulis ucapan" };
    case "photo":
      return { strong: "Foto baru", rest: " ditambahkan" };
  }
}

// Mobile 01 · Beranda — ported 1:1 from the design's MB_Beranda, wired to data.
export function OverviewMobile({ data, chrome }: OverviewMobileProps) {
  const groomFirstName = (chrome?.groomName ?? "").trim().split(/\s+/)[0];
  const eyebrow = chrome ? `Beranda · ${chrome.coupleLabel}` : "Beranda";

  const photoLimitLabel = data.photos.limit ?? "∞";

  return (
    <MobileShell
      active="beranda"
      eyebrow={eyebrow}
      title={
        groomFirstName ? (
          <>
            Selamat sore, <MobileEm>{groomFirstName}.</MobileEm>
          </>
        ) : (
          <>
            Selamat <MobileEm>sore.</MobileEm>
          </>
        )
      }
    >
      {/* Countdown */}
      <MobileCard tone="dark" className="overflow-hidden">
        <div className="absolute -top-[30px] -right-[30px] w-[150px] h-[150px] opacity-10">
          <FlowerMark size={150} color="var(--tint-peach)" core="var(--tint-peach)" stamen="var(--accent-terracotta)" />
        </div>
        <div className="relative z-[2]">
          <MobileEyebrow className="text-peach opacity-85">Hari bahagiamu</MobileEyebrow>
          <div className="flex items-baseline gap-3 mt-[10px]">
            <div className="font-display [font-variation-settings:'opsz'_144] font-extrabold text-[64px] leading-[0.9] tracking-[-0.04em] text-peach">
              {data.daysLeft ?? "—"}
            </div>
            <div>
              <div className="font-display italic text-[22px] text-cream leading-none">hari lagi</div>
              {data.dateLabel && (
                <div className="text-[11px] text-[rgba(245,239,230,0.6)] tracking-[0.16em] uppercase mt-1">
                  {data.dateLabel}
                </div>
              )}
            </div>
          </div>
          {data.venueLabel && (
            <div className="flex items-center justify-between mt-4 pt-[14px] border-t border-[rgba(245,239,230,0.16)]">
              <span className="inline-flex items-center gap-[7px] font-display italic text-[13px] text-peach">
                <Icon name="pin" size={13} stroke="var(--tint-peach)" /> {data.venueLabel}
              </span>
              <Icon name="chevron-r" size={15} stroke="var(--tint-peach)" />
            </div>
          )}
        </div>
      </MobileCard>

      {/* Publish progress */}
      <MobileCard tone="peach">
        <div className="flex items-center justify-between">
          <StatusPill tone="draft" className="bg-[rgba(255,255,255,0.45)]">
            Draft
          </StatusPill>
          <FlowerMark size={18} />
        </div>
        <MobileHeading className="text-[20px] mt-3 text-burgundy-dark">
          Undangan kamu <MobileEm>hampir siap.</MobileEm>
        </MobileHeading>
        <div className="text-[12.5px] text-[#5a2a18] mt-[6px] leading-[1.5]">
          Lengkapi detail undangan, lalu publish untuk dapat link undangan.
        </div>
        <div className="flex items-center gap-[10px] my-[14px]">
          <MobileProgress value={data.completionPct} className="flex-1 bg-[rgba(124,45,45,0.16)]" />
          <span className="font-display font-extrabold text-sm text-burgundy-dark">{data.completionPct}%</span>
        </div>
        <MobileButton variant="primary" full>
          <Icon name="sparkle" size={15} /> Lanjutkan undangan
        </MobileButton>
      </MobileCard>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-[10px]">
        <MobileStat v={String(data.rsvp.confirmed)} l="Tamu konfirmasi" />
        <MobileStat v={String(data.wishes.total)} l="Ucapan masuk" tone="cream" />
        <MobileStat v={`${data.photos.used} / ${photoLimitLabel}`} l="Foto galeri" />
        <MobileStat v={String(data.visits)} l="Pengunjung · 7 hari" tone="sage" />
      </div>

      {/* RSVP compact */}
      <MobileCard>
        <MobileCardHead
          sec="§ RSVP"
          title={
            <>
              Kehadiran <MobileEm>tamu.</MobileEm>
            </>
          }
          link="Tamu"
        />
        <div className="flex items-baseline gap-[10px] mb-3">
          <div className="font-display font-extrabold [font-variation-settings:'opsz'_144] text-[32px] tracking-[-0.03em] leading-none">
            {data.rsvp.respondedPct}%
          </div>
          <div className="text-[11.5px] text-muted-ink">
            sudah merespons · {data.rsvp.confirmed + data.rsvp.declined} / {data.rsvp.invited}
          </div>
        </div>
        <div className="flex h-[11px] rounded-full overflow-hidden gap-[2px] mb-3">
          <div className="bg-sage" style={{ flexGrow: data.rsvp.confirmed }} />
          <div className="bg-terracotta" style={{ flexGrow: data.rsvp.declined }} />
          <div className="bg-sage-soft" style={{ flexGrow: data.rsvp.pending }} />
        </div>
        <div className="grid grid-cols-3 gap-[6px]">
          {[
            { dot: "bg-sage", v: data.rsvp.confirmed, l: "Hadir" },
            { dot: "bg-terracotta", v: data.rsvp.declined, l: "Tidak" },
            { dot: "bg-sage-soft", v: data.rsvp.pending, l: "Belum" },
          ].map((x) => (
            <div key={x.l}>
              <div className="flex items-center gap-[5px]">
                <span className={`w-2 h-2 rounded-full ${x.dot}`} />
                <span className="font-display font-extrabold text-[15px]">{x.v}</span>
              </div>
              <div className="text-[10px] text-muted-ink mt-px">{x.l}</div>
            </div>
          ))}
        </div>
      </MobileCard>

      {/* Activity */}
      <MobileCard flush>
        <div className="px-4 pt-[15px] pb-3 border-b border-line">
          <MobileSecLabel>§ Aktivitas</MobileSecLabel>
          <MobileHeading className="mt-[3px]">Terbaru.</MobileHeading>
        </div>
        <ul className="list-none m-0 p-0">
          {data.activity.length === 0 ? (
            <li className="flex items-center gap-[11px] px-4 py-[11px]">
              <span className="text-[12.5px] text-muted-ink">Belum ada aktivitas</span>
            </li>
          ) : (
            data.activity.map((a) => {
              const style = ACTIVITY_STYLE[a.kind];
              const { strong, rest } = activityCopy(a);
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-[11px] px-4 py-[11px] border-b border-line last:border-b-0"
                >
                  <span className={`w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 ${style.tone}`}>
                    <Icon name={style.icon} size={14} stroke="currentColor" />
                  </span>
                  <div className="flex-1 min-w-0 text-[12.5px] leading-[1.35]">
                    <span className="font-semibold">{strong}</span>
                    <span className="text-muted-ink">{rest}</span>
                  </div>
                  <span className="text-[10px] text-faint [font-variant:small-caps] tracking-[0.08em] shrink-0">
                    {a.timeLabel}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      </MobileCard>
    </MobileShell>
  );
}

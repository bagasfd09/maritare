import { DashboardShell } from "@/components/templates/dashboard-shell";
import { DashboardTopBar } from "@/components/organisms/dashboard-topbar";
import { CircleButton } from "@/components/atoms/circle-button";
import { Icon } from "@/components/atoms/icon";
import { Em } from "@/components/atoms/typography";
import { CountdownCard } from "@/components/molecules/countdown-card";
import { PublishCard } from "@/components/molecules/publish-card";
import { PublishControl } from "@/components/molecules/publish-control";
import { StatCard } from "@/components/molecules/stat-card";
import { RsvpCard } from "@/components/molecules/rsvp-card";
import { ActivityFeed } from "@/components/molecules/activity-feed";
import type { OverviewData } from "@/server/queries/dashboard";

type OverviewProps = {
  data: OverviewData;
};

// Screen 01 · Beranda (Overview). Renders straight from real overview data.
export function Overview({ data }: OverviewProps) {
  const chrome = data.chrome;
  // Greeting uses the SIGNED-IN user's first name (each co-owner sees their own
  // name, not always the groom's); skip when chrome is unavailable.
  const greetName = (chrome?.userName ?? "").trim().split(/\s+/)[0];

  // Countdown — render straight from data; coerce nulls for the card's required
  // props (CountdownCard takes a number/string and is out of scope to change).
  const daysLeft = data.daysLeft ?? 0;
  const dateLabel = data.dateLabel ?? "";
  const venueLabel = data.venueLabel ?? "";

  // RSVP / wishes / photos / visits.
  const confirmed = data.rsvp.confirmed;
  const invited = data.rsvp.invited;
  const wishesTotal = data.wishes.total;
  const wishesPending = data.wishes.pending;
  const photosUsed = data.photos.used;
  const photoLimitLabel = data.photos.limit ?? "∞";
  const packageName = chrome?.packageName ?? "—";
  const visits = data.visits;

  return (
    <DashboardShell active="home" chrome={chrome}>
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          num="§ I"
          eyebrow="Beranda"
          title={
            greetName
              ? <>Selamat sore, <Em className="text-burgundy">{greetName}.</Em></>
              : <>Selamat <Em className="text-burgundy">sore.</Em></>
          }
          actions={
            <>
              <PublishControl slug={data.slug} initialStatus={data.chrome?.status ?? "draft"} />
              <CircleButton><Icon name="bell" size={14} /></CircleButton>
            </>
          }
        />

        <div className="flex-1 overflow-y-auto px-10 py-7">
          {/* Hero: countdown + publish */}
          <div className="grid grid-cols-[1.4fr_1fr] gap-5 mb-[22px]">
            <CountdownCard daysLeft={daysLeft} dateLabel={dateLabel} venueLabel={venueLabel} />
            <PublishCard progress={data.completionPct} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-[14px] mb-[22px]">
            <StatCard label="Tamu konfirmasi" value={String(confirmed)} sub={`dari ${invited} diundang`} tone="default" icon="users" />
            <StatCard label="Ucapan masuk" value={String(wishesTotal)} sub={`${wishesPending} menunggu moderasi`} tone="cream" icon="heart" />
            <StatCard label="Foto galeri" value={String(photosUsed)} sub={`dari ${photoLimitLabel} (paket ${packageName})`} tone="default" icon="image" />
            <StatCard label="Pengunjung" value={String(visits)} sub="7 hari terakhir" tone="sage" icon="eye" />
          </div>

          {/* RSVP + activity */}
          <div className="grid grid-cols-[1.3fr_1fr] gap-5">
            <RsvpCard
              confirmed={data.rsvp.confirmed}
              declined={data.rsvp.declined}
              pending={data.rsvp.pending}
              invited={data.rsvp.invited}
              respondedPct={data.rsvp.respondedPct}
              groups={data.rsvpByGroup}
              bySide={data.rsvpBySide}
            />
            <ActivityFeed items={data.activity} />
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}

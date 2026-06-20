import { Icon, type IconName } from "@/components/atoms/icon";
import { Avatar } from "@/components/atoms/avatar";
import { MobileShell } from "@/components/templates/mobile-shell";
import { MobileCard, MobileEyebrow, MobileToggle } from "@/components/molecules/mobile-primitives";
import { cn } from "@/lib/utils";
import { logout } from "@/server/actions/auth";
import type { SettingsData } from "@/server/queries/dashboard";

// Eyebrow label above a flush card group.
function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <MobileEyebrow className="px-1 pb-2">{title}</MobileEyebrow>
      <MobileCard flush>{children}</MobileCard>
    </div>
  );
}

// Inner markup shared by the <a> and the <form><button> variants of a row.
function RowInner({
  icon,
  label,
  sub,
  danger,
}: {
  icon: IconName;
  label: string;
  sub?: string;
  danger: boolean;
}) {
  return (
    <>
      <span
        className={cn(
          "w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0",
          danger ? "bg-[rgba(124,45,45,0.1)] text-burgundy" : "bg-sage-soft text-[#2E3325]",
        )}
      >
        <Icon name={icon} size={16} stroke="currentColor" />
      </span>
      <div className="flex-1 text-left">
        <div className="text-sm font-semibold">{label}</div>
        {sub && <div className="text-[11.5px] text-muted-ink mt-px">{sub}</div>}
      </div>
      {!danger && <Icon name="chevron-r" size={16} stroke="var(--color-faint)" />}
    </>
  );
}

// Tappable settings row: icon chip + label/sub + chevron (hidden for danger rows).
// When `action` is supplied the row renders as a server-action form button
// instead of a link (used by "Keluar").
function LinkRow({
  icon,
  label,
  sub,
  danger = false,
  action,
}: {
  icon: IconName;
  label: string;
  sub?: string;
  danger?: boolean;
  action?: () => void | Promise<void>;
}) {
  const rowClass = cn(
    "flex items-center gap-3 px-4 py-[14px] border-b border-line last:border-b-0 no-underline w-full",
    danger ? "text-burgundy" : "text-charcoal",
  );
  if (action) {
    return (
      <form action={action}>
        <button type="submit" className={cn(rowClass, "bg-transparent cursor-pointer border-b-0")}>
          <RowInner icon={icon} label={label} sub={sub} danger={danger} />
        </button>
      </form>
    );
  }
  return (
    <a href="#" className={rowClass}>
      <RowInner icon={icon} label={label} sub={sub} danger={danger} />
    </a>
  );
}

// Notification preference row with a static switch.
function ToggleRow({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-[13px] border-b border-line last:border-b-0">
      <div className="flex-1 text-sm font-medium">{label}</div>
      <MobileToggle on={on} />
    </div>
  );
}

// Mobile 09 · Pengaturan — ported from the design's MB_Pengaturan, now bound to
// the signed-in user's real profile + invitation.
export function SettingsMobile({ data }: { data: SettingsData }) {
  const { profile, weddingSlug, notificationPrefs } = data;
  const headerName = profile.name.trim() || profile.email;
  return (
    <MobileShell active="pengaturan" eyebrow="Pengaturan" title={<>Pengaturan.</>}>
      {/* Profile card */}
      <MobileCard className="flex items-center gap-[14px]">
        <Avatar tone="burgundy" size={52} className="text-[18px]">
          {profile.initials}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-display text-[19px] truncate">{headerName}</div>
          <div className="text-xs text-muted-ink truncate">{profile.email}</div>
        </div>
      </MobileCard>

      <SettingsGroup title="Undangan">
        <LinkRow icon="link" label="Tautan & domain" sub={`maritare.id/${weddingSlug}`} />
        <LinkRow icon="globe" label="Bahasa" sub="Indonesia" />
      </SettingsGroup>

      <SettingsGroup title="Notifikasi">
        <ToggleRow label="Email" on={notificationPrefs.rsvp.email} />
        <ToggleRow label="WhatsApp" on={notificationPrefs.rsvp.wa} />
      </SettingsGroup>

      <SettingsGroup title="Akun">
        <LinkRow icon="settings" label="Masuk dengan Google" sub={profile.email} />
        <LinkRow icon="logout" label="Keluar" sub="Akhiri sesi kamu" danger action={logout} />
      </SettingsGroup>

      <div className="text-center text-[11px] text-faint pt-1 pb-[2px] font-display italic">
        maritare* · v1.0
      </div>
    </MobileShell>
  );
}

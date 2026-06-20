// Account-level notification preferences.
//
// Shared by the users table (jsonb column type), the saveNotifications server
// action, and the settings UI so the channels stay in sync across all three.
// Each notification kind toggles two delivery channels: email + WhatsApp.

export type NotificationChannel = { email: boolean; wa: boolean };

export type NotificationKind = "rsvp" | "wishes" | "gift" | "reminder" | "tips";

export type NotificationPrefs = Record<NotificationKind, NotificationChannel>;

// Display metadata for each notification kind (Bahasa Indonesia, informal). The
// order here is the order rendered in the settings screen.
export const NOTIFICATION_ROWS: ReadonlyArray<{
  kind: NotificationKind;
  label: string;
  desc: string;
}> = [
  { kind: "rsvp", label: "RSVP baru masuk", desc: "Setiap tamu konfirmasi hadir/tidak" },
  {
    kind: "wishes",
    label: "Ucapan baru menunggu moderasi",
    desc: "Saat ada ucapan perlu disetujui",
  },
  { kind: "gift", label: "Hadiah masuk", desc: "Notifikasi setiap amplop diterima" },
  { kind: "reminder", label: "Pengingat hari H", desc: "30 / 7 / 1 hari sebelum acara" },
  { kind: "tips", label: "Tips & update produk", desc: "Saran fitur baru & tutorial" },
];

export const NOTIFICATION_KINDS: readonly NotificationKind[] = NOTIFICATION_ROWS.map(
  (r) => r.kind,
);

// Sensible defaults (mirror the original design's on/off states).
export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  rsvp: { email: true, wa: true },
  wishes: { email: true, wa: false },
  gift: { email: true, wa: true },
  reminder: { email: true, wa: true },
  tips: { email: false, wa: false },
};

/**
 * Coerce an unknown stored value into a complete NotificationPrefs, filling any
 * missing kind/channel from the defaults. Tolerant of partial/legacy documents.
 */
export function normalizeNotificationPrefs(value: unknown): NotificationPrefs {
  const source = (value ?? {}) as Partial<Record<NotificationKind, Partial<NotificationChannel>>>;
  const out = {} as NotificationPrefs;
  for (const kind of NOTIFICATION_KINDS) {
    const fallback = DEFAULT_NOTIFICATION_PREFS[kind];
    const channel = source[kind] ?? {};
    out[kind] = {
      email: typeof channel.email === "boolean" ? channel.email : fallback.email,
      wa: typeof channel.wa === "boolean" ? channel.wa : fallback.wa,
    };
  }
  return out;
}

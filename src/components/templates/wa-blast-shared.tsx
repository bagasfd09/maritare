// Shared logic + WhatsApp visuals for the "Sebar via WhatsApp" screens (desktop
// wa-blast.tsx + the mobile variant). Pure helpers and presentational pieces
// only — each screen owns its own layout, state, and send wiring.

import { FlowerMark } from "@/components/atoms/flower-mark";
import { inviteUrl } from "@/lib/invite-message";
import { normalizePhoneIntl } from "@/lib/phone";
import type { WaBlastData } from "@/server/queries/dashboard";

export type Guest = WaBlastData["guests"][number];
export type Status = "unsent" | "sent" | "opened" | "rsvp";

export const WA = { green: "#1FA855", greenDeep: "#157F40", greenSoft: "rgba(31,168,85,0.12)" };
export const TONES = ["peach", "sage", "blush", "burgundy", "dark"] as const;

export const STATUS_META: Record<Status, { label: string; color: string; bg: string; dot: string }> = {
  unsent: { label: "Belum dikirim", color: "#5a2a18", bg: "var(--color-peach)", dot: "var(--color-terracotta)" },
  sent: { label: "Terkirim", color: WA.greenDeep, bg: WA.greenSoft, dot: WA.green },
  opened: { label: "Dibuka", color: "#155e63", bg: "rgba(31,150,160,0.14)", dot: "#1f96a0" },
  rsvp: { label: "Konfirmasi hadir", color: "#1c5a36", bg: "rgba(77,216,145,0.18)", dot: "#3FAE6E" },
};

// Effective status from real fields, with an optimistic local "just sent" set so
// the UI updates instantly before the server refresh lands.
export function effStatus(g: Guest, sentLocal: Set<string>): Status {
  if (g.status === "confirmed") return "rsvp";
  if (g.invitationStatus === "opened") return "opened";
  if (g.invitationStatus === "sent" || sentLocal.has(g.id)) return "sent";
  return "unsent";
}

export function validPhone(g: Guest): boolean {
  return normalizePhoneIntl(g.phone) !== null;
}

// Template defaults seed once from the real wedding info; the user can edit them
// (persisted per-wedding in localStorage). {link} is always injected from the
// real per-guest invite URL at send time, so edits can't break the link.
export function defaultTemplates(
  coupleLabel: string,
  dateLabel: string | null,
  venueLabel: string | null,
) {
  const when = dateLabel ? `🗓️ ${dateLabel}\n` : "";
  const where = venueLabel ? `📍 ${venueLabel}\n` : "";
  return [
    {
      id: "undangan",
      name: "Undangan",
      phase: "Pertama kali",
      text: `Halo {nama} 👋

Dengan penuh kebahagiaan, kami mengundangmu ke pernikahan *${coupleLabel}* 💍
${when}${where}
Undangan, konfirmasi kehadiran (RSVP), & QR check-in kamu ada di tautan ini:
{link}

Merupakan suatu kehormatan jika kamu berkenan hadir. Terima kasih 🙏`,
    },
    {
      id: "reminder",
      name: "Reminder",
      phase: "Belum balas",
      text: `Halo {nama} 🌸

Sekadar mengingatkan dengan hormat, acara pernikahan *${coupleLabel}* sudah dekat${dateLabel ? `:\n🗓️ ${dateLabel}` : "."}
${where}
Bila berkenan, mohon konfirmasi kehadiranmu lewat undangan kami ya:
{link}

Kami menantikan kehadiranmu 🤍`,
    },
    {
      id: "terimakasih",
      name: "Terima kasih",
      phase: "Setelah RSVP",
      text: `Terima kasih banyak {nama} 🙏

Kami berbahagia atas konfirmasi kehadiranmu. Sampai berjumpa di hari bahagia kami 🤍

Detail & lokasi acara:
{link}

— ${coupleLabel}`,
    },
  ];
}
export type Template = ReturnType<typeof defaultTemplates>[number];

export function fillTemplate(tpl: string, g: Guest, slug: string): string {
  const link = inviteUrl(slug, { to: g.name, code: g.code ?? undefined });
  return (tpl || "")
    .replace(/\{sapaan_lc\}/g, "")
    .replace(/\{sapaan\}/g, "")
    .replace(/\{nama\}/g, g.name)
    .replace(/\{grup\}/g, g.group ?? "")
    .replace(/\{link\}/g, link)
    .replace(/[ \t]{2,}/g, " ");
}

export function fmtNow(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ─────────── WhatsApp glyph (generic chat bubble, not the branded logo) ───────────
export function WAGlyph({ size = 16, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M3.2 20.8l1.3-4.1a8 8 0 113 3l-4.3 1.1z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 9.2c0 3.2 2.6 5.8 5.8 5.8l.9-1.7-2.4-.9-.8.9c-.9-.3-1.8-1.2-2.1-2.1l.9-.8-.9-2.4-1.4.1z" fill={color} />
    </svg>
  );
}

export function WADoubleTick({ color = "#53bdeb" }: { color?: string }) {
  return (
    <svg width="16" height="11" viewBox="0 0 18 12" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1 6.5l3 3L11 2.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6.5l3 3L16 2.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// WhatsApp-style chat preview bubble.
export function WAChat({ text, maxHeight = 200 }: { text: string; maxHeight?: number }) {
  return (
    <div
      style={{
        borderRadius: 14,
        padding: "16px 14px",
        maxHeight,
        overflowY: "auto",
        background: "#E4DCD2",
        backgroundImage:
          "radial-gradient(rgba(124,45,45,0.05) 1px, transparent 1px), radial-gradient(rgba(124,45,45,0.04) 1px, transparent 1px)",
        backgroundSize: "22px 22px, 22px 22px",
        backgroundPosition: "0 0, 11px 11px",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: "90%",
          width: "fit-content",
          flex: "0 0 auto",
          background: "#D9FDD3",
          borderRadius: "10px 3px 10px 10px",
          padding: "7px 10px 5px",
          boxShadow: "0 1px 1.5px rgba(11,20,26,0.16)",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 0,
            right: -7,
            width: 0,
            height: 0,
            borderTop: "8px solid #D9FDD3",
            borderRight: "8px solid transparent",
          }}
        />
        <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word", fontSize: 13, lineHeight: 1.5, color: "#111b21" }}>
          {text}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: 2, lineHeight: 1 }}>
          <span style={{ fontSize: 10, color: "#667781" }}>{fmtNow()}</span>
          <WADoubleTick />
        </div>
      </div>
    </div>
  );
}

// Countdown ring for the anti-ban cooldown between sends.
export function Ring({ secs, left, color }: { secs: number; left: number; color: string }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const prog = secs ? left / secs : 0;
  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
      <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--color-beige)" strokeWidth="4" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - prog)}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--color-charcoal)" }}>
        {left}
      </div>
    </div>
  );
}

// Decorative flower scatter for the burgundy focus backdrop.
export function WAFloralBg() {
  const flowers: Array<React.CSSProperties & { size: number }> = [
    { top: "-3%", left: "-2%", size: 220, transform: "rotate(18deg)", opacity: 0.1 },
    { top: "8%", right: "4%", size: 150, transform: "rotate(-12deg)", opacity: 0.09 },
    { bottom: "-5%", left: "6%", size: 190, transform: "rotate(30deg)", opacity: 0.08 },
    { bottom: "2%", right: "-2%", size: 240, transform: "rotate(-22deg)", opacity: 0.1 },
    { top: "44%", left: "-4%", size: 120, transform: "rotate(8deg)", opacity: 0.07 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {flowers.map(({ size, ...pos }, i) => (
        <div key={i} style={{ position: "absolute", width: size, height: size, ...pos }}>
          <FlowerMark size={size} color="var(--color-peach)" core="var(--color-terracotta-soft)" stamen="var(--color-peach)" />
        </div>
      ))}
    </div>
  );
}

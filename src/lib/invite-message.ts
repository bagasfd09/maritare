// Invitation links + default WhatsApp message. Shared by client (wa.me manual
// button) and server (Fonnte blast), so it must stay free of secrets. Uses
// NEXT_PUBLIC_APP_URL (inlined into the client bundle by Next).

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");

/**
 * Public invitation URL for a wedding slug, e.g. https://maritare.id/inv/bagas-kiki.
 * Pass `to` (guest name → personalizes the cover) and/or `code` (the short
 * per-guest code → renders that guest's check-in QR inside the invitation):
 *   inviteUrl("bagas-kiki", { to: "Andi", code: "a3X9kP" })
 *   → https://maritare.id/inv/bagas-kiki?to=Andi&g=a3X9kP
 */
export function inviteUrl(slug: string, opts?: { to?: string; code?: string }): string {
  const base = `${APP_URL}/inv/${slug}`;
  const params = new URLSearchParams();
  if (opts?.to) params.set("to", opts.to);
  if (opts?.code) params.set("g", opts.code);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Public per-guest QR page (shows the guest's check-in QR), e.g. /qr/<uuid> */
export function guestQrUrl(guestId: string): string {
  return `${APP_URL}/qr/${guestId}`;
}

/**
 * Default WhatsApp invite text (Bahasa, informal). One link only: the
 * personalized invitation, which already embeds the guest's check-in QR (via the
 * ?g= short code), so no separate QR link is sent. Used verbatim for both the
 * manual wa.me deep-link and the Fonnte auto-blast.
 */
export function buildInviteMessage(p: {
  guestName: string;
  groomName: string;
  brideName: string;
  slug: string;
  /** Short per-guest code; embeds the in-invitation check-in QR via ?g=. */
  guestCode?: string;
}): string {
  return [
    `Halo ${p.guestName} 👋`,
    "",
    `Dengan penuh kebahagiaan, kami mengundangmu ke pernikahan *${p.groomName} & ${p.brideName}* 💍`,
    "",
    "Undangan, konfirmasi kehadiran (RSVP), & QR check-in kamu ada di tautan ini:",
    inviteUrl(p.slug, { to: p.guestName, code: p.guestCode }),
    "",
    "Merupakan suatu kehormatan jika kamu berkenan hadir. Terima kasih 🙏",
  ].join("\n");
}

/** Build a wa.me deep link with the message prefilled (phone already normalized). */
export function waMeLink(intlPhone: string, message: string): string {
  return `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
}

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

/** Placeholders a family sender may use in their /kirim template. */
export const FAMILY_TEMPLATE_LINK = "{link}";
export const FAMILY_TEMPLATE_NAME = "{nama}";

/**
 * Default formal (salam-style) invite TEMPLATE for the family "quick send" page
 * (/kirim), with {nama}/{link} placeholders the sender can edit. Couple names
 * are baked from live wedding info; {link} is always the real per-guest URL
 * injected at send time (see fillFamilyTemplate), so edits can't break it.
 */
export function familyInviteTemplate(p: { groomName: string; brideName: string }): string {
  return [
    "Assalamu'alaikum wr.wb.",
    "Kepada Yth.",
    `Bapak/Ibu/Saudara/i ${FAMILY_TEMPLATE_NAME}`,
    "",
    "Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara kami.",
    "",
    "Berikut link undangan kami, untuk info lengkap dari acara bisa kunjungi :",
    FAMILY_TEMPLATE_LINK,
    "",
    "",
    "Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.",
    "",
    "Mohon maaf perihal undangan hanya di bagikan melalui pesan ini.",
    "",
    "Kami yang berbahagia:",
    `${p.groomName} & ${p.brideName}`,
    "Beserta Keluarga besar kedua mempelai.",
  ].join("\n");
}

/**
 * Fill a family template for one guest: {nama} → guest name, {link} → the real
 * per-guest invite URL (embeds the check-in QR via ?g=). Unknown text is left
 * as-is, so a sender's custom wording is preserved verbatim.
 */
export function fillFamilyTemplate(
  template: string,
  p: { guestName: string; slug: string; guestCode?: string },
): string {
  const link = inviteUrl(p.slug, { to: p.guestName, code: p.guestCode });
  // Function replacements: the name/link are inserted LITERALLY, so an
  // owner-typed name containing `$&`, `$'`, `$1` etc. isn't reinterpreted as a
  // replace pattern. {link} first so a guest literally named "{link}" stays text.
  return template
    .replace(/\{link\}/g, () => link)
    .replace(/\{nama\}/g, () => p.guestName);
}

/** Build a wa.me deep link with the message prefilled (phone already normalized). */
export function waMeLink(intlPhone: string, message: string): string {
  return `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
}

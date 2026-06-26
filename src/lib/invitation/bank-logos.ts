// Per-bank / per-e-wallet logo resolution for the wedding-gift cards.
//
// The gift form's bank (and e-wallet provider) field is FREE TEXT, so we map a
// normalized typed name to a known logo asset. Only names we actually ship a
// logo file for resolve to a path; everything else returns null and the card
// falls back to showing the typed name as text — so an unknown bank is never
// mislabeled with the wrong logo.
//
// TO ADD A BANK / E-WALLET LOGO:
//   1. Drop the official logo (transparent bg, roughly landscape wordmark) at:
//        /public/invitation/banks/<slug>.webp
//   2. Add `<slug>: "/invitation/banks/<slug>.webp"` to LOGO_BY_SLUG below.
//   3. Map the names customers might type to that slug in NAME_ALIASES.
// Bank logos are trademarks — use the official asset supplied by the brand.

// Which slugs actually have a logo file shipped. ADD A BANK HERE (one line) after
// dropping its /public/invitation/banks/<slug>.webp file. Slugs with no entry here
// resolve to null and the card shows the typed name as text — so the aliases below
// can list every bank safely, even before its logo file exists.
const LOGO_BY_SLUG: Record<string, string> = {
  bca: "/invitation/banks/bca.webp",
  mandiri: "/invitation/banks/mandiri.webp",
  // bni: "/invitation/banks/bni.webp",
  // bri: "/invitation/banks/bri.webp",
  // ...
};

// Lowercased, space-collapsed typed name → slug. Listing a bank here is harmless
// without a logo file (it just falls back to text), so these stay populated.
const NAME_ALIASES: Record<string, string> = {
  // Banks
  bca: "bca",
  "bank bca": "bca",
  "bank central asia": "bca",
  mandiri: "mandiri",
  "bank mandiri": "mandiri",
  bni: "bni",
  "bank bni": "bni",
  "bank negara indonesia": "bni",
  bri: "bri",
  "bank bri": "bri",
  "bank rakyat indonesia": "bri",
  bsi: "bsi",
  "bank syariah indonesia": "bsi",
  cimb: "cimb",
  "cimb niaga": "cimb",
  "bank cimb niaga": "cimb",
  permata: "permata",
  "bank permata": "permata",
  danamon: "danamon",
  "bank danamon": "danamon",
  btn: "btn",
  "bank btn": "btn",
  jago: "jago",
  "bank jago": "jago",
  seabank: "seabank",
  // E-wallets
  gopay: "gopay",
  ovo: "ovo",
  dana: "dana",
  shopeepay: "shopeepay",
  "shopee pay": "shopeepay",
  linkaja: "linkaja",
};

/**
 * Resolve a free-text bank / e-wallet name to a logo path, or null when we have
 * no logo for it (caller then shows the name as text).
 */
export function resolveBankLogo(rawName: string): string | null {
  const key = rawName.trim().toLowerCase().replace(/\s+/g, " ");
  if (!key) return null;
  const slug = NAME_ALIASES[key];
  return slug ? (LOGO_BY_SLUG[slug] ?? null) : null;
}

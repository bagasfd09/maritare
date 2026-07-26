// Payment channel catalog + the shape of an issued payment instrument.
//
// Deliberately free of any node: import so BOTH the client checkout screens and
// the server-only DOKU calls can share it. The API calls that use these live in
// doku-channels.ts, which imports node:crypto — keep that split, or the crypto
// module gets pulled into the browser bundle.

// Channel identifiers exactly as DOKU spells them. Only list a bank here once it
// is active on the DOKU account AND has a partnerServiceId (VA prefix) — DOKU
// issues one per bank, so a missing prefix means that bank cannot be used.
// https://developers.doku.com/accept-payments/doku-checkout/supported-payment-methods
export const VA_CHANNELS = [
  { id: "VIRTUAL_ACCOUNT_BCA", bank: "BCA", label: "BCA Virtual Account", color: "#0060AF", logo: "/brand/payments/bca.webp" },
  { id: "VIRTUAL_ACCOUNT_BANK_MANDIRI", bank: "Mandiri", label: "Mandiri Virtual Account", color: "#003D79", logo: "/brand/payments/mandiri.webp" },
  { id: "VIRTUAL_ACCOUNT_BRI", bank: "BRI", label: "BRI Virtual Account", color: "#00529C", logo: "/brand/payments/bri.webp" },
  { id: "VIRTUAL_ACCOUNT_BANK_PERMATA", bank: "Permata", label: "Permata Virtual Account", color: "#00857C", logo: "/brand/payments/permata.webp" },
  { id: "VIRTUAL_ACCOUNT_BANK_CIMB", bank: "CIMB Niaga", label: "CIMB Niaga Virtual Account", color: "#7A1F2B", logo: "/brand/payments/cimb.webp" },
  { id: "VIRTUAL_ACCOUNT_BANK_SYARIAH_MANDIRI", bank: "BSI", label: "BSI Virtual Account", color: "#00A39D", logo: "/brand/payments/bsi.webp" },
  // BNI & BTN: no working v2 endpoint on DOKU sandbox (BNI 400s, BTN 404s) and
  // SNAP VA isn't provisioned on this account — re-add once DOKU enables them.
  // { id: "VIRTUAL_ACCOUNT_BNI", bank: "BNI", label: "BNI Virtual Account", color: "#F05A22" },
  // { id: "VIRTUAL_ACCOUNT_BTN", bank: "BTN", label: "BTN Virtual Account", color: "#00529B" },
] as const satisfies ReadonlyArray<{ id: string; bank: string; label: string; color: string; logo?: string }>;

export type VaChannel = (typeof VA_CHANNELS)[number]["id"];

// E-wallets enabled on the DOKU account (EMONEY_* exactly as DOKU spells them).
// Each rides the hosted Checkout API pinned to that single method — the wallet
// flow inherently leaves the app for authorization, so there is nothing to
// render in-app beyond the choice itself.
export const EWALLET_CHANNELS = [
  { id: "EMONEY_DANA", name: "DANA", badge: "DANA", color: "#108EE9", logo: "/brand/payments/dana.webp" },
  { id: "EMONEY_OVO", name: "OVO", badge: "OVO", color: "#4C3494", logo: "/brand/payments/ovo.webp" },
  { id: "EMONEY_SHOPEE_PAY", name: "ShopeePay", badge: "SPAY", color: "#EE4D2D", logo: "/brand/payments/shopeepay.svg" },
  { id: "EMONEY_LINKAJA", name: "LinkAja", badge: "LINK", color: "#E82529", logo: "/brand/payments/linkaja.webp" },
  { id: "EMONEY_ISAKU", name: "iSaku", badge: "ISAKU", color: "#F26F21", logo: "/brand/payments/isaku.svg" },
] as const satisfies ReadonlyArray<{ id: string; name: string; badge: string; color: string; logo?: string }>;

export type EwalletChannel = (typeof EWALLET_CHANNELS)[number]["id"];

/** "CHECKOUT" is the escape hatch to DOKU's hosted page (cards, paylater). */
export type PaymentChannel = VaChannel | EwalletChannel | "QRIS" | "CHECKOUT";

/**
 * How to pay one order — stored on `orders.payment_detail` so our payment page
 * re-renders on refresh without calling DOKU again.
 */
export type PaymentInstrument =
  | {
      kind: "va";
      channel: VaChannel;
      bank: string;
      virtualAccountNo: string;
      /** ISO-8601. The instrument expires here; the order itself does not. */
      expiresAt: string;
    }
  | {
      kind: "qris";
      channel: "QRIS";
      /** Raw QR payload — we render the image ourselves with `qrcode`. */
      qrContent: string;
      expiresAt: string;
    };

export function isVaChannel(value: string): value is VaChannel {
  return VA_CHANNELS.some((c) => c.id === value);
}

export function isEwalletChannel(value: string): value is EwalletChannel {
  return EWALLET_CHANNELS.some((c) => c.id === value);
}

export function vaChannelMeta(channel: VaChannel) {
  return VA_CHANNELS.find((c) => c.id === channel) ?? VA_CHANNELS[0];
}

/** One selectable payment method on the checkout screens. */
export type ChannelOption = {
  id: PaymentChannel;
  label: string;
  desc: string;
  badge: string;
  color: string;
  /**
   * Brand logo under /public (e.g. "/brand/payments/dana.svg"). Optional — the
   * colored `badge` chip renders until the asset lands.
   */
  logo?: string;
  recommended?: boolean;
};

/**
 * The checkout picker, grouped the way the screen renders it: e-wallets first,
 * then bank Virtual Accounts.
 * QRIS is deliberately absent until DOKU activates the product on this account
 * ("The product has not been Activated") — re-add it here when that lands.
 */
export const CHECKOUT_GROUPS: Array<{ title: string; options: ChannelOption[] }> = [
  {
    title: "E-Wallet",
    options: EWALLET_CHANNELS.map((w) => ({
      id: w.id as PaymentChannel,
      label: w.name,
      desc: `Bayar & konfirmasi lewat aplikasi ${w.name}`,
      badge: w.badge,
      color: w.color,
      logo: w.logo,
      ...(w.id === "EMONEY_DANA" ? { recommended: true } : {}),
    })),
  },
  {
    title: "Virtual Account",
    options: VA_CHANNELS.map((c) => ({
      id: c.id as PaymentChannel,
      label: c.label,
      desc: "Transfer & verifikasi otomatis",
      badge: c.bank,
      color: c.color,
      logo: c.logo,
    })),
  },
];

/** Flat view of the picker, in display order — first entry is the default. */
export const CHECKOUT_CHANNELS: ChannelOption[] = CHECKOUT_GROUPS.flatMap((g) => g.options);

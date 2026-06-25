// Checkout catalog + pricing — UI-only mock shared by the desktop (Checkout) and
// mobile (CheckoutMobile) screens. There is no payment backend yet (gateway
// undecided), so the plan/payment/voucher catalog is baked from the design and
// the "Bayar" button is inert. When a provider is chosen, wire selection state
// to a Server Action + order/promo tables. Keeping this React-free so both
// screens (and any future server code) can import it.

export type PlanState = "lower" | "current" | "upgrade";
export type Plan = {
  id: string;
  roman: string;
  name: string;
  price: number;
  per: string;
  guests: string;
  perks: string[];
  state: PlanState;
};

export const LAUNCH_PCT = 20;
// Proportional credit for the still-active Gold plan, applied on upgrade.
export const GOLD_CREDIT = 150_000;

export const PLANS: Plan[] = [
  {
    id: "silver",
    roman: "I",
    name: "Silver",
    price: 150_000,
    per: "90 hari aktif",
    guests: "Hingga 100 tamu",
    perks: ["1 template editorial", "Galeri 30 foto", "RSVP & buku tamu digital"],
    state: "lower",
  },
  {
    id: "gold",
    roman: "II",
    name: "Gold",
    price: 300_000,
    per: "180 hari aktif",
    guests: "Hingga 300 tamu",
    perks: ["Semua dari Silver, plus →", "Subdomain nama.maritare.id", "Livestream & QR check-in"],
    state: "current",
  },
  {
    id: "platinum",
    roman: "III",
    name: "Platinum",
    price: 500_000,
    per: "1 tahun aktif",
    guests: "Tamu unlimited",
    perks: [
      "Semua dari Gold, plus →",
      "Custom domain (.com / .id)",
      "Galeri foto unlimited",
      "Konsultasi desain 1-on-1",
    ],
    state: "upgrade",
  },
];

export type Pay = {
  id: string;
  label: string;
  desc: string;
  badge: string;
  color: string;
  recommended?: boolean;
};
export const PAYS: Pay[] = [
  { id: "bca", label: "BCA Virtual Account", desc: "Transfer & verifikasi otomatis", badge: "BCA", color: "#0060AF", recommended: true },
  { id: "qris", label: "QRIS", desc: "Scan dari semua e-wallet & m-banking", badge: "QRIS", color: "#1a1a1a" },
  { id: "gopay", label: "GoPay", desc: "Saldo GoPay / GoPay Later", badge: "GoPay", color: "#00AED6" },
  { id: "ewallet", label: "OVO · DANA · ShopeePay", desc: "Bayar dengan e-wallet pilihanmu", badge: "e-wallet", color: "#4C2A86" },
  { id: "cc", label: "Kartu Kredit / Debit", desc: "Visa · Mastercard · JCB · cicilan 0%", badge: "Kartu", color: "#7c2d2d" },
];

export type Voucher = { pct: number; label: string };
export const VOUCHERS: Record<string, Voucher> = {
  CINTA20: { pct: 20, label: "Diskon 20%" },
  NIKAHYUK: { pct: 15, label: "Diskon 15%" },
  MARITARE10: { pct: 10, label: "Diskon 10%" },
};
export type AppliedVoucher = { code: string } & Voucher;

// Fixed launch-promo window (2d 14h 22m 08s). Seeded as a constant so first paint
// matches on server and client; the live deadline is set on mount.
export const PROMO_MS = ((2 * 24 + 14) * 3600 + 22 * 60 + 8) * 1000;

export const CD_UNITS: Array<{ key: "hari" | "jam" | "mnt" | "dtk"; div: number; mod: number }> = [
  { key: "hari", div: 86_400_000, mod: Infinity },
  { key: "jam", div: 3_600_000, mod: 24 },
  { key: "mnt", div: 60_000, mod: 60 },
  { key: "dtk", div: 1_000, mod: 60 },
];

export type Order = {
  sel: Plan;
  launchOff: number;
  afterLaunch: number;
  voucherOff: number;
  credit: number;
  total: number;
  saved: number;
  verb: string;
};

// Pure pricing for the selected plan + optional voucher. Identical on web/mobile.
export function computeOrder(planId: string, voucher: AppliedVoucher | null): Order {
  const sel = PLANS.find((p) => p.id === planId) ?? PLANS[0];
  const launchOff = Math.round((sel.price * LAUNCH_PCT) / 100);
  const afterLaunch = sel.price - launchOff;
  const voucherOff = voucher ? Math.round((afterLaunch * voucher.pct) / 100) : 0;
  const credit = planId === "platinum" ? GOLD_CREDIT : 0;
  const total = Math.max(0, sel.price - launchOff - voucherOff - credit);
  const saved = launchOff + voucherOff + credit;
  const verb = planId === "gold" ? "Perpanjang" : "Upgrade ke";
  return { sel, launchOff, afterLaunch, voucherOff, credit, total, saved, verb };
}

// Checkout catalog types + pricing, shared by the desktop (Checkout) and mobile
// (CheckoutMobile) screens.
//
// Prices are NOT defined here. They come from the `packages` table via
// getBillingData, and startCheckout re-derives the charge from that same table
// before calling DOKU — so what the customer sees is exactly what the gateway
// charges. Discounts come only from the admin-managed `promos` table, validated
// server-side by checkPromo. React-free so server code can import it too.

export type PlanState =
  | "lower" // below the active package — not purchasable
  | "current" // the active package — buying again renews it
  | "upgrade" // above the active package (or the featured one when there's none)
  | "available";

export type CheckoutPlan = {
  /** The package slug — the only plan identifier the client ever sends. */
  id: string;
  roman: string;
  name: string;
  price: number;
  per: string; // "180 hari aktif"
  guests: string; // "Hingga 300 tamu"
  perks: string[];
  state: PlanState;
};

/** A promo confirmed by the server, with its rupiah discount for this plan. */
export type AppliedPromo = { code: string; label: string; discount: number };

export type Order = {
  sel: CheckoutPlan | null;
  promoOff: number;
  total: number;
  /** Call to action for the selected plan's relationship to the active one. */
  verb: string;
};

const VERBS: Record<PlanState, string> = {
  lower: "Pilih",
  current: "Perpanjang",
  upgrade: "Upgrade ke",
  available: "Pilih",
};

/** Pure pricing for the selected plan + an optional server-validated promo. */
export function computeOrder(
  plans: CheckoutPlan[],
  planId: string,
  promo: AppliedPromo | null,
): Order {
  const sel = plans.find((p) => p.id === planId) ?? plans[0] ?? null;
  if (!sel) {
    return { sel: null, promoOff: 0, total: 0, verb: "Pilih" };
  }
  // Never discount below zero — mirrors the clamp in startCheckout.
  const promoOff = promo ? Math.min(promo.discount, sel.price) : 0;
  return { sel, promoOff, total: sel.price - promoOff, verb: VERBS[sel.state] };
}

/** First plan the customer can actually buy: prefer an upgrade, never a lower tier. */
export function defaultPlanId(plans: CheckoutPlan[]): string {
  const buyable = plans.filter((p) => p.state !== "lower");
  const preferred = buyable.find((p) => p.state === "upgrade") ?? buyable[0] ?? plans[0];
  return preferred?.id ?? "";
}

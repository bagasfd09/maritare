"use client";

import { useState, useTransition } from "react";

import {
  computeOrder,
  defaultPlanId,
  type AppliedPromo,
  type CheckoutPlan,
  type Order,
} from "@/lib/checkout";
import { CHECKOUT_CHANNELS, type PaymentChannel } from "@/lib/payment/channels";
import { checkPromo, startCheckout } from "@/server/actions/checkout";

export type CheckoutState = Order & {
  plans: CheckoutPlan[];
  plan: string;
  setPlan: (id: string) => void;
  /** Payment channel — an e-wallet or a specific bank's Virtual Account. */
  channel: PaymentChannel;
  setChannel: (id: PaymentChannel) => void;
  promoInput: string;
  setPromoInput: (v: string) => void;
  promo: AppliedPromo | null;
  promoErr: string;
  setPromoErr: (v: string) => void;
  applyPromo: () => void;
  clearPromo: () => void;
  promoPending: boolean;
  /** Create the order and hand off to the DOKU-hosted payment page. */
  pay: () => void;
  payPending: boolean;
  payErr: string;
};

// Shared checkout interactivity (plan selection, promo validation, handoff to
// DOKU) so the desktop and mobile screens behave identically. Layout is each
// screen's own concern.
//
// Prices come from `plans` (the packages table) and the promo discount is
// whatever the server confirmed — nothing here invents a number, and
// startCheckout re-derives the charge server-side regardless.
export function useCheckout(plans: CheckoutPlan[]): CheckoutState {
  const [plan, setPlanState] = useState(() => defaultPlanId(plans));
  const [channel, setChannel] = useState<PaymentChannel>(CHECKOUT_CHANNELS[0].id);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  const [promoErr, setPromoErr] = useState("");
  const [payErr, setPayErr] = useState("");
  const [promoPending, startPromoCheck] = useTransition();
  const [payPending, startPay] = useTransition();

  function setPlan(id: string) {
    setPlanState(id);
    // A percent promo is worth a different amount on a different plan, so drop
    // it rather than show a stale discount the server won't agree with.
    setPromo(null);
    setPromoErr("");
  }

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code || promoPending) return;
    startPromoCheck(async () => {
      const result = await checkPromo({ packageSlug: plan, code });
      if (result.ok) {
        setPromo({ code: result.code, label: result.label, discount: result.discount });
        setPromoErr("");
      } else {
        setPromo(null);
        setPromoErr(result.error);
      }
    });
  }

  function clearPromo() {
    setPromo(null);
    setPromoInput("");
    setPromoErr("");
  }

  function pay() {
    if (payPending || !plan) return;
    setPayErr("");
    startPay(async () => {
      const result = await startCheckout({ packageSlug: plan, promoCode: promo?.code, channel });
      if (result.ok) {
        // Full navigation: this leaves the dashboard shell either way — to our
        // own payment page for VA/QRIS, or to DOKU's hosted page for cards.
        window.location.href = result.redirect;
        return;
      }
      setPayErr(result.error);
    });
  }

  return {
    plans,
    plan,
    setPlan,
    channel,
    setChannel,
    promoInput,
    setPromoInput,
    promo,
    promoErr,
    setPromoErr,
    applyPromo,
    clearPromo,
    promoPending,
    pay,
    payPending,
    payErr,
    ...computeOrder(plans, plan, promo),
  };
}

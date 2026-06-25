"use client";

import { useEffect, useState } from "react";

import {
  PROMO_MS,
  VOUCHERS,
  computeOrder,
  type AppliedVoucher,
  type Order,
} from "@/lib/checkout";

export type CheckoutState = Order & {
  plan: string;
  setPlan: (id: string) => void;
  pay: string;
  setPay: (id: string) => void;
  promoInput: string;
  setPromoInput: (v: string) => void;
  voucher: AppliedVoucher | null;
  voucherErr: string;
  setVoucherErr: (v: string) => void;
  /** Live countdown remaining (ms) for the launch-promo banner. */
  remain: number;
  applyVoucher: () => void;
  clearVoucher: () => void;
};

// Shared checkout interactivity (plan + payment selection, voucher, promo
// countdown, derived pricing) so the desktop and mobile screens behave
// identically. Layout is each screen's own concern.
export function useCheckout(): CheckoutState {
  const [plan, setPlan] = useState("platinum");
  const [pay, setPay] = useState("bca");
  const [promoInput, setPromoInput] = useState("");
  const [voucher, setVoucher] = useState<AppliedVoucher | null>(null);
  const [voucherErr, setVoucherErr] = useState("");
  const [remain, setRemain] = useState(PROMO_MS);

  useEffect(() => {
    const deadline = Date.now() + PROMO_MS;
    const t = setInterval(() => setRemain(Math.max(0, deadline - Date.now())), 1000);
    return () => clearInterval(t);
  }, []);

  function applyVoucher() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const found = VOUCHERS[code];
    if (found) {
      setVoucher({ code, ...found });
      setVoucherErr("");
    } else {
      setVoucherErr("Kode voucher tidak valid atau sudah berakhir.");
    }
  }

  function clearVoucher() {
    setVoucher(null);
    setPromoInput("");
  }

  const order = computeOrder(plan, voucher);

  return {
    plan,
    setPlan,
    pay,
    setPay,
    promoInput,
    setPromoInput,
    voucher,
    voucherErr,
    setVoucherErr,
    remain,
    applyVoucher,
    clearVoucher,
    ...order,
  };
}

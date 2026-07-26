// Server-only data access for the custom payment page.
//
// Ownership is derived from the session (never the invoice number in the URL):
// the order must belong to the wedding the signed-in user is a member of, so a
// guessed invoice number resolves to nothing.

import QRCode from "qrcode";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import type { PaymentInstrument } from "@/lib/payment/channels";
import { resolveMemberWeddingId } from "@/server/queries/wedding";

export type PaymentOrderData = {
  invoiceNo: string;
  description: string | null;
  amount: number;
  status: "pending" | "paid" | "failed" | "refunded";
  instrument: PaymentInstrument | null;
  /** Pre-rendered on the server so the client ships no QR library. */
  qrDataUrl: string | null;
};

export async function getPaymentOrder(invoiceNo: string): Promise<PaymentOrderData | null> {
  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) {
    return null;
  }

  const order = await db.query.orders.findFirst({
    columns: {
      invoiceNo: true,
      description: true,
      amount: true,
      status: true,
      paymentDetail: true,
    },
    where: and(eq(orders.invoiceNo, invoiceNo), eq(orders.weddingId, weddingId)),
  });
  if (!order) {
    return null;
  }

  const instrument = order.paymentDetail ?? null;
  let qrDataUrl: string | null = null;
  if (instrument?.kind === "qris") {
    // Plain black on white and error correction M: QRIS scanners are strict, so
    // this is the one QR in the app that does NOT take the brand palette.
    qrDataUrl = await QRCode.toDataURL(instrument.qrContent, {
      width: 640,
      margin: 1,
      errorCorrectionLevel: "M",
    });
  }

  return {
    invoiceNo: order.invoiceNo,
    description: order.description,
    amount: order.amount,
    status: order.status,
    instrument,
    qrDataUrl,
  };
}

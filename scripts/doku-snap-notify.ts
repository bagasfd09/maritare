// Simulate a DOKU SNAP payment notification against a running app.
//
//   node --env-file=.env.local scripts/doku-snap-notify.ts <invoice-no> <amount> [va|qris]
//
// DOKU cannot reach localhost, so this is how the SNAP settle path gets tested
// without a real sandbox payment. Signs the body with the same helper the route
// verifies with, so a 401 means the signing wiring is wrong, not the payload.
//
// The amount is required and must equal orders.amount exactly — the route
// refuses to settle on a mismatch, and a made-up default would look like a bug
// in the very guard that is doing its job.

import { randomUUID } from "node:crypto";

import {
  buildSnapStringToSign,
  snapSymmetricSignature,
  snapTimestamp,
} from "../src/lib/payment/doku-snap.ts";

const [invoiceNo, amountArg, kind = "va"] = process.argv.slice(2);
if (!invoiceNo || !amountArg || !Number.isFinite(Number(amountArg))) {
  console.error("usage: node --env-file=.env.local scripts/doku-snap-notify.ts <invoice-no> <amount> [va|qris]");
  console.error("  amount must match orders.amount exactly");
  process.exit(1);
}

const secretKey = process.env.DOKU_SECRET_KEY;
// `||`, not `??`: a blank DOKU_PARTNER_ID= in .env.local must fall through.
const partnerId = process.env.DOKU_PARTNER_ID || process.env.DOKU_CLIENT_ID;
if (!secretKey || !partnerId) {
  console.error("DOKU_SECRET_KEY and DOKU_CLIENT_ID/DOKU_PARTNER_ID must be set");
  process.exit(1);
}

const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
// Each SNAP channel notifies on its own spec path; mirror the mounted routes.
const path =
  process.env.DOKU_SNAP_NOTIFICATION_PATH ??
  (kind === "qris" ? "/v1.0/qr/qr-mpm-notify" : "/v1.1/transfer-va/payment");
const value = `${Number(amountArg)}.00`;

const rawBody = JSON.stringify(
  kind === "qris"
    ? {
        originalPartnerReferenceNo: invoiceNo,
        originalReferenceNo: randomUUID().replace(/-/g, "").slice(0, 20),
        latestTransactionStatus: "00",
        transactionStatusDesc: "Success",
        amount: { value, currency: "IDR" },
        additionalInfo: { channel: "QRIS" },
      }
    : {
        partnerServiceId: "   19008",
        customerNo: "12345678901234",
        virtualAccountNo: "0001900812345678901234",
        virtualAccountName: "Maritare Test",
        trxId: invoiceNo,
        paymentRequestId: randomUUID().replace(/-/g, "").slice(0, 20),
        paidAmount: { value, currency: "IDR" },
        virtualAccountTrxType: "C",
        trxDateTime: snapTimestamp(),
        additionalInfo: { channel: "VIRTUAL_ACCOUNT_BCA" },
      },
);

const timestamp = snapTimestamp();
// Inbound notifications carry no access token of ours; the route accepts the
// empty-slot reading, which is what this sends.
const signature = snapSymmetricSignature(
  buildSnapStringToSign({ method: "POST", path, accessToken: "", rawBody, timestamp }),
  secretKey,
);

const res = await fetch(`${appUrl.replace(/\/$/, "")}${path}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-PARTNER-ID": partnerId,
    "X-EXTERNAL-ID": randomUUID().replace(/-/g, "").slice(0, 32),
    "X-TIMESTAMP": timestamp,
    "X-SIGNATURE": signature,
    "CHANNEL-ID": "H2H",
  },
  body: rawBody,
});

console.log(`${res.status} ${res.statusText}`, await res.text());
if (res.status === 401) {
  console.error(`→ signature rejected: check DOKU_SECRET_KEY and that the route is mounted at ${path}`);
}

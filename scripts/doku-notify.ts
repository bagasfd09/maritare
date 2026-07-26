// Simulate a DOKU HTTP notification against a running app. DOKU cannot reach
// localhost, so this is how the settle path gets exercised locally without
// making a real sandbox payment for every iteration.
//
//   node --env-file=.env.local scripts/doku-notify.ts <invoice-no> [amount] [status]
//
// Signs the body exactly the way DOKU does (same helper the route verifies
// with), so a 401 here means the signing wiring is wrong — not the payload.
// Reads DOKU_SECRET_KEY / DOKU_CLIENT_ID from the env, and posts to
// NEXT_PUBLIC_APP_URL (override with APP_URL=... for a tunnel).

import { randomUUID } from "node:crypto";

import { DOKU_NOTIFICATION_TARGET, digestOf, signatureFor } from "../src/lib/payment/doku.ts";

const [invoiceNo, amountArg, statusArg] = process.argv.slice(2);
// The amount is required, not defaulted: the route refuses to settle when it
// disagrees with the stored order, so a made-up default would look like a
// broken webhook instead of the cross-check doing its job.
if (!invoiceNo || !amountArg || !Number.isFinite(Number(amountArg))) {
  console.error("usage: node --env-file=.env.local scripts/doku-notify.ts <invoice-no> <amount> [status]");
  console.error("  amount must match orders.amount exactly, or the route will refuse to settle");
  process.exit(1);
}

const clientId = process.env.DOKU_CLIENT_ID;
const secretKey = process.env.DOKU_SECRET_KEY;
if (!clientId || !secretKey) {
  console.error("DOKU_CLIENT_ID / DOKU_SECRET_KEY must be set (they are what the route verifies against)");
  process.exit(1);
}

const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const status = statusArg ?? "SUCCESS";

const rawBody = JSON.stringify({
  service: { id: "VIRTUAL_ACCOUNT" },
  acquirer: { id: "BCA" },
  channel: { id: "VIRTUAL_ACCOUNT_BCA" },
  transaction: {
    status,
    date: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    original_request_id: randomUUID(),
  },
  order: { invoice_number: invoiceNo, amount: Number(amountArg) },
});

const requestId = randomUUID();
const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

const res = await fetch(`${appUrl.replace(/\/$/, "")}${DOKU_NOTIFICATION_TARGET}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Client-Id": clientId,
    "Request-Id": requestId,
    "Request-Timestamp": timestamp,
    Signature: signatureFor({
      clientId,
      requestId,
      timestamp,
      target: DOKU_NOTIFICATION_TARGET,
      digest: digestOf(rawBody),
      secretKey,
    }),
  },
  body: rawBody,
});

console.log(`${res.status} ${res.statusText}`, await res.text());
if (res.status === 401) {
  console.error("→ signature rejected: check DOKU_SECRET_KEY and DOKU_NOTIFICATION_TARGET");
}

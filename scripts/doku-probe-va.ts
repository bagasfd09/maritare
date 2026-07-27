// Probe which bank Virtual Account v2 endpoints this DOKU account can actually
// issue against. Run: node --env-file=.env.local scripts/doku-probe-va.ts
//
// The Back Office "Active" pill is NOT evidence — this account shows QRIS as
// Active while its product is unactivated, and shows every bank as SNAP-capable
// while every SNAP create-va answers 4032715. The only proof a bank is usable is
// this endpoint returning a virtual_account_number.
//
// The request body is copied VERBATIM from createVirtualAccountV2 in
// src/lib/payment/doku-channels.ts — if it drifts, a bank can pass here and fail
// at checkout.

import { randomInt, randomUUID } from "node:crypto";

import { digestOf, dokuBaseUrl, signatureFor } from "../src/lib/payment/doku.ts";

if (process.env.DOKU_IS_PRODUCTION === "true") {
  console.error("Refusing to probe production — this mints real Virtual Accounts.");
  process.exit(1);
}

const clientId = process.env.DOKU_CLIENT_ID;
const secretKey = process.env.DOKU_SECRET_KEY;
if (!clientId || !secretKey) {
  console.error("DOKU_CLIENT_ID / DOKU_SECRET_KEY missing — run with --env-file=.env.local");
  process.exit(1);
}

// Per-bank body quirks, mirroring vaInfoFor() in doku-channels.ts. Keep the two
// in step — a probe that sends a different body than production proves nothing.
function vaInfo(slug: string): Record<string, unknown> {
  const base = { billing_type: "FIX_BILL", expired_time: 60, reusable_status: false };
  if (slug === "bni") return { ...base, merchant_unique_reference: String(randomInt(1e11, 1e12)) };
  if (slug === "danamon") {
    const { billing_type: _unsupported, ...rest } = base;
    return rest;
  }
  return base;
}

// Every bank on the account's channel list, plus the ones already shipped as a
// control group. Slug spellings that DOKU's own docs disagree on get both tries.
const CANDIDATES: Array<{ bank: string; slug: string; shipped?: boolean }> = [
  { bank: "BCA", slug: "bca", shipped: true },
  { bank: "Mandiri", slug: "mandiri", shipped: true },
  { bank: "BRI", slug: "bri", shipped: true },
  { bank: "Permata", slug: "permata", shipped: true },
  { bank: "CIMB", slug: "cimb", shipped: true },
  { bank: "BSI", slug: "bsm", shipped: true },
  { bank: "BNI", slug: "bni", shipped: true },
  { bank: "Danamon", slug: "danamon", shipped: true },
  { bank: "Maybank", slug: "maybank", shipped: true },
  { bank: "DOKU", slug: "doku", shipped: true },
  { bank: "BTN", slug: "btn" },
  { bank: "Neo Commerce", slug: "bnc" },
  { bank: "Sampoerna", slug: "bss" },
  { bank: "BJB", slug: "bjb" },
  { bank: "Sinarmas", slug: "sinarmas" },
];

async function probe(slug: string): Promise<{ ok: boolean; detail: string }> {
  const target = `/${slug}-virtual-account/v2/payment-code`;
  // Unique per call: DOKU rejects a repeated invoice_number, which would read as
  // a dead endpoint on the second run.
  const rawBody = JSON.stringify({
    order: { invoice_number: `PROBE-${Date.now()}-${slug.toUpperCase()}`, amount: 10000 },
    virtual_account_info: vaInfo(slug),
    customer: { name: "Probe Maritare", email: "probe@maritare.id" },
  });

  const requestId = randomUUID();
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const signature = signatureFor({
    clientId: clientId!,
    requestId,
    timestamp,
    target,
    digest: digestOf(rawBody),
    secretKey: secretKey!,
  });

  try {
    const res = await fetch(`${dokuBaseUrl()}${target}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": clientId!,
        "Request-Id": requestId,
        "Request-Timestamp": timestamp,
        Signature: signature,
      },
      body: rawBody,
    });
    const text = await res.text();
    let va: unknown;
    try {
      va = JSON.parse(text)?.virtual_account_info?.virtual_account_number;
    } catch {
      /* non-JSON body — reported raw below */
    }
    if (res.ok && typeof va === "string" && va) {
      return { ok: true, detail: `VA ${va}` };
    }
    return { ok: false, detail: `${res.status} ${text.slice(0, 160).replace(/\s+/g, " ")}` };
  } catch (error) {
    return { ok: false, detail: `request failed: ${String(error)}` };
  }
}

console.log(`Probing ${dokuBaseUrl()} with ${clientId}\n`);
for (const c of CANDIDATES) {
  const r = await probe(c.slug);
  const tag = c.shipped ? " (shipped)" : "";
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${c.bank}${tag} [${c.slug}] — ${r.detail}`);
}

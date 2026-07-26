// Self-check for the DOKU SNAP signature construction. Run: pnpm check:doku:snap
//
// SNAP has two signature schemes and both are easy to get subtly wrong:
// asymmetric SHA256withRSA for the B2B token, symmetric HMAC-SHA512 for every
// transactional call and inbound notification. DOKU publishes no sample with a
// matching key, so this pins the CONSTRUCTION (component order, separators,
// hash encoding, timestamp shape) and proves the crypto round-trips.

import assert from "node:assert/strict";
import { createVerify, generateKeyPairSync } from "node:crypto";

import {
  buildSnapStringToSign,
  sha256HexLower,
  snapAsymmetricSignature,
  snapSymmetricSignature,
  snapTimestamp,
  verifySnapNotification,
} from "../src/lib/payment/doku-snap.ts";

// 1. Body hash is lowercase hex SHA-256 (NOT base64 — that's the non-SNAP scheme).
assert.equal(
  sha256HexLower(""),
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
);
assert.match(sha256HexLower("{}"), /^[0-9a-f]{64}$/, "must be lowercase hex, 64 chars");

// 2. stringToSign is colon-joined: METHOD:path:token:sha256hex:timestamp
const stringToSign = buildSnapStringToSign({
  method: "post",
  path: "/snap-adapter/b2b/v1.0/qr/qr-mpm-generate",
  accessToken: "TOKEN123",
  rawBody: "{}",
  timestamp: "2026-07-26T10:00:00+07:00",
});
assert.equal(
  stringToSign,
  `POST:/snap-adapter/b2b/v1.0/qr/qr-mpm-generate:TOKEN123:${sha256HexLower("{}")}:2026-07-26T10:00:00+07:00`,
);
// 5 components, but the timestamp alone contributes 3 more colons (10:00:00 and
// the +07:00 offset) — so a stringToSign can never be parsed by splitting on ":".
assert.equal(stringToSign.split(":").length, 8);
assert.ok(stringToSign.startsWith("POST:"), "method must be upper-cased");

// 3. Timestamp: ISO-8601 with a +07:00 offset, no milliseconds, same instant.
const at = new Date("2026-07-26T03:00:00.500Z");
assert.equal(snapTimestamp(at), "2026-07-26T10:00:00+07:00");
assert.match(snapTimestamp(), /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+07:00$/);
assert.equal(
  new Date(snapTimestamp(at)).getTime(),
  Math.floor(at.getTime() / 1000) * 1000,
  "must round-trip to the same instant it was given",
);

// 4. Symmetric signature: base64 HMAC-SHA512 (64 bytes -> 88 base64 chars).
const secretKey = "SK-test-0000";
const sig = snapSymmetricSignature(stringToSign, secretKey);
assert.equal(Buffer.from(sig, "base64").length, 64, "HMAC-SHA512 is 64 bytes");
assert.notEqual(
  sig,
  snapSymmetricSignature(stringToSign + " ", secretKey),
  "signature must change when the payload changes",
);

// 5. Asymmetric signature: SHA256withRSA over `clientId|timestamp`, verifiable
//    with the matching public key — and an escaped-\n PEM must work, because
//    that is how a private key survives an env var.
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});
const clientId = "BRN-0214-1714016624673";
const ts = "2026-07-26T10:00:00+07:00";
const asym = snapAsymmetricSignature({ clientId, timestamp: ts, privateKey });
assert.ok(
  createVerify("RSA-SHA256").update(`${clientId}|${ts}`).verify(publicKey, asym, "base64"),
  "asymmetric signature must verify against the public key",
);
assert.equal(
  snapAsymmetricSignature({ clientId, timestamp: ts, privateKey: privateKey.replace(/\n/g, "\\n") }),
  asym,
  "an env-style PEM with escaped newlines must produce the same signature",
);

// 6. Inbound notification: accepts its own signature, rejects tampering.
process.env.DOKU_SECRET_KEY = secretKey;
const notifPath = "/api/webhook/doku/snap";
const notifBody = JSON.stringify({
  partnerServiceId: "   19008",
  customerNo: "12345",
  virtualAccountNo: "00019008012345",
  trxId: "MTR-20260726-K3F9QA",
  paidAmount: { value: "500000.00", currency: "IDR" },
});
const notifTs = "2026-07-26T10:05:00+07:00";
const bearer = "eyJhbGciOiJIUzI1NiJ9.token";

for (const [label, token, authorization] of [
  ["bearer-token variant", bearer, `Bearer ${bearer}`],
  ["empty-token variant", "", null],
] as const) {
  const inbound = {
    method: "POST",
    path: notifPath,
    rawBody: notifBody,
    timestamp: notifTs,
    authorization,
    signature: snapSymmetricSignature(
      buildSnapStringToSign({
        method: "POST",
        path: notifPath,
        accessToken: token,
        rawBody: notifBody,
        timestamp: notifTs,
      }),
      secretKey,
    ),
  };
  assert.ok(verifySnapNotification(inbound), `must accept the ${label}`);
  assert.ok(
    !verifySnapNotification({ ...inbound, rawBody: notifBody.replace("500000.00", "1.00") }),
    `must reject a tampered amount (${label})`,
  );
  assert.ok(
    !verifySnapNotification({ ...inbound, timestamp: "2026-07-26T11:00:00+07:00" }),
    `must reject a swapped timestamp (${label})`,
  );
  assert.ok(
    !verifySnapNotification({ ...inbound, signature: "short" }),
    `must reject a length-mismatched signature without throwing (${label})`,
  );
  assert.ok(
    !verifySnapNotification({ ...inbound, signature: null }),
    `must reject a missing signature (${label})`,
  );
}

// 7. A blank env var must behave as UNSET, not as the empty string. `??` does
//    NOT do this — it only falls back on undefined — which shipped a bug where
//    `DOKU_PARTNER_ID=` in .env.local failed with "not configured" despite the
//    documented fallback to DOKU_CLIENT_ID.
{
  const pick = (primary: string | undefined, fallback: string) => primary || fallback;
  assert.equal(pick("", "fallback"), "fallback", "blank env must fall through");
  assert.equal(pick(undefined, "fallback"), "fallback", "unset env must fall through");
  assert.equal(pick("set", "fallback"), "set", "a real value must win");
  // The literal source-level guarantee: no `process.env.X ?? …` fallbacks remain
  // in the DOKU payment code, since `??` reintroduces exactly this bug.
  const { readFileSync } = await import("node:fs");
  for (const file of [
    "src/lib/payment/doku-snap.ts",
    "src/lib/payment/doku.ts",
    "src/lib/payment/doku-channels.ts",
    "src/server/actions/checkout.ts",
    "src/server/doku-snap-notification.ts",
  ]) {
    const source = readFileSync(file, "utf8");
    const offenders = source.match(/process\.env\.[A-Z_]+\s*\?\?/g);
    assert.equal(offenders, null, `${file} uses ?? on an env var — use || so a blank value falls through`);
  }
}

// 8. VA customerNo must fill the DGPC 16-digit number exactly. Getting this
//    wrong is what produced DOKU 4032715 "Transaction Not Permitted
//    [Combination of partnerServiceId, customerNo, and virtualAccountNo]".
{
  const { newCustomerNo } = await import("../src/lib/payment/doku-channels.ts");

  // Real values from DOKU Back Office (BCA, Aggregator, API 1.1):
  //   Partner Service ID 19008 · Prefix Customer No 9 · Merchant BIN 190089
  // customerNo MUST start with the prefix — omitting it is what DOKU rejects as
  // "Combination of partnerServiceId, customerNo, and virtualAccountNo".
  const bca = newCustomerNo(5, "9");
  assert.equal(bca.length, 11, "BCA: serviceId 5 + customerNo 11 = 16");
  assert.ok(bca.startsWith("9"), "BCA: customerNo must start with the configured prefix");
  assert.equal(`19008${bca}`.length, 16, "BCA: full VA number must be 16 digits");
  assert.ok(`19008${bca}`.startsWith("190089"), "BCA: VA must carry the merchant BIN 190089");

  // Prefix is optional; a bank without one still fills to 16.
  for (const [serviceIdLen, prefix] of [[5, ""], [8, ""], [6, "8"], [5, "12"]] as const) {
    const customerNo = newCustomerNo(serviceIdLen, prefix);
    assert.equal(serviceIdLen + customerNo.length, 16, `serviceId ${serviceIdLen} + customerNo must total 16`);
    assert.ok(customerNo.startsWith(prefix), "customerNo must keep the configured prefix");
    assert.match(customerNo, /^[0-9]+$/, "customerNo must be digits only");
  }

  // Distinct across calls, or two orders would collide on one VA.
  const many = new Set(Array.from({ length: 200 }, () => newCustomerNo(5, "9")));
  assert.ok(many.size > 190, "customerNo must vary between calls");
}

console.log("doku snap signature: all checks passed");

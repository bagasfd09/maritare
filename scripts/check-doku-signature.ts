// Self-check for the DOKU signature construction. Run: pnpm check:doku
//
// The HMAC itself can't be asserted against the docs (DOKU never publishes the
// sample's Secret Key), so this pins the two things that actually break in
// practice: the component order / "\n" join with no trailing newline, and the
// digest+verify round trip.

import assert from "node:assert/strict";

import {
  buildStringToSign,
  digestOf,
  signatureFor,
  verifyDokuNotification,
} from "../src/lib/payment/doku.ts";

// 1. String-to-sign matches the published sample byte for byte.
// https://developers.doku.com/get-started-with-doku-api/signature-component/non-snap/signature-component-from-request-header
const DOC_SAMPLE =
  "Client-Id:MCH-0001-10791114622547\n" +
  "Request-Id:cc682442-6c22-493e-8121-b9ef6b3fa728\n" +
  "Request-Timestamp:2020-08-11T08:45:42Z\n" +
  "Request-Target:/doku-virtual-account/v2/payment-code\n" +
  "Digest:5WIYK2TJg6iiZ0d5v4IXSR0EkYEkYOezJIma3Ufli5s=";

const built = buildStringToSign({
  clientId: "MCH-0001-10791114622547",
  requestId: "cc682442-6c22-493e-8121-b9ef6b3fa728",
  timestamp: "2020-08-11T08:45:42Z",
  target: "/doku-virtual-account/v2/payment-code",
  digest: "5WIYK2TJg6iiZ0d5v4IXSR0EkYEkYOezJIma3Ufli5s=",
});
assert.equal(built, DOC_SAMPLE, "string-to-sign must match the DOKU doc sample verbatim");
assert.ok(!built.endsWith("\n"), "string-to-sign must not end with a newline");
assert.equal(built.split("\n").length, 5, "string-to-sign must have exactly 5 components");

// 2. Digest is base64(sha256(body)) — known-answer for the empty string.
assert.equal(digestOf(""), "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=");

// 3. Signature carries the required prefix and is body-dependent.
const secretKey = "SK-test-0000";
const components = {
  clientId: "MCH-0001-10791114622547",
  requestId: "cc682442-6c22-493e-8121-b9ef6b3fa728",
  timestamp: "2020-08-11T08:45:42Z",
  target: "/api/webhook/doku",
  secretKey,
};
const rawBody = JSON.stringify({
  order: { invoice_number: "MTR-20260725-ABC123", amount: 500000 },
  transaction: { status: "SUCCESS" },
});
const signature = signatureFor({ ...components, digest: digestOf(rawBody) });
assert.ok(signature.startsWith("HMACSHA256="), "signature must carry the HMACSHA256= prefix");
assert.notEqual(
  signature,
  signatureFor({ ...components, digest: digestOf(rawBody + " ") }),
  "signature must change when the body changes",
);

// 4. Notification verify round trip: accepts its own signature, rejects tampering.
process.env.DOKU_SECRET_KEY = secretKey;
process.env.DOKU_CLIENT_ID = components.clientId;
const inbound = {
  rawBody,
  clientId: components.clientId,
  requestId: components.requestId,
  timestamp: components.timestamp,
  signature,
};
assert.ok(verifyDokuNotification(inbound), "must accept a correctly signed notification");
assert.ok(
  !verifyDokuNotification({ ...inbound, rawBody: rawBody.replace("500000", "1") }),
  "must reject a tampered amount",
);
assert.ok(
  !verifyDokuNotification({ ...inbound, signature: "HMACSHA256=" }),
  "must reject a truncated signature without throwing",
);
assert.ok(!verifyDokuNotification({ ...inbound, signature: null }), "must reject a missing signature");
assert.ok(
  !verifyDokuNotification({ ...inbound, clientId: "MCH-9999-0000000000000" }),
  "must reject a foreign Client-Id",
);

console.log("doku signature: all checks passed");

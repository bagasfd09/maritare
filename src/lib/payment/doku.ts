// DOKU payment gateway client (non-SNAP API). SERVER-ONLY — reads
// DOKU_CLIENT_ID / DOKU_SECRET_KEY from the environment and must never be
// imported into a client bundle (per AGENTS.md: gateway secrets are server-side
// only, same rule as the Midtrans server key and the Fonnte token).
//
// Auth is a per-request HMAC-SHA256 signature over five ordered components,
// one per line, joined with "\n" and NO trailing newline:
//
//   Client-Id:<client id>
//   Request-Id:<uuid, unique per request>
//   Request-Timestamp:<ISO8601 UTC, seconds precision — no milliseconds>
//   Request-Target:<path only, e.g. /checkout/v1/payment>
//   Digest:<base64(sha256(raw json body))>
//
// The signature is `HMACSHA256=` + base64(hmac_sha256(secretKey, stringToSign)).
// The SAME construction verifies inbound HTTP notifications — there
// Request-Target is OUR notification path as registered in DOKU Back Office.
//
// Docs:
// https://developers.doku.com/get-started-with-doku-api/signature-component/non-snap/signature-component-from-request-header
// https://developers.doku.com/accept-payments/doku-checkout/integration-guide/backend-integration

import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const CHECKOUT_TARGET = "/checkout/v1/payment";

// The path DOKU calls back on. This is a signed component, so it must match the
// Notification URL registered in DOKU Back Office character-for-character —
// a trailing slash or a different path silently fails every signature check.
// Hardcoded rather than derived from the inbound request URL: a proxy rewrite
// would otherwise change what we verify against.
export const DOKU_NOTIFICATION_TARGET = "/api/webhook/doku";

// Checkout page lifetime in minutes (DOKU default is 60). A day gives guests
// time to complete a bank transfer / VA payment.
const PAYMENT_DUE_MINUTES = 1440;

export function dokuBaseUrl(): string {
  return process.env.DOKU_IS_PRODUCTION === "true"
    ? "https://api.doku.com"
    : "https://api-sandbox.doku.com";
}

/** ISO8601 UTC at seconds precision. `toISOString()` includes milliseconds, which DOKU rejects. */
function nowTimestamp(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

/**
 * base64(sha256(body)). DOKU digests the exact bytes on the wire, so the caller
 * must sign and send the identical string — never re-serialize in between.
 */
export function digestOf(rawBody: string): string {
  return createHash("sha256").update(rawBody, "utf8").digest("base64");
}

export type SignatureComponents = {
  clientId: string;
  requestId: string;
  timestamp: string;
  target: string;
  /** Already-computed digest (see `digestOf`). */
  digest: string;
};

/** The five signature components, one per line, no trailing newline. */
export function buildStringToSign(c: SignatureComponents): string {
  return [
    `Client-Id:${c.clientId}`,
    `Request-Id:${c.requestId}`,
    `Request-Timestamp:${c.timestamp}`,
    `Request-Target:${c.target}`,
    `Digest:${c.digest}`,
  ].join("\n");
}

/** Full `Signature` header value, including the `HMACSHA256=` prefix. */
export function signatureFor(c: SignatureComponents & { secretKey: string }): string {
  const mac = createHmac("sha256", c.secretKey).update(buildStringToSign(c), "utf8").digest("base64");
  return `HMACSHA256=${mac}`;
}

// ─────────────────────────────────────────────────────────────────
// Checkout — create a hosted payment page
// ─────────────────────────────────────────────────────────────────

export type DokuCheckoutInput = {
  /** Our `orders.invoiceNo`. DOKU echoes it back in the notification — it is the join key. */
  invoiceNumber: string;
  /** Final amount in integer rupiah, computed server-side. */
  amount: number;
  /** Where DOKU returns the customer after payment. */
  callbackUrl: string;
  /** Line label shown on the DOKU page, e.g. "Paket Platinum". */
  itemName: string;
  customer: { id: string; name: string; email: string };
  /**
   * Pin the hosted page to specific DOKU methods (e.g. ["EMONEY_DANA"]), so a
   * wallet chosen in OUR UI goes straight into that wallet's flow. Omitted =
   * the page offers every channel enabled on the account.
   */
  paymentMethodTypes?: string[];
};

export type DokuCheckoutResult =
  | { ok: true; url: string; tokenId: string }
  | { ok: false; error: string };

/**
 * Create a DOKU Checkout session and return the hosted payment URL.
 *
 * Without `paymentMethodTypes` the hosted page offers every channel enabled on
 * the DOKU account — new channels appear without a code change. With it, the
 * page is pinned to those methods (how our e-wallet buttons work).
 *
 * Never throws: returns a wrapped result so the calling Server Action can leave
 * the pending order row in place and surface a retryable message.
 */
export async function createDokuCheckout(input: DokuCheckoutInput): Promise<DokuCheckoutResult> {
  const clientId = process.env.DOKU_CLIENT_ID;
  const secretKey = process.env.DOKU_SECRET_KEY;
  if (!clientId || !secretKey) {
    console.error("createDokuCheckout: DOKU_CLIENT_ID / DOKU_SECRET_KEY not configured");
    return { ok: false, error: "Pembayaran belum dikonfigurasi. Hubungi admin." };
  }

  // Single line item priced at the final amount so it can never disagree with
  // `order.amount` after a promo discount.
  const rawBody = JSON.stringify({
    order: {
      amount: input.amount,
      invoice_number: input.invoiceNumber,
      currency: "IDR",
      callback_url: input.callbackUrl,
      language: "ID",
      auto_redirect: true,
      line_items: [{ name: input.itemName, quantity: 1, price: input.amount }],
    },
    payment: {
      payment_due_date: PAYMENT_DUE_MINUTES,
      ...(input.paymentMethodTypes?.length ? { payment_method_types: input.paymentMethodTypes } : {}),
    },
    customer: {
      id: input.customer.id,
      name: input.customer.name,
      email: input.customer.email,
    },
  });

  const requestId = randomUUID();
  const timestamp = nowTimestamp();
  const signature = signatureFor({
    clientId,
    requestId,
    timestamp,
    target: CHECKOUT_TARGET,
    digest: digestOf(rawBody),
    secretKey,
  });

  try {
    const res = await fetch(`${dokuBaseUrl()}${CHECKOUT_TARGET}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": clientId,
        "Request-Id": requestId,
        "Request-Timestamp": timestamp,
        Signature: signature,
      },
      body: rawBody,
    });

    const data: unknown = await res.json().catch(() => null);
    const url = pick(data, ["response", "payment", "url"]);
    const tokenId = pick(data, ["response", "payment", "token_id"]);

    if (!res.ok || typeof url !== "string" || !url) {
      // DOKU reports failures as { message: [...] }.
      const message = pick(data, ["message"]);
      console.error("createDokuCheckout failed", res.status, JSON.stringify(message ?? data));
      return { ok: false, error: "Gagal membuat halaman pembayaran. Coba lagi." };
    }
    return { ok: true, url, tokenId: typeof tokenId === "string" ? tokenId : "" };
  } catch (error) {
    console.error("createDokuCheckout request failed", error);
    return { ok: false, error: "Gagal menghubungi layanan pembayaran. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// HTTP notification — verify an inbound callback
// ─────────────────────────────────────────────────────────────────

/**
 * Recompute the signature over the raw notification body and compare it, in
 * constant time, to the `Signature` header. Returns false on any missing header
 * so an unsigned request can never be mistaken for a valid one.
 */
export function verifyDokuNotification(input: {
  rawBody: string;
  clientId: string | null;
  requestId: string | null;
  timestamp: string | null;
  signature: string | null;
}): boolean {
  const secretKey = process.env.DOKU_SECRET_KEY;
  if (!secretKey) {
    console.error("verifyDokuNotification: DOKU_SECRET_KEY not configured");
    return false;
  }
  const { rawBody, clientId, requestId, timestamp, signature } = input;
  if (!clientId || !requestId || !timestamp || !signature) {
    return false;
  }
  // Reject a notification signed with someone else's Client-Id outright.
  if (process.env.DOKU_CLIENT_ID && clientId !== process.env.DOKU_CLIENT_ID) {
    return false;
  }

  const expected = signatureFor({
    clientId,
    requestId,
    timestamp,
    target: DOKU_NOTIFICATION_TARGET,
    digest: digestOf(rawBody),
    secretKey,
  });

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  // timingSafeEqual throws on a length mismatch — check first.
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Walk a nested key path on an unknown JSON value without casting through `any`. */
function pick(source: unknown, path: string[]): unknown {
  let current = source;
  for (const key of path) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

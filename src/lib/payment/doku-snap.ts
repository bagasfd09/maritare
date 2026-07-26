// DOKU SNAP client — Bank Indonesia's national payment API standard.
// SERVER-ONLY: reads the client id, secret key and RSA private key from the
// environment and must never reach a client bundle.
//
// This is a SEPARATE auth stack from DOKU Checkout (src/lib/payment/doku.ts,
// non-SNAP HMAC-SHA256). The two coexist on purpose: Checkout / cards /
// paylater stay on non-SNAP, while Virtual Account + QRIS are SNAP-only.
//
// Outbound auth is two steps:
//   1. B2B access token — POST /authorization/v1/access-token/b2b, signed
//      asymmetrically: base64(SHA256withRSA(privateKey, `${clientId}|${ts}`)).
//      Tokens live 900s, so one is cached in module scope and refreshed early.
//   2. Every transactional call — signed symmetrically:
//      base64(HMAC-SHA512(secretKey,
//        `${method}:${path}:${accessToken}:${sha256HexLower(body)}:${ts}`))
//
// Docs:
// https://developers.doku.com/accept-payments/direct-api/snap/integration-guide/get-token-api/b2b
// https://developers.doku.com/get-started-with-doku-api/signature-component/snap/symmetric-signature

import { createHash, createHmac, createSign, randomUUID, timingSafeEqual } from "node:crypto";

const TOKEN_PATH = "/authorization/v1/access-token/b2b";

/** Refresh this many ms before the 900s expiry so an in-flight call can't race it. */
const TOKEN_SKEW_MS = 60_000;

export function snapBaseUrl(): string {
  return process.env.DOKU_IS_PRODUCTION === "true"
    ? "https://api.doku.com"
    : "https://api-sandbox.doku.com";
}

/**
 * SNAP timestamps are ISO-8601 with an explicit offset (`yyyy-MM-ddTHH:mm:ss+07:00`),
 * not a `Z` suffix, and carry no milliseconds. Rendered in Asia/Jakarta because
 * that is the form DOKU's samples use. The identical string goes into both the
 * header and the stringToSign, so the two can never drift.
 */
export function snapTimestamp(now: Date = new Date()): string {
  const jakarta = new Date(now.getTime() + 7 * 3_600_000);
  return jakarta.toISOString().replace(/\.\d{3}Z$/, "+07:00");
}

/** lowercase(hex(sha256(body))) — the body-hash component of the stringToSign. */
export function sha256HexLower(rawBody: string): string {
  return createHash("sha256").update(rawBody, "utf8").digest("hex").toLowerCase();
}

/**
 * The symmetric stringToSign. `path` must be the request path only (no host, no
 * query unless it was actually sent) and `rawBody` the exact bytes transmitted —
 * re-serializing between signing and sending invalidates the signature.
 */
export function buildSnapStringToSign(input: {
  method: string;
  path: string;
  accessToken: string;
  rawBody: string;
  timestamp: string;
}): string {
  return [
    input.method.toUpperCase(),
    input.path,
    input.accessToken,
    sha256HexLower(input.rawBody),
    input.timestamp,
  ].join(":");
}

/** base64(HMAC-SHA512(secretKey, stringToSign)) — the X-SIGNATURE value. */
export function snapSymmetricSignature(stringToSign: string, secretKey: string): string {
  return createHmac("sha512", secretKey).update(stringToSign, "utf8").digest("base64");
}

/**
 * base64(SHA256withRSA(privateKey, `${clientId}|${timestamp}`)) — only used to
 * obtain the B2B token. Env vars can't hold real newlines, so an escaped `\n`
 * PEM is normalised here.
 */
export function snapAsymmetricSignature(input: {
  clientId: string;
  timestamp: string;
  privateKey: string;
}): string {
  const pem = input.privateKey.includes("\\n")
    ? input.privateKey.replace(/\\n/g, "\n")
    : input.privateKey;
  return createSign("RSA-SHA256")
    .update(`${input.clientId}|${input.timestamp}`, "utf8")
    .sign(pem, "base64");
}

// ─────────────────────────────────────────────────────────────────
// B2B access token
// ─────────────────────────────────────────────────────────────────

let cachedToken: { token: string; expiresAtMs: number } | null = null;

/** Drop the cached token. Used by tests and after a 401 from DOKU. */
export function resetSnapToken(): void {
  cachedToken = null;
}

export type SnapTokenResult = { ok: true; token: string } | { ok: false; error: string };

/**
 * Fetch (or reuse) a B2B access token. Cached in module scope: a token is valid
 * for 900s and a new one is only requested inside the skew window, so a burst of
 * payments shares one token instead of hammering the auth endpoint.
 */
export async function getSnapToken(): Promise<SnapTokenResult> {
  if (cachedToken && cachedToken.expiresAtMs - TOKEN_SKEW_MS > Date.now()) {
    return { ok: true, token: cachedToken.token };
  }

  const clientId = process.env.DOKU_CLIENT_ID;
  const privateKey = process.env.DOKU_PRIVATE_KEY;
  if (!clientId || !privateKey) {
    console.error("getSnapToken: DOKU_CLIENT_ID / DOKU_PRIVATE_KEY not configured");
    return { ok: false, error: "Pembayaran belum dikonfigurasi. Hubungi admin." };
  }

  const timestamp = snapTimestamp();
  const rawBody = JSON.stringify({ grantType: "client_credentials" });

  try {
    const res = await fetch(`${snapBaseUrl()}${TOKEN_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CLIENT-KEY": clientId,
        "X-TIMESTAMP": timestamp,
        "X-SIGNATURE": snapAsymmetricSignature({ clientId, timestamp, privateKey }),
      },
      body: rawBody,
    });
    const data: unknown = await res.json().catch(() => null);
    const token = readPath(data, ["accessToken"]);
    if (!res.ok || typeof token !== "string" || !token) {
      console.error("getSnapToken failed", res.status, JSON.stringify(data));
      return { ok: false, error: "Gagal terhubung ke layanan pembayaran. Coba lagi." };
    }

    // expiresIn is documented as 900 (seconds) but arrives as a string in places.
    const expiresIn = Number(readPath(data, ["expiresIn"]));
    const lifetimeMs = (Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 900) * 1000;
    cachedToken = { token, expiresAtMs: Date.now() + lifetimeMs };
    return { ok: true, token };
  } catch (error) {
    console.error("getSnapToken request failed", error);
    return { ok: false, error: "Gagal menghubungi layanan pembayaran. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// Signed transactional request
// ─────────────────────────────────────────────────────────────────

export type SnapCallResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string };

/**
 * POST a signed SNAP request. Retries once on 401 with a fresh token, since a
 * cached token can expire between the check and the call.
 */
export async function snapPost(
  path: string,
  body: Record<string, unknown>,
  options: { externalId?: string } = {},
): Promise<SnapCallResult> {
  const secretKey = process.env.DOKU_SECRET_KEY;
  // `||`, not `??`: an env var present but blank (DOKU_PARTNER_ID=) is "unset"
  // as far as a human is concerned, and `??` would pass the empty string through.
  const partnerId = process.env.DOKU_PARTNER_ID || process.env.DOKU_CLIENT_ID;
  if (!secretKey || !partnerId) {
    console.error("snapPost: DOKU_SECRET_KEY / DOKU_PARTNER_ID not configured");
    return { ok: false, error: "Pembayaran belum dikonfigurasi. Hubungi admin." };
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    const tokenResult = await getSnapToken();
    if (!tokenResult.ok) {
      return { ok: false, error: tokenResult.error };
    }

    // Sign and send the SAME string — never re-stringify in between.
    const rawBody = JSON.stringify(body);
    const timestamp = snapTimestamp();
    const signature = snapSymmetricSignature(
      buildSnapStringToSign({
        method: "POST",
        path,
        accessToken: tokenResult.token,
        rawBody,
        timestamp,
      }),
      secretKey,
    );

    try {
      const res = await fetch(`${snapBaseUrl()}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenResult.token}`,
          "X-PARTNER-ID": partnerId,
          "X-EXTERNAL-ID": options.externalId ?? randomUUID().replace(/-/g, "").slice(0, 32),
          "X-TIMESTAMP": timestamp,
          "X-SIGNATURE": signature,
          "CHANNEL-ID": "H2H",
        },
        body: rawBody,
      });
      const data: unknown = await res.json().catch(() => null);

      if (res.status === 401 && attempt === 0) {
        resetSnapToken(); // token died mid-flight — one clean retry
        continue;
      }
      if (!res.ok || !data || typeof data !== "object") {
        console.error(`snapPost ${path} failed`, res.status, JSON.stringify(data));
        return { ok: false, error: snapErrorMessage(data) };
      }

      // SNAP encodes success as responseCode "2xxxxxx"; a 200 with 4xxxxxx is
      // still a rejection, so the body is authoritative, not the HTTP status.
      const responseCode = String(readPath(data, ["responseCode"]) ?? "");
      if (responseCode && !responseCode.startsWith("2")) {
        console.error(`snapPost ${path} rejected`, responseCode, JSON.stringify(data));
        return { ok: false, error: snapErrorMessage(data) };
      }
      return { ok: true, data: data as Record<string, unknown> };
    } catch (error) {
      console.error(`snapPost ${path} request failed`, error);
      return { ok: false, error: "Gagal menghubungi layanan pembayaran. Coba lagi." };
    }
  }
  return { ok: false, error: "Gagal menghubungi layanan pembayaran. Coba lagi." };
}

function snapErrorMessage(data: unknown): string {
  const message = readPath(data, ["responseMessage"]);
  return typeof message === "string" && message ? message : "Gagal membuat pembayaran. Coba lagi.";
}

// ─────────────────────────────────────────────────────────────────
// Inbound notification verification
// ─────────────────────────────────────────────────────────────────

/**
 * Verify an inbound SNAP notification's X-SIGNATURE (symmetric HMAC-SHA512 with
 * our secret key).
 *
 * ponytail: DOKU's docs specify the stringToSign but NOT which access token goes
 * in the token slot for an inbound call — the merchant never issued DOKU one.
 * Rather than guess, both documented readings are tried (the bearer token DOKU
 * presented, and an empty slot) and the one that matched is logged. Either way
 * the HMAC still requires our secret key, so accepting both costs no security.
 * Once the sandbox shows which form DOKU actually sends, pin it and delete the
 * other branch.
 */
export function verifySnapNotification(input: {
  method: string;
  path: string;
  rawBody: string;
  timestamp: string | null;
  signature: string | null;
  authorization: string | null;
}): boolean {
  const secretKey = process.env.DOKU_SECRET_KEY;
  if (!secretKey) {
    console.error("verifySnapNotification: DOKU_SECRET_KEY not configured");
    return false;
  }
  const { timestamp, signature } = input;
  if (!timestamp || !signature) {
    return false;
  }

  const bearer = input.authorization?.replace(/^Bearer\s+/i, "") ?? "";
  // Deduped: with no Authorization header both readings collapse to the empty
  // slot, and reporting that as "bearer-token" would defeat the point of logging
  // which variant DOKU actually uses.
  const candidates: Array<[string, string]> = bearer
    ? [
        ["bearer-token", bearer],
        ["empty-token", ""],
      ]
    : [["no-authorization-header", ""]];

  for (const [label, accessToken] of candidates) {
    const expected = snapSymmetricSignature(
      buildSnapStringToSign({
        method: input.method,
        path: input.path,
        accessToken,
        rawBody: input.rawBody,
        timestamp,
      }),
      secretKey,
    );
    if (safeEqual(expected, signature)) {
      console.info(`verifySnapNotification: matched using ${label}`);
      return true;
    }
  }
  return false;
}

/** Constant-time compare that tolerates a length mismatch (timingSafeEqual throws). */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/** Walk a nested key path on an unknown JSON value without casting through `any`. */
export function readPath(source: unknown, path: string[]): unknown {
  let current = source;
  for (const key of path) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

// Virtual Account + QRIS payment instruments via DOKU SNAP. SERVER-ONLY.
//
// These are the two channels we render entirely in our own UI: a VA number the
// customer copies into their banking app, or a QR they scan. Everything else
// (cards, paylater) stays on the non-SNAP Checkout page.
//
// Docs:
// https://developers.doku.com/accept-payments/direct-api/snap/integration-guide/virtual-account/bca-virtual-account
// https://developers.doku.com/accept-payments/direct-api/snap/integration-guide/qris

import { randomInt, randomUUID } from "node:crypto";

// Relative sibling imports (not the `@/` alias) so scripts/ can load this module
// under Node's TS type-stripping, which doesn't resolve path aliases at runtime —
// the same constraint documented on the type-only imports in lib/db/schema.ts.
import {
  vaChannelMeta,
  type PaymentInstrument,
  type VaChannel,
} from "./channels.ts";
import { digestOf, dokuBaseUrl, signatureFor } from "./doku.ts";
import { readPath, snapPost, snapTimestamp } from "./doku-snap.ts";

const CREATE_VA_PATH = "/virtual-accounts/bi-snap-va/v1.1/transfer-va/create-va";
const QRIS_GENERATE_PATH = "/snap-adapter/b2b/v1.0/qr/qr-mpm-generate";

/** How long a payment instrument stays valid. Matches the Checkout page window. */
export const PAYMENT_WINDOW_MINUTES = 1440;

export type InstrumentResult =
  | { ok: true; instrument: PaymentInstrument }
  | { ok: false; error: string };

/** SNAP money is a string with exactly two decimals: 500000 -> "500000.00". */
function snapAmount(rupiah: number): string {
  return `${rupiah}.00`;
}

/**
 * The per-bank VA config DOKU assigns, read from Back Office → Payment
 * Configuration → Virtual Account. Two values matter there:
 *
 *   Partner Service ID  -> `serviceId`, sent as partnerServiceId
 *   Prefix Customer No  -> `customerPrefix`, the digit(s) customerNo MUST start with
 *
 * The "Merchant BIN" column is just those two concatenated (19008 + 9 = 190089)
 * and is not sent anywhere — it is the prefix the customer sees on the VA.
 *
 * Configured as `"<serviceId>:<customerPrefix>"`, e.g. `"19008:9"`. The prefix is
 * optional (`"19008"`) for banks that don't use one.
 */
function vaConfig(channel: VaChannel): { serviceId: string; customerPrefix: string } | null {
  const raw = process.env.DOKU_VA_PARTNER_SERVICE_IDS;
  let value: string | undefined;
  if (raw) {
    try {
      value = (JSON.parse(raw) as Record<string, string>)[channel];
    } catch {
      console.error("DOKU_VA_PARTNER_SERVICE_IDS is not valid JSON");
    }
  }
  value ||= process.env.DOKU_VA_PARTNER_SERVICE_ID;
  if (!value) {
    return null;
  }
  const [serviceId, customerPrefix = ""] = value.split(":");
  return serviceId ? { serviceId, customerPrefix } : null;
}

/**
 * A DOKU-generated (DGPC) virtual account number is 16 digits for every bank:
 * the BIN (partnerServiceId) followed by a code that fills the remainder. The
 * BIN length differs per bank — BCA 6, Mandiri 8, BNI 9, Permata/CIMB 5 — so
 * the code length is derived from whatever prefix DOKU assigned rather than
 * hardcoded per bank.
 * https://developers.doku.com/accept-payments/direct-api/snap/integration-guide/virtual-account
 */
const VA_TOTAL_DIGITS = 16;

/**
 * Numeric customer number, unique per VA and sized so BIN + customerNo lands on
 * exactly 16 digits. It cannot be our invoice number — that is alphanumeric and
 * this field is digits only — so the notification is joined back on
 * `virtualAccountNo` (and `trxId` as a fallback) instead.
 *
 * Uniqueness only has to hold among *live* VAs (expired ones free up), so plain
 * random digits are enough; a collision is rejected by DOKU, not silently paid.
 */
export function newCustomerNo(serviceIdLength: number, customerPrefix = ""): string {
  const digits = VA_TOTAL_DIGITS - serviceIdLength;
  // The prefix is fixed by DOKU ("Prefix Customer No" in Back Office); only the
  // remainder is ours to randomise. Omitting it is what DOKU rejects as an
  // invalid partnerServiceId/customerNo/virtualAccountNo combination.
  let out = customerPrefix;
  while (out.length < digits) {
    out += String(randomInt(0, 10));
  }
  return out.slice(0, digits);
}

// ─────────────────────────────────────────────────────────────────
// Virtual Account via the non-SNAP v2 API — the LIVE path.
//
// Live probing (2026-07-26) showed this merchant account is provisioned for the
// v2 "payment code" API, NOT SNAP VA: every SNAP create-va answers 4032715
// "Transaction Not Permitted" regardless of shape, while v2 issues VAs for
// BCA / Mandiri / BRI / Permata / CIMB / BSI on the first try. Same in-app UX
// either way — we get the VA number back as JSON and render it ourselves.
// ─────────────────────────────────────────────────────────────────

/**
 * Per-bank v2 endpoints, every one verified live against sandbox with
 * scripts/doku-probe-va.ts. A bank missing here has no v2 endpoint (404 "No
 * static resource") and cannot be issued in-app: BTN, Bank Neo Commerce, Bank
 * Sahabat Sampoerna, BJB, Sinarmas. They are hidden from the catalog too.
 */
const VA_V2_PATHS: Partial<Record<VaChannel, string>> = {
  VIRTUAL_ACCOUNT_BCA: "/bca-virtual-account/v2/payment-code",
  VIRTUAL_ACCOUNT_BANK_MANDIRI: "/mandiri-virtual-account/v2/payment-code",
  VIRTUAL_ACCOUNT_BRI: "/bri-virtual-account/v2/payment-code",
  VIRTUAL_ACCOUNT_BANK_PERMATA: "/permata-virtual-account/v2/payment-code",
  VIRTUAL_ACCOUNT_BANK_CIMB: "/cimb-virtual-account/v2/payment-code",
  VIRTUAL_ACCOUNT_BANK_SYARIAH_MANDIRI: "/bsm-virtual-account/v2/payment-code",
  VIRTUAL_ACCOUNT_BNI: "/bni-virtual-account/v2/payment-code",
  VIRTUAL_ACCOUNT_BANK_DANAMON: "/danamon-virtual-account/v2/payment-code",
  VIRTUAL_ACCOUNT_MAYBANK: "/maybank-virtual-account/v2/payment-code",
  VIRTUAL_ACCOUNT_DOKU: "/doku-virtual-account/v2/payment-code",
};

/**
 * `virtual_account_info` for one bank. Most take the same body; two don't, and
 * both quirks were pinned by live probe (2026-07-26) — DOKU's docs describe
 * neither:
 *
 * - BNI rejects a body without `merchant_unique_reference`, and rejects one of
 *   13+ digits ("should less than 13 digits").
 * - Danamon answers 400 "Invalid Billing Type Value" for EVERY documented
 *   billing_type; it only succeeds when the field is omitted entirely. The
 *   resulting VA may therefore be open-amount — harmless for money, because the
 *   webhook refuses to settle an order whose notified amount doesn't match ours
 *   (see api/webhook/doku/route.ts), but an underpayment would leave the order
 *   pending rather than paid.
 */
function vaInfoFor(channel: VaChannel): Record<string, unknown> {
  const base = {
    billing_type: "FIX_BILL", // closed amount: pays exactly order.amount
    expired_time: PAYMENT_WINDOW_MINUTES,
    reusable_status: false,
  };
  if (channel === "VIRTUAL_ACCOUNT_BNI") {
    // 12 digits: under BNI's limit, and random so a retry can't collide.
    return { ...base, merchant_unique_reference: String(randomInt(1e11, 1e12)) };
  }
  if (channel === "VIRTUAL_ACCOUNT_BANK_DANAMON") {
    const { billing_type: _unsupported, ...rest } = base;
    return rest;
  }
  return base;
}

/**
 * Create a Virtual Account through the non-SNAP v2 API. DOKU generates the VA
 * number (DGPC); the settlement notification arrives on the SAME non-SNAP
 * webhook as Checkout (/api/webhook/doku), joined back on invoice_number.
 */
export async function createVirtualAccountV2(input: {
  channel: VaChannel;
  invoiceNo: string;
  amount: number;
  customerName: string;
  customerEmail: string;
}): Promise<InstrumentResult> {
  const clientId = process.env.DOKU_CLIENT_ID;
  const secretKey = process.env.DOKU_SECRET_KEY;
  if (!clientId || !secretKey) {
    console.error("createVirtualAccountV2: DOKU_CLIENT_ID / DOKU_SECRET_KEY not configured");
    return { ok: false, error: "Pembayaran belum dikonfigurasi. Hubungi admin." };
  }

  const target = VA_V2_PATHS[input.channel];
  if (!target) {
    console.error(`createVirtualAccountV2: no v2 endpoint for ${input.channel}`);
    return { ok: false, error: "Metode pembayaran ini belum aktif. Pilih metode lain ya." };
  }

  const rawBody = JSON.stringify({
    order: { invoice_number: input.invoiceNo, amount: input.amount },
    virtual_account_info: vaInfoFor(input.channel),
    customer: { name: input.customerName.slice(0, 255), email: input.customerEmail },
  });

  const requestId = randomUUID();
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const signature = signatureFor({
    clientId,
    requestId,
    timestamp,
    target,
    digest: digestOf(rawBody),
    secretKey,
  });

  try {
    const res = await fetch(`${dokuBaseUrl()}${target}`, {
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

    const virtualAccountNo = readPath(data, ["virtual_account_info", "virtual_account_number"]);
    if (!res.ok || typeof virtualAccountNo !== "string" || !virtualAccountNo) {
      const message = readPath(data, ["error", "message"]);
      console.error(`createVirtualAccountV2 ${input.channel} failed`, res.status, JSON.stringify(data));
      return {
        ok: false,
        error:
          typeof message === "string" && message ? message : "Gagal membuat nomor Virtual Account. Coba lagi.",
      };
    }

    // v2 echoes the expiry as ISO UTC; fall back to our own window if absent.
    const expiredUtc = readPath(data, ["virtual_account_info", "expired_date_utc"]);
    const expiresAt =
      typeof expiredUtc === "string" && expiredUtc
        ? expiredUtc
        : new Date(Date.now() + PAYMENT_WINDOW_MINUTES * 60_000).toISOString().replace(/\.\d{3}Z$/, "Z");

    return {
      ok: true,
      instrument: {
        kind: "va",
        channel: input.channel,
        bank: vaChannelMeta(input.channel).bank,
        virtualAccountNo: virtualAccountNo.trim(),
        expiresAt,
      },
    };
  } catch (error) {
    console.error(`createVirtualAccountV2 ${input.channel} request failed`, error);
    return { ok: false, error: "Gagal menghubungi layanan pembayaran. Coba lagi." };
  }
}

/**
 * Create a bank-specific Virtual Account via SNAP.
 *
 * ponytail: DORMANT — this account isn't provisioned for SNAP VA (every call
 * answers 4032715), so the live path is createVirtualAccountV2 above. Kept
 * because the crypto is done and self-checked; when DOKU activates SNAP VA,
 * point createPaymentInstrument back here and delete the v2 path.
 */
export async function createVirtualAccount(input: {
  channel: VaChannel;
  invoiceNo: string;
  amount: number;
  customerName: string;
}): Promise<InstrumentResult> {
  const config = vaConfig(input.channel);
  if (!config) {
    console.error(`createVirtualAccount: no partnerServiceId configured for ${input.channel}`);
    return { ok: false, error: "Metode pembayaran ini belum aktif. Pilih metode lain ya." };
  }

  // The field is 8 chars wide (space-padded) but the id itself is shorter, and
  // its length decides how many digits customerNo gets.
  const serviceIdLength = config.serviceId.length;
  if (serviceIdLength < 1 || serviceIdLength + config.customerPrefix.length >= VA_TOTAL_DIGITS) {
    console.error(
      `createVirtualAccount: ${input.channel} serviceId(${serviceIdLength}) + prefix(${config.customerPrefix.length}) must be under ${VA_TOTAL_DIGITS}`,
    );
    return { ok: false, error: "Konfigurasi Virtual Account belum benar. Hubungi admin." };
  }

  const expiredDate = snapTimestamp(new Date(Date.now() + PAYMENT_WINDOW_MINUTES * 60_000));
  const customerNo = newCustomerNo(serviceIdLength, config.customerPrefix);

  // ponytail: DOKU's docs contradict themselves on whether a DGPC create-va
  // should carry a merchant-chosen customerNo, and a wrong choice returns the
  // same opaque 4032715 either way. This flag flips between the two readings so
  // the answer can be settled by experiment instead of another doc round-trip.
  // Delete the losing branch once DOKU confirms which one is right.
  const letDokuAssign = process.env.DOKU_VA_DGPC_AUTO === "true";

  // The three fields DOKU validates as a COMBINATION: virtualAccountNo must be
  // the padded partnerServiceId + customerNo, leading spaces included — DOKU's
  // sample sends "    1899" + "20240704001" as "    189920240704001". Omitting
  // virtualAccountNo (or trimming the spaces) is rejected with 4032715.
  const paddedServiceId = config.serviceId.padStart(8, " ");

  const result = await snapPost(CREATE_VA_PATH, {
    partnerServiceId: paddedServiceId,
    ...(letDokuAssign ? {} : { customerNo, virtualAccountNo: paddedServiceId + customerNo }),
    // Shown in the customer's banking app, so it must stay human-readable.
    virtualAccountName: input.customerName.slice(0, 255),
    trxId: input.invoiceNo,
    totalAmount: { value: snapAmount(input.amount), currency: "IDR" },
    virtualAccountTrxType: "C", // closed: fixed amount, single use
    expiredDate,
    additionalInfo: { channel: input.channel },
  });
  if (!result.ok) {
    // DOKU rejects on the SHAPE of these three, so log what we actually sent —
    // the response alone ("Combination of partnerServiceId, customerNo and
    // virtualAccountNo") does not say which one is wrong.
    console.error(
      `createVirtualAccount ${input.channel}: partnerServiceId="${config.serviceId}", ` +
        (letDokuAssign
          ? "customerNo OMITTED (DOKU_VA_DGPC_AUTO=true — letting DOKU assign it)"
          : `customerNo="${customerNo}" (prefix "${config.customerPrefix}"), ` +
            `implied VA ${config.serviceId}${customerNo} = ${serviceIdLength + customerNo.length} digits`) +
        `. If this keeps failing, flip DOKU_VA_DGPC_AUTO and retry — the two readings of DGPC ` +
        `produce the same error code, so only a live call tells them apart.`,
    );
    return result;
  }

  const virtualAccountNo = readPath(result.data, ["virtualAccountData", "virtualAccountNo"]);
  if (typeof virtualAccountNo !== "string" || !virtualAccountNo) {
    console.error("createVirtualAccount: no virtualAccountNo in response", JSON.stringify(result.data));
    return { ok: false, error: "Gagal membuat nomor Virtual Account. Coba lagi." };
  }

  return {
    ok: true,
    instrument: {
      kind: "va",
      channel: input.channel,
      bank: vaChannelMeta(input.channel).bank,
      virtualAccountNo: virtualAccountNo.trim(),
      expiresAt: expiredDate,
    },
  };
}

/** Generate a dynamic QRIS code for one order. */
export async function createQris(input: {
  invoiceNo: string;
  amount: number;
}): Promise<InstrumentResult> {
  const merchantId = process.env.DOKU_QRIS_MERCHANT_ID;
  const terminalId = process.env.DOKU_QRIS_TERMINAL_ID;
  if (!merchantId || !terminalId) {
    console.error("createQris: DOKU_QRIS_MERCHANT_ID / DOKU_QRIS_TERMINAL_ID not configured");
    return { ok: false, error: "QRIS belum aktif. Pilih metode lain ya." };
  }

  const validityPeriod = snapTimestamp(new Date(Date.now() + PAYMENT_WINDOW_MINUTES * 60_000));
  const result = await snapPost(
    QRIS_GENERATE_PATH,
    {
      partnerReferenceNo: input.invoiceNo,
      amount: { value: snapAmount(input.amount), currency: "IDR" },
      merchantId,
      terminalId,
      validityPeriod,
      additionalInfo: { feeType: 1 }, // 1 = no tips
    },
    { externalId: input.invoiceNo.replace(/[^a-zA-Z0-9]/g, "").slice(0, 32) },
  );
  if (!result.ok) {
    return result;
  }

  const qrContent = readPath(result.data, ["qrContent"]);
  if (typeof qrContent !== "string" || !qrContent) {
    console.error("createQris: no qrContent in response", JSON.stringify(result.data));
    return { ok: false, error: "Gagal membuat QRIS. Coba lagi." };
  }

  return {
    ok: true,
    instrument: { kind: "qris", channel: "QRIS", qrContent, expiresAt: validityPeriod },
  };
}

/**
 * Dispatch to the right channel. The only entry point callers should need.
 * "CHECKOUT" and e-wallets never reach here — those ride the hosted page.
 */
export async function createPaymentInstrument(input: {
  channel: VaChannel | "QRIS";
  invoiceNo: string;
  amount: number;
  customerName: string;
  customerEmail: string;
}): Promise<InstrumentResult> {
  if (input.channel === "QRIS") {
    return createQris({ invoiceNo: input.invoiceNo, amount: input.amount });
  }
  // VA goes through the non-SNAP v2 API — the only VA API this account is
  // provisioned for (see createVirtualAccountV2). SNAP stays for QRIS.
  return createVirtualAccountV2({
    channel: input.channel,
    invoiceNo: input.invoiceNo,
    amount: input.amount,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
  });
}

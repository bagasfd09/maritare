"use server";

// Customer checkout — creates a pending order and hands back a DOKU Checkout URL.
//
// Hard rules (AGENTS.md): the charged amount is ALWAYS derived server-side from
// the `packages` table — the client only names a package slug, never a price.
// Discounts come only from the admin-managed `promos` table. Ownership is
// derived from the session, never from a client-supplied wedding/user id.
// Gateway secrets stay inside the DOKU client (server-only). User-facing copy is
// Bahasa; logs are English.
//
// The order row is written BEFORE the gateway call so an inbound notification
// can always resolve its invoice number. Settling it is the webhook's job
// (src/app/api/webhook/doku/route.ts) — never this action.

import { randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { orders, packages, promos, users, weddings } from "@/lib/db/schema";
import {
  EWALLET_CHANNELS,
  VA_CHANNELS,
  isEwalletChannel,
  type EwalletChannel,
  type VaChannel,
} from "@/lib/payment/channels";
import { createDokuCheckout } from "@/lib/payment/doku";
import { createPaymentInstrument } from "@/lib/payment/doku-channels";
import { logAudit } from "@/server/audit";
import { applyPaidEntitlements } from "@/server/entitlements";
import { resolveMemberWeddingId } from "@/server/queries/wedding";

/** `redirect` is our own payment page for VA/QRIS, or DOKU's hosted page for cards. */
export type StartCheckoutResult = { ok: true; redirect: string } | { ok: false; error: string };

// The client names a channel, never a price. "CHECKOUT" is the escape hatch to
// DOKU's hosted page for anything we don't render ourselves (cards, paylater).
// E-wallets ride the hosted page too, pinned to the one chosen wallet.
const channelSchema = z.union([
  z.enum(VA_CHANNELS.map((c) => c.id) as [VaChannel, ...VaChannel[]]),
  z.enum(EWALLET_CHANNELS.map((c) => c.id) as [EwalletChannel, ...EwalletChannel[]]),
  z.literal("QRIS"),
  z.literal("CHECKOUT"),
]);

const startCheckoutSchema = z.object({
  packageSlug: z.string().trim().min(1).max(64),
  promoCode: z.string().trim().max(64).optional(),
  channel: channelSchema,
});

export type StartCheckoutInput = z.input<typeof startCheckoutSchema>;

/** Unambiguous when read aloud over the phone: no vowels, no 0/O or 1/I clashes. */
const INVOICE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function newInvoiceNo(): string {
  const now = new Date();
  const ymd =
    `${now.getFullYear()}` +
    `${String(now.getMonth() + 1).padStart(2, "0")}` +
    `${String(now.getDate()).padStart(2, "0")}`;
  // 32 divides 256, so the modulo is unbiased.
  const suffix = Array.from(randomBytes(6), (b) => INVOICE_ALPHABET[b % 32]).join("");
  return `MTR-${ymd}-${suffix}`;
}

type ResolvedPromo = { id: string; code: string; label: string; discount: number };

/**
 * Validate a coupon against the promos table and return its rupiah discount.
 * Mirrors the effective-status rules used on the admin screen: a promo is
 * redeemable only while it is active, not soft-deleted, inside its window, and
 * under quota — plus the targeting rules: restricted to one package and/or to
 * specific customers (checked against the wedding CREATOR, who owns billing).
 * `used` is NOT incremented here — that happens when the order is actually
 * paid, so abandoned checkouts don't burn quota.
 */
async function resolvePromo(
  code: string,
  context: { price: number; packageId: string; creatorId: string },
): Promise<{ ok: true; promo: ResolvedPromo } | { ok: false; error: string }> {
  const { price, packageId, creatorId } = context;
  const row = await db.query.promos.findFirst({
    columns: {
      id: true,
      code: true,
      discountType: true,
      discountValue: true,
      quota: true,
      used: true,
      validUntil: true,
      active: true,
      packageId: true,
      allowedUserIds: true,
      scope: true,
    },
    where: and(eq(promos.code, code), isNull(promos.deletedAt)),
  });

  const invalid = { ok: false, error: "Kode promo tidak valid atau sudah berakhir." } as const;
  if (!row || !row.active) return invalid;
  if (row.validUntil && row.validUntil.getTime() <= Date.now()) return invalid;
  if (row.quota !== null && row.used >= row.quota) {
    return { ok: false, error: "Kuota kode promo ini sudah habis." };
  }
  // Targeted at specific customers: a code in the wrong hands reads as plain
  // invalid — no hint that it exists for someone else.
  if (row.allowedUserIds && row.allowedUserIds.length > 0 && !row.allowedUserIds.includes(creatorId)) {
    return invalid;
  }
  if (row.packageId && row.packageId !== packageId) {
    return {
      ok: false,
      error: row.scope
        ? `Kode promo ini khusus ${row.scope}.`
        : "Kode promo ini tidak berlaku untuk paket ini.",
    };
  }

  const percent = row.discountType === "percent";
  const discount = percent ? Math.round((price * row.discountValue) / 100) : row.discountValue;
  const label = percent
    ? `Diskon ${row.discountValue}%`
    : `Diskon ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(row.discountValue)}`;

  return {
    ok: true,
    promo: { id: row.id, code: row.code, label, discount: Math.max(0, discount) },
  };
}

/**
 * Poll one order's status from the payment page. Scoped to the caller's wedding
 * so an invoice number alone reveals nothing. Read-only: settlement is the
 * webhook's job, never this.
 */
export async function getOrderStatus(
  invoiceNo: string,
): Promise<"pending" | "paid" | "failed" | "refunded" | null> {
  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) {
    return null;
  }
  const order = await db.query.orders.findFirst({
    columns: { status: true },
    where: and(eq(orders.invoiceNo, invoiceNo), eq(orders.weddingId, weddingId)),
  });
  return order?.status ?? null;
}

export type CheckPromoResult =
  | { ok: true; code: string; label: string; discount: number }
  | { ok: false; error: string };

const checkPromoSchema = z.object({
  packageSlug: z.string().trim().min(1).max(64),
  code: z.string().trim().min(1).max(64),
});

/**
 * Validate a coupon for one package so the checkout summary can show the real
 * discount before paying. Read-only — redemption is still counted only when the
 * order settles. startCheckout re-validates independently; this never sets price.
 */
export async function checkPromo(input: z.input<typeof checkPromoSchema>): Promise<CheckPromoResult> {
  const parsed = checkPromoSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Kode promo tidak valid." };
  }
  // Gate on membership: the promo catalog isn't public.
  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  // Billing (and therefore promo targeting) is anchored to the wedding creator.
  const [wedding] = await db
    .select({ creatorId: weddings.userId })
    .from(weddings)
    .where(and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)))
    .limit(1);
  if (!wedding) {
    return { ok: false, error: "Undangan tidak ditemukan." };
  }

  const pkg = await db.query.packages.findFirst({
    columns: { id: true, price: true },
    where: and(eq(packages.slug, parsed.data.packageSlug), eq(packages.active, true)),
  });
  if (!pkg) {
    return { ok: false, error: "Paket tidak ditemukan." };
  }

  const result = await resolvePromo(parsed.data.code.toUpperCase(), {
    price: pkg.price,
    packageId: pkg.id,
    creatorId: wedding.creatorId,
  });
  if (!result.ok) {
    return result;
  }
  const { code, label, discount } = result.promo;
  return { ok: true, code, label, discount };
}

/**
 * Start a payment for one package. Returns the DOKU-hosted checkout URL for the
 * browser to redirect to. Each call is a distinct payment attempt with its own
 * invoice number and DOKU session — stale pending orders simply expire.
 */
export async function startCheckout(input: StartCheckoutInput): Promise<StartCheckoutResult> {
  const parsed = startCheckoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data tidak valid. Periksa lagi isianmu." };
  }
  const { packageSlug, channel } = parsed.data;
  const promoCode = parsed.data.promoCode?.toUpperCase();

  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  // Billing is anchored to the wedding's CREATOR (orders.userId), so an order
  // stays on one account even when the partner is the one who clicks Bayar.
  const [row] = await db
    .select({
      weddingId: weddings.id,
      creatorId: weddings.userId,
      creatorName: users.name,
      creatorEmail: users.email,
      currentPackageId: weddings.packageId,
    })
    .from(weddings)
    .innerJoin(users, eq(weddings.userId, users.id))
    .where(and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)))
    .limit(1);
  if (!row) {
    return { ok: false, error: "Undangan tidak ditemukan." };
  }

  // Price is read from the catalog, never from the client.
  const pkg = await db.query.packages.findFirst({
    columns: { id: true, name: true, price: true, sortOrder: true },
    where: and(eq(packages.slug, packageSlug), eq(packages.active, true)),
  });
  if (!pkg) {
    return { ok: false, error: "Paket tidak ditemukan atau sedang tidak tersedia." };
  }

  // The UI locks lower tiers, but the client sends the slug — so enforce it here
  // too. Taking the money and then declining to downgrade (see
  // applyPaidEntitlements) would leave the customer paying for nothing.
  if (row.currentPackageId && row.currentPackageId !== pkg.id) {
    const current = await db.query.packages.findFirst({
      columns: { name: true, sortOrder: true },
      where: eq(packages.id, row.currentPackageId),
    });
    if (current && current.sortOrder > pkg.sortOrder) {
      return {
        ok: false,
        error: `Paket ${pkg.name} lebih rendah dari paket aktifmu (${current.name}). Pilih paket yang sama atau lebih tinggi.`,
      };
    }
  }

  let promo: ResolvedPromo | null = null;
  if (promoCode) {
    const result = await resolvePromo(promoCode, {
      price: pkg.price,
      packageId: pkg.id,
      creatorId: row.creatorId,
    });
    if (!result.ok) {
      return result;
    }
    promo = result.promo;
  }

  const amount = Math.max(0, pkg.price - (promo?.discount ?? 0));

  // 100%-off promo: nothing to charge, so the gateway is skipped entirely and
  // the order settles here. Extra guards on top of resolvePromo (active,
  // window, quota, package + user targeting):
  //   · a wedding can redeem one free activation per promo code, ever — a
  //     retried/replayed call can't stack free upgrades;
  //   · the order is written already-paid in ONE insert (no pending window for
  //     a webhook to race), and entitlements go through the same
  //     applyPaidEntitlements path as real payments (which also burns quota).
  if (amount <= 0 && promo) {
    const already = await db.query.orders.findFirst({
      columns: { id: true },
      where: and(
        eq(orders.weddingId, row.weddingId),
        eq(orders.promoId, promo.id),
        eq(orders.status, "paid"),
      ),
    });
    if (already) {
      return { ok: false, error: "Promo ini sudah pernah dipakai untuk undangan ini." };
    }

    const now = new Date();
    const invoiceNo = newInvoiceNo();
    const [freeOrder] = await db
      .insert(orders)
      .values({
        invoiceNo,
        userId: row.creatorId,
        weddingId: row.weddingId,
        packageId: pkg.id,
        promoId: promo.id,
        description: `Paket ${pkg.name} · promo ${promo.code}`,
        amount: 0,
        method: "Promo 100%",
        status: "paid",
        paidAt: now,
      })
      .returning({ id: orders.id });
    if (!freeOrder) {
      return { ok: false, error: "Gagal membuat pesanan. Coba lagi." };
    }

    try {
      await applyPaidEntitlements({
        weddingId: row.weddingId,
        packageId: pkg.id,
        promoId: promo.id,
        now,
      });
    } catch (error) {
      console.error(
        `startCheckout: FREE ORDER PAID BUT ENTITLEMENTS NOT APPLIED for ${invoiceNo} — set weddings.packageId manually`,
        error,
      );
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/billing");
    await logAudit({
      action: "order.create",
      targetType: "order",
      targetId: freeOrder.id,
      summary: `Aktivasi gratis ${invoiceNo} — Paket ${pkg.name} via promo ${promo.code} (100%)`,
    });
    return { ok: true, redirect: "/dashboard/billing" };
  }
  if (amount <= 0) {
    // Zero without a promo means a zero-priced package — misconfiguration.
    return { ok: false, error: "Paket ini belum bisa dibeli. Hubungi admin." };
  }

  // `||`, not `??`: a blank env var must fall through, not be taken as a value.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL;
  if (!appUrl) {
    console.error("startCheckout: NEXT_PUBLIC_APP_URL / AUTH_URL not configured");
    return { ok: false, error: "Pembayaran belum dikonfigurasi. Hubungi admin." };
  }

  const description = promo ? `Paket ${pkg.name} · promo ${promo.code}` : `Paket ${pkg.name}`;
  const invoiceNo = newInvoiceNo();
  const customerName = row.creatorName?.trim() || row.creatorEmail.split("@")[0];

  const [order] = await db
    .insert(orders)
    .values({
      invoiceNo,
      userId: row.creatorId,
      weddingId: row.weddingId,
      packageId: pkg.id,
      promoId: promo?.id ?? null,
      description,
      amount,
      method: channel === "CHECKOUT" ? "DOKU Checkout" : `DOKU · ${channel}`,
      status: "pending",
    })
    .returning({ id: orders.id });
  if (!order) {
    return { ok: false, error: "Gagal membuat pesanan. Coba lagi." };
  }

  // The gateway never issued anything payable, so no notification can ever
  // reference this invoice. Drop the row rather than leaving a phantom "pending"
  // (or a misleading "failed") in the customer's invoice list.
  async function abandon(error: string): Promise<StartCheckoutResult> {
    await db.delete(orders).where(eq(orders.id, order.id));
    return { ok: false, error };
  }

  // Cards/paylater ("CHECKOUT") and e-wallets route through DOKU's hosted page
  // — e-wallets pinned to the one chosen wallet, so the page IS that wallet's
  // flow. VA and QRIS are issued directly and rendered on our own payment page.
  if (channel === "CHECKOUT" || isEwalletChannel(channel)) {
    const checkout = await createDokuCheckout({
      invoiceNumber: invoiceNo,
      amount,
      callbackUrl: `${appUrl.replace(/\/$/, "")}/dashboard/billing`,
      itemName: description,
      customer: { id: row.creatorId, name: customerName, email: row.creatorEmail },
      ...(channel === "CHECKOUT" ? {} : { paymentMethodTypes: [channel] }),
    });
    if (!checkout.ok) {
      return abandon(checkout.error);
    }
    await logAudit({
      action: "order.create",
      targetType: "order",
      targetId: order.id,
      summary: `Buat pesanan ${invoiceNo} — ${description}`,
    });
    return { ok: true, redirect: checkout.url };
  }

  const instrument = await createPaymentInstrument({
    channel,
    invoiceNo,
    amount,
    customerName,
    customerEmail: row.creatorEmail,
  });
  if (!instrument.ok) {
    return abandon(instrument.error);
  }

  await db
    .update(orders)
    .set({ paymentDetail: instrument.instrument, updatedAt: new Date() })
    .where(eq(orders.id, order.id));

  await logAudit({
    action: "order.create",
    targetType: "order",
    targetId: order.id,
    summary: `Buat pesanan ${invoiceNo} — ${description}`,
  });

  return { ok: true, redirect: `/dashboard/billing/bayar/${invoiceNo}` };
}

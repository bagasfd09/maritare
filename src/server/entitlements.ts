// What a settled payment actually grants. Server-only (imports db).
//
// Lives outside both callers on purpose: an order reaches `paid` from TWO
// places — the DOKU webhook (src/app/api/webhook/doku/route.ts) and an admin
// settling it by hand (adminSetOrderStatus, used for manual transfers and
// fully-discounted orders). Both must grant the same thing, so the logic sits
// where they can share it rather than being duplicated per caller.

import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { packages, promos, weddings } from "@/lib/db/schema";

/**
 * Grant what the payment bought. `weddings.packageId` is what every quota check
 * reads (photo/guest/petugas limits) and what publishWedding derives expiry
 * from, so an order that settles without this leaves a paying customer on no plan.
 *
 * Safe to call only once per order — the caller must have already won the
 * pending → paid transition, since this increments promo redemption.
 */
export async function applyPaidEntitlements(input: {
  weddingId: string | null;
  packageId: string | null;
  promoId: string | null;
  now?: Date;
}): Promise<void> {
  const now = input.now ?? new Date();

  // Redemption is counted here, not at checkout, so abandoned carts don't burn quota.
  if (input.promoId) {
    await db
      .update(promos)
      .set({ used: sql`${promos.used} + 1`, updatedAt: now })
      .where(eq(promos.id, input.promoId));
  }

  if (!input.weddingId || !input.packageId) {
    return;
  }

  const pkg = await db.query.packages.findFirst({
    columns: { durationDays: true, sortOrder: true },
    where: eq(packages.id, input.packageId),
  });
  const wedding = await db.query.weddings.findFirst({
    columns: { expiresAt: true, packageId: true },
    where: eq(weddings.id, input.weddingId),
  });
  if (!wedding) {
    return;
  }

  // Never move a customer DOWN a tier. startCheckout already refuses to sell a
  // lower package, so reaching here means a hand-made order — and silently
  // shrinking a paying customer's photo/guest/petugas quotas is the worst
  // possible failure: no error, just less than they had. Time is still extended.
  let grantedPackageId = input.packageId;
  if (pkg && wedding.packageId && wedding.packageId !== input.packageId) {
    const current = await db.query.packages.findFirst({
      columns: { sortOrder: true },
      where: eq(packages.id, wedding.packageId),
    });
    if (current && current.sortOrder > pkg.sortOrder) {
      console.error(
        `applyPaidEntitlements: refusing to downgrade wedding ${input.weddingId} — keeping the higher tier`,
      );
      grantedPackageId = wedding.packageId;
    }
  }

  // A renewal bought while the invitation is still active extends from the
  // existing expiry; anything else starts from now. For a not-yet-published
  // invitation publishWedding recomputes this on publish anyway.
  let expiresAt = wedding.expiresAt;
  if (pkg) {
    const from = wedding.expiresAt && wedding.expiresAt > now ? wedding.expiresAt : now;
    expiresAt = new Date(from.getTime() + pkg.durationDays * 86_400_000);
  }

  await db
    .update(weddings)
    .set({ packageId: grantedPackageId, expiresAt, updatedAt: now })
    .where(eq(weddings.id, input.weddingId));
}

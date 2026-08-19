"use server";

// Customer publish / unpublish for the invitation editor.
//
// Hard rules (AGENTS.md): publishing is NEVER automatic — it is an explicit
// customer action GATED BY PAID STATUS. Ownership is always derived from the
// session (never a client-supplied wedding id). Public-facing copy is Bahasa;
// logs are English.
//
// The single source of public visibility is weddings.status === "live"
// (see getInvitationBySlug). Publishing flips status → "live" + stamps
// publishedAt; unpublishing flips it back to "draft" and clears publishedAt so
// the public /inv/<slug> route can never serve an unpublished invitation.

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { orders, packages, weddings } from "@/lib/db/schema";
import { logAudit } from "@/server/audit";
import { resolveAssistWeddingId, resolveMemberWeddingId } from "@/server/queries/wedding";

/** Why a publish was refused — lets the UI tailor the call to action. */
export type PublishRefusal = "auth" | "notfound" | "incomplete" | "unpaid" | "server";

export type PublishResult =
  | { ok: true; status: "live"; slug: string; alreadyLive?: boolean }
  | { ok: false; reason: PublishRefusal; error: string; missing?: string[] };

export type UnpublishResult =
  | { ok: true; status: "draft"; slug: string }
  | { ok: false; error: string };

/** Bust every surface that reflects publish state (sidebar pill, editor, billing, public page). */
function revalidatePublishSurfaces(slug: string): void {
  revalidatePath("/dashboard", "layout"); // sidebar status pill + chrome across the dashboard
  revalidatePath("/dashboard/editor");
  revalidatePath("/dashboard/billing");
  revalidatePath(`/inv/${slug}`);
}

export async function publishWedding(): Promise<PublishResult> {
  // Publishing is the CUSTOMER's act (AGENTS.md) — an admin helping via "bantu
  // edit" may fill the invitation but never make it public on their behalf.
  if (await resolveAssistWeddingId()) {
    return {
      ok: false,
      reason: "auth",
      error: "Publish harus dilakukan pemilik undangan sendiri.",
    };
  }

  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) {
    return { ok: false, reason: "auth", error: "Kamu harus masuk dulu." };
  }

  const wedding = await db.query.weddings.findFirst({
    columns: {
      id: true,
      slug: true,
      status: true,
      packageId: true,
      eventDate: true,
      venue: true,
      templateId: true,
    },
    where: and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)),
  });
  if (!wedding) {
    return { ok: false, reason: "notfound", error: "Undangan tidak ditemukan." };
  }

  // Idempotent: already public → report success without re-stamping.
  if (wedding.status === "live") {
    return { ok: true, status: "live", slug: wedding.slug, alreadyLive: true };
  }

  // Readiness: a public invitation needs at least a date, a venue, and a chosen
  // template. (completionPct in the UI is a softer progress signal; this is the
  // hard minimum so we never publish an empty page.)
  const missing: string[] = [];
  if (!wedding.eventDate) missing.push("tanggal acara");
  if (!wedding.venue) missing.push("lokasi acara");
  if (!wedding.templateId) missing.push("pilih template");
  if (missing.length > 0) {
    return {
      ok: false,
      reason: "incomplete",
      missing,
      error: `Lengkapi dulu sebelum publish: ${missing.join(", ")}.`,
    };
  }

  // HARD RULE: gated by paid status. A wedding is paid when it has at least one
  // order with status='paid' (not pending/failed/refunded).
  const paidOrder = await db.query.orders.findFirst({
    columns: { id: true },
    where: and(eq(orders.weddingId, wedding.id), eq(orders.status, "paid")),
  });
  if (!paidOrder) {
    return {
      ok: false,
      reason: "unpaid",
      error: "Paket undangan kamu belum dibayar. Selesaikan pembayaran dulu untuk publish.",
    };
  }

  // Expiry from the linked package duration (if any). Generous: recomputed from
  // "now" on every (re)publish.
  let expiresAt: Date | null = null;
  if (wedding.packageId) {
    const pkg = await db.query.packages.findFirst({
      columns: { durationDays: true },
      where: eq(packages.id, wedding.packageId),
    });
    if (pkg) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + pkg.durationDays);
    }
  }

  try {
    const now = new Date();
    const [row] = await db
      .update(weddings)
      .set({ status: "live", publishedAt: now, expiresAt, updatedAt: now })
      .where(and(eq(weddings.id, wedding.id), isNull(weddings.deletedAt)))
      .returning({ id: weddings.id });
    if (!row) {
      return { ok: false, reason: "notfound", error: "Undangan tidak ditemukan." };
    }

    revalidatePublishSurfaces(wedding.slug);
    await logAudit({
      action: "wedding.publish",
      targetType: "wedding",
      targetId: wedding.id,
      summary: `Publish undangan ${wedding.slug}`,
    });
    return { ok: true, status: "live", slug: wedding.slug };
  } catch (error) {
    console.error("publishWedding failed", error);
    return { ok: false, reason: "server", error: "Gagal publish. Coba lagi." };
  }
}

export async function unpublishWedding(): Promise<UnpublishResult> {
  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  const wedding = await db.query.weddings.findFirst({
    columns: { id: true, slug: true },
    where: and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)),
  });
  if (!wedding) {
    return { ok: false, error: "Undangan tidak ditemukan." };
  }

  try {
    const now = new Date();
    // Clear publishedAt (mirrors adminSetWeddingStatus) so the public route can
    // never serve it; leave expiresAt as-is for historical reference.
    const [row] = await db
      .update(weddings)
      .set({ status: "draft", publishedAt: null, updatedAt: now })
      .where(and(eq(weddings.id, wedding.id), isNull(weddings.deletedAt)))
      .returning({ id: weddings.id });
    if (!row) {
      return { ok: false, error: "Undangan tidak ditemukan." };
    }

    revalidatePublishSurfaces(wedding.slug);
    await logAudit({
      action: "wedding.unpublish",
      targetType: "wedding",
      targetId: wedding.id,
      summary: `Tarik undangan ${wedding.slug} dari publik`,
    });
    return { ok: true, status: "draft", slug: wedding.slug };
  } catch (error) {
    console.error("unpublishWedding failed", error);
    return { ok: false, error: "Gagal menarik undangan. Coba lagi." };
  }
}

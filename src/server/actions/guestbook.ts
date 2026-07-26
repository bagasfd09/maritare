"use server";

// Server Actions for the check-in kiosk (guestbook).
//
// Hard rules (AGENTS.md): never accept a client-supplied weddingId — the target
// wedding is always derived from the kiosk TOKEN session (via the shared
// resolver), never from the dashboard login. All external input is validated
// with Zod at the boundary. Ownership is baked into every WHERE clause so a
// forged guest id from another wedding matches nothing. DB errors are wrapped so
// internals never leak; user-facing copy is in Bahasa Indonesia (informal).

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { guests, wishes } from "@/lib/db/schema";
import { insertGuestsWithCode } from "@/lib/guest-code";
import { resolveKioskWeddingId } from "@/server/guestbook-resolve";

// ─────────────────────────────────────────────────────────────────
// Input schemas (validated at the boundary)
// ─────────────────────────────────────────────────────────────────

// `expectedWeddingId` is a fail-closed guard for the kiosk's offline replay:
// when supplied, the mutation applies only if the token session still belongs
// to that wedding. It can only NARROW what the session already grants (never
// widen), so it does not violate the never-trust-client-ids rule — it protects
// against the gb_session cookie being re-issued for a different wedding while
// a kiosk tab still holds the previous wedding's queued ops.
const checkInSchema = z.object({
  guestId: z.uuid(),
  partySize: z.number().int().min(1).max(20),
  expectedWeddingId: z.uuid().optional(),
});

const addWalkInSchema = z.object({
  name: z.string().trim().min(1).max(80),
  side: z.enum(["groom", "bride", "both"]),
  partySize: z.number().int().min(1).max(20),
  note: z.string().trim().max(120).optional(),
  group: z.string().trim().max(60).optional(),
  expectedWeddingId: z.uuid().optional(),
});

const addWishSchema = z.object({
  body: z.string().trim().min(1).max(600),
  guestId: z.uuid().optional(),
});

export type CheckInInput = z.input<typeof checkInSchema>;
export type AddWalkInInput = z.input<typeof addWalkInSchema>;
export type AddKioskWishInput = z.input<typeof addWishSchema>;

// Failure flags for the kiosk's offline sync queue:
// - `unauthenticated`: missing/kicked/wrong-wedding session — KEEP the op
//   (it succeeds after the next login to the right wedding).
// - `weddingMismatch` (always with unauthenticated): the session is VALID but
//   for a different wedding than the op — the client reloads /guestbook to
//   mount that wedding's flow instead of bouncing to the login screen.
// - `retryable`: transient server-side failure (DB blip) — KEEP the op and
//   retry on a later tick. A plain ok:false is a permanent rejection the
//   queue may drop (validation failure, guest deleted meanwhile).
type KioskMutationFailure = {
  ok: false;
  error: string;
  unauthenticated?: true;
  weddingMismatch?: true;
  retryable?: true;
};

export type CheckInResult = { ok: true; guestName: string } | KioskMutationFailure;

export type AddWalkInResult =
  | { ok: true; guestId: string; guestName: string }
  | KioskMutationFailure;

export type AddKioskWishResult = { ok: true } | { ok: false; error: string };

// ─────────────────────────────────────────────────────────────────
// Shared ownership resolution
// ─────────────────────────────────────────────────────────────────

/**
 * Resolve the wedding id from the kiosk token session — identical logic to the
 * kiosk query module, so every kiosk path derives the wedding the same way and
 * never trusts a client-supplied id. Returns `null` when there is no valid token
 * (missing / revoked / kicked).
 */
async function resolveOwnedWeddingId(): Promise<string | null> {
  // Token session only — the kiosk never uses the dashboard login.
  return resolveKioskWeddingId();
}

/** Revalidate every kiosk path that renders mutated state. The guest-facing
 * flow is a single client-stateful route (it refreshes itself by polling the
 * snapshot endpoint, and /guestbook is dynamic anyway) — revalidating it would
 * only fatten every mutation response with a re-rendered page the client
 * ignores. Only the server-rendered attendant screen needs it. */
function revalidateKiosk(): void {
  revalidatePath("/guestbook/attendant");
}

// ─────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────

/**
 * Check in an existing guest at the kiosk.
 *
 * Ownership is enforced in the WHERE clause: the row is only updated when it
 * belongs to the session user's wedding (and is not soft-deleted), so a forged
 * guestId from another wedding matches nothing and changes nothing.
 */
export async function checkInGuest(input: CheckInInput): Promise<CheckInResult> {
  const parsed = checkInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data check-in tidak valid. Coba lagi." };
  }
  const { guestId, partySize, expectedWeddingId } = parsed.data;

  const weddingId = await resolveOwnedWeddingId();
  if (!weddingId) {
    return {
      ok: false,
      error: "Kamu harus masuk dulu untuk check-in tamu.",
      unauthenticated: true,
    };
  }
  if (expectedWeddingId && expectedWeddingId !== weddingId) {
    // Session now belongs to a different wedding than the op was recorded for.
    return {
      ok: false,
      error: "Sesi kiosk sudah berpindah acara. Muat ulang halaman.",
      unauthenticated: true,
      weddingMismatch: true,
    };
  }

  try {
    const now = new Date();
    const [updated] = await db
      .update(guests)
      .set({
        checkedInAt: now,
        checkedInPartySize: partySize,
        status: "confirmed",
        updatedAt: now,
      })
      .where(
        and(
          eq(guests.id, guestId),
          eq(guests.weddingId, weddingId),
          isNull(guests.deletedAt),
        ),
      )
      .returning({ name: guests.name });

    if (!updated) {
      return { ok: false, error: "Tamu tidak ditemukan." };
    }

    revalidateKiosk();

    return { ok: true, guestName: updated.name };
  } catch (error) {
    console.error("checkInGuest failed", error);
    // Transient (DB blip etc.) — the offline queue must keep the op and retry.
    return { ok: false, error: "Gagal check-in tamu. Coba lagi.", retryable: true };
  }
}

/**
 * Register a walk-in guest at the kiosk: a guest who arrived without a prior
 * invitation. They are inserted already checked-in and confirmed.
 */
export async function addWalkInGuest(
  input: AddWalkInInput,
): Promise<AddWalkInResult> {
  const parsed = addWalkInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data tamu tidak valid. Coba lagi." };
  }
  const { name, side, partySize, note, group, expectedWeddingId } = parsed.data;

  const weddingId = await resolveOwnedWeddingId();
  if (!weddingId) {
    return {
      ok: false,
      error: "Kamu harus masuk dulu untuk menambah tamu.",
      unauthenticated: true,
    };
  }
  if (expectedWeddingId && expectedWeddingId !== weddingId) {
    // Session now belongs to a different wedding than the op was recorded for
    // — refusing here is what keeps a stale kiosk queue from inserting one
    // wedding's walk-ins into another wedding.
    return {
      ok: false,
      error: "Sesi kiosk sudah berpindah acara. Muat ulang halaman.",
      unauthenticated: true,
      weddingMismatch: true,
    };
  }

  try {
    const now = new Date();
    const [inserted] = await insertGuestsWithCode([
      {
        weddingId,
        name,
        group: group ?? null,
        side,
        status: "confirmed",
        partySize,
        invitationStatus: "none",
        isWalkIn: true,
        note: note ?? null,
        checkedInAt: now,
        checkedInPartySize: partySize,
      },
    ]);

    if (!inserted) {
      return { ok: false, error: "Gagal menambah tamu. Coba lagi." };
    }

    revalidateKiosk();

    return { ok: true, guestId: inserted.id, guestName: name };
  } catch (error) {
    console.error("addWalkInGuest failed", error);
    // Transient (DB blip etc.) — the offline queue must keep the op and retry.
    return { ok: false, error: "Gagal menambah tamu. Coba lagi.", retryable: true };
  }
}

/**
 * Leave a wish (buku ucapan) from the kiosk.
 *
 * When a guestId is supplied it must belong to the session-owned wedding — the
 * lookup is scoped to the owned wedding, so a forged / foreign id is rejected
 * rather than letting the wish borrow another wedding's guest name. With no
 * guestId the wish is signed "Tamu". Wishes land as `pending` for moderation.
 */
export async function addKioskWish(
  input: AddKioskWishInput,
): Promise<AddKioskWishResult> {
  const parsed = addWishSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ucapan tidak valid. Coba lagi." };
  }
  const { body, guestId } = parsed.data;

  const weddingId = await resolveOwnedWeddingId();
  if (!weddingId) {
    return { ok: false, error: "Kamu harus masuk dulu untuk mengirim ucapan." };
  }

  try {
    let fromName = "Tamu";
    let resolvedGuestId: string | null = null;

    if (guestId) {
      // Scope the lookup to the owned wedding: a foreign id never leaks a name.
      const guest = await db.query.guests.findFirst({
        columns: { id: true, name: true },
        where: and(
          eq(guests.id, guestId),
          eq(guests.weddingId, weddingId),
          isNull(guests.deletedAt),
        ),
      });
      if (!guest) {
        return { ok: false, error: "Tamu tidak ditemukan." };
      }
      fromName = guest.name;
      resolvedGuestId = guest.id;
    }

    await db.insert(wishes).values({
      weddingId,
      guestId: resolvedGuestId,
      fromName,
      body,
      attending: true,
      status: "pending",
    });

    revalidateKiosk();

    return { ok: true };
  } catch (error) {
    console.error("addKioskWish failed", error);
    return { ok: false, error: "Gagal mengirim ucapan. Coba lagi." };
  }
}

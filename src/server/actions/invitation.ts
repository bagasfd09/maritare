"use server";

// Public Server Action for the guest-facing invitation page (/inv/[slug]).
//
// Guests are anonymous — there is no session. The wedding is located by the
// public slug from the URL path, and writes are accepted ONLY when the
// invitation is live (publish is an explicit, paid-gated customer action; a
// draft must never accumulate public data). Inserts are scoped to that wedding;
// nothing privileged is mutated, so no ownership check applies here.

import { and, eq, isNull } from "drizzle-orm";
import { format } from "date-fns";
import { z } from "zod";

import { db } from "@/lib/db";
import { guests, rsvps, weddings, wishes } from "@/lib/db/schema";
import { parseSectionData } from "@/lib/invitation/sections";

const submitSchema = z
  .object({
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .max(80),
    name: z.string().trim().min(1, "Nama wajib diisi").max(80),
    attending: z.boolean().optional(),
    partySize: z.number().int().min(1).max(10).optional(),
    message: z.string().trim().max(600).optional(),
    // Honeypot: real guests never fill this hidden field. Non-empty → pretend
    // success, write nothing.
    website: z.string().optional(),
  })
  .refine((v) => v.attending !== undefined || (v.message ?? "").length > 0, {
    message: "Isi kehadiran atau ucapan dulu ya.",
  });

export type SubmitInvitationResponseInput = z.input<typeof submitSchema>;

export type SubmitInvitationResponseResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Record a guest's RSVP and/or wish from the public invitation page.
 *
 * - RSVP (`attending` provided) → `rsvps` row (guestId null — anonymous form).
 * - Wish (`message` non-empty) → `wishes` row, status `pending` (moderated in
 *   the dashboard before it appears publicly).
 * Both inserts happen in one transaction when both are present.
 */
export async function submitInvitationResponse(
  input: SubmitInvitationResponseInput,
): Promise<SubmitInvitationResponseResult> {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data tidak valid. Periksa lagi isianmu.",
    };
  }
  const { slug, name, attending, partySize, message, website } = parsed.data;

  // Honeypot tripped → silently accept (don't tip off the bot), write nothing.
  if (website) {
    return { ok: true };
  }

  try {
    // Public writes only land on LIVE invitations.
    const wedding = await db.query.weddings.findFirst({
      columns: { id: true },
      where: and(
        eq(weddings.slug, slug),
        eq(weddings.status, "live"),
        isNull(weddings.deletedAt),
      ),
    });
    if (!wedding) {
      return { ok: false, error: "Undangan ini belum menerima konfirmasi." };
    }

    await db.transaction(async (tx) => {
      if (attending !== undefined) {
        await tx.insert(rsvps).values({
          weddingId: wedding.id,
          attending,
          partySize: partySize ?? 1,
          message: message || null,
        });
      }
      if (message) {
        await tx.insert(wishes).values({
          weddingId: wedding.id,
          fromName: name,
          body: message,
          attending: attending ?? null,
          // pending → shows publicly only after the couple approves it
          status: "pending",
        });
      }
    });

    return { ok: true };
  } catch (error) {
    console.error("submitInvitationResponse failed", error);
    return { ok: false, error: "Gagal mengirim. Coba lagi ya." };
  }
}

// ─────────────────────────────────────────────────────────────────
// Per-guest RSVP from the Folk Garden opening gate
// ─────────────────────────────────────────────────────────────────

// Unlike the public form above, this is keyed to a SPECIFIC invited guest: the
// caller has resolved a personalized link (/inv/<slug>?g=<code>) so it knows the
// guest's UUID. We trust that UUID the same way we trust the ?g code — both are
// unguessable per-guest tokens — but still verify it belongs to THIS live
// wedding before writing. Records the response on the guest (dashboard status +
// headcount) and appends an `rsvps` row (latest wins, per the table's design).
const guestRsvpSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(80),
  guestId: z.string().uuid(),
  attending: z.boolean(),
  // Attendance type → headcount. "family" carries no exact number; we store the
  // configured max as an estimate. Omitted / ignored when not attending.
  party: z.enum(["solo", "couple", "family"]).optional(),
});

export type SubmitGuestRsvpInput = z.input<typeof guestRsvpSchema>;
export type SubmitGuestRsvpResult = { ok: true } | { ok: false; error: string };

export async function submitGuestRsvp(
  input: SubmitGuestRsvpInput,
): Promise<SubmitGuestRsvpResult> {
  const parsed = guestRsvpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data tidak valid. Coba lagi ya." };
  }
  const { slug, guestId, attending, party } = parsed.data;

  try {
    // Per-guest writes only land on LIVE invitations.
    const wedding = await db.query.weddings.findFirst({
      columns: { id: true, sections: true },
      where: and(
        eq(weddings.slug, slug),
        eq(weddings.status, "live"),
        isNull(weddings.deletedAt),
      ),
    });
    if (!wedding) {
      return { ok: false, error: "Undangan ini belum menerima konfirmasi." };
    }

    // The client gate also checks these, but they're host-configured rules, so we
    // enforce them at the trust boundary — the action is a POST-able endpoint.
    const rsvp = parseSectionData("rsvp", wedding.sections?.rsvp?.data);
    if (!rsvp.enabled) {
      return { ok: false, error: "Konfirmasi kehadiran sedang ditutup." };
    }
    if (rsvp.deadline && format(new Date(), "yyyy-MM-dd") > rsvp.deadline) {
      return { ok: false, error: "Batas konfirmasi kehadiran sudah lewat." };
    }

    // The guest UUID is a bearer token; confirm it belongs to this wedding.
    const guest = await db.query.guests.findFirst({
      columns: { id: true },
      where: and(
        eq(guests.id, guestId),
        eq(guests.weddingId, wedding.id),
        isNull(guests.deletedAt),
      ),
    });
    if (!guest) {
      return { ok: false, error: "Tamu tidak ditemukan untuk undangan ini." };
    }

    // Map the attendance choice → headcount: sendiri = 1, pasangan = 2,
    // keluarga = 4 (a fixed family estimate). Irrelevant when not attending.
    const partySize = !attending
      ? 1
      : party === "couple"
        ? 2
        : party === "family"
          ? 4
          : 1; // solo / unspecified

    const now = new Date();
    await db.transaction(async (tx) => {
      await tx
        .update(guests)
        .set({
          status: attending ? "confirmed" : "declined",
          // Only set the headcount when attending; a decline leaves it untouched.
          ...(attending ? { partySize } : {}),
          updatedAt: now,
        })
        .where(and(eq(guests.id, guestId), eq(guests.weddingId, wedding.id)));

      await tx.insert(rsvps).values({
        weddingId: wedding.id,
        guestId,
        attending,
        partySize,
      });
    });

    return { ok: true };
  } catch (error) {
    console.error("submitGuestRsvp failed", error);
    return { ok: false, error: "Gagal mengirim. Coba lagi ya." };
  }
}

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
    // Guest resolved from a personalized link (?g=<code>). The UUID is a bearer
    // token the same way the ?g code is — unguessable per guest. When present
    // with `attending`, the RSVP is keyed to that guest (dashboard status +
    // headcount) instead of an anonymous row.
    guestId: z.string().uuid().optional(),
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
 * - RSVP (`attending` provided) → `rsvps` row. With a resolved `guestId` the
 *   row is keyed to that guest and their dashboard status/headcount is updated;
 *   otherwise the row is anonymous.
 * - Wish (`message` non-empty) → `wishes` row, status `pending` (moderated in
 *   the dashboard before it appears publicly).
 * All writes happen in one transaction.
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
  const { slug, name, partySize, message, guestId, website } = parsed.data;
  let { attending } = parsed.data;

  // Honeypot tripped → silently accept (don't tip off the bot), write nothing.
  if (website) {
    return { ok: true };
  }

  try {
    // Public writes only land on LIVE invitations.
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

    // Host-configured RSVP rules, enforced at the trust boundary — the client
    // merely hides the attendance input, and the action is a POST-able endpoint.
    // A stale tab can still show the input after the host closes RSVP (or the
    // deadline passes): then drop only the attendance and keep the wish, so the
    // guest's message never fails on a rule they couldn't see. Error out only
    // when there's nothing else to save.
    if (attending !== undefined) {
      const rsvp = parseSectionData("rsvp", wedding.sections?.rsvp?.data);
      const closed = !rsvp.enabled
        ? "Konfirmasi kehadiran sedang ditutup."
        : rsvp.deadline && format(new Date(), "yyyy-MM-dd") > rsvp.deadline
          ? "Batas konfirmasi kehadiran sudah lewat."
          : null;
      if (closed) {
        if (!message) {
          return { ok: false, error: closed };
        }
        attending = undefined;
      }
    }

    // Resolve the guest for a personalized link. A stale/deleted guest falls
    // back to an anonymous RSVP rather than blocking the submission.
    const guest =
      guestId && attending !== undefined
        ? await db.query.guests.findFirst({
            columns: { id: true },
            where: and(
              eq(guests.id, guestId),
              eq(guests.weddingId, wedding.id),
              isNull(guests.deletedAt),
            ),
          })
        : undefined;

    await db.transaction(async (tx) => {
      if (attending !== undefined) {
        await tx.insert(rsvps).values({
          weddingId: wedding.id,
          guestId: guest?.id,
          attending,
          partySize: partySize ?? 1,
          message: message || null,
        });
        if (guest) {
          // Mirror the response onto the guest so the dashboard status flips.
          await tx
            .update(guests)
            .set({
              status: attending ? "confirmed" : "declined",
              // Only set the headcount when attending; a decline leaves it untouched.
              ...(attending ? { partySize: partySize ?? 1 } : {}),
              updatedAt: new Date(),
            })
            .where(eq(guests.id, guest.id));
        }
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


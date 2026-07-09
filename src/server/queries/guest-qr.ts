// Public (no-session) lookup for the per-guest QR page (/qr/<id>). A guest opens
// this from their WhatsApp invite to show the check-in QR; it is gated only by
// the unguessable guest UUID, and exposes just the guest name + couple + slug
// (no contact details). The kiosk still enforces wedding ownership on scan.

import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { guests, weddings } from "@/lib/db/schema";

export type GuestQrInfo = {
  guestId: string;
  guestName: string;
  groomName: string;
  brideName: string;
  slug: string;
};

// Resolves the short per-guest code from a personalized invite link
// (/inv/<slug>?g=<code>) to the guest UUID + name, scoped to the wedding for
// that slug. The invitation embeds the returned UUID in its check-in QR; the
// kiosk still enforces wedding ownership on scan.
export type InvitationCheckin = {
  guestId: string;
  guestName: string;
  /** Which family invited this guest — drives the wedding-gift section to show
   *  only that side's accounts. "both" (the default) and custom sides show all. */
  side: string;
  /** The guest's recorded RSVP (dashboard status): true = confirmed, false =
   *  declined, null = not answered yet. Lets the invitation show a "sudah
   *  konfirmasi" summary instead of the attendance form on a return visit. */
  attending: boolean | null;
  /** Recorded headcount (incl. themselves); meaningful only when attending. */
  partySize: number | null;
};

export async function getInvitationCheckinByCode(
  slug: string,
  code: string,
): Promise<InvitationCheckin | null> {
  // Codes are URL-supplied — keep the shape tight before touching the DB.
  if (!/^[0-9A-Za-z]{4,16}$/.test(code)) {
    return null;
  }
  const [row] = await db
    .select({
      guestId: guests.id,
      guestName: guests.name,
      side: guests.side,
      status: guests.status,
      partySize: guests.partySize,
    })
    .from(guests)
    .innerJoin(weddings, eq(guests.weddingId, weddings.id))
    .where(
      and(
        eq(guests.code, code),
        eq(weddings.slug, slug),
        isNull(guests.deletedAt),
        isNull(weddings.deletedAt),
      ),
    )
    .limit(1);

  if (!row) return null;
  return {
    guestId: row.guestId,
    guestName: row.guestName,
    side: row.side,
    attending: row.status === "confirmed" ? true : row.status === "declined" ? false : null,
    partySize: row.partySize,
  };
}

export async function getGuestQrInfo(id: string): Promise<GuestQrInfo | null> {
  if (!z.uuid().safeParse(id).success) {
    return null;
  }
  const [row] = await db
    .select({
      guestId: guests.id,
      guestName: guests.name,
      groomName: weddings.groomName,
      brideName: weddings.brideName,
      slug: weddings.slug,
    })
    .from(guests)
    .innerJoin(weddings, eq(guests.weddingId, weddings.id))
    .where(and(eq(guests.id, id), isNull(guests.deletedAt), isNull(weddings.deletedAt)))
    .limit(1);

  return row ?? null;
}

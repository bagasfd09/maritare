"use server";

// Server Actions for the dashboard Tamu (guests) screen — WhatsApp sending.
//
// Hard rules (AGENTS.md): ownership is derived from the session (never a client
// wedding id); the Fonnte token stays server-side; input validated with Zod;
// errors are Bahasa, logs English.

import { revalidatePath } from "next/cache";
import { and, eq, inArray, isNull, isNotNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { guests, weddings } from "@/lib/db/schema";
import { canonicalizeSide, isReservedSide } from "@/lib/guests-csv";
import { insertGuestsWithCode } from "@/lib/guest-code";
import { sendFonnteMessage } from "@/lib/fonnte";
import { buildInviteMessage } from "@/lib/invite-message";
import { normalizePhoneIntl } from "@/lib/phone";
import { resolveMemberWeddingId } from "@/server/queries/wedding";

type OwnedWedding = { id: string; slug: string; groomName: string; brideName: string };

async function resolveOwnedWedding(): Promise<OwnedWedding | null> {
  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) return null;
  const w = await db.query.weddings.findFirst({
    columns: { id: true, slug: true, groomName: true, brideName: true },
    where: and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)),
  });
  return w ?? null;
}

// ─────────────────────────────────────────────────────────────────
// Auto-send via Fonnte (bulk WhatsApp API)
// ─────────────────────────────────────────────────────────────────

const blastSchema = z.object({
  // Optional subset (selected rows). Omitted/empty → every guest with a phone.
  guestIds: z.array(z.uuid()).max(2000).optional(),
});

export type SendWhatsappBlastResult =
  | { ok: true; sent: number; failed: number; skipped: number }
  | { ok: false; error: string };

/** Run async tasks with a small concurrency cap (Fonnte-friendly). */
async function inChunks<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size);
    out.push(...(await Promise.all(batch.map(fn))));
  }
  return out;
}

export async function sendWhatsappBlast(
  input: { guestIds?: string[] } = {},
): Promise<SendWhatsappBlastResult> {
  const parsed = blastSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Permintaan tidak valid." };
  }

  const wedding = await resolveOwnedWedding();
  if (!wedding) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  const ids = parsed.data.guestIds;
  const rows = await db
    .select({ id: guests.id, name: guests.name, phone: guests.phone, code: guests.code })
    .from(guests)
    .where(
      and(
        eq(guests.weddingId, wedding.id),
        isNull(guests.deletedAt),
        isNotNull(guests.phone),
        ids && ids.length > 0 ? inArray(guests.id, ids) : undefined,
      ),
    );

  if (rows.length === 0) {
    return { ok: false, error: "Tidak ada tamu dengan nomor WhatsApp untuk dikirimi." };
  }

  let skipped = 0;
  const targets = rows
    .map((g) => {
      const target = normalizePhoneIntl(g.phone);
      if (!target) {
        skipped += 1;
        return null;
      }
      return { id: g.id, target, name: g.name, code: g.code };
    })
    .filter(
      (x): x is { id: string; target: string; name: string; code: string | null } =>
        x !== null,
    );

  const results = await inChunks(targets, 5, async (g) => {
    const message = buildInviteMessage({
      guestName: g.name,
      groomName: wedding.groomName,
      brideName: wedding.brideName,
      slug: wedding.slug,
      guestCode: g.code ?? undefined,
    });
    const r = await sendFonnteMessage({ target: g.target, message });
    return { id: g.id, ok: r.ok };
  });

  const sentIds = results.filter((r) => r.ok).map((r) => r.id);
  const failed = results.length - sentIds.length;

  if (sentIds.length > 0) {
    await db
      .update(guests)
      .set({ invitationStatus: "sent", updatedAt: new Date() })
      .where(and(eq(guests.weddingId, wedding.id), inArray(guests.id, sentIds)));
    revalidatePath("/dashboard/guests");
  }

  return { ok: true, sent: sentIds.length, failed, skipped };
}

// ─────────────────────────────────────────────────────────────────
// Mark a guest as invited (used by the manual wa.me path after sending)
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// Guest CRUD (add / edit / delete) — owner-scoped
// ─────────────────────────────────────────────────────────────────

const guestFieldsSchema = z.object({
  name: z.string().trim().min(1, "Nama tamu wajib diisi").max(80),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  group: z.string().trim().max(80).optional().or(z.literal("")),
  // Canonical "groom"/"bride"/"both" plus free-text custom sides. Folding
  // aliases here keeps every write path consistent with CSV import.
  side: z
    .string()
    .transform(canonicalizeSide)
    .pipe(
      z
        .string()
        .min(1, "Sisi wajib diisi")
        .max(40, "Sisi terlalu panjang (maks 40 karakter)")
        .refine((s) => !isReservedSide(s), "Nama sisi tidak valid."),
    )
    .default("both"),
  status: z.enum(["pending", "confirmed", "declined"]).default("pending"),
  partySize: z.number().int().min(0).max(20).nullable().optional(),
  foodChoice: z.string().trim().max(80).optional().or(z.literal("")),
});

const addGuestSchema = guestFieldsSchema;
const updateGuestSchema = guestFieldsSchema.extend({ id: z.uuid() });

export type AddGuestInput = z.input<typeof addGuestSchema>;
export type UpdateGuestInput = z.input<typeof updateGuestSchema>;
export type GuestMutationResult = { ok: true } | { ok: false; error: string };

/** Normalize the optional text/number fields the same way for add + edit. */
function guestValues(f: z.infer<typeof guestFieldsSchema>) {
  return {
    name: f.name,
    phone: f.phone ? f.phone : null,
    group: f.group ? f.group : null,
    side: f.side,
    status: f.status,
    partySize: f.partySize ?? null,
    foodChoice: f.foodChoice ? f.foodChoice : null,
  };
}

export async function addGuest(input: AddGuestInput): Promise<GuestMutationResult> {
  const parsed = addGuestSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first || "Data tamu tidak valid." };
  }
  const wedding = await resolveOwnedWedding();
  if (!wedding) return { ok: false, error: "Kamu harus masuk dulu." };

  try {
    await insertGuestsWithCode([
      {
        weddingId: wedding.id,
        invitationStatus: "none",
        ...guestValues(parsed.data),
      },
    ]);
    revalidatePath("/dashboard/guests");
    return { ok: true };
  } catch (error) {
    console.error("addGuest failed", error);
    return { ok: false, error: "Gagal menambah tamu. Coba lagi." };
  }
}

export async function updateGuest(input: UpdateGuestInput): Promise<GuestMutationResult> {
  const parsed = updateGuestSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first || "Data tamu tidak valid." };
  }
  const { id, ...fields } = parsed.data;
  const wedding = await resolveOwnedWedding();
  if (!wedding) return { ok: false, error: "Kamu harus masuk dulu." };

  try {
    const [row] = await db
      .update(guests)
      .set({ ...guestValues(fields), updatedAt: new Date() })
      .where(
        and(eq(guests.id, id), eq(guests.weddingId, wedding.id), isNull(guests.deletedAt)),
      )
      .returning({ id: guests.id });
    if (!row) return { ok: false, error: "Tamu tidak ditemukan." };
    revalidatePath("/dashboard/guests");
    revalidatePath("/guestbook");
    return { ok: true };
  } catch (error) {
    console.error("updateGuest failed", error);
    return { ok: false, error: "Gagal menyimpan perubahan. Coba lagi." };
  }
}

export async function deleteGuest(input: {
  id: string;
}): Promise<GuestMutationResult> {
  const parsed = z.object({ id: z.uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Data tidak valid." };
  const wedding = await resolveOwnedWedding();
  if (!wedding) return { ok: false, error: "Kamu harus masuk dulu." };

  try {
    const [row] = await db
      .update(guests)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(guests.id, parsed.data.id),
          eq(guests.weddingId, wedding.id),
          isNull(guests.deletedAt),
        ),
      )
      .returning({ id: guests.id });
    if (!row) return { ok: false, error: "Tamu tidak ditemukan." };
    revalidatePath("/dashboard/guests");
    revalidatePath("/guestbook");
    return { ok: true };
  } catch (error) {
    console.error("deleteGuest failed", error);
    return { ok: false, error: "Gagal menghapus tamu. Coba lagi." };
  }
}

export async function markGuestInvited(input: {
  guestId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = z.object({ guestId: z.uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Data tidak valid." };

  const wedding = await resolveOwnedWedding();
  if (!wedding) return { ok: false, error: "Kamu harus masuk dulu." };

  try {
    await db
      .update(guests)
      .set({ invitationStatus: "sent", updatedAt: new Date() })
      .where(
        and(
          eq(guests.id, parsed.data.guestId),
          eq(guests.weddingId, wedding.id),
          isNull(guests.deletedAt),
        ),
      );
    revalidatePath("/dashboard/guests");
    return { ok: true };
  } catch (error) {
    console.error("markGuestInvited failed", error);
    return { ok: false, error: "Gagal memperbarui status." };
  }
}

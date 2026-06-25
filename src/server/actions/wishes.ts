"use server";

// Wish moderation for the dashboard Buku Ucapan. Guest wishes land as `pending`
// (submitInvitationResponse) and stay hidden from the public invitation until
// the couple approves them. Approve → `approved` (shows publicly); Reject →
// `hidden`. Ownership is derived from the session (never the client): the wish
// must belong to the signed-in owner's wedding before any write.

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { weddings, wishes } from "@/lib/db/schema";
import { resolveMemberWeddingId } from "@/server/queries/wedding";

const moderateSchema = z.object({
  wishId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
});

export type ModerateWishInput = z.input<typeof moderateSchema>;
export type ModerateWishResult = { ok: true } | { ok: false; error: string };

export async function moderateWish(input: ModerateWishInput): Promise<ModerateWishResult> {
  const parsed = moderateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data tidak valid." };
  }
  const { wishId, action } = parsed.data;

  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  try {
    // Resolve the member's wedding from the session (same logic as the editor).
    const wedding = await db.query.weddings.findFirst({
      columns: { id: true },
      where: and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)),
    });
    if (!wedding) {
      return { ok: false, error: "Undangan tidak ditemukan." };
    }

    // Scope the update to THIS wedding — a foreign wishId never matches.
    const status = action === "approve" ? "approved" : "hidden";
    const updated = await db
      .update(wishes)
      .set({ status, updatedAt: new Date() })
      .where(
        and(eq(wishes.id, wishId), eq(wishes.weddingId, wedding.id), isNull(wishes.deletedAt)),
      )
      .returning({ id: wishes.id });

    if (updated.length === 0) {
      return { ok: false, error: "Ucapan tidak ditemukan." };
    }

    revalidatePath("/dashboard/wishes");
    return { ok: true };
  } catch (error) {
    console.error("moderateWish failed", error);
    return { ok: false, error: "Gagal memperbarui. Coba lagi ya." };
  }
}

"use server";

// Support tickets Server Actions.
//
// Two distinct gates by design (AGENTS.md):
//   - createTicket: ANY signed-in user may open a ticket from the customer
//     dashboard (not admin-only). Identity is taken from the SESSION, never the
//     client (we never trust a client-supplied userId/name/email).
//   - setTicketStatus: ADMIN-gated (open/close from /admin/support).
// All input validated with Zod at the boundary; user-facing copy is Bahasa,
// logs/comments English.

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { supportTickets } from "@/lib/db/schema";
import { logAudit } from "@/server/audit";

export type SupportActionResult = { ok: true } | { ok: false; error: string };

/** Resolve the session user id only when they are an admin; else null. */
async function requireAdminId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session.user.id;
}

// ─────────────────────────────────────────────────────────────────
// Create a ticket (any signed-in user)
// ─────────────────────────────────────────────────────────────────

const createTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, "Subjek wajib diisi.")
    .max(120, "Subjek maksimal 120 karakter."),
  body: z
    .string()
    .trim()
    .min(1, "Pesan wajib diisi.")
    .max(2000, "Pesan maksimal 2000 karakter."),
});

export type CreateTicketInput = z.input<typeof createTicketSchema>;

export async function createTicket(
  input: CreateTicketInput,
): Promise<SupportActionResult> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  const parsed = createTicketSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first || "Data tidak valid. Periksa lagi isianmu." };
  }
  const { subject, body } = parsed.data;

  try {
    await db.insert(supportTickets).values({
      userId: session.user.id,
      fromName: session.user.name ?? session.user.email,
      fromEmail: session.user.email,
      subject,
      body,
      status: "open",
    });
    revalidatePath("/admin/support");
    return { ok: true };
  } catch (error) {
    console.error("createTicket failed", error);
    return { ok: false, error: "Gagal mengirim tiket. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// Set ticket status (admin only)
// ─────────────────────────────────────────────────────────────────

const setTicketStatusSchema = z.object({
  id: z.uuid(),
  status: z.enum(["open", "closed"]),
});

export type SetTicketStatusInput = z.input<typeof setTicketStatusSchema>;

export async function setTicketStatus(
  input: SetTicketStatusInput,
): Promise<SupportActionResult> {
  const parsed = setTicketStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data tidak valid." };
  }
  const { id, status } = parsed.data;

  const adminId = await requireAdminId();
  if (!adminId) {
    return { ok: false, error: "Akses ditolak." };
  }

  try {
    const [row] = await db
      .update(supportTickets)
      .set({ status, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning({ id: supportTickets.id });
    if (!row) {
      return { ok: false, error: "Tiket tidak ditemukan." };
    }

    await logAudit({
      action: "support.status",
      targetType: "support_ticket",
      targetId: id,
      summary:
        status === "closed"
          ? "Menandai tiket support selesai"
          : "Membuka kembali tiket support",
    });

    revalidatePath("/admin/support");
    return { ok: true };
  } catch (error) {
    console.error("setTicketStatus failed", error);
    return { ok: false, error: "Gagal memperbarui tiket. Coba lagi." };
  }
}

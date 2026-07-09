"use server";

// Server Actions for the dashboard Settings screen.
//
// Hard rules (AGENTS.md): never accept a client-supplied wedding/user id —
// ownership is derived from the session; all external input is validated with
// Zod at the boundary; DB errors are wrapped so internals never leak to the
// client. User-facing copy is in Bahasa Indonesia (informal).

import { revalidatePath } from "next/cache";
import { and, eq, isNull, ne } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { users, weddings } from "@/lib/db/schema";
import { NOTIFICATION_KINDS, type NotificationPrefs } from "@/lib/notifications";
import { isValidSlug } from "@/lib/slug";
import { resolveEditorUserId, resolveMemberWeddingId } from "@/server/queries/wedding";

export type SettingsActionResult = { ok: true } | { ok: false; error: string };

// ─────────────────────────────────────────────────────────────────
// Profile (display name + WhatsApp number). Email is the OAuth identity
// and is intentionally NOT editable here.
// ─────────────────────────────────────────────────────────────────

const saveProfileSchema = z.object({
  name: z.string().trim().min(1, "Nama tampilan wajib diisi").max(80),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export async function saveProfile(input: {
  name: string;
  phone?: string;
}): Promise<SettingsActionResult> {
  const parsed = saveProfileSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first || "Data tidak valid. Periksa lagi isianmu." };
  }

  const userId = await resolveEditorUserId();
  if (!userId) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  try {
    await db
      .update(users)
      .set({
        name: parsed.data.name,
        phone: parsed.data.phone ? parsed.data.phone : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Sidebar chrome reads the name → refresh the whole dashboard tree.
    revalidatePath("/dashboard", "layout");
    return { ok: true };
  } catch (error) {
    console.error("saveProfile failed", error);
    return { ok: false, error: "Gagal menyimpan. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// Notification preferences
// ─────────────────────────────────────────────────────────────────

const channelSchema = z.object({ email: z.boolean(), wa: z.boolean() });
const notificationPrefsSchema = z.object({
  rsvp: channelSchema,
  wishes: channelSchema,
  gift: channelSchema,
  reminder: channelSchema,
  tips: channelSchema,
}) satisfies z.ZodType<NotificationPrefs>;

export async function saveNotifications(input: {
  prefs: NotificationPrefs;
}): Promise<SettingsActionResult> {
  const parsed = notificationPrefsSchema.safeParse(input?.prefs);
  if (!parsed.success) {
    return { ok: false, error: "Preferensi tidak valid." };
  }
  // Re-key in canonical order so the stored document is stable.
  const prefs = {} as NotificationPrefs;
  for (const kind of NOTIFICATION_KINDS) {
    prefs[kind] = parsed.data[kind];
  }

  const userId = await resolveEditorUserId();
  if (!userId) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  try {
    await db
      .update(users)
      .set({ notificationPrefs: prefs, updatedAt: new Date() })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard/settings");
    return { ok: true };
  } catch (error) {
    console.error("saveNotifications failed", error);
    return { ok: false, error: "Gagal menyimpan. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// WhatsApp invite templates (per-user, per-wedding)
// ─────────────────────────────────────────────────────────────────

// Only texts that diverge from the generated defaults are sent/stored, so
// untouched templates keep following live wedding info (date/venue edits).
const waTemplatesSchema = z.object({
  undangan: z.string().max(4000).optional(),
  reminder: z.string().max(4000).optional(),
  terimakasih: z.string().max(4000).optional(),
});

export async function saveWaTemplates(input: {
  templates: Record<string, string>;
}): Promise<SettingsActionResult> {
  const parsed = waTemplatesSchema.safeParse(input?.templates);
  if (!parsed.success) {
    return { ok: false, error: "Template tidak valid." };
  }

  const userId = await resolveEditorUserId();
  const weddingId = await resolveMemberWeddingId();
  if (!userId || !weddingId) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  // Drop undefined keys so the stored document only holds real edits.
  const edits: Record<string, string> = {};
  for (const [id, text] of Object.entries(parsed.data)) {
    if (typeof text === "string") edits[id] = text;
  }

  try {
    const me = await db.query.users.findFirst({
      columns: { waTemplates: true },
      where: eq(users.id, userId),
    });
    const all = { ...(me?.waTemplates ?? {}), [weddingId]: edits };
    await db
      .update(users)
      .set({ waTemplates: all, updatedAt: new Date() })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard/guests/sebar");
    return { ok: true };
  } catch (error) {
    console.error("saveWaTemplates failed", error);
    return { ok: false, error: "Gagal menyimpan template. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// Rename the invitation slug (maritare.id/<slug>)
// ─────────────────────────────────────────────────────────────────

const renameSlugSchema = z.object({
  slug: z.string().trim().toLowerCase(),
});

export async function renameSlug(input: {
  slug: string;
}): Promise<SettingsActionResult> {
  const parsed = renameSlugSchema.safeParse(input);
  if (!parsed.success || !isValidSlug(parsed.data.slug)) {
    return {
      ok: false,
      error: "Slug hanya boleh huruf kecil, angka, dan tanda hubung.",
    };
  }
  const slug = parsed.data.slug;

  const weddingId = await resolveMemberWeddingId();
  if (!weddingId) {
    return { ok: false, error: "Kamu harus masuk dulu." };
  }

  try {
    const wedding = await db.query.weddings.findFirst({
      columns: { id: true, slug: true },
      where: and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)),
    });
    if (!wedding) {
      return { ok: false, error: "Undangan tidak ditemukan." };
    }
    if (wedding.slug === slug) {
      return { ok: true }; // unchanged
    }

    // Slug index is global; reject if any OTHER wedding already uses it.
    const taken = await db.query.weddings.findFirst({
      columns: { id: true },
      where: and(eq(weddings.slug, slug), ne(weddings.id, wedding.id)),
    });
    if (taken) {
      return { ok: false, error: "Slug ini sudah dipakai. Coba yang lain." };
    }

    await db
      .update(weddings)
      .set({ slug, updatedAt: new Date() })
      .where(eq(weddings.id, wedding.id));

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard", "layout");
    return { ok: true };
  } catch (error) {
    console.error("renameSlug failed", error);
    return { ok: false, error: "Gagal mengganti slug. Coba lagi." };
  }
}

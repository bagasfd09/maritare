"use server";

// Server Action for the admin Settings screen — upserts the singleton
// `app_settings` row.
//
// Hard rules (AGENTS.md): never trust client-supplied ids (the row id is the
// fixed literal "singleton"); all external input is validated with Zod at the
// boundary; DB errors are wrapped so internals never leak to the client. This
// mutation is SUPER-ADMIN only: the JWT session carries `role` but NOT
// `adminRole`, so the sub-role is looked up from the database. User-facing copy
// is in Bahasa Indonesia.

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appSettings, users } from "@/lib/db/schema";
import { logAudit } from "@/server/audit";

export type AppSettingsActionResult = { ok: true } | { ok: false; error: string };

/**
 * True only when the signed-in user is an admin whose `adminRole` is
 * "super_admin". The JWT carries `role` but not `adminRole`, so the sub-role is
 * resolved from the users table.
 */
async function requireSuperAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return false;
  const u = await db.query.users.findFirst({
    columns: { adminRole: true },
    where: eq(users.id, session.user.id),
  });
  return u?.adminRole === "super_admin";
}

const saveAppSettingsSchema = z.object({
  brandName: z.string().trim().min(1, "Nama brand wajib diisi").max(80),
  supportEmail: z
    .string()
    .trim()
    .email("Email support tidak valid")
    .max(255)
    .optional()
    .or(z.literal("")),
  supportWhatsapp: z.string().trim().max(30).optional().or(z.literal("")),
});

export async function saveAppSettings(input: {
  brandName: string;
  supportEmail?: string;
  supportWhatsapp?: string;
}): Promise<AppSettingsActionResult> {
  const isSuperAdmin = await requireSuperAdmin();
  if (!isSuperAdmin) {
    return { ok: false, error: "Hanya Super Admin yang bisa mengubah pengaturan." };
  }

  const parsed = saveAppSettingsSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first || "Data tidak valid. Periksa lagi isianmu." };
  }

  const fields = {
    brandName: parsed.data.brandName,
    supportEmail: parsed.data.supportEmail ? parsed.data.supportEmail : null,
    supportWhatsapp: parsed.data.supportWhatsapp ? parsed.data.supportWhatsapp : null,
  };

  try {
    await db
      .insert(appSettings)
      .values({ id: "singleton", ...fields })
      .onConflictDoUpdate({
        target: appSettings.id,
        set: { ...fields, updatedAt: new Date() },
      });

    await logAudit({
      action: "settings.update",
      targetType: "settings",
      targetId: "singleton",
      summary: `Memperbarui pengaturan platform (brand ${fields.brandName})`,
    });

    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (error) {
    console.error("saveAppSettings failed", error);
    return { ok: false, error: "Gagal menyimpan. Coba lagi." };
  }
}

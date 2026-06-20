"use server";

// Server Actions for the admin Team management screen (RBAC sub-roles + invites).
//
// Hard rules (AGENTS.md): never trust a client-supplied id without verifying the
// session; all external input is validated with Zod at the boundary; DB errors
// are wrapped so internals never leak. User-facing copy is in Bahasa Indonesia
// (informal); logs/comments are in English.
//
// Authorization model:
//   - updateAdminRole / inviteAdmin / revokeInvite — SUPER ADMIN only. The JWT
//     session carries `role` but NOT `adminRole`, so we look the sub-role up in
//     the DB via `requireSuperAdmin()`.
//   - acceptInvite — PUBLIC (no admin gate). The invite token is the credential;
//     accepting it creates-or-promotes the user with the invite's email + role.

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamInvites, users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/password";
import { logAudit } from "@/server/audit";

// The admin team page to refresh after a super-admin mutation.
const ADMIN_TEAM_PATH = "/admin/team";

// Invites are valid for 7 days from creation.
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// The sub-roles a super admin can assign. Mirrors the `adminRole` pgEnum.
const ADMIN_ROLES = ["super_admin", "support", "finance", "designer"] as const;
type AdminRoleValue = (typeof ADMIN_ROLES)[number];

const ROLE_LABEL: Record<AdminRoleValue, string> = {
  super_admin: "Super Admin",
  support: "Support",
  finance: "Finance",
  designer: "Designer",
};

export type TeamActionResult = { ok: true } | { ok: false; error: string };
export type InviteActionResult =
  | { ok: true; inviteUrl: string }
  | { ok: false; error: string };

/**
 * Resolve the signed-in user and require the `super_admin` sub-role. The JWT
 * only carries `role`, so the sub-role is read from the DB. Returns the user's
 * id when they are a super admin, otherwise `null`.
 */
async function requireSuperAdmin(): Promise<string | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  const u = await db.query.users.findFirst({
    columns: { id: true, adminRole: true },
    where: eq(users.id, session.user.id),
  });
  return u?.adminRole === "super_admin" ? u.id : null;
}

/** Build the public accept URL for an invite token from AUTH_URL. */
function inviteUrlFor(token: string): string {
  return `${process.env.AUTH_URL ?? ""}/invite/${token}`;
}

// ─────────────────────────────────────────────────────────────────
// updateAdminRole — change a member's RBAC sub-role
// ─────────────────────────────────────────────────────────────────

const updateAdminRoleSchema = z.object({
  userId: z.uuid("ID pengguna tidak valid."),
  adminRole: z.enum(ADMIN_ROLES),
});

export type UpdateAdminRoleInput = { userId: string; adminRole: AdminRoleValue };

/**
 * Change an admin's sub-role. Super admin only. Guards against stripping the
 * LAST super admin: if the target is currently super_admin, they're the only
 * one, and the new role is NOT super_admin, the change is rejected.
 */
export async function updateAdminRole(
  input: UpdateAdminRoleInput,
): Promise<TeamActionResult> {
  const actorId = await requireSuperAdmin();
  if (!actorId) {
    return { ok: false, error: "Akses ditolak." };
  }

  const parsed = updateAdminRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data peran tidak valid." };
  }
  const { userId, adminRole } = parsed.data;

  try {
    const target = await db.query.users.findFirst({
      columns: { id: true, name: true, email: true, role: true, adminRole: true },
      where: and(eq(users.id, userId), isNull(users.deletedAt)),
    });
    if (!target || target.role !== "admin") {
      return { ok: false, error: "Admin tidak ditemukan." };
    }

    // Last-super-admin guard: never let the only super admin demote themselves
    // (or be demoted), which would lock everyone out of team management.
    if (target.adminRole === "super_admin" && adminRole !== "super_admin") {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(
          and(
            eq(users.role, "admin"),
            eq(users.adminRole, "super_admin"),
            isNull(users.deletedAt),
          ),
        );
      if (count <= 1) {
        return {
          ok: false,
          error: "Tidak bisa menurunkan Super Admin terakhir. Tunjuk Super Admin lain dulu.",
        };
      }
    }

    await db
      .update(users)
      .set({ adminRole, updatedAt: new Date() })
      .where(eq(users.id, userId));

    await logAudit({
      action: "team.role",
      targetType: "user",
      targetId: userId,
      summary: `Mengubah peran ${target.name?.trim() || target.email} menjadi ${ROLE_LABEL[adminRole]}`,
    });

    revalidatePath(ADMIN_TEAM_PATH);
    return { ok: true };
  } catch (error) {
    console.error("updateAdminRole failed", error);
    return { ok: false, error: "Gagal memperbarui peran. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// inviteAdmin — invite a new admin by email (+ best-effort Resend email)
// ─────────────────────────────────────────────────────────────────

const inviteAdminSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Email tidak valid.")
    .max(255)
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Email tidak valid."),
  adminRole: z.enum(ADMIN_ROLES),
});

export type InviteAdminInput = { email: string; adminRole: AdminRoleValue };

/**
 * Send a best-effort invite email via Resend. NEVER throws — email being
 * unconfigured or failing must not fail the invite action (the UI shows the
 * copyable link regardless). Skips silently when the API key / from address are
 * not set.
 */
async function sendInviteEmail(
  email: string,
  roleLabel: string,
  inviteUrl: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return;
  }
  try {
    // Imported lazily so the action never fails to load when Resend is absent.
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: email,
      subject: "Kamu diundang jadi admin Maritare",
      html: `<div style="font-family:system-ui,sans-serif;line-height:1.6;color:#2b2826">
  <h2 style="margin:0 0 12px">Undangan tim Maritare</h2>
  <p>Kamu diundang bergabung sebagai <strong>${roleLabel}</strong> di panel admin Maritare.</p>
  <p>Klik tautan di bawah untuk membuat akun dan menerima undangan. Tautan ini berlaku 7 hari.</p>
  <p><a href="${inviteUrl}" style="display:inline-block;background:#7C2D2D;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none">Terima undangan</a></p>
  <p style="font-size:12px;color:#8a857f">Atau salin tautan ini: ${inviteUrl}</p>
</div>`,
    });
  } catch (error) {
    // Best-effort: log and swallow so the action still succeeds.
    console.error("sendInviteEmail failed", error);
  }
}

/**
 * Invite a new admin. Super admin only. Rejects when a non-deleted user with
 * that email is ALREADY an admin. Creates a pending teamInvites row (token +
 * 7-day expiry), sends a best-effort email, and ALWAYS returns the invite URL
 * so the UI can show/copy it even when email isn't configured.
 */
export async function inviteAdmin(
  input: InviteAdminInput,
): Promise<InviteActionResult> {
  const actorId = await requireSuperAdmin();
  if (!actorId) {
    return { ok: false, error: "Akses ditolak." };
  }

  const parsed = inviteAdminSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first || "Data undangan tidak valid." };
  }
  const { email, adminRole } = parsed.data;

  try {
    // Reject if this email already belongs to a non-deleted admin.
    const existingAdmin = await db.query.users.findFirst({
      columns: { id: true },
      where: and(
        eq(users.email, email),
        eq(users.role, "admin"),
        isNull(users.deletedAt),
      ),
    });
    if (existingAdmin) {
      return { ok: false, error: "Email ini sudah menjadi admin." };
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

    await db.insert(teamInvites).values({
      email,
      adminRole,
      token,
      status: "pending",
      invitedByUserId: actorId,
      expiresAt,
    });

    const inviteUrl = inviteUrlFor(token);

    // Best-effort email — never fails the action.
    await sendInviteEmail(email, ROLE_LABEL[adminRole], inviteUrl);

    await logAudit({
      action: "team.invite",
      targetType: "team_invite",
      targetId: token,
      summary: `Mengundang ${email} sebagai ${ROLE_LABEL[adminRole]}`,
    });

    revalidatePath(ADMIN_TEAM_PATH);
    return { ok: true, inviteUrl };
  } catch (error) {
    console.error("inviteAdmin failed", error);
    return { ok: false, error: "Gagal mengirim undangan. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// revokeInvite — cancel a pending invite
// ─────────────────────────────────────────────────────────────────

const revokeInviteSchema = z.object({
  id: z.uuid("ID undangan tidak valid."),
});

export type RevokeInviteInput = { id: string };

/** Revoke a pending invite (status → "revoked"). Super admin only. */
export async function revokeInvite(
  input: RevokeInviteInput,
): Promise<TeamActionResult> {
  const actorId = await requireSuperAdmin();
  if (!actorId) {
    return { ok: false, error: "Akses ditolak." };
  }

  const parsed = revokeInviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data undangan tidak valid." };
  }
  const { id } = parsed.data;

  try {
    const result = await db
      .update(teamInvites)
      .set({ status: "revoked", updatedAt: new Date() })
      .where(and(eq(teamInvites.id, id), eq(teamInvites.status, "pending")))
      .returning({ email: teamInvites.email });

    if (result.length === 0) {
      return { ok: false, error: "Undangan tidak ditemukan atau sudah tidak aktif." };
    }

    await logAudit({
      action: "team.invite.revoke",
      targetType: "team_invite",
      targetId: id,
      summary: `Membatalkan undangan untuk ${result[0]!.email}`,
    });

    revalidatePath(ADMIN_TEAM_PATH);
    return { ok: true };
  } catch (error) {
    console.error("revokeInvite failed", error);
    return { ok: false, error: "Gagal membatalkan undangan. Coba lagi." };
  }
}

// ─────────────────────────────────────────────────────────────────
// acceptInvite — PUBLIC: create-or-promote the invited user
// ─────────────────────────────────────────────────────────────────

const acceptInviteSchema = z.object({
  token: z.string().trim().min(1, "Token undangan tidak valid."),
  name: z.string().trim().min(1, "Nama wajib diisi.").max(80),
  password: z.string().min(8, "Kata sandi minimal 8 karakter.").max(200),
});

export type AcceptInviteInput = { token: string; name: string; password: string };

/**
 * PUBLIC. Accept a pending, non-expired invite: create-or-promote the user with
 * the invite's email — set role "admin", the invite's adminRole, name, and a
 * scrypt password hash — then mark the invite accepted. The token is the
 * credential; no admin session is required.
 */
export async function acceptInvite(
  input: AcceptInviteInput,
): Promise<TeamActionResult> {
  const parsed = acceptInviteSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first || "Data tidak valid. Periksa lagi." };
  }
  const { token, name, password } = parsed.data;

  try {
    const invite = await db.query.teamInvites.findFirst({
      where: eq(teamInvites.token, token),
    });
    if (!invite) {
      return { ok: false, error: "Undangan tidak ditemukan." };
    }
    if (invite.status !== "pending") {
      return { ok: false, error: "Undangan ini sudah tidak berlaku." };
    }
    if (invite.expiresAt.getTime() < Date.now()) {
      return { ok: false, error: "Undangan ini sudah kedaluwarsa." };
    }

    const passwordHash = await hashPassword(password);

    // Create-or-promote the user keyed on the invite's email. The email column
    // is globally unique, so an existing (soft-deleted or not) row is promoted.
    const existing = await db.query.users.findFirst({
      columns: { id: true },
      where: eq(users.email, invite.email),
    });

    if (existing) {
      await db
        .update(users)
        .set({
          name,
          passwordHash,
          role: "admin",
          adminRole: invite.adminRole,
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id));
    } else {
      await db.insert(users).values({
        name,
        email: invite.email,
        passwordHash,
        role: "admin",
        adminRole: invite.adminRole,
      });
    }

    await db
      .update(teamInvites)
      .set({ status: "accepted", acceptedAt: new Date(), updatedAt: new Date() })
      .where(eq(teamInvites.id, invite.id));

    await logAudit({
      action: "team.invite.accept",
      targetType: "team_invite",
      targetId: invite.id,
      summary: `${invite.email} menerima undangan sebagai ${ROLE_LABEL[invite.adminRole]}`,
    });

    revalidatePath(ADMIN_TEAM_PATH);
    return { ok: true };
  } catch (error) {
    console.error("acceptInvite failed", error);
    return { ok: false, error: "Gagal menerima undangan. Coba lagi." };
  }
}

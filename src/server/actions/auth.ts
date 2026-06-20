"use server";

// Auth Server Actions.
//
// Logout is invoked from forms (server-rendered <form action={logout}>) and
// from client components via event handlers (Next 16 allows calling a Server
// Action directly from a client handler). No secrets touch the client — the
// session is destroyed server-side by Auth.js and the user is redirected to
// the login page.

import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/password";

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

// ─────────────────────────────────────────────────────────────────
// Email + password registration
// ─────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(80),
  email: z.string().trim().toLowerCase().min(3).max(255).regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter").max(200),
});

export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterResult = { ok: true } | { ok: false; error: string };

/**
 * Create a customer account with email + password. The password is scrypt-hashed
 * (never stored or returned in plaintext). On success the CLIENT then calls
 * signIn("credentials", …) to start the session. Always creates role "customer".
 */
export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first || "Data tidak valid. Periksa lagi isianmu." };
  }
  const { name, email, password } = parsed.data;

  try {
    const existing = await db.query.users.findFirst({
      columns: { id: true },
      where: and(eq(users.email, email), isNull(users.deletedAt)),
    });
    if (existing) {
      return { ok: false, error: "Email ini sudah terdaftar. Coba masuk." };
    }

    const passwordHash = await hashPassword(password);
    await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: "customer",
    });

    return { ok: true };
  } catch (error) {
    console.error("registerUser failed", error);
    return { ok: false, error: "Gagal mendaftar. Coba lagi." };
  }
}

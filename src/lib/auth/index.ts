import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq, isNull } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { z } from "zod";

import { db } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/password";

// Credentials login REQUIRES the JWT session strategy (Auth.js cannot persist a
// database session for a credentials sign-in). We keep the DrizzleAdapter so
// Google/Resend still persist users + accounts; the JWT just carries id + role.
const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().min(3).max(255),
  password: z.string().min(1).max(200),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Google verifies the email it returns, so linking a Google sign-in to an
      // existing user with the same (verified) email is safe — no takeover risk.
      // Without this, a user who registered via credentials hits
      // OAuthAccountNotLinked when they later try "Sign in with Google".
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM_EMAIL,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Kata sandi", type: "password" },
      },
      // Verify email + password against our own users table (scrypt hash).
      // Returning null → Auth.js reports invalid credentials (no detail leaked).
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await db.query.users.findFirst({
          where: and(eq(users.email, email), isNull(users.deletedAt)),
        });
        if (!user?.passwordHash) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // JWT strategy: on sign-in `user` is present (adapter user for OAuth, or the
    // authorize() return for credentials). Persist id + role onto the token so
    // every request carries them without a DB read.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Surface id + role onto session.user for server layouts / actions / route
    // handlers (resolveEditorUserId, the (dashboard)/(admin) gates, etc.).
    // typeof/literal narrowing keeps this safe regardless of JWT field typing.
    session({ session, token }) {
      const id = token.id;
      const role = token.role;
      if (typeof id === "string") session.user.id = id;
      if (role === "admin" || role === "customer") session.user.role = role;
      return session;
    },
  },
});

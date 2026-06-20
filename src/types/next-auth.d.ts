import type { DefaultSession } from "next-auth";

import type { userRole } from "@/lib/db/schema";

// Role values come from the `user_role` pg enum on the users table
// ("customer" | "admin"). Derive the union from the schema so it stays
// in sync if the enum ever changes.
type UserRole = (typeof userRole.enumValues)[number];

declare module "next-auth" {
  /**
   * Returned by `auth()`, `useSession`, `getSession`. The JWT session callback
   * copies `id` and `role` from the token onto `session.user`, so type them here.
   */
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  /**
   * The user object the `jwt` callback receives on sign-in: either the adapter
   * user (OAuth) or the Credentials `authorize()` return. Both carry `role`.
   */
  interface User {
    role: UserRole;
  }
}

declare module "next-auth/adapters" {
  /**
   * The DrizzleAdapter returns the full `users` row (including `role`) as the
   * adapter user. The default `AdapterUser` type omits it, so augment it here.
   */
  interface AdapterUser {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  /**
   * Our JWT carries the user id + role (set in the `jwt` callback at sign-in)
   * so the `session` callback can surface them without a DB read.
   */
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}

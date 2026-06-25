// Per-guest short code generation + collision-safe guest insertion.
//
// The code powers the pretty personalized invite link (/inv/<slug>?g=<code>).
// Uniqueness is GUARANTEED by the `guests.code` unique index — this module just
// generates candidates and retries the rare collision so callers never have to.
// Server-only (node crypto + db).

import { randomInt } from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { guests, weddings } from "@/lib/db/schema";

// Unambiguous base-57 alphabet — omits 0/O/1/I/l so a code can't be misread off
// a screen. 57^6 ≈ 34 billion combinations.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const CODE_LENGTH = 6;
const MAX_ATTEMPTS = 6;
const PG_UNIQUE_VIOLATION = "23505";

/** A random 6-char short code from the unambiguous alphabet. */
export function generateGuestCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}

/**
 * A unique wedding invite code (the "kode undangan" a partner enters at
 * onboarding to join as the 2nd owner). Reuses the unambiguous guest-code
 * alphabet; the `weddings.invite_code` unique index is the real guarantee, this
 * just pre-checks so the insert/update rarely collides.
 */
export async function generateUniqueInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateGuestCode();
    const existing = await db.query.weddings.findFirst({
      columns: { id: true },
      where: eq(weddings.inviteCode, code),
    });
    if (!existing) return code;
  }
  throw new Error("Failed to generate a unique invite code");
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === PG_UNIQUE_VIOLATION
  );
}

type GuestInsert = typeof guests.$inferInsert;

/**
 * Insert one or more guests, assigning each a unique short `code`. The DB unique
 * index is the real guarantee against duplicates; on the (astronomically rare)
 * collision we regenerate every code in the batch and retry. Returns the
 * inserted rows' ids in input order.
 */
export async function insertGuestsWithCode(
  rows: Array<Omit<GuestInsert, "code">>,
): Promise<Array<{ id: string }>> {
  if (rows.length === 0) return [];

  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const withCodes = rows.map((row) => ({ ...row, code: generateGuestCode() }));
    try {
      return await db.insert(guests).values(withCodes).returning({ id: guests.id });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      lastError = error; // code collision — regenerate the whole batch and retry
    }
  }
  throw lastError;
}

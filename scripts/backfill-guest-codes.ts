// One-off backfill: assign a unique short `code` to every existing guest that
// doesn't have one yet (rows created before the code column existed).
//
// Run with:  node --env-file=.env.local scripts/backfill-guest-codes.ts
//
// Constraints (Node 24 native TS type-stripping, same as seed.ts):
//   - relative imports only (no path aliases, no tsx)
//   - only erasable TS syntax
//   - build our own pg Pool from process.env.DATABASE_URL
//
// Idempotent: only touches rows where code IS NULL. The DB unique index is the
// real guarantee against duplicates; on the rare collision we just retry.

import { randomInt } from "node:crypto";
import { Pool } from "pg";

// Mirrors src/lib/guest-code.ts (kept inline — that module imports the @/ alias,
// which Node's type-stripping can't resolve from a script).
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function generateGuestCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main(): Promise<void> {
  const { rows } = await pool.query("SELECT id FROM guests WHERE code IS NULL");
  console.log(`Backfilling ${rows.length} guest(s) without a code…`);

  let updated = 0;
  for (const row of rows) {
    let ok = false;
    for (let attempt = 0; attempt < 10 && !ok; attempt++) {
      try {
        await pool.query("UPDATE guests SET code = $1, updated_at = now() WHERE id = $2", [
          generateGuestCode(),
          row.id,
        ]);
        ok = true;
        updated += 1;
      } catch (error) {
        // 23505 = unique_violation → regenerate and retry; anything else is fatal.
        if (error && (error as { code?: string }).code === "23505") continue;
        throw error;
      }
    }
    if (!ok) throw new Error(`Failed to assign a unique code for guest ${row.id}`);
  }

  console.log(`Done — ${updated} guest(s) updated.`);
  await pool.end();
}

main().catch((error) => {
  console.error("backfill-guest-codes failed", error);
  process.exit(1);
});

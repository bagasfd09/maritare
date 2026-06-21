// Production DB migration runner.
//
// Applies the SQL files in ./drizzle using the Drizzle migrator. Needs only
// `drizzle-orm` + `pg` (both production deps) and the committed ./drizzle folder
// (incl. meta/_journal.json) — no drizzle-kit, no .env file. DATABASE_URL is read
// from the process environment, so it works the same in Docker, CI, and a shell.
//
// Run: `node scripts/migrate.mjs`  (or `pnpm db:migrate:prod`).

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("migrate: DATABASE_URL is not set");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url });

try {
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("migrate: migrations applied");
} catch (err) {
  console.error("migrate: failed", err);
  process.exitCode = 1;
} finally {
  await pool.end();
}

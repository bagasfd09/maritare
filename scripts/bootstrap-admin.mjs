// Create (or reset) the first admin in a fresh production database — without the
// demo data that `db:seed` injects. Run once on the VPS:
//
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='<strong-pass>' node scripts/bootstrap-admin.mjs
//
// Idempotent: re-running updates the password + ensures role=admin/super_admin.
// Reads DATABASE_URL from the environment.
//
// The scrypt parameters/format below MUST match src/lib/password.ts (the app's
// verifier). Kept inline so this runs with plain `node` (no TS import) inside the
// production image.

import { randomBytes, scrypt } from "node:crypto";
import pg from "pg";

const COST = 16384; // scrypt N — must match src/lib/password.ts
const KEYLEN = 64;
const SALT_BYTES = 16;

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(SALT_BYTES);
    scrypt(password, salt, KEYLEN, { N: COST, maxmem: 64 * 1024 * 1024 }, (err, derived) => {
      if (err) reject(err);
      else resolve(`scrypt$${COST}$${salt.toString("hex")}$${derived.toString("hex")}`);
    });
  });
}

const url = process.env.DATABASE_URL;
const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "";
const name = (process.env.ADMIN_NAME || "Admin").trim();

if (!url) {
  console.error("bootstrap-admin: DATABASE_URL is not set");
  process.exit(1);
}
if (!email || !email.includes("@")) {
  console.error("bootstrap-admin: ADMIN_EMAIL is missing or invalid");
  process.exit(1);
}
if (password.length < 12) {
  console.error("bootstrap-admin: ADMIN_PASSWORD must be at least 12 characters");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url });

try {
  const passwordHash = await hashPassword(password);
  const { rows } = await pool.query(
    `INSERT INTO users (email, name, password_hash, role, admin_role)
     VALUES ($1, $2, $3, 'admin', 'super_admin')
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           name          = EXCLUDED.name,
           role          = 'admin',
           admin_role    = 'super_admin',
           updated_at    = now()
     RETURNING id, email, role, admin_role`,
    [email, name, passwordHash],
  );
  const row = rows[0];
  console.log(`bootstrap-admin: ${row.email} ready (role=${row.role}/${row.admin_role})`);
} catch (err) {
  console.error("bootstrap-admin: failed", err);
  process.exitCode = 1;
} finally {
  await pool.end();
}

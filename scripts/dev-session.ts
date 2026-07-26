// Mint a local dev session cookie so authenticated pages can be exercised with
// curl / a headless browser. LOCAL ONLY — it signs with AUTH_SECRET from
// .env.local and refuses to run against a production secret setup.
//
//   node --env-file=.env.local scripts/dev-session.ts <user-email>
//
// Prints the cookie value. Use as: curl -b "authjs.session-token=<value>" ...
//
// Uses Auth.js's own encode() rather than hand-rolling the JWE, so the token is
// exactly what the app would have issued (session strategy here is "jwt", so
// the sessions table plays no part in auth).

import { encode } from "next-auth/jwt";
import { Client } from "pg";

if (process.env.NODE_ENV === "production") {
  console.error("refusing to mint a session against NODE_ENV=production");
  process.exit(1);
}

const email = process.argv[2];
const secret = process.env.AUTH_SECRET;
if (!email || !secret) {
  console.error("usage: node --env-file=.env.local scripts/dev-session.ts <user-email>");
  console.error("  (AUTH_SECRET must be set)");
  process.exit(1);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const { rows } = await client.query<{ id: string; role: string }>(
  "SELECT id, role FROM users WHERE email = $1 AND deleted_at IS NULL LIMIT 1",
  [email],
);
await client.end();

if (rows.length === 0) {
  console.error(`no user with email ${email}`);
  process.exit(1);
}

// salt must equal the cookie name Auth.js reads it back from.
const salt = "authjs.session-token";
const token = await encode({
  token: { sub: rows[0].id, id: rows[0].id, role: rows[0].role, email },
  secret,
  salt,
  maxAge: 3600,
});

console.log(token);

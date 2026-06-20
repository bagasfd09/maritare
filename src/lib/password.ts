// Password hashing for email+password auth — dependency-free, using Node's
// built-in scrypt (a memory-hard KDF). Stored format:
//   scrypt$N$<saltHex>$<hashHex>
// where N is the scrypt cost parameter. Verification is constant-time.
//
// Server-only (imports node:crypto). Never import from client components.

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const COST = 16384; // scrypt N (2^14) — solid default for interactive logins
const KEYLEN = 64;
const SALT_BYTES = 16;

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // maxmem must be raised above the default to allow N=16384 at keylen 64.
    scrypt(password, salt, KEYLEN, { N: COST, maxmem: 64 * 1024 * 1024 }, (err, derived) => {
      if (err) reject(err);
      else resolve(derived);
    });
  });
}

/** Hash a plaintext password into the storable `scrypt$N$salt$hash` string. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = await scryptAsync(password, salt);
  return `scrypt$${COST}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

/** Verify a plaintext password against a stored hash. Safe against malformed input. */
export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "scrypt") return false;
  const cost = Number(parts[1]);
  if (!Number.isInteger(cost) || cost <= 0) return false;

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[2], "hex");
    expected = Buffer.from(parts[3], "hex");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;

  const derived = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, expected.length, { N: cost, maxmem: 64 * 1024 * 1024 }, (err, d) => {
      if (err) reject(err);
      else resolve(d);
    });
  }).catch(() => null);

  if (!derived || derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

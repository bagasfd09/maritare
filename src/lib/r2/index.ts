// Cloudflare R2 client + presigned-URL helpers.
//
// SERVER-ONLY MODULE. This file reads R2 secret credentials from the
// environment and must NEVER be imported into a "use client" component or any
// bundle shipped to the browser (per AGENTS.md hard rules: R2 secret keys are
// server-side signing only). It is intended for use from Route Handlers and
// Server Actions exclusively. We intentionally do not add the `server-only`
// npm package (no new deps); treat this comment as the guard.

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ─────────────────────────────────────────────────────────────────
// Environment — fail early if any required R2 credential is missing.
// ─────────────────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    // English internal error — never surfaced to end users.
    throw new Error(`Missing required R2 env var: ${name}`);
  }
  return value;
}

const R2_ACCOUNT_ID = requireEnv("R2_ACCOUNT_ID");
const R2_ACCESS_KEY_ID = requireEnv("R2_ACCESS_KEY_ID");
const R2_SECRET_ACCESS_KEY = requireEnv("R2_SECRET_ACCESS_KEY");

/** The R2 bucket all media objects live in. */
export const R2_BUCKET = requireEnv("R2_BUCKET");

// ─────────────────────────────────────────────────────────────────
// Singleton S3 client pointed at the R2 S3-compatible endpoint.
// ─────────────────────────────────────────────────────────────────

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Presigned-URL lifetimes (seconds).
const UPLOAD_URL_TTL = 300; // 5 min — browser PUTs directly to R2.
const VIEW_URL_TTL = 3600; // 1 hour — short-lived GET for rendering.

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/**
 * Generate a presigned PUT URL the browser can use to upload bytes directly to
 * R2 (we never proxy file bytes through the server). Both `Content-Type` and
 * `Content-Length` are signed into the request, so an upload whose headers do
 * not match the signed values will be rejected by R2 with a 403.
 *
 * Note: by default the presigner hoists `content-type` to a query parameter
 * rather than including it in `X-Amz-SignedHeaders`, which means R2 would NOT
 * enforce a Content-Type match. We pass `signableHeaders` to force both
 * `content-type` and `content-length` into the signature, so a client that
 * uploads with a different Content-Type (or wrong size) gets rejected.
 */
export function getUploadUrl(params: {
  key: string;
  contentType: string;
  contentLength: number;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: params.key,
    ContentType: params.contentType,
    ContentLength: params.contentLength,
  });

  return getSignedUrl(r2, command, {
    expiresIn: UPLOAD_URL_TTL,
    signableHeaders: new Set(["content-type", "content-length"]),
  });
}

/**
 * Generate a short-lived presigned GET URL for rendering a stored object.
 */
export function getViewUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });

  return getSignedUrl(r2, command, { expiresIn: VIEW_URL_TTL });
}

/**
 * Check whether an object exists in R2. Returns `true` when the object is
 * present, `false` when R2 reports it missing (404 / NotFound / NoSuchKey).
 * Any other error (network, auth, …) is re-thrown so callers can fail loudly.
 */
export async function headObject(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch (error) {
    if (isNotFound(error)) {
      return false;
    }
    throw error;
  }
}

/**
 * Permanently delete an object from R2 so storage isn't held by removed media.
 * Idempotent: R2 returns success for an already-absent key, and we treat a
 * NotFound as success too. Any other error (network, auth, …) is re-thrown so
 * callers can decide whether to swallow it (best-effort cleanup) or fail loudly.
 */
export async function deleteObject(key: string): Promise<void> {
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  } catch (error) {
    if (isNotFound(error)) {
      return;
    }
    throw error;
  }
}

/** Narrow an unknown S3 error to a "missing object" condition. */
function isNotFound(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const e = error as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };
  return (
    e.name === "NotFound" ||
    e.name === "NoSuchKey" ||
    e.$metadata?.httpStatusCode === 404
  );
}

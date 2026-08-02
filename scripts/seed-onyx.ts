// Targeted upsert of the "onyx" catalog template row — so it appears in the
// customer + admin template menus WITHOUT running the full seed (which deletes &
// re-seeds the demo wedding's guests/wishes). Idempotent: upsert by slug, and
// clears any prior soft-delete. Run with:
//   node --env-file=.env.local scripts/seed-onyx.ts
//
// Mirrors the onyx entry in scripts/seed.ts TEMPLATE_SEED.

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import { templates } from "../src/lib/db/schema.ts";
import { ONYX_MANIFEST } from "../src/lib/invitation/manifest.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set (run with node --env-file=.env.local)");
}

const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema: { templates } });

const ONYX_ROW = {
  slug: "onyx",
  name: "Onyx",
  style: "Cinematic Noir",
  category: "Editorial",
  palette: ["#0D0D0D", "#C9A96E", "#F7F7F5"],
  // DRAFT on purpose: the admin templates list shows every non-deleted row
  // regardless of status, while the customer catalog (and template picker) only
  // reads status='published'. So Onyx is staged and reviewable in admin without
  // being selectable by customers yet. Flip to "published" to release it.
  status: "draft" as const,
  featured: false,
  isNew: true,
  manifest: ONYX_MANIFEST,
};

async function run() {
  const [row] = await db
    .insert(templates)
    .values(ONYX_ROW)
    .onConflictDoUpdate({
      target: templates.slug,
      set: {
        name: ONYX_ROW.name,
        style: ONYX_ROW.style,
        category: ONYX_ROW.category,
        palette: ONYX_ROW.palette,
        status: ONYX_ROW.status,
        featured: ONYX_ROW.featured,
        isNew: ONYX_ROW.isNew,
        manifest: ONYX_ROW.manifest,
        deletedAt: null, // un-retire if it was soft-deleted
        updatedAt: new Date(),
      },
    })
    .returning();
  console.log("onyx template upserted:", { id: row?.id, slug: row?.slug, status: row?.status });
}

run()
  .then(() => pool.end())
  .catch((err) => {
    console.error("seed-onyx failed:", err);
    return pool.end().finally(() => process.exit(1));
  });

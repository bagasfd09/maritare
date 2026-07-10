// Targeted upsert of the "sienna" catalog template row — so it appears in the
// customer + admin template menus WITHOUT running the full seed (which deletes &
// re-seeds the demo wedding's guests/wishes). Idempotent: upsert by slug, and
// clears any prior soft-delete. Run with:
//   pnpm db:seed:sienna      (= node --env-file=.env.local scripts/seed-sienna.ts)
//
// Mirrors the sienna entry in scripts/seed.ts TEMPLATE_SEED + upsertTemplateBySlug.

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import { templates } from "../src/lib/db/schema.ts";
import { SIENNA_MANIFEST } from "../src/lib/invitation/manifest.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set (run with node --env-file=.env.local)");
}

const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema: { templates } });

const SIENNA_ROW = {
  slug: "sienna",
  name: "Sienna",
  style: "Warm Botanical",
  category: "Romantic",
  palette: ["#FBF6F0", "#D6A191", "#CB3A31"],
  status: "published" as const,
  featured: false,
  isNew: true,
  manifest: SIENNA_MANIFEST,
};

async function run() {
  const [row] = await db
    .insert(templates)
    .values(SIENNA_ROW)
    .onConflictDoUpdate({
      target: templates.slug,
      set: {
        name: SIENNA_ROW.name,
        style: SIENNA_ROW.style,
        category: SIENNA_ROW.category,
        palette: SIENNA_ROW.palette,
        status: SIENNA_ROW.status,
        featured: SIENNA_ROW.featured,
        isNew: SIENNA_ROW.isNew,
        manifest: SIENNA_ROW.manifest,
        deletedAt: null, // un-retire if it was soft-deleted
        updatedAt: new Date(),
      },
    })
    .returning();
  console.log("sienna template upserted:", { id: row?.id, slug: row?.slug, status: row?.status });
}

run()
  .then(() => pool.end())
  .catch((err) => {
    console.error("seed-sienna failed:", err);
    return pool.end().finally(() => process.exit(1));
  });

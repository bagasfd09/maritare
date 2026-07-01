// Targeted upsert of the "plum" catalog template row — so it appears in the
// customer + admin template menus WITHOUT running the full seed (which deletes &
// re-seeds the demo wedding's guests/wishes). Idempotent: upsert by slug, and
// clears any prior soft-delete. Run with:
//   pnpm db:seed:plum      (= node --env-file=.env.local scripts/seed-plum.ts)
//
// Mirrors the plum entry in scripts/seed.ts TEMPLATE_SEED + upsertTemplateBySlug.

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import { templates } from "../src/lib/db/schema.ts";
import { PLUM_MANIFEST } from "../src/lib/invitation/manifest.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set (run with node --env-file=.env.local)");
}

const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema: { templates } });

const PLUM_ROW = {
  slug: "plum",
  name: "Plum",
  style: "Forest Botanical",
  category: "Romantic",
  palette: ["#F3E4D8", "#613947", "#D0A25E"],
  status: "published" as const,
  featured: false,
  isNew: true,
  manifest: PLUM_MANIFEST,
};

async function run() {
  const [row] = await db
    .insert(templates)
    .values(PLUM_ROW)
    .onConflictDoUpdate({
      target: templates.slug,
      set: {
        name: PLUM_ROW.name,
        style: PLUM_ROW.style,
        category: PLUM_ROW.category,
        palette: PLUM_ROW.palette,
        status: PLUM_ROW.status,
        featured: PLUM_ROW.featured,
        isNew: PLUM_ROW.isNew,
        manifest: PLUM_ROW.manifest,
        deletedAt: null, // un-retire if it was soft-deleted
        updatedAt: new Date(),
      },
    })
    .returning();
  console.log("plum template upserted:", { id: row?.id, slug: row?.slug, status: row?.status });
}

run()
  .then(() => pool.end())
  .catch((err) => {
    console.error("seed-plum failed:", err);
    return pool.end().finally(() => process.exit(1));
  });

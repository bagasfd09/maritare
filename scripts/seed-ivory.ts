// Targeted upsert of the "ivory" catalog template row — so it appears in the
// customer + admin template menus WITHOUT running the full seed (which deletes &
// re-seeds the demo wedding's guests/wishes). Idempotent: upsert by slug, and
// clears any prior soft-delete. Run with:
//   pnpm db:seed:ivory      (= node --env-file=.env.local scripts/seed-ivory.ts)
//
// Mirrors the ivory entry in scripts/seed.ts TEMPLATE_SEED + upsertTemplateBySlug.

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import { templates } from "../src/lib/db/schema.ts";
import { IVORY_MANIFEST } from "../src/lib/invitation/manifest.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set (run with node --env-file=.env.local)");
}

const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema: { templates } });

const IVORY_ROW = {
  slug: "ivory",
  name: "Ivory",
  style: "Romantic Floral",
  category: "Romantic",
  palette: ["#FBF7EC", "#D89BAE", "#7C8B5A"],
  status: "published" as const,
  featured: false,
  isNew: true,
  manifest: IVORY_MANIFEST,
};

async function run() {
  const [row] = await db
    .insert(templates)
    .values(IVORY_ROW)
    .onConflictDoUpdate({
      target: templates.slug,
      set: {
        name: IVORY_ROW.name,
        style: IVORY_ROW.style,
        category: IVORY_ROW.category,
        palette: IVORY_ROW.palette,
        status: IVORY_ROW.status,
        featured: IVORY_ROW.featured,
        isNew: IVORY_ROW.isNew,
        manifest: IVORY_ROW.manifest,
        deletedAt: null, // un-retire if it was soft-deleted
        updatedAt: new Date(),
      },
    })
    .returning();
  console.log("ivory template upserted:", { id: row?.id, slug: row?.slug, status: row?.status });
}

run()
  .then(() => pool.end())
  .catch((err) => {
    console.error("seed-ivory failed:", err);
    return pool.end().finally(() => process.exit(1));
  });

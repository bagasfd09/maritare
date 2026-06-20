// One-off: sync the Folk + Scarlet template manifests (editor form groups +
// photo slots) from code into the DB `templates.manifest` column — WITHOUT
// running the full seed (which resets the demo wedding's sections + guests).
//
// The editor rail reads templates.manifest from the DB (getWeddingTemplateMeta),
// so any manifest change in src/lib/invitation/manifest.ts only takes effect
// after this runs. Touches ONLY the two template rows; no wedding data.
//
// Run with:  node --env-file=.env.local scripts/sync-template-manifests.ts
//
// Node native TS type-stripping constraints (same as seed.ts): relative imports
// with .ts extensions, erasable syntax only, build our own pg Pool.

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq, isNull } from "drizzle-orm";
import { templates } from "../src/lib/db/schema.ts";
import type { TemplateManifest } from "../src/lib/invitation/manifest.ts";
import { FOLK_MANIFEST, SCARLET_MANIFEST } from "../src/lib/invitation/manifest.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set (run with node --env-file=.env.local)");
}

const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema: { templates } });

async function syncOne(slug: string, manifest: TemplateManifest) {
  const updated = await db
    .update(templates)
    .set({ manifest, updatedAt: new Date() })
    .where(and(eq(templates.slug, slug), isNull(templates.deletedAt)))
    .returning({ id: templates.id });
  console.log(`${slug}: ${updated.length} template row(s) updated`);
}

async function main() {
  await syncOne("folk", FOLK_MANIFEST);
  await syncOne("scarlet", SCARLET_MANIFEST);
  console.log("Done — template manifests synced.");
}

main()
  .then(() => pool.end())
  .catch(async (err) => {
    console.error(err);
    await pool.end();
    process.exit(1);
  });

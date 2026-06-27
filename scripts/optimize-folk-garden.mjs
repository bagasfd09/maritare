// Build-time optimizer for the Folk "garden" watercolor ornament pack.
//
// These webp are already sanely sized (≤780px) — the weight comes from their
// ENCODING quality, not dimensions (e.g. landscape-watercolor 600×860 = 238KB,
// tree-green-01 600×902 = 183KB). So this RE-ENCODES each in place at a lower
// (still visually-lossless-for-decoration) quality, cutting the fixed payload
// the Folk template ships on every page. A 1000px cap is a safety net only.
//
// Files are overwritten in place (same .webp name → no code reference changes).
// Git history is the backup for the originals; review the diff before committing.
//
// ponytail: webp-only. AVIF would shave another ~30-50% on these watercolors but
// needs <picture> in FolkFloral to be picked up — wire that if payload still bites.
//
// Run with:  node scripts/optimize-folk-garden.mjs   (or: pnpm optimize:folk)

import sharp from "sharp";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DIR = "public/invitation/folk/garden";
const MAX_WIDTH = 1000; // ornaments render ≤~780px; cap is just a guard
const QUALITY = 78; // decorative watercolor — generation loss is invisible here

const files = (await readdir(DIR)).filter((f) => /\.webp$/i.test(f));
if (files.length === 0) {
  console.error(`No .webp found in ${DIR}`);
  process.exit(1);
}

let before = 0;
let after = 0;
for (const f of files) {
  const src = path.join(DIR, f);
  // Read the bytes into memory FIRST: on Windows sharp(src) keeps the file handle
  // open, which blocks overwriting the same path. Feeding it a Buffer decouples it.
  const input = await readFile(src);
  const inSize = input.length;
  const meta = await sharp(input).metadata();
  before += inSize;

  let pipe = sharp(input);
  if (meta.width && meta.width > MAX_WIDTH) {
    pipe = pipe.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }
  const buf = await pipe.webp({ quality: QUALITY, effort: 6 }).toBuffer();

  // Keep the larger original if re-encoding somehow didn't help.
  if (buf.length >= inSize) {
    after += inSize;
    console.log(`${f} — kept (${(inSize / 1024).toFixed(0)}KB, re-encode not smaller)`);
    continue;
  }
  await writeFile(src, buf);
  after += buf.length;
  console.log(
    `${f} (${meta.width}px ${(inSize / 1024).toFixed(0)}KB) -> ${(buf.length / 1024).toFixed(0)}KB`,
  );
}
console.log(
  `\nTOTAL: ${(before / 1024 / 1024).toFixed(2)}MB -> ${(after / 1024 / 1024).toFixed(2)}MB across ${files.length} files`,
);

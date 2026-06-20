// Build-time optimizer for the Scarlet/Folk ornament asset pack.
//
// The shipped ornaments are wildly oversized PNG/JPG (~20 MB total) but render
// in a narrow invitation column (≤ ~600px, ~1100px retina). This resizes them to
// a sane cap and re-encodes as WebP (sibling file, same basename), cutting the
// fixed payload ~80-90%. Originals are KEPT so any un-swapped reference still
// loads — prune them in a later cleanup once all refs are .webp.
//
// Run with:  node scripts/optimize-scarlet.mjs   (or: pnpm optimize:scarlet)

import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const DIR = "public/invitation/scarlet";
const MAX_WIDTH = 1100; // retina-safe for the narrow invitation column
const QUALITY = 82; // decorative art — visually lossless enough at this size

const files = (await readdir(DIR)).filter((f) => /\.(png|jpe?g)$/i.test(f));
if (files.length === 0) {
  console.error(`No PNG/JPG found in ${DIR}`);
  process.exit(1);
}

let before = 0;
let after = 0;
for (const f of files) {
  const src = path.join(DIR, f);
  const out = path.join(DIR, f.replace(/\.(png|jpe?g)$/i, ".webp"));
  const meta = await sharp(src).metadata();
  const inStat = await stat(src);
  before += inStat.size;

  let pipe = sharp(src);
  if (meta.width && meta.width > MAX_WIDTH) {
    pipe = pipe.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }
  await pipe.webp({ quality: QUALITY, effort: 6 }).toFile(out);

  const outStat = await stat(out);
  after += outStat.size;
  console.log(
    `${f} (${meta.width}px ${(inStat.size / 1024).toFixed(0)}KB) -> ${path.basename(out)} ${(outStat.size / 1024).toFixed(0)}KB`,
  );
}
console.log(
  `\nTOTAL: ${(before / 1024 / 1024).toFixed(1)}MB -> ${(after / 1024 / 1024).toFixed(1)}MB across ${files.length} files`,
);

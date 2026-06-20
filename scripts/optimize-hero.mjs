import sharp from "sharp";
import { stat } from "node:fs/promises";
import { existsSync } from "node:fs";

// Auto-detect source: prefer .webp/.png/.jpg in public/landing/hero-couple-source.*
const candidates = [
  "public/landing/hero-couple-source.webp",
  "public/landing/hero-couple-source.png",
  "public/landing/hero-couple-source.jpg",
  "public/landing/hero-couple-source.jpeg",
];
const src = candidates.find((p) => existsSync(p));
if (!src) {
  console.error("No source image found. Drop one at: " + candidates.join(" or "));
  process.exit(1);
}

const srcMeta = await sharp(src).metadata();
const srcStat = await stat(src);
console.log(
  `source: ${src} — ${srcMeta.width}x${srcMeta.height} ${srcMeta.format} — ${(srcStat.size / 1024).toFixed(0)}KB`,
);

// Cap width at 2400px (retina-ready). Source above that is wasted bytes.
const MAX_WIDTH = 2400;
const base =
  srcMeta.width && srcMeta.width > MAX_WIDTH
    ? sharp(src).resize({ width: MAX_WIDTH, withoutEnlargement: true })
    : sharp(src);

// WebP q90 — visually identical to source, ~14× smaller than the original webp.
// Next.js Image (when not unoptimized) will further convert this to AVIF for
// supported browsers, so end users typically download even less.
const out = "public/landing/hero-couple.webp";
await base.clone().webp({ quality: 90, effort: 6 }).toFile(out);
const sized = await stat(out);
console.log(`${out} (WebP q90): ${(sized.size / 1024).toFixed(0)}KB`);

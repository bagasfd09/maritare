import sharp from "sharp";
import { stat } from "node:fs/promises";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const src = "public/landing/hero-couple-source.webp";
if (!existsSync(src)) {
  console.error("Source not found:", src);
  process.exit(1);
}
const srcMeta = await sharp(src).metadata();
const srcSize = (await stat(src)).size;
console.log(
  `SOURCE: ${srcMeta.width}x${srcMeta.height} ${srcMeta.format} — ${(srcSize / 1024).toFixed(0)}KB\n`,
);

const tmp = mkdtempSync(join(tmpdir(), "hero-compare-"));
const widths = [1920, 2400];

const variants = [
  { name: "JPG q85",          ext: "jpg",  encode: (s) => s.jpeg({ quality: 85, progressive: true, mozjpeg: true }) },
  { name: "JPG q90",          ext: "jpg",  encode: (s) => s.jpeg({ quality: 90, progressive: true, mozjpeg: true }) },
  { name: "JPG q92",          ext: "jpg",  encode: (s) => s.jpeg({ quality: 92, progressive: true, mozjpeg: true }) },
  { name: "WebP q85",         ext: "webp", encode: (s) => s.webp({ quality: 85, effort: 6 }) },
  { name: "WebP q90",         ext: "webp", encode: (s) => s.webp({ quality: 90, effort: 6 }) },
  { name: "WebP q95",         ext: "webp", encode: (s) => s.webp({ quality: 95, effort: 6 }) },
  { name: "AVIF q60",         ext: "avif", encode: (s) => s.avif({ quality: 60, effort: 6 }) },
  { name: "AVIF q70",         ext: "avif", encode: (s) => s.avif({ quality: 70, effort: 6 }) },
  { name: "AVIF q80",         ext: "avif", encode: (s) => s.avif({ quality: 80, effort: 6 }) },
];

console.log("Format/Quality       1920px     2400px");
console.log("------------------- --------- ---------");

for (const v of variants) {
  const sizes = await Promise.all(
    widths.map(async (w) => {
      const f = join(tmp, `${v.name.replace(/\s/g, "_")}_${w}.${v.ext}`);
      await v.encode(sharp(src).resize({ width: w, withoutEnlargement: true })).toFile(f);
      return (await stat(f)).size / 1024;
    }),
  );
  console.log(
    `${v.name.padEnd(20)} ${sizes[0].toFixed(0).padStart(6)}KB ${sizes[1].toFixed(0).padStart(6)}KB`,
  );
}

rmSync(tmp, { recursive: true, force: true });

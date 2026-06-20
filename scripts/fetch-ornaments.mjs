// One-off: source public-domain botanical watercolors from Wikimedia Commons
// for the Flora Atelier invitation ornaments, trim/resize via sharp, and write
// an ATTRIBUTION.md. Re-run safe (overwrites). Not part of the app runtime.
//
// Usage: node scripts/fetch-ornaments.mjs

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.resolve("public/invitation/ornaments");
const UA = "MaritareOrnamentFetch/1.0 (dev tooling; one-off asset sourcing)";

// Curated targets: classic botanical/ornithological painters, all died well
// over 100 years ago → public domain worldwide, commercial use OK.
// cropBottom: fraction cut off the bottom (plate captions); whiten: stretch the
// paper tone toward white so mix-blend-multiply reads clean.
const TARGETS = [
  { out: "rose-white", query: 'Redouté "Rosa alba" regalis', hint: "white rose", cropBottom: 0.16, whiten: true },
  { out: "lily-white", query: "Redouté Lilium candidum", hint: "white lily", cropBottom: 0.12, whiten: true },
  { out: "rose-red", query: "Redouté Rosa gallica", hint: "red rose", cropBottom: 0.14, whiten: true },
  { out: "anemone-red", query: "Redouté anemone", hint: "red accent bouquet" },
  { out: "bouquet-blush", query: "Paul de Longpré roses", hint: "lush blush spray", whiten: true },
  { out: "peony-blush", query: "Redouté Paeonia", hint: "blush peony", cropBottom: 0.12, whiten: true },
  { out: "fern-green", query: "Redouté Convallaria majalis", hint: "green foliage", cropBottom: 0.12, whiten: true },
  { out: "bird-pair", query: "John Gould Hirundo swallow plate", hint: "bird pair", cropBottom: 0.1, whiten: true },
];

async function api(params) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&" + params;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function pdLicensed(meta) {
  const lic = `${meta?.LicenseShortName?.value ?? ""} ${meta?.License?.value ?? ""}`.toLowerCase();
  return lic.includes("public domain") || lic.includes("pd-") || lic === "pd" || lic.includes("cc0");
}

async function findFile(query) {
  const data = await api(
    "generator=search&gsrsearch=" +
      encodeURIComponent(query + " filetype:bitmap") +
      "&gsrlimit=12&gsrnamespace=6&prop=imageinfo&iiprop=url|size|extmetadata",
  );
  const pages = Object.values(data?.query?.pages ?? {});
  const candidates = pages
    .map((p) => {
      const info = p.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata ?? {};
      return {
        title: p.title,
        url: info.url,
        width: info.width,
        height: info.height,
        artist: (meta.Artist?.value ?? "").replace(/<[^>]+>/g, "").trim(),
        license: meta.LicenseShortName?.value ?? "?",
        page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, "_"))}`,
        pd: pdLicensed(meta),
      };
    })
    .filter(Boolean)
    .filter((c) => c.pd && c.width >= 600 && /\.(jpe?g|png)$/i.test(c.url));
  return candidates[0] ?? null;
}

// Background→alpha keying by PAPER DETECTION (saturation + brightness).
// Old book scans have beige/cream/foxed paper that defeats single-colour
// thresholds and flood-fills alike. But paper — however aged — is always pale
// and near-neutral (low saturation, high brightness), while painted flowers
// and leaves are either saturated (colour) or dark (shadow). So we drop pixels
// that read as paper and keep everything else, with a soft ramp for clean edges.
const EDGE_FEATHER = 1.2; // gaussian sigma on the alpha edge
// A pixel is "paper" when brightness is high AND saturation is low. Ramps make
// the transition soft so watercolor edges don't get a hard cutout halo.
const V_LO = 0.7; // brightness ramp: below → definitely subject
const V_HI = 0.88; // above → bright enough to be paper (if also desaturated)
const S_LO = 0.1; // saturation ramp: below → neutral (paper-like)
const S_HI = 0.22; // above → coloured enough to be subject
const FLOOD_THRESH = 0.62; // min paperness to keep flooding from the border

function sampleCorner(raw, width, height) {
  // Median of four 14×14 corner patches → the paper colour (robust to specks).
  const patch = 14;
  const rs = [];
  const gs = [];
  const bs = [];
  for (const [cx, cy] of [
    [0, 0],
    [width - patch, 0],
    [0, height - patch],
    [width - patch, height - patch],
  ]) {
    for (let y = cy; y < cy + patch; y++) {
      for (let x = cx; x < cx + patch; x++) {
        const i = (y * width + x) * 3;
        rs.push(raw[i]);
        gs.push(raw[i + 1]);
        bs.push(raw[i + 2]);
      }
    }
  }
  const med = (a) => a.sort((m, n2) => m - n2)[a.length >> 1];
  return [med(rs), med(gs), med(bs)];
}

function keyPaperToAlpha(raw, width, height) {
  const n = width * height;
  const out = Buffer.alloc(n * 4);
  const paperness = new Float32Array(n);
  // White-balance gains that map the sampled paper colour onto neutral grey, so
  // warm beige/cream paper reads as desaturated (and gets keyed) while the
  // flowers — whose hue diverges from the paper — keep their saturation.
  const [cr, cg, cb] = sampleCorner(raw, width, height);
  const target = 235;
  const gr = target / Math.max(cr, 1);
  const gg = target / Math.max(cg, 1);
  const gb = target / Math.max(cb, 1);
  for (let i = 0, o = 0; i < raw.length; i += 3, o += 4) {
    const r = raw[i];
    const g = raw[i + 1];
    const b = raw[i + 2];
    // Balanced values drive the paper decision only; output keeps true colour.
    const rb = Math.min(255, r * gr);
    const gb2 = Math.min(255, g * gg);
    const bb2 = Math.min(255, b * gb);
    const max = Math.max(rb, gb2, bb2);
    const min = Math.min(rb, gb2, bb2);
    const v = max / 255;
    const s = max === 0 ? 0 : (max - min) / max;
    // paperness ∈ [0,1]: 1 = clearly paper (bright + neutral). Combine the two
    // cues — a pixel must be BOTH bright and desaturated to read as paper.
    const bright = Math.min(1, Math.max(0, (v - V_LO) / (V_HI - V_LO)));
    const neutral = Math.min(1, Math.max(0, (S_HI - s) / (S_HI - S_LO)));
    paperness[i / 3] = bright * neutral;
    out[o] = r;
    out[o + 1] = g;
    out[o + 2] = b;
    out[o + 3] = 255;
  }

  // Only remove paper CONNECTED to the border: flood inward through paper-like
  // pixels. Pale petals enclosed by the bloom aren't reachable, so they survive
  // even when they read as paper-coloured.
  const reachable = new Uint8Array(n);
  const stack = new Int32Array(n);
  let sp = 0;
  const tryPush = (p) => {
    if (!reachable[p] && paperness[p] >= FLOOD_THRESH) {
      reachable[p] = 1;
      stack[sp++] = p;
    }
  };
  for (let x = 0; x < width; x++) {
    tryPush(x);
    tryPush((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    tryPush(y * width);
    tryPush(y * width + width - 1);
  }
  while (sp > 0) {
    const p = stack[--sp];
    const x = p % width;
    const y = (p - x) / width;
    if (x > 0) tryPush(p - 1);
    if (x < width - 1) tryPush(p + 1);
    if (y > 0) tryPush(p - width);
    if (y < height - 1) tryPush(p + width);
  }

  // Border-connected paper → transparent (soft by its own paperness so edges
  // ramp); enclosed paper-coloured pixels stay opaque.
  for (let p = 0; p < n; p++) {
    if (reachable[p]) {
      out[p * 4 + 3] = Math.round(255 * (1 - paperness[p]));
    }
  }
  return out;
}

async function processImage(buf, target) {
  // Crop plate captions, whiten the paper tone, key white → transparent alpha,
  // trim transparent margins, cap size, save webp WITH alpha. Transparent
  // assets work over any surface — no blend-mode tricks needed in CSS.
  const outPath = path.join(OUT_DIR, `${target.out}.webp`);
  let img = sharp(buf);
  if (target.cropBottom) {
    const meta = await img.metadata();
    img = img.extract({
      left: 0,
      top: 0,
      width: meta.width,
      height: Math.round(meta.height * (1 - target.cropBottom)),
    });
    img = sharp(await img.toBuffer());
  }
  // Downscale to working size FIRST (caps output + keeps keying fast), then
  // key paper→transparent on the small buffer.
  const { data, info } = await img
    .resize({ width: 720, height: 900, fit: "inside", withoutEnlargement: true })
    .gamma(1.05)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgba = keyPaperToAlpha(data, info.width, info.height);
  const { width: w, height: h } = info;
  const rawOpts = { raw: { width: w, height: h, channels: 4 } };
  // Feather only the alpha channel for soft watercolor edges, then recombine
  // with the original RGB (all via explicit raw I/O so sharp keeps geometry).
  const softAlpha = await sharp(rgba, rawOpts)
    .extractChannel(3)
    .blur(EDGE_FEATHER)
    .raw()
    .toBuffer();
  const rgb = await sharp(rgba, rawOpts).removeAlpha().raw().toBuffer();
  await sharp(rgb, { raw: { width: w, height: h, channels: 3 } })
    .joinChannel(softAlpha, { raw: { width: w, height: h, channels: 1 } })
    .trim({ threshold: 8 })
    .webp({ quality: 84 })
    .toFile(outPath);
  const meta = await sharp(outPath).metadata();
  return { outPath, width: meta.width, height: meta.height };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(url, cacheKey) {
  // Cache originals in $TEMP so re-runs never re-hit Commons (which
  // rate-limits bursts hard); back off and retry on 429.
  const cacheDir = path.join(process.env.TEMP ?? "/tmp", "orn-cache");
  await mkdir(cacheDir, { recursive: true });
  const cachePath = path.join(cacheDir, cacheKey + ".bin");
  try {
    return await readFile(cachePath);
  } catch {
    // not cached yet
  }
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(cachePath, buf);
      return buf;
    }
    if (res.status !== 429) throw new Error(`download ${res.status}`);
    await sleep(10000 * (attempt + 1));
  }
  throw new Error("download 429 (after retries)");
}

const rows = [];
await mkdir(OUT_DIR, { recursive: true });

for (const t of TARGETS) {
  try {
    const found = await findFile(t.query);
    if (!found) {
      console.log(`MISS  ${t.out}  (${t.query})`);
      continue;
    }
    const buf = await download(found.url, t.out);
    const { width, height } = await processImage(buf, t);
    rows.push({ file: `${t.out}.webp`, ...found, w: width, h: height, hint: t.hint });
    console.log(`OK    ${t.out}.webp  ${width}x${height}  ← ${found.title} [${found.license}]`);
  } catch (err) {
    console.log(`FAIL  ${t.out}  ${err.message}`);
  }
  await sleep(3000);
}

const md = [
  "# Ornament asset attribution",
  "",
  "All artwork below is in the **public domain** (artists deceased >100 years;",
  "see per-file license note). Sourced from Wikimedia Commons scans, trimmed +",
  "resized via `scripts/fetch-ornaments.mjs`. Rendered with `mix-blend-multiply`",
  "so the paper-white background disappears on light surfaces.",
  "",
  "| File | Work | Artist | License | Source |",
  "| --- | --- | --- | --- | --- |",
  ...rows.map(
    (r) => `| ${r.file} | ${r.title.replace("File:", "")} | ${r.artist || "—"} | ${r.license} | ${r.page} |`,
  ),
  "",
].join("\n");
await writeFile(path.join(OUT_DIR, "ATTRIBUTION.md"), md);
console.log(`\nWrote ${rows.length} assets + ATTRIBUTION.md → ${OUT_DIR}`);

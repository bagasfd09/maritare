// Folk Garden — downloadable check-in QR "card".
//
// The on-page QR (folk-qr.tsx) is a bare scannable square. When a guest taps
// "Unduh QR" we don't want that naked QR on their phone roll — we compose a
// keepsake card that carries the Folk Garden identity: the watercolor florals,
// the gold Javanese ornament, the couple's names + date, and the guest's own
// name, all drawn around the QR on a single PNG.
//
// Everything is rendered onto an offscreen <canvas> from same-origin assets
// (the /public webp florals) + a freshly generated high-res QR, so the canvas
// is never tainted and exports cleanly. Fonts are resolved from the live DOM
// (next/font hashes the family names) so the card matches the page typography.

import QRCode from "qrcode";

// Folk palette (mirrors the colors baked into folk-ornaments / folk-qr).
const C = {
  cream: "#F5EFE0",
  creamLight: "#FBF7EC",
  paper: "#F7F1E3",
  gold: "#C9A24B",
  beige: "#E0D6BE",
  magenta: "#9E2B62",
  magentaDeep: "#7A1E48",
  olive: "#52602F",
  oliveDark: "#3C471F",
  sunflower: "#E8A33D",
  // Muted maroon used for the QR modules — a subtle red tint, not a loud red.
  qrDark: "#5C1F1F",
  // The invitation's primary red (Scarlet theme --text-primary) — the same color
  // the couple names render in on the cover. Used for the names on the card.
  nameRed: "#700F06",
} as const;

const ASSET_BASE = "/invitation/folk/garden";

export type FolkQrCardInput = {
  /** QR payload — the guest UUID the kiosk scanner decodes. */
  payload: string;
  /** Couple display names (bride-first, matching the cover). */
  brideName: string;
  groomName: string;
  /** Guest the card is issued to. */
  guestName: string;
  /** Pre-formatted Bahasa date label, e.g. "Sabtu, 13 Juni 2026". */
  dateLabel: string | null;
  /**
   * An element inside the /inv subtree — used purely to resolve the template's
   * CSS-variable font families (next/font hashes them) for canvas text.
   */
  fontHost: HTMLElement;
};

/** Load a same-origin image; resolves to null on failure so one missing
 *  ornament never aborts the whole card. */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Resolve a CSS-variable font (e.g. "--font-display") to its computed family
 *  stack by probing inside the invitation subtree where the var is defined. */
function resolveFontFamily(host: HTMLElement, cssVar: string, fallback: string): string {
  try {
    const probe = document.createElement("span");
    probe.style.fontFamily = `var(${cssVar})`;
    probe.style.position = "absolute";
    probe.style.opacity = "0";
    probe.style.pointerEvents = "none";
    host.appendChild(probe);
    const family = getComputedStyle(probe).fontFamily;
    probe.remove();
    return family || fallback;
  } catch {
    return fallback;
  }
}

// `heading` + `serif` come from the Scarlet theme the Folk body renders in
// (Pinyon Script / Cormorant Garamond) so the card's names match the cover.
type Fonts = { body: string; script: string; heading: string; serif: string };

/** Make sure the weights/styles we draw are actually loaded before painting —
 *  next/font uses display:swap, so a cold font would otherwise render fallback. */
async function ensureFontsReady(fonts: Fonts): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  const specs = [
    `400 26px ${fonts.body}`,
    `600 13px ${fonts.body}`,
    `700 44px ${fonts.script}`,
    `400 90px ${fonts.heading}`,
    `italic 600 40px ${fonts.serif}`,
  ];
  try {
    // FontFaceSet.load can throw synchronously on an unparseable shorthand, so
    // isolate each spec — one bad family must not abandon the rest.
    await Promise.all(
      specs.map((s) => {
        try {
          return document.fonts.load(s).catch(() => undefined);
        } catch {
          return Promise.resolve(undefined);
        }
      }),
    );
    await document.fonts.ready;
  } catch {
    // Best-effort: fall through and let canvas use whatever is available.
  }
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

type Anchor = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** Draw an image at a target width, anchored by one of its corners to (x,y),
 *  preserving aspect ratio. flipX mirrors it horizontally about that corner. */
function drawByWidth(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  targetW: number,
  anchor: Anchor,
  flipX = false,
): void {
  const ratio = img.naturalHeight / img.naturalWidth || 1;
  const w = targetW;
  const h = targetW * ratio;
  const left = anchor.endsWith("right") ? x - w : x;
  const top = anchor.startsWith("bottom") ? y - h : y;
  ctx.save();
  if (flipX) {
    ctx.translate(left + w, top);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, w, h);
  } else {
    ctx.drawImage(img, left, top, w, h);
  }
  ctx.restore();
}

/** Draw an image scaled to fit (contain) within a box, centered. */
function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): void {
  const scale = Math.min(bw / img.naturalWidth, bh / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  ctx.drawImage(img, bx + (bw - w) / 2, by + (bh - h) / 2, w, h);
}

/** Shrink the font until `text` fits `maxWidth`; returns the chosen px size. */
function fitSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: (px: number) => string,
  maxWidth: number,
  startPx: number,
  minPx: number,
): number {
  let px = startPx;
  for (; px > minPx; px -= 2) {
    ctx.font = font(px);
    if (ctx.measureText(text).width <= maxWidth) break;
  }
  return px;
}

/** Trim `text` with an ellipsis until it fits `maxWidth` at the current font —
 *  the floor-size safety net so an extreme name can never paint past the band. */
function clampText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out.trimEnd()}…`;
}

/** Greedy word-wrap into at most `maxLines` lines that each fit `maxWidth`. */
function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  // Fold any remaining overflow words into the last line.
  const used = lines.join(" ").split(/\s+/).length;
  if (used < words.length && lines.length) {
    lines[lines.length - 1] += " " + words.slice(used).join(" ");
  }
  return lines;
}

/**
 * Compose the decorated Folk check-in card and return it as a PNG Blob.
 */
export async function renderFolkQrCard(input: FolkQrCardInput): Promise<Blob> {
  const W = 1080;
  const H = 1480;
  const cx = W / 2;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  const fonts: Fonts = {
    body: resolveFontFamily(input.fontHost, "--font-body", "system-ui, sans-serif"),
    script: resolveFontFamily(input.fontHost, "--font-caveat", "cursive"),
    // Template name fonts (defined on the .scarlet-inv wrapper the card lives in).
    heading: resolveFontFamily(input.fontHost, "--heading-family", "'Pinyon Script', cursive"),
    serif: resolveFontFamily(input.fontHost, "--body-text-family-2", "Georgia, serif"),
  };

  // Generate a high-res QR sharing the on-page palette (muted maroon on cream).
  const qrUrl = await QRCode.toDataURL(input.payload, {
    width: 720,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: C.qrDark, light: C.creamLight },
  });

  const [qrImg, rosesImg, leafImg, goldImg] = await Promise.all([
    loadImage(qrUrl),
    loadImage(`${ASSET_BASE}/burgundy-roses-bouquet.webp`),
    loadImage(`${ASSET_BASE}/green-leaves-branch.webp`),
    loadImage(`${ASSET_BASE}/gold-ornament.webp`),
    ensureFontsReady(fonts),
  ]);

  // ---- Background + frame ------------------------------------------------
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, C.creamLight);
  bg.addColorStop(1, C.paper);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Double rule frame (gold outer, beige inner) — echoes the section card.
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 3;
  roundRectPath(ctx, 30, 30, W - 60, H - 60, 40);
  ctx.stroke();
  ctx.strokeStyle = C.beige;
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, 44, 44, W - 88, H - 88, 30);
  ctx.stroke();

  // ---- Decorative ornament layer (drawn under the text) ------------------
  if (rosesImg) {
    drawByWidth(ctx, rosesImg, 6, 4, 252, "top-left");
    drawByWidth(ctx, rosesImg, W - 6, 4, 252, "top-right", true);
  }
  if (leafImg) {
    drawByWidth(ctx, leafImg, 30, H - 8, 214, "bottom-left");
    drawByWidth(ctx, leafImg, W - 30, H - 8, 214, "bottom-right", true);
  }
  if (goldImg) {
    // Tall hanging Javanese ornament centered at the top.
    drawContain(ctx, goldImg, cx - 70, 60, 140, 150);
  }

  // ---- Text + QR ---------------------------------------------------------
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Script eyebrow — the section's identity.
  ctx.fillStyle = C.sunflower;
  ctx.font = `700 46px ${fonts.script}`;
  ctx.fillText("QR Check-in", cx, 250);

  // Couple names (bride-first) — Pinyon Script in the invitation's red, exactly
  // as they render on the cover. Pinyon is a single-weight calligraphy script.
  const couple = `${input.brideName} & ${input.groomName}`;
  const coupleFont = (px: number) => `400 ${px}px ${fonts.heading}`;
  const couplePx = fitSize(ctx, couple, coupleFont, 600, 92, 46);
  ctx.fillStyle = C.nameRed;
  ctx.font = coupleFont(couplePx);
  ctx.fillText(clampText(ctx, couple, 600), cx, 330);

  // Date.
  if (input.dateLabel) {
    ctx.fillStyle = C.olive;
    ctx.font = `400 26px ${fonts.body}`;
    ctx.fillText(input.dateLabel, cx, 392);
  }

  // Gold divider.
  ctx.strokeStyle = C.gold;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 48, 432);
  ctx.lineTo(cx + 48, 432);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Guest the QR belongs to.
  ctx.fillStyle = C.olive;
  ctx.font = `600 14px ${fonts.body}`;
  ctx.fillText("A T A S   N A M A", cx, 476);

  // Guest name — the template's serif (Cormorant Garamond) italic, also in red;
  // a readable companion to the couple's Pinyon Script.
  const guestFont = (px: number) => `italic 600 ${px}px ${fonts.serif}`;
  const guestPx = fitSize(ctx, input.guestName, guestFont, 600, 40, 22);
  ctx.fillStyle = C.nameRed;
  ctx.font = guestFont(guestPx);
  ctx.fillText(clampText(ctx, input.guestName, 600), cx, 512);

  // QR tile — cream inset square with a gold inner ring (matches the page).
  const tile = 540;
  const tileX = cx - tile / 2;
  const tileY = 556;
  ctx.fillStyle = C.creamLight;
  roundRectPath(ctx, tileX, tileY, tile, tile, 28);
  ctx.fill();
  ctx.strokeStyle = C.gold;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 2;
  roundRectPath(ctx, tileX + 6, tileY + 6, tile - 12, tile - 12, 22);
  ctx.stroke();
  ctx.globalAlpha = 1;

  if (qrImg) {
    const pad = 44;
    const inner = tile - pad * 2;
    ctx.drawImage(qrImg, tileX + pad, tileY + pad, inner, inner);
  }

  // Footer instruction (wrapped).
  ctx.fillStyle = C.oliveDark;
  ctx.font = `400 25px ${fonts.body}`;
  const note = "Tunjukkan QR ini ke petugas buku tamu saat tiba untuk check-in.";
  const noteLines = wrapLines(ctx, note, 720, 2);
  const noteTop = tileY + tile + 60;
  noteLines.forEach((ln, i) => ctx.fillText(ln, cx, noteTop + i * 36));

  // Brand mark.
  ctx.fillStyle = C.gold;
  ctx.font = `700 30px ${fonts.script}`;
  ctx.fillText("maritare", cx, H - 96);

  // ---- Export ------------------------------------------------------------
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png"),
  );
  if (blob) return blob;

  // Fallback: derive a Blob from the data URL if toBlob yielded null.
  const dataUrl = canvas.toDataURL("image/png");
  const res = await fetch(dataUrl);
  return res.blob();
}

/** Build a filesystem-safe slug from a display name for the download filename. */
function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "qr"
  );
}

/**
 * Render the card and trigger a browser download. Returns once the click is
 * dispatched; the object URL is revoked on the next tick.
 */
export async function downloadFolkQrCard(input: FolkQrCardInput): Promise<void> {
  const blob = await renderFolkQrCard(input);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `qr-checkin-${slugify(input.guestName)}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

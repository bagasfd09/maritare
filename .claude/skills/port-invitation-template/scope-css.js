// Deterministic CSS scoping for a ported invitation theme.
//
//   node scope-css.js <slug> <source.css> <out-theme.ts> [themeClass]
//
// Every selector is scoped under `.<slug>-inv`: `body.<themeClass>` (the theme
// root, e.g. body.aulia) collapses to `.<slug>-inv`; bare `body`/`html`/`:root`
// also collapse to it; ANY OTHER classes on `body` are PRESERVED on the root
// (e.g. `body.original` → `.<slug>-inv.original`, `body.sukma` → `.<slug>-inv.sukma`).
// Local + brand-CDN asset url()s are rewritten to /invitation/<slug>/<basename>.
// @keyframes step selectors and the Google-fonts @import are left untouched
// (the @import must stay first in the emitted string).
//
// !! CRITICAL FOLLOW-UP !! Color presets (--background-primary, --text-primary,
// button colors, …) are usually defined on `body.<themeClass>.<preset>` (e.g.
// body.aulia.original), which becomes `.<slug>-inv.<preset>`. That selector only
// matches if the EMBED ROOT carries those preset classes. So set the embed's root
// to `className="<slug>-inv <preset1> <preset2>"` using the reference <body>'s
// OTHER classes (its `class="aulia original preset-original"` → add
// "original preset-original"). This script PRINTS the body classes you must add.
//
// Emits `export const <SLUG>_THEME_CSS = String.raw\`...\`` (or JSON.stringify if
// the CSS contains a backtick / ${ ). Re-parses the output to prove it's valid.
//
// postcss is resolved from the project's pnpm store (no extra dependency).

const fs = require("fs");
const path = require("path");

const SLUG = process.argv[2];
const SRC = process.argv[3];
const OUT = process.argv[4];
const THEME_CLASS = process.argv[5] || ""; // e.g. "aulia"; the body theme class fused into the root
if (!SLUG || !SRC || !OUT) {
  console.error("usage: node scope-css.js <slug> <source.css> <out-theme.ts> [themeClass]");
  process.exit(2);
}

// Resolve postcss from the project (script lives in .claude/skills/<name>/).
const PROJ = path.resolve(__dirname, "../../..");
function resolvePostcss() {
  try {
    return require(require.resolve("postcss", { paths: [PROJ] }));
  } catch {
    const pnpm = path.join(PROJ, "node_modules/.pnpm");
    const dir = fs.readdirSync(pnpm).find((d) => /^postcss@/.test(d));
    if (!dir) throw new Error("postcss not found under node_modules/.pnpm");
    return require(path.join(pnpm, dir, "node_modules/postcss"));
  }
}
const postcss = resolvePostcss();

const SCOPE = `.${SLUG}-inv`;
const CONST = SLUG.toUpperCase().replace(/[^A-Z0-9]/g, "_") + "_THEME_CSS";

const css = fs.readFileSync(SRC, "utf8");
const root = postcss.parse(css);

// `html`/`:root`/bare `body` → the scope root. `body.<themeClass>` → the scope
// root (the theme class is fused in). ANY OTHER classes on `body` are preserved
// as classes on the root (so non-active themes/presets correctly DON'T match a
// bare `.<slug>-inv`). Everything else becomes a descendant of the root.
const bodyClasses = new Set(); // non-theme body classes → must go on the embed root
function mapSelector(sel) {
  const s = sel.trim();
  if (!s) return sel;
  if (/^(html|:root)(?![\w-])/.test(s)) return s.replace(/^(html|:root)/, SCOPE);
  if (/^body(?![\w-])/.test(s)) {
    let rest = s.slice(4); // text after the "body" tag (".aulia.original", " .inner", "", …)
    if (THEME_CLASS && rest.startsWith("." + THEME_CLASS)) {
      const after = rest.slice(1 + THEME_CLASS.length);
      if (!/^[\w-]/.test(after)) rest = after; // fuse ".<themeClass>" into the root
    }
    // record the classes that remain on the root (so the embed can carry them)
    const m = rest.match(/^(?:\.[A-Za-z0-9_-]+)+/);
    if (m) for (const c of m[0].split(".").filter(Boolean)) bodyClasses.add(c);
    return SCOPE + rest;
  }
  return SCOPE + " " + s;
}

let ruleCount = 0;
let keyframeRules = 0;
root.walkRules((rule) => {
  const p = rule.parent;
  if (p && p.type === "atrule" && /keyframes$/i.test(p.name)) {
    keyframeRules++;
    return; // never prefix 0%/from/to step selectors
  }
  rule.selectors = rule.selectors.map(mapSelector);
  ruleCount++;
});

const urlBases = new Set();
function rewriteUrls(value) {
  return value.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, _q, url) => {
    const u = url.trim();
    // Leave the Google Fonts @import + data:/anchor refs untouched.
    if (u.includes("fonts.googleapis") || /^(data:|#)/i.test(u)) return m;
    // Local relative paths AND the owner's brand CDN → /invitation/<slug>/<base>.
    const base = u.split(/[\\/?#]/).filter(Boolean).pop();
    urlBases.add(base);
    return `url(/invitation/${SLUG}/${base})`;
  });
}
root.walkDecls((decl) => {
  if (decl.value && decl.value.includes("url(")) decl.value = rewriteUrls(decl.value);
});

const scoped = root.toString();
const safe = !scoped.includes("`") && !scoped.includes("${");
const body = safe
  ? `export const ${CONST} = String.raw\`\n${scoped}\n\`;\n`
  : `export const ${CONST} = ${JSON.stringify(scoped)};\n`;

const header =
  `// ${SLUG} theme CSS — ported VERBATIM from the source invitation stylesheet,\n` +
  `// scoped under .${SLUG}-inv with local asset url()s rewritten to /invitation/${SLUG}/.\n` +
  `// Generated by .claude/skills/port-invitation-template/scope-css.js — do not hand-edit;\n` +
  `// re-run the script against the source CSS instead. Injected as a <style> by the embed.\n\n`;

fs.writeFileSync(OUT, header + body, "utf8");
postcss.parse(scoped); // throws if the scoped output is invalid CSS

console.log(`scope        : ${SCOPE}`);
console.log(`const        : ${CONST}`);
console.log(`scoped rules : ${ruleCount}`);
console.log(`keyframes    : ${keyframeRules} (step selectors left intact)`);
console.log(`local url()s : ${urlBases.size}`);
console.log(`emission     : ${safe ? "String.raw" : "JSON.stringify"}`);
console.log(`wrote        : ${OUT} (${(header + body).length} bytes)`);
if (urlBases.size) console.log(`url bases    : ${[...urlBases].slice(0, 30).join("  ")}`);
if (bodyClasses.size) {
  console.log(
    `\n!! EMBED ROOT must carry these body classes (preset/palette rules are scoped to them):\n` +
      `   className="${SLUG}-inv ${[...bodyClasses].join(" ")}"\n` +
      `   (cross-check against the reference <body class="…"> — keep only its ACTIVE classes;\n` +
      `    classes for OTHER presets/themes should NOT be added, so those rules stay inert.)`,
  );
}

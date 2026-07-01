// Extract invitation-only rules from a SECONDARY stylesheet (the original page
// often splits the invitation CSS across files — e.g. the QR + RSVP/wish-form
// styling lives apart from the main theme). Pulls only rules whose selector
// matches one of the invitation classes your section components actually use,
// rejects anything that smells like builder/dashboard chrome, scopes the rest
// under `.<slug>-inv`, and rewrites local url()s.
//
//   node extract-extra.js <slug> <secondary.css> <out.css> "class1,class2,..."
//
// The 4th arg (comma-separated class names) defaults to a sensible set for the
// Katsudoto family. Review the printed selectors BEFORE wiring the output into a
// <slug>-theme-extra.ts const — confirm no chrome leaked in.

const fs = require("fs");
const path = require("path");

const SLUG = process.argv[2];
const SRC = process.argv[3];
const OUT = process.argv[4];
const NEED = (process.argv[5] ||
  "general-qrcode,img-qrcode,guest-name,guest-attendance,guest-party-size,guest-comment,ch-name-wrap,ch-name,wedding-wish-wrap,rsvp,submit,comment-outer,category-wish-wrap,e-invitation"
).split(",").map((s) => s.trim()).filter(Boolean);
if (!SLUG || !SRC || !OUT) {
  console.error('usage: node extract-extra.js <slug> <secondary.css> <out.css> "cls1,cls2,..."');
  process.exit(2);
}

const REJECT = [
  "navbar", "modal", "protocol", "confirm-payment", "selectize", "guest-config",
  "guest-card", "wa-chat", "whatsapp", "preview-design", "sidebar", "dashboard",
  "builder", "toolbar", "editor", "panel",
];

const PROJ = path.resolve(__dirname, "../../..");
const postcss = require(require.resolve("postcss", { paths: [PROJ] }));

const SCOPE = `.${SLUG}-inv`;
const ROOT_RE = /^(body(\.[A-Za-z0-9_-]+)?|html|:root)(?![\w-])/;
const mapSelector = (s) =>
  ROOT_RE.test(s.trim()) ? s.trim().replace(ROOT_RE, SCOPE) : SCOPE + " " + s.trim();
const rewriteUrls = (v) =>
  v.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, _q, u) => {
    u = u.trim();
    if (u.includes("fonts.googleapis") || /^(data:|#)/i.test(u)) return m;
    return `url(/invitation/${SLUG}/${u.split(/[\\/?#]/).filter(Boolean).pop()})`;
  });

const needRe = new RegExp("\\.(" + NEED.map((c) => c.replace(/-/g, "\\-")).join("|") + ")(?![\\w-])");
const rejectRe = new RegExp("(" + REJECT.join("|") + ")", "i");

const root = postcss.parse(fs.readFileSync(SRC, "utf8"));
const out = postcss.root();
let kept = 0, rejected = 0;

function take(rule, wrapMedia) {
  const sel = rule.selector || "";
  if (!needRe.test(sel)) return;
  if (rejectRe.test(sel)) { rejected++; return; }
  const clone = rule.clone();
  clone.selectors = clone.selectors.map(mapSelector);
  clone.walkDecls((d) => { if (d.value && d.value.includes("url(")) d.value = rewriteUrls(d.value); });
  if (wrapMedia) {
    const at = postcss.atRule({ name: "media", params: wrapMedia });
    at.append(clone);
    out.append(at);
  } else {
    out.append(clone);
  }
  kept++;
}

root.walkRules((rule) => {
  const p = rule.parent;
  if (p && p.type === "atrule" && /keyframes$/i.test(p.name)) return;
  if (p && p.type === "atrule" && p.name === "media") take(rule, p.params);
  else take(rule, null);
});

const text = out.toString();
fs.writeFileSync(OUT, text, "utf8");
console.log(`kept rules: ${kept} | rejected (chrome-smell): ${rejected} | bytes: ${text.length}`);
const sels = [];
out.walkRules((r) => sels.push(r.selector));
console.log("--- selectors kept (review these) ---\n" + sels.join("\n"));

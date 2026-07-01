---
name: port-invitation-template
description: >-
  Port a static HTML wedding-invitation reference (Katsudoto export, Themeforest
  download, any saved .html + _files) into a NEW data-driven maritare invitation
  template, faithfully ("sama persis"). Produces a registered slug under
  src/components/invitation/<slug>/ that renders from InvitationView like
  scarlet/folk. Use when the user wants to add, clone, port, or migrate an
  invitation template from an HTML/CSS reference; mentions Katsudoto, "tiru
  template", "bikin template baru dari referensi", "migrasi template", or hands
  over a .html invitation design.
---

# Port an HTML invitation reference into a maritare template

Reproduce the workflow that built the `ivory` template (a faithful port of the
Katsudoto "Aulia" / "Sinta & Fanny" reference). Goal: a NEW registered template
that looks byte-identical to the reference but is driven by `InvitationView` data,
following the established `scarlet`/`folk` pattern — not a one-off static page.

**Quality bar:** verbatim markup + the reference's own CSS scoped under a new
root class. Do NOT re-author the design by eye. The reference IS the spec.

This is a large, multi-phase build. Under ultracode, drive Phase 2 with a
`Workflow` fan-out (one agent per section + an adversarial verify stage). Without
ultracode, ask the user whether to run a workflow (it spawns ~28 agents); they
can opt in with "use a workflow".

---

## Target architecture (how scarlet/folk work — read one first)

A template = a registered React component tree, data-bound to `InvitationView`:

- `<slug>-embed.tsx` — `"use client"`. Wraps everything in `<div className="<slug>-inv">`,
  injects the scoped theme CSS via `<style>`, and drives the scroll reveal with an
  `IntersectionObserver` over `[data-aos]` nodes (gated behind `.aos-on` so the
  page stays visible if JS never runs). Reproduce the reference's outer shell
  skeleton here if the theme CSS depends on it (see Phase 0).
- `<slug>-theme.ts` — `export const <SLUG>_THEME_CSS` = the reference's invitation
  stylesheet, every selector scoped under `.<slug>-inv`. Generated, never hand-edited.
- `<slug>-<section>.tsx` — one component per reference `<section>`, reproducing its
  markup VERBATIM (keep every className — the scoped CSS targets those exact names),
  with only the data-bearing parts bound to `InvitationView`.
- `<slug>-template.tsx` — composes the sections inside the embed, in render order.
- Wiring: `registry.ts`, `slugs.ts`, `manifest.ts`, `scripts/seed.ts`.

**Read these contract files before writing anything:**
- `src/components/invitation/types.ts` — `InvitationTemplateProps`.
- `src/server/queries/invitation.ts` — the `InvitationView` shape (every section field).
- `src/lib/invitation/sections.ts` — per-section Zod schemas (exact field names/types).
- `src/lib/invitation/manifest.ts` — `TemplateManifest`, the per-template manifests.
- `src/components/invitation/registry.ts`, `slugs.ts`, `src/lib/invitation/demo.ts`.
- Canonical analogs to MIRROR: `src/components/invitation/scarlet/**` and
  `src/components/invitation/folk/**` (folk adds an opening gate + cerita/story +
  hero; scarlet is the inline-cover baseline). Reuse `scarlet/inv-image` (`InvImage`),
  `scarlet/scarlet-audio` (`ScarletAudio`, data-driven — reuse as-is), `flora/format`
  (`formatFullDateId`/`formatTimeRangeId`/…), and `folk/folk-qr` (`FolkQr`).

---

## Phase 0 — Orient (read the reference; do NOT skip)

The reference is a saved `<name>.html` + a `<name>_files/` asset dir. Establish:

1. **Theme + fonts.** `grep` the html `<title>`, `font-family`, the Google Fonts
   `@import`/`<link>`. Katsudoto names the theme in CSS `body.<themeclass>{…}` and
   in the brand-CDN url path (`…/template/exclusive/<theme>/…`).
2. **Which CSS file is the invitation theme.** `_files` holds many stylesheets
   (vendor: slick/aos/lightgallery/flexbin/selectize/video-js + the platform's
   own). Find the one with the most invitation selectors (`.cover`, `.couple-wrap`,
   `.agenda`, `.love-story`, …) and the `body.<theme>{--vars}` root — that's the
   main theme. A SECOND file often carries the QR + RSVP/wish-form rules (see Phase 1c).
   The big dashboard-chrome file (`.navbar`, `.modal`, `.protocol`, `.confirm-payment`)
   is NOT invitation CSS — ignore it.
3. **Section list + order.** `grep -noiE '<section[^>]*class="..."'` the body to get
   the ordered section classes (cover, quote-wrap, couple-wrap, save-date-wrap,
   agenda-wrap, general-qrcode, photo-wrap, video-gallery, love-story,
   wedding-gift-wrap, ig-filter-wrap, wedding-wish-wrap, notes-container,
   footnote-wrap, footer, music-outer, …). Record each section's start line.
4. **The shell skeleton.** Check whether the theme CSS references wrapper selectors
   (`grep -oF '.primary-pane' theme.css | wc -l`, also `kat-page`, `secondary-pane`,
   `inner-wrapper`). If yes, the layout DEPENDS on that skeleton — reproduce it in
   the embed. (Aulia: `body > kat-page__side-to-side > {primary-pane = decorative
   side panel with bg ornaments + "The Wedding Of {names}" intro; secondary-pane =
   the scrolling invitation sections}`. Counter-intuitive naming — verify by reading
   which pane actually contains the `<section class="cover">`.)
5. **JS-driven widgets per section.** `grep` each section fragment for
   `slick|swiper|lightgallery|lg-uid|video-js|modal-video|countdown`. These libs are
   NOT loaded in the port → verbatim conversion renders an EMPTY widget. Each must
   become a static render or a real React component (see ruleset rule 5).
   `flexbin` + `aos` are CSS/observer-driven and survive — keep them.
6. **Opening gate?** Look for a separate "Buka Undangan"/"Dear {guest}" overlay vs
   an inline cover. (Aulia has no gate — cover is inline; so music starts on first
   interaction, `waitForOpen={false}`. Folk HAS a gate — different wiring.)
7. **Sections with no data home.** Identify reference sections maritare has no field
   for (Instagram AR filter, a generic video gallery, custom notes). These are
   judgment calls — see "Decisions to surface".

Carve each section's markup to a scratchpad file by line range so Phase 2 agents
get a clean, small fragment instead of scanning the 300KB html.

---

## Phase 1 — CSS + assets (deterministic — do this yourself, no agents)

a. **Scope the theme CSS** (this skill ships the script — pass the theme's body
   class, e.g. `aulia`):
   ```
   node .claude/skills/port-invitation-template/scope-css.js <slug> <main-theme.css> \
     src/components/invitation/<slug>/<slug>-theme.ts <themeClass>
   ```
   It scopes every selector under `.<slug>-inv`, collapses `body.<themeClass>`/`html`/
   `:root` to the root, PRESERVES other body classes (`body.original` →
   `.<slug>-inv.original`), leaves `@keyframes` steps + the Google `@import` alone,
   rewrites local + brand-CDN url()s to `/invitation/<slug>/<basename>`, and re-parses
   the output to prove it's valid.

   **CRITICAL — read the script's output.** It prints `EMBED ROOT must carry these
   body classes`. The color palette (`--background-primary`, `--text-primary`, button
   colors) is almost always defined on `body.<themeClass>.<preset>` (e.g.
   `body.aulia.original`) → scoped to `.<slug>-inv.original`. That ONLY matches if the
   embed root carries the `original` class. Cross-check the printed list against the
   reference `<body class="…">` and use its ACTIVE classes for the embed root
   (Phase 3). Skip this and the whole template renders with default browser colors
   (white bg / black text) even though the ornament images make it look "fine".

b. **Copy assets:** every `png/jpg/jpeg/webp/svg/gif` from `_files/` →
   `public/invitation/<slug>/`. Then verify every `/invitation/<slug>/<base>` referenced
   by the sections AND the theme exists there (a missing ornament = broken `<img>`).

c. **Second-stylesheet rules** (if Phase 0 found QR/form CSS elsewhere):
   ```
   node .claude/skills/port-invitation-template/extract-extra.js <slug> <secondary.css> \
     /tmp/extra.css "general-qrcode,img-qrcode,rsvp,ch-name-wrap,..."
   ```
   REVIEW the printed selectors (no chrome leaked), then paste the result into
   `<slug>-theme-extra.ts` as `export const <SLUG>_EXTRA_CSS` and inject it as a
   second `<style>` in the embed.

d. **Brand-CDN textures** (e.g. `mask-cover`, `texture-1`) are usually hotlink-
   protected (403) — they no-op as background layers (acceptable, same as scarlet).
   The scope script already localizes their url()s so there's no external dependency.

---

## Phase 2 — Sections (the fan-out)

Build ONE component per section. Each is a verbatim HTML→JSX conversion + data
binding. Author then adversarially verify+fix each. Under ultracode, use a
`Workflow` pipeline; the proven shape is in this repo's history — give each agent:
its carved fragment, the **Conversion ruleset** below, a per-section binding spec
("mirror analog X exactly, keep ivory's markup"), and the analog file path.

**Lesson:** the largest fragment (agenda, ~650 lines) can stall a streaming agent
mid-response. If a section comes back null, re-run it as a single focused `Agent`
with the same prompt — don't hand-port 650 lines unless that also fails.

Map each section to its analog so bindings aren't reinvented:
- cover → `scarlet/sections/scarlet-cover` · quote → `scarlet-quote` · couple →
  `scarlet-couple` · savedate(+countdown, client) → `scarlet-savedate` · agenda →
  `scarlet-agenda` · gallery → `scarlet-gallery`/`folk-gallery` · story → `folk-story`
  · gift(+kado) → `scarlet-gift` · wishes(+RSVP, client) → `scarlet-wishes` +
  `folk-rsvp` · thank-you/notes → `scarlet-thankyou` · footnote → `scarlet-footnote`
  · footer (swap brand → Maritare) → `folk-footer` · QR → `folk-qr` · audio → reuse
  `ScarletAudio` directly in the template.

### Conversion ruleset (give this to every section agent, verbatim)

1. ONE `.tsx` file, named export `<Slug><Section>`. SERVER component unless it needs
   state/effects (countdown, forms) → then `"use client"`.
2. Props: `{ data: InvitationView; mode: "public"|"ownerPreview"|"editorPreview"; … }`.
   `import type { InvitationView } from "@/server/queries/invitation"`.
3. Reproduce the fragment markup verbatim. KEEP every className exactly (the scoped
   CSS targets them). KEEP all `data-aos`/`data-aos-duration`/`data-aos-delay`.
4. HTML→JSX: `class`→`className`, `for`→`htmlFor`, `tabindex`→`tabIndex`, self-close
   void els, inline `style="a:b;c:d"`→`style={{ a:'b', c:'d' }}` (camelCase), SVG attrs
   camelCased, `<!-- -->`→`{/* */}`, `&amp;`→`&`.
5. STRIP runtime AOS artifacts: remove `aos-init`/`aos-animate` from className (KEEP
   `data-aos*`); remove baked inline `style="opacity:…;transition-…"` (the observer
   drives reveal). STRIP JS-widget scaffolding — slick-* wrappers/attrs, lightgallery
   (`lightgallery` class + `lg-uid` + `data-lg-*`), swiper-*, video-js — and convert
   the carousel/slider to a static render (single image, or `.map` over the data).
6. Decorative ornament `<img>` (from `_files` or a brand CDN): keep as RAW
   `<img loading="lazy" decoding="async" src="/invitation/<slug>/<basename>" alt="…"/>`;
   rewrite EVERY such src to `/invitation/<slug>/<basename>`. Add at file top:
   `/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */`.
7. DATA photos (cover/couple/gallery/closing/story): use `<InvImage>` (from
   `../scarlet/inv-image`), NOT raw `<img>`. Never keep the reference's concrete photo
   src — bind to the InvitationView URL.
8. Replace concrete couple data (names, dates, bank numbers, IG handles, addresses)
   with InvitationView expressions per the spec. KEEP all non-data design copy
   (English headings/captions) verbatim.
9. Self-hide: `return null` when the section's data is empty (mirror the analog).
10. Do NOT emit the shell wrappers (primary/secondary-pane/.inner) — the embed
    provides them. The component root is the fragment's own top-level `<section>`.
11. Imports are relative from `src/components/invitation/<slug>/`: `../scarlet/inv-image`,
    `../flora/format`, `@/lib/invitation/sections`. When mirroring an analog, READ it
    first and reuse its EXACT data expressions, helper logic, and (for forms) its
    server-action imports + field names — invent nothing.

---

## Phase 3 — Wiring

- `<slug>-embed.tsx`: clone `scarlet-embed`/`ivory-embed` — `.<slug>-inv` root that
  injects `<SLUG>_THEME_CSS` (+ any extra CSS) + the AOS reveal observer, reproducing
  the shell skeleton (Phase 0.4). **Set the root className to `"<slug>-inv <preset…>"`
  using the body classes the scope script reported** (e.g. `"ivory-inv original preset-original"`)
  — without them the palette never applies.
- `<slug>-template.tsx`: compose `<SlugEmbed primary={…}>{sections}</SlugEmbed>` in
  reference order (drop the sections decided out in "Decisions"). Reuse `ScarletAudio`.
- `registry.ts`: add `<slug>: <Slug>Template`.
- `slugs.ts`: add `<slug>` to `RENDERABLE_TEMPLATE_SLUGS`. (Optional: add a
  `TEMPLATE_THUMBS` entry once you have a `public/invitation/thumbs/<slug>.webp`.)
- `manifest.ts`: add `<SLUG>_MANIFEST` (form groups + photo slots) + register it in
  `TEMPLATE_MANIFESTS`. Include `cerita` if the template has a story section; a
  `closing` photo slot if the footnote uses one.
- `scripts/seed.ts`: add the row to `TEMPLATE_SEED` (slug/name/style/category/palette/
  status:"published"/manifest) AND add the slug to `KEEP_TEMPLATE_SLUGS`.

**Catalog visibility (the easy-to-miss step):** the customer + admin template menus
read the DB `templates` table (`status='published' AND deleted_at IS NULL`), NOT the
code. A new template does NOT appear until a row exists. The full `pnpm db:seed`
DELETES + re-seeds the demo wedding's guests/wishes — do NOT run it just for a
template. Instead do a TARGETED upsert (see `scripts/seed-ivory.ts` as the pattern,
or generalize it) and run it: `node --env-file=.env.local scripts/seed-<slug>.ts`.

---

## Phase 4 — Verify

1. `pnpm typecheck` (whole project) — must be clean.
2. `npx eslint "src/components/invitation/<slug>/**/*.{ts,tsx}"` — scope to the new
   dir; the global `pnpm lint` reports hundreds of pre-existing errors inside `.next/`
   build artifacts — ignore those, they are not your code.
3. `pnpm build` — the real SSR/boundary test (`/inv/preview/[slug]` must compile).
4. Render + screenshot (no browser extension needed — Chrome is installed):
   ```
   pnpm dev   # background; note the port
   # full mobile render (tall window forces every [data-aos] to reveal):
   "/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu \
     --hide-scrollbars --user-data-dir=<tmp> --window-size=430,15000 \
     --virtual-time-budget=10000 --screenshot=<out.png> \
     http://localhost:3000/inv/preview/<slug>
   # crisp cover: --window-size=430,1400 --force-device-scale-factor=2
   # desktop side-to-side: --window-size=1280,1400
   ```
   Read the PNGs and compare to the reference. (The reference html itself does NOT
   screenshot well headless — its slick/lightgallery/AOS JS doesn't run, so it goes
   blank below the cover. Compare the cover, and judge the ported sections on their
   own faithfulness.)
   **Check the palette actually applied:** section backgrounds + text should be the
   theme's colors, NOT white-bg/black-text. If everything looks washed-out/default,
   the embed root is missing its preset classes (Phase 1a / Phase 3).
5. **Hand-verify the high-risk files yourself** (build green proves it compiles, not
   that it's correct; LLM verification alone is insufficient):
   - **wishes** — the submit MUST call the real `submitInvitationResponse` from
     `@/server/actions/invitation` with the SAME object shape as `scarlet-wishes`
     (`{slug, name, attending, partySize, message, website}`). A hallucinated action
     or renamed field typechecks but fails at submit. Forms can't be tested live in
     preview (forms are disabled in `editorPreview`/`ownerPreview`) — the diff vs the
     analog is the only check. Tell the user a real submit test needs a published
     invitation in the DB.
   - **gift** — the `guestSide` filter is a PRIVACY feature (CLAUDE.md): `?g=` links
     must hide the other family's accounts. Confirm `visibleForSide` is identical to
     `scarlet-gift` (`!guestSide||guestSide==="both"` → all; else `side==="both"||side===guestSide`).
   - **savedate** — countdown must init state to 0 and do all `Date` math inside a
     `useEffect` (hydration-safe), clamped `Math.max(0, …)`. Demo `eventDate` is often
     today (degenerate ~0) — mentally run it with a future date.
   - **couple** — confirm the groom/bride render ORDER matches the reference (read the
     reference's actual first card), not just "matches scarlet".

---

## Decisions to surface to the user (AskUserQuestion, before Phase 2)

- **Slug/name** for the new template.
- **Sections with no data home** (Instagram filter, video gallery, custom notes):
  drop / keep static / bind to nearest field. Default to DROP non-functional ones
  and say so.
- **No-schema-field design bits** (couple monogram upload, wedding hashtag): adding a
  field = a schema change (CLAUDE.md says ask first). Default to dropping them and
  binding the title to names; offer to add a field later.
- **Scale/approach** — staged vs one-shot; confirm a workflow run if not ultracode.

---

## Known caveats to report honestly (don't silently ship)

- Icon fonts (`fab fa-instagram`, Phosphor `ph ph-*`) aren't bundled → glyphs won't
  show (links/text still work). Replace with inline SVG if the user wants the icon
  (scarlet-gift shows the pattern).
- Brand-CDN textures/masks 403 → no-op background layers.
- Catalog thumbnail falls back to the abstract `MiniInvite` swatch card until you add
  `public/invitation/thumbs/<slug>.webp` + a `TEMPLATE_THUMBS` entry.
- Static copy buttons (gift) won't copy unless the section is a client component with a
  clipboard handler (scarlet-gift has it).
- The catalog preview uses `demoInvitation(slug)` (neutral placeholder photos), so
  catalog renders show silhouette dummies — real weddings use uploaded photos.

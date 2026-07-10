---
name: standardize-invitation-template
description: >-
  Upgrade a ported maritare invitation template (fresh from
  /port-invitation-template, or a legacy slug) to the maritare behavior
  standard established on ivory + sienna: opening gate, folk-style gift &
  wishes, story slider, QR check-in, editor Sampul wiring, and the recurring
  ported-CSS bug fixes — while PRESERVING that template's own visual identity.
  Use when the user asks to "samakan dengan ivory/sienna", "berlakukan hal yang
  sama", "standarkan template", "benerin template X kayak Y", mentions template
  parity, or right after a new template port lands.
---

# Standardize a maritare invitation template

Apply the behavior standard built on **ivory** (2026-07-09 session) and re-applied
to **sienna**. The canonical references ARE the code — read them, don't reinvent:

| Area | Canonical reference (mirror the logic 1:1) |
|---|---|
| Opening gate | `src/components/invitation/ivory/ivory-cover-gate.tsx`, `sienna/sienna-cover-gate.tsx` |
| Gift | `ivory/ivory-gift.tsx`, `sienna/sienna-gift.tsx` |
| Wishes + RSVP | `ivory/ivory-wishes.tsx`, `sienna/sienna-wishes.tsx` (+ `folk/folk-wishes.tsx` = origin, exports `burstConfetti(origin, colors)`) |
| Story slider | `ivory/ivory-story.tsx`, `sienna/sienna-story.tsx` (origin: `folk/folk-story.tsx`) |
| QR check-in | `ivory/ivory-qr.tsx`, `sienna/sienna-qr.tsx` |
| Embed CSS + editor fixes | `ivory/ivory-embed.tsx`, `sienna/sienna-embed.tsx` (the commented CSS blocks explain every fix) |
| Template wiring | `ivory/ivory-template.tsx`, `sienna/sienna-template.tsx` |
| Editor forms | `src/components/molecules/editor-forms/hero-form.tsx` (heroAsset/closingAsset flags), `active-section-form.tsx` |

**Prime directive:** port the BEHAVIOR, keep the target template's IDENTITY —
its own section markup/classes, ornament assets (`public/invitation/<slug>/`),
palette, and fonts. Never copy another template's hex colors or ornament PNGs.

---

## Phase 0 — Recon (do this before editing anything)

1. **Palette reality check.** Grep `<slug>-theme.ts` for `--background-primary:`
   (WITH colon). Some ports (sienna) reference palette vars that are NEVER
   DEFINED (the reference's preset stylesheet wasn't part of the ported file) —
   rules using them silently no-op. If undefined: collect the template's working
   hexes (`grep -rhoE '#[0-9a-fA-F]{3,8}' src/components/invitation/<slug>/*.tsx`,
   plus eyeball a screenshot) and use PLAIN HEXES (or `var(--x,#hex)` fallbacks)
   in every new rule. If defined (ivory: `.ivory-inv.original{...}`), use the vars
   (check whether `-rgb` variants exist before writing `rgba(var(--x-rgb),…)`).
2. **Mask health.** Grep the theme for `mask-image:` and verify every referenced
   `url(/invitation/<slug>/…)` file exists on disk. A broken `mask-image` clips
   the element to NOTHING in Chrome/Safari — this silently blanked ivory's cover
   AND couple photos. Fix in embed CSS: `mask-image:none` + an equivalent CSS
   clip (`border-radius:50%;overflow:hidden` for ovals). A 403'd `background`
   is a harmless no-op; a 403'd mask is NOT.
3. **Pane rules.** Extract the base rules for `.kat-page__side-to-side`,
   `.primary-pane` (desktop: usually `position:fixed;width:61%`) and the mobile
   `@media (max-width:960px)` variant (usually `display:none`) — the gate and
   the editor fix both override these.
4. **Section inventory.** Read `<slug>-template.tsx`: does it have a gate? a QR
   section? a Maritare footer? what does the gift/wishes/story currently do?
   Read `<slug>-primary-pane.tsx` (props! some take `guestName`) and check
   whether the pane already contains the cover photo (sienna: yes → gate needs
   no extra portrait; ivory: no → gate got a centered oval cover photo).
5. **Manifest + seed.** Read the slug's manifest in `src/lib/invitation/manifest.ts`
   and confirm `scripts/seed-<slug>.ts` + the `db:seed:<slug>` npm script exist.
   The DB `templates.manifest` column is AUTHORITATIVE — code edits do nothing
   until the seed is re-run.

---

## Phase 1 — The checklist (one area at a time)

Work in this order; run `pnpm typecheck` + targeted `pnpm exec eslint` after each
area. Keep prop changes backward-compatible so typecheck stays green mid-way.

### 1. Wedding Gift (`<slug>-gift.tsx`)
- Merge `accounts` + `ewallets` into ONE card list `{label, number, holder}`,
  both filtered by `visibleForSide(side, guestSide)` (privacy rule — never drop it).
- `resolveBankLogo(card.label)` from `@/lib/invitation/bank-logos` — logo `<img
  class="bank-logo">` replaces the name text when available; text fallback
  otherwise. Aliases already cover gopay/ovo/dana/etc.
- "Buka Amplop" gated in **EVERY mode** (`useState(false)`), button inside a
  taller `wedding-gift-reveal-panel` (min-height ~200-220px, template-toned
  surface) so the closed state keeps visual weight.
- All accounts in ONE internally-scrolling framed box (`<slug>-gift-scroll`:
  max-height ~340px, hidden scrollbar, light rows + hairline dividers — strip
  per-account heavy boxes).
- Copy buttons must be real `<button>`s with `navigator.clipboard`: numbers
  copied with `replace(/[\s-]/g,"")`, address verbatim, per-key "Tersalin" flip
  for 2s, timer cleaned up on unmount. (Clipboard needs HTTPS/localhost.)
- `giftAddress` folds INTO the section below the rows ("Kirim Kado" card +
  Copy Address) behind the same reveal; DELETE any standalone "Send us a
  gift"/kado section. Render the section when cards OR address exist.

### 2. Wishes + RSVP (`<slug>-wishes.tsx`)
- Mirror `ivory-wishes.tsx` wholesale (it IS the folk model): optional
  `checkin?: InvitationCheckin | null` prop; Hadir/Berhalangan pills +
  "Datang bersama siapa?" (Sendiri/Partner/Keluarga → 1/2/4, `sizeFor`
  preserves a recorded headcount); answered → "sudah konfirmasi" summary +
  "Ubah jawaban" (keyed guests only, and only when `result.attendanceSaved`);
  wish required except keyed-guest pill-only submits; honeypot; optimistic
  prepend with `pendingModeration` → "Menunggu persetujuan" in the list;
  confetti via `burstConfetti(submitRef.current, COLORS)` with ~5 hexes from
  the template palette; the exact Bahasa validation/notice strings.
- Attendance panel: template-toned cream surface, `min-h-[200px]` with
  vertically centered content, 1–2 SMALL template ornaments tucked BEHIND the
  content (`pointer-events-none` + `z-0`, interactive blocks `relative z-10`),
  `[font-family:var(--body-text-family)]` on the panel (Tailwind `font-body`
  is the APP font, not the template's).
- List: ONE card per wish (embed CSS), pagination `WISHES_PAGE = 5` +
  "Muat ucapan lainnya".
- Recurring ported-CSS bugs: `.wedding-wish-form .form-control` usually lacks
  Bootstrap's `width:100%` (inputs collapse to ~20ch) and `.form-group` lacks
  vertical rhythm (`margin-bottom:12px`). Check + fix in embed CSS.

### 3. Story slider (`<slug>-story.tsx`)
- `"use client"` scroll-snap track (folk mechanism): `flex snap-x
  snap-mandatory overflow-x-auto` + hidden scrollbars, `goTo`/`onScroll`,
  inline-SVG arrows + dots in template colors, hidden when 1 slide.
- Slides: `w-full min-w-full max-w-full shrink-0 snap-center overflow-hidden`.
  The `max-w-full` is CRITICAL — a natural-size frame image inside a flex item
  grows the slide past the track and one photo spans two snap points (ivory bug:
  722px slides on a 390px track). If the design's frame art renders at natural
  size, also force it to scale in embed CSS (`width:100%;height:auto`).
- **1 slide = 1 foto**: only chapters WITH a resolved photo become slides;
  all-text data falls back to text chapters so nothing is lost. Items from
  `cerita.items` (photoId → `data.photos`), legacy fallback
  `parseStoryChapters(cerita.body)` from `folk/folk-story-parse`.
- **REMOVE `data-aos` from everything inside slides** — horizontally off-screen
  slides never intersect vertically, so the AOS observer leaves them opacity-0
  (blank after swiping). Keep the reveal only on the section heading.
- `overflow-wrap:anywhere` on the title + caption classes (long unbroken words
  run sideways otherwise).

### 4. QR check-in (`<slug>-qr.tsx`, usually NEW)
- Mirror `ivory-qr.tsx`: `qrcode` lib, `SAMPLE_PAYLOAD = "MARITARE-CONTOH-QR"`
  dimmed 30% for non-keyed views, props `{checkin, brideName, groomName,
  eventDate}` (names/date reserved for a future keepsake card).
- QR colors: a deep tint from the template palette on a light cream —
  must stay high-contrast/scannable.
- Head (small ornament + `h1` — the theme's `h1` rule gives the heading font
  free — + the standard Bahasa explainer strings) + framed card. Corner
  ornaments sit BEHIND the QR (`z-0` + QR wrapper `relative z-index:1`) — the
  code must NEVER be covered.
- Template slot: between agenda and gift.

### 5. Opening gate (`<slug>-cover-gate.tsx`, NEW)
- Mirror the gate mechanism EXACTLY: fixed `inset-0 z-[80]` overlay, slide-up
  exit (`EXIT_MS 850`), body scroll lock skipped in `editorPreview`,
  `handleOpen` dispatches `new Event("maritare:open-invitation")` synchronously
  in the click (audio needs the user gesture).
- Gate content = the template's PRIMARY PANE full-screen: a shell div carrying
  the embed root's EXACT preset classes (e.g. `"<slug>-inv original
  preset-original <slug>-gate"`) → `section.kat-page__side-to-side >
  section.primary-pane > div.inner > <SlugPrimaryPane …/>`. No `aos-on` on the
  gate root → ornaments render visible without the observer.
- Embed CSS overrides (`.<slug>-inv.<slug>-gate …`): pane `display:block;
  position:absolute;inset:0;width:100%` + `height:100%` up the chain —
  overriding BOTH the desktop fixed-61% rule and the mobile display:none rule.
- If the pane has NO photo (ivory): add a centered oval cover portrait
  (`aspect-[3/4] rounded-[50%]`, template-toned ring, `pointer-events-none`,
  `md:` smaller + nudged down to clear the desktop title). If the pane already
  shows the cover photo (sienna), skip it.
- Check the pane's text contrast over the photo — sienna's wash used an
  UNDEFINED `--light-rgb` var (invisible gradient); re-declare it with concrete
  colors in embed CSS.
- Bottom overlay: optional "Kepada Yth. {guestName}" (skip if the pane already
  greets, e.g. sienna's "Dear,") + "Buka Undangan" pill (envelope `Icon`) in
  template button colors. May need a gate-only `margin-bottom` bump on the
  pane's text block + a `max-width:560px` font clamp so nothing collides with
  the button on phones.
- Template: render the gate BEFORE the embed (fragment), pass
  `guestName={checkin?.guestName ?? guestName}`, and switch `ScarletAudio` to
  `waitForOpen={mode !== "editorPreview"}`.

### 6. Small parity fixes
- **Cover**: honor `data.sections.pasangan.showHeroText` — wrap ONLY the text
  head/foot (names/date), never the artwork.
- **Couple**: display ONE name — `fullName || nickname`, never
  `"{nickname} — {fullName}"` (reads as "Bagas — Bagas").
- **Footer**: delete the Maritare-credit footer component + its template usage
  (`grep -rl "SlugFooter" src/` first).

### 7. Editor wiring (shared files — do these LAST, single-threaded)
- `manifest.ts`: add `{ id: "hero", label: "Sampul", order: 1 }` to the slug's
  formGroups (renumber the rest). The Sampul form uploads the gate/cover photo
  (isCover) + closing photo.
- `hero-form.tsx` flags via `active-section-form.tsx`:
  `heroAsset` (full-bleed Hero block) = folk only;
  `closingAsset` (Foto/Video Penutup block) = only templates whose closing
  section renders the isClosing photo (folk, ivory) — text-only footnotes
  (sienna, plum) pass false.
- `<slug>-embed.tsx`: add the `forceMobile?: boolean` prop + CSS
  (`.<slug>-inv.force-mobile …` mirroring the theme's own ≤960px pane rules).
  The editor phone preview is a SCALED DIV, not an iframe — desktop media
  queries still match inside it, so without this the side pane squeezes into
  the phone frame.
- Template: `forceMobile={mode === "editorPreview"}` on the embed.
- **Re-run `pnpm db:seed:<slug>`** — the DB manifest column is authoritative;
  the editor won't show Sampul until the row is upserted.

---

## Phase 2 — Verify (never skip)

1. `pnpm typecheck` + `pnpm exec eslint src/components/invitation/<slug>/`.
2. Headless browser against the running dev server
   (`http://localhost:3000/inv/preview/<slug>`). Playwright-core known-working
   require path on this machine:
   `D:/self_project/dashboard-automation/node_modules/.pnpm/playwright-core@1.58.2/node_modules/playwright-core`
   (script files go in the session scratchpad, `node <script>` runs them).
3. Assert, at 390×844 AND 1280×800:
   - gate renders, `button:has-text("Buka Undangan")` exists, click → gate gone;
   - `.wedding-gift-reveal-btn` click reveals the scroll box; bank logo `<img>`
     present when the demo account is BCA;
   - pills panel (`.guest-attendance-wrap`) renders;
   - story track geometry: every slide width === track clientWidth (the
     one-photo-two-slides regression);
   - QR section present, ornaments not overlapping the QR;
   - element screenshots of gate/gift/wishes/QR/story — EYEBALL them (geometry
     asserts miss visual collisions like text over dark photos).
4. Editor: reload, confirm the "Sampul" chapter appears and the phone preview
   isn't split into two panes.

## Recurring gotchas index (why things look broken)

- Undefined palette vars in ported CSS → rules silently no-op (sienna). Use hexes/fallbacks.
- Broken `mask-image` (missing PNG) → element renders BLANK, not unmasked (ivory cover/couple).
- Icon fonts (Phosphor/FontAwesome) are NOT bundled → `<i class="ph …">` renders empty; use inline SVGs.
- AOS observer + horizontal sliders → off-screen slides stay opacity-0; no data-aos inside slides.
- Editor preview = scaled div → desktop media queries apply; forceMobile.
- Flex slides without `max-w-full` → natural-size art blows the slide past the track.
- Missing Bootstrap `width:100%` on `.form-control` → half-width inputs.
- `Tailwind font-body/font-display` = APP fonts; template fonts come from `var(--body-text-family)` / theme `h1` rules.
- Backticks inside CSS comments in embed template literals TERMINATE the string (typecheck catches it — don't write `` ` `` in those comments).
- DB manifest is authoritative — always re-seed after manifest edits.
- Drifting/absolute decorative ornaments were positioned for the ORIGINAL tall
  stacked layout — compacting a section (scroll box, reveal panel) can land them
  ON content (plum's gift clouds). Lift the content: `position:relative;z-index:2`.
- A pane element dead-center (plum's stacked 3-line couple name) collides with
  the gate's oval portrait — hide it in the gate with `visibility:hidden` (NOT
  display:none, which collapses its box and shifts siblings like the greeting).
- `pnpm typecheck` failing with parse errors in `.next/dev/types/routes.d.ts` =
  a dev-server write race corrupted the GENERATED file — delete it (regenerates
  on the next request); it's never your code.

// Pure parser for the Folk "Our Story" slideshow: turns the free-text `cerita`
// body into ordered chapters (one per slide). Kept JSX-free so it can be unit
// tested with `node folk-story-parse.test.ts`.
//
// Two input styles, both supported so the shared editor textarea stays free-form:
//   1. Markdown headings — "## Judul bab" starts a titled chapter; the prose
//      below it (until the next heading) is that chapter's body. A leading
//      "1." / "2)" in the heading becomes the slide numeral.
//   2. Plain blank-line blocks — each paragraph becomes an untitled slide.
// This also means single-paragraph stories still render (just one framed slide),
// and the blank-line form degrades cleanly in templates that don't slide.

export type StoryChapter = {
  /** Zero-padded slide numeral ("01"). From a leading "1." in the title, else the position. */
  num: string;
  /** Optional chapter heading. */
  title?: string;
  /** Chapter prose; may still contain blank-line paragraph breaks. */
  body: string;
};

const HEADING = /^#{1,6}\s+(.*)$/;
const LEADING_NUMBER = /^(\d+)\s*[.)]\s*(.*)$/;

export function parseStoryChapters(raw: string): StoryChapter[] {
  const text = (raw ?? "").trim();
  if (!text) return [];

  const blocks: { title?: string; body: string }[] = [];
  if (/^#{1,6}\s+/m.test(text)) {
    // Heading-delimited: split on "##" lines, gather prose under each.
    let cur: { title?: string; body: string } | null = null;
    for (const line of text.split(/\r?\n/)) {
      const h = line.match(HEADING);
      if (h) {
        if (cur) blocks.push(cur);
        cur = { title: h[1].trim(), body: "" };
      } else {
        if (!cur) cur = { body: "" }; // prose before the first heading
        cur.body += line + "\n";
      }
    }
    if (cur) blocks.push(cur);
  } else {
    // Plain: each blank-line-separated block is one slide.
    for (const block of text.split(/\n{2,}/)) blocks.push({ body: block });
  }

  return blocks
    .map((b) => ({
      title: b.title?.trim() || undefined,
      body: b.body.replace(/\n{3,}/g, "\n\n").trim(),
    }))
    .filter((b) => b.title || b.body)
    .map((b, i): StoryChapter => {
      let title = b.title;
      let num = String(i + 1).padStart(2, "0");
      if (title) {
        const m = title.match(LEADING_NUMBER);
        if (m && m[2].trim()) {
          num = m[1].padStart(2, "0");
          title = m[2].trim();
        }
      }
      return { num, title: title || undefined, body: b.body };
    });
}

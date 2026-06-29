// Run: node src/components/invitation/folk/folk-story-parse.test.ts
import assert from "node:assert/strict";

import { parseStoryChapters } from "./folk-story-parse.ts";

// Markdown headings with leading numbers (the documented "## 1. Title" format),
// heading and prose separated by a blank line like the sample content.
{
  const md = [
    "## 1. Where It All Began (2013)",
    "",
    "Kisah kami bermula dari sebuah pertemuan sederhana.",
    "",
    "## 2. Choosing Forever",
    "",
    "Dengan penuh syukur, kami memilih satu sama lain.",
  ].join("\n");
  const ch = parseStoryChapters(md);
  assert.equal(ch.length, 2);
  assert.deepEqual(ch[0], {
    num: "01",
    title: "Where It All Began (2013)",
    body: "Kisah kami bermula dari sebuah pertemuan sederhana.",
  });
  assert.deepEqual(ch[1], { num: "02", title: "Choosing Forever", body: "Dengan penuh syukur, kami memilih satu sama lain." });
}

// Plain blank-line blocks → untitled slides, positional numerals.
{
  const ch = parseStoryChapters("First para.\n\nSecond para.");
  assert.equal(ch.length, 2);
  assert.equal(ch[0].title, undefined);
  assert.equal(ch[0].num, "01");
  assert.equal(ch[1].body, "Second para.");
}

// Single paragraph, no blanks → exactly one slide.
{
  const ch = parseStoryChapters("Just one story, nothing fancy.");
  assert.equal(ch.length, 1);
  assert.equal(ch[0].num, "01");
  assert.equal(ch[0].title, undefined);
}

// A multi-paragraph chapter keeps its internal blank-line break.
{
  const ch = parseStoryChapters("## Bab\n\nPara one.\n\nPara two.");
  assert.equal(ch.length, 1);
  assert.equal(ch[0].body, "Para one.\n\nPara two.");
}

// Empty / whitespace → nothing.
assert.deepEqual(parseStoryChapters("   \n  "), []);
assert.deepEqual(parseStoryChapters(""), []);

console.log("folk-story-parse: all checks passed");

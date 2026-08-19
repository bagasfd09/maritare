// Run: node src/components/invitation/flora/format.test.ts
//
// The regression these guard: date-fns `format()` throws RangeError on an
// invalid date, and the editor preview renders the draft on every keystroke —
// so a half-filled event row (`date: ""`) took down the whole preview tree.
import assert from "node:assert/strict";

import {
  formatFullDateId,
  formatLongDateId,
  formatShortDateId,
  formatTimeRangeId,
} from "./format.ts";

// Normal output is unchanged.
assert.equal(formatFullDateId("2026-07-12"), "Minggu, 12 Juli 2026");
assert.equal(formatLongDateId("2026-07-12"), "12 Juli 2026");
assert.equal(formatShortDateId("2026-07-12T04:30:00.000Z"), "12 Jul 2026");
assert.equal(formatTimeRangeId("08:00", "10:00"), "08.00 – 10.00 WIB");
assert.equal(formatTimeRangeId("08:00"), "08.00 WIB – selesai");

// Blank / garbage never throws — it renders as nothing.
for (const bad of ["", "   ", "not-a-date", "2026-13-45"]) {
  assert.equal(formatFullDateId(bad), "", `formatFullDateId(${JSON.stringify(bad)})`);
  assert.equal(formatLongDateId(bad), "", `formatLongDateId(${JSON.stringify(bad)})`);
  assert.equal(formatShortDateId(bad), "", `formatShortDateId(${JSON.stringify(bad)})`);
}

// An unfinished row must not render a bare " WIB – selesai".
assert.equal(formatTimeRangeId(""), "");
assert.equal(formatTimeRangeId("", "10:00"), "");
assert.equal(formatTimeRangeId("  "), "");

console.log("flora/format: ok");

// Run: node src/components/invitation/onyx/onyx-theme.test.ts
import assert from "node:assert/strict";

import { shortName } from "./onyx-theme.ts";

// The whole point: the wedding's nickname beats the full name's first word.
// "Muhammad Ihsan Pratama" with nickname "Ihsan" must read Ihsan.
assert.equal(shortName("Muhammad Ihsan Pratama", "Ihsan"), "Ihsan");
assert.equal(shortName("Ayu Lestari, S.Kom.", "Ayu"), "Ayu");

// No nickname stored → fall back to the full name's first word.
assert.equal(shortName("Muhammad Ihsan Pratama", ""), "Muhammad");
assert.equal(shortName("Muhammad Ihsan Pratama", "   "), "Muhammad");

// Full name blank → the nickname is all there is; both blank → empty (callers
// render the empty string rather than a stray "undefined").
assert.equal(shortName("", "Ihsan"), "Ihsan");
assert.equal(shortName(undefined, "Ihsan"), "Ihsan");
assert.equal(shortName(undefined, ""), "");
assert.equal(shortName("  ", "  "), "");

// Leading/trailing whitespace never leaks into display type.
assert.equal(shortName("  Muhammad  Ihsan ", ""), "Muhammad");
assert.equal(shortName("Muhammad", " Ihsan "), "Ihsan");

console.log("onyx-theme: shortName ok");

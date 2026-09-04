// Guards the rsvp.showQr toggle (hide/show the guest check-in QR section).
// The risk isn't the render guard — it's persistence: a jsonb row written before
// the field existed must keep the QR, and an explicit `false` must survive the
// editor's save payload instead of being silently dropped.
//
// Run: node src/lib/invitation/sections.test.ts

import assert from "node:assert/strict";

import { parseSectionData } from "./sections.ts";

// Legacy row — saved before showQr existed. Must default to SHOWN, so no live
// invitation loses its QR section on deploy.
assert.equal(parseSectionData("rsvp", { enabled: true, maxPartySize: 2 }).showQr, true);

// Junk / missing payloads fall back to the schema default, also shown.
assert.equal(parseSectionData("rsvp", null).showQr, true);
assert.equal(parseSectionData("rsvp", "not an object").showQr, true);

// The editor's save payload (RsvpForm.toPayload spreads RsvpData, blank deadline
// → undefined) must round-trip an explicit off.
assert.equal(
  parseSectionData("rsvp", {
    enabled: true,
    deadline: undefined,
    maxPartySize: 2,
    showQr: false,
  }).showQr,
  false,
);

// ...and the other fields still parse alongside it.
const parsed = parseSectionData("rsvp", { enabled: false, maxPartySize: 5, showQr: false });
assert.equal(parsed.enabled, false);
assert.equal(parsed.maxPartySize, 5);

console.log("sections: rsvp.showQr ok");

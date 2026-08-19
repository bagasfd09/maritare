// Run: node src/lib/invitation/acara-complete.test.ts
//
// Guards the rule that broke "Tambah acara": every row AcaraForm sends must pass
// acaraEventSchema, because saveWeddingSection replaces the section WHOLESALE —
// one unfinished row rejected the entire save, title included.
import assert from "node:assert/strict";

import { acaraDataSchema, isCompleteEvent } from "./sections.ts";

// A fresh row, and every half-filled state on the way to a complete one, is
// held back — this is the sequence a user types through after "Tambah acara".
assert.equal(isCompleteEvent({}), false);
assert.equal(isCompleteEvent({ name: "Akad Nikah" }), false);
assert.equal(isCompleteEvent({ name: "Akad Nikah", date: "2026-10-18" }), false);
assert.equal(isCompleteEvent({ name: "Akad Nikah", timeStart: "08:00" }), false);
assert.equal(isCompleteEvent({ date: "2026-10-18", timeStart: "08:00" }), false);
// Whitespace is not content.
assert.equal(isCompleteEvent({ name: " ", date: " ", timeStart: " " }), false);

// Name + date + start time is the minimum that stores (venue may be blank).
assert.equal(isCompleteEvent({ name: "Akad Nikah", date: "2026-10-18", timeStart: "08:00" }), true);

// The contract: anything isCompleteEvent lets through must parse.
assert.equal(
  acaraDataSchema.safeParse({
    events: [
      { name: "Akad Nikah", date: "2026-10-18", timeStart: "08:00", venue: "" },
      {
        name: "Resepsi",
        date: "2026-10-18",
        timeStart: "11:00",
        timeEnd: "14:00",
        venue: "Hotel Tentrem",
        address: "Jl. Diponegoro 27",
        mapsUrl: "https://maps.google.com/?q=Hotel+Tentrem",
      },
    ],
  }).success,
  true,
);

// The regression itself: a half-filled row WOULD be rejected, which is exactly
// why it must never reach the action.
assert.equal(
  acaraDataSchema.safeParse({ events: [{ name: "Akad Nikah", date: "", timeStart: "", venue: "" }] })
    .success,
  false,
);

// And a non-https map link sinks the event carrying it — hence cleanMapsUrl
// drops it in the form rather than sending it.
assert.equal(
  acaraDataSchema.safeParse({
    events: [
      {
        name: "Akad",
        date: "2026-10-18",
        timeStart: "08:00",
        venue: "",
        mapsUrl: "maps.app.goo.gl/x",
      },
    ],
  }).success,
  false,
);

console.log("acara: isCompleteEvent ok");

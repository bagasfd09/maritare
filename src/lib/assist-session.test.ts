// Guards the one thing that turns admin assist into a privilege escalation: the
// role check. A customer holding a forged assist cookie must get nothing, and a
// missing role (the dev no-session fallback) must never count as admin.
//
// Run: node src/lib/assist-session.test.ts

import assert from "node:assert/strict";

import { assistIdFor } from "./assist-session.ts";

const WID = "8f1c7b26-0f1a-4a3b-9c0d-2e5f6a7b8c9d";

// Admin + cookie → assist granted.
assert.equal(assistIdFor(WID, "admin"), WID);

// Same cookie, non-admin session → inert.
assert.equal(assistIdFor(WID, "customer"), null);
assert.equal(assistIdFor(WID, undefined), null);
assert.equal(assistIdFor(WID, ""), null);

// Admin without the cookie → normal (no) membership, not assist.
assert.equal(assistIdFor(null, "admin"), null);
assert.equal(assistIdFor("", "admin"), null);

// Hand-crafted junk never reaches the uuid column.
assert.equal(assistIdFor("not-a-uuid", "admin"), null);
assert.equal(assistIdFor(`${WID}' OR 1=1--`, "admin"), null);

console.log("assist-session: ok");

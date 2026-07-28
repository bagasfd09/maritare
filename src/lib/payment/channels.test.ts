// Guards the one thing that silently breaks checkout: the DEFAULT selection.
// The picker seeds from the first enabled option, so if filtering leaves an
// empty group (or the caller reads the unfiltered catalog), a customer who
// never touches the picker submits a channel the server rejects.
//
// Run: node src/lib/payment/channels.test.ts

import assert from "node:assert/strict";

import { CHECKOUT_CHANNELS, checkoutGroups, EWALLET_CHANNELS } from "./channels.ts";

const first = (groups: ReturnType<typeof checkoutGroups>) => groups[0]?.options[0]?.id;

// Nothing disabled → full catalog, DANA first.
assert.equal(first(checkoutGroups([])), "EMONEY_DANA");
assert.equal(
  checkoutGroups([]).flatMap((g) => g.options).length,
  CHECKOUT_CHANNELS.length,
);

// Disable DANA → 4 wallets left and the default moves to OVO.
const noDana = checkoutGroups(["EMONEY_DANA"]);
assert.equal(noDana[0].options.length, EWALLET_CHANNELS.length - 1);
assert.equal(first(noDana), "EMONEY_OVO");
assert.ok(!noDana.flatMap((g) => g.options).some((o) => o.id === "EMONEY_DANA"));

// Disable every wallet → the E-Wallet group is dropped, not rendered empty,
// and the default falls through to the first VA.
const noWallets = checkoutGroups(EWALLET_CHANNELS.map((w) => w.id));
assert.ok(!noWallets.some((g) => g.title === "E-Wallet"));
assert.ok(noWallets.every((g) => g.options.length > 0));
assert.equal(first(noWallets), "VIRTUAL_ACCOUNT_BCA");

// Unknown ids are inert.
assert.equal(first(checkoutGroups(["EMONEY_NOPE"])), "EMONEY_DANA");

console.log("channels: ok");

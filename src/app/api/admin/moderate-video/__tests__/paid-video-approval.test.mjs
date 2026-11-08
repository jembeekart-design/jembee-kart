import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../route.ts", import.meta.url), "utf8");

test("paid videos can enter moderation but are not publicly activated by approval", () => {
  assert.doesNotMatch(source, /Paid video approval is disabled/);
  assert.match(source, /paidVideoStatus:\s*submission\.videoAccess === "paid"\s*\?\s*"pending_admin_activation"/);
  assert.match(source, /paidCheckoutEnabled: false/);
  assert.match(source, /active: submission\.videoAccess !== "paid"/);
});

test("moderation never grants viewer coins", () => {
  assert.match(source, /const rewardCoins = 0/);
  assert.match(source, /pendingCoins:\s*0/);
});

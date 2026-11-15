import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const read = (relativePath) => readFileSync(resolve(here, relativePath), "utf8");

test("watch-earned rewards remain disabled until server verification is implemented", () => {
  const tracking = read("../../../../lib/videos/watch-earn/trackVideoWatch.ts");
  const reward = read("../../../../lib/videos/watch-earn/createWatchReward.ts");
  const hook = read("../../hooks/useWatchTracking.ts");

  assert.match(tracking, /success:\s*false/);
  assert.match(reward, /success:\s*false/);
  assert.match(hook, /watchedTime:\s*0/);
  assert.match(hook, /rewarded:\s*false/);
});

test("reward center does not present wallet balance as watch-earned coins", () => {
  const page = read("../page.tsx");
  assert.match(page, /Wallet balance:/);
  assert.match(page, /Watch-based rewards are currently disabled/);
  assert.match(page, /Video views do not add coins or wallet credits/);
  assert.doesNotMatch(page, />Coins:/);
});

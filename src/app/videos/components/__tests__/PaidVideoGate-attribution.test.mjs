import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(new URL("../PaidVideoGate.tsx", import.meta.url), "utf8");
test("paid video checkout claims referral link before creating order", () => {
  assert.match(source, /useSearchParams/);
  assert.match(source, /searchParams\.get\("ref"\)/);
  assert.match(source, /api\/monetag\/share-attribution\/claim/);
  assert.match(source, /shareId, videoId/);
  assert.match(source, /api\/shorts\/paid-video\/create-order/);
});

test("a paidVideoId URL parameter never grants client-side playback authorization", async () => {
  const feed = await readFile(new URL("../VerticalVideoFeed.tsx", import.meta.url), "utf8");
  assert.match(feed, /useState<Record<string, boolean>>\(\{\}\)/);
  assert.doesNotMatch(feed, /paidVideoId \? \{ \[paidVideoId\]: true \}/);
  assert.match(feed, /onAuthorized=\{\(\) => setAuthorizedPaidVideos/);
});

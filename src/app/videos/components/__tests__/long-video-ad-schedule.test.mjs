import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const player = await readFile(new URL("../ExoClickVideoPlayer.tsx", import.meta.url), "utf8");
const page = await readFile(new URL("../../page.tsx", import.meta.url), "utf8");
const paidGate = await readFile(new URL("../PaidVideoGate.tsx", import.meta.url), "utf8");
const rules = await readFile(new URL("../../../../lib/ads/videoAdsRules.ts", import.meta.url), "utf8");
const publicApi = await readFile(new URL("../../../api/videos/video-ads/route.ts", import.meta.url), "utf8");

test("long-video ads require deployment opt-in and Admin master/audience switches", () => {
  assert.match(player, /getExoClickLongVideoVastUrl/);
  assert.match(player, /config\.providerReady/);
  assert.match(player, /config\.longVideoAds\?\.enabled/);
  assert.match(player, /audienceRules\?\.enabled/);
  assert.match(publicApi, /NEXT_PUBLIC_EXOCLICK_VIDEO_ADS_ENABLED === "true"/);
});

test("mid-roll scheduling uses media currentTime and respects max ads and minimum gap", () => {
  assert.match(player, /onTimeUpdate=\{\(\) => \{ checkMidroll\(\);/);
  assert.match(player, /video\.currentTime/);
  assert.match(player, /video\.paused \|\| video\.seeking/);
  assert.match(player, /maxAdsPerVideo/);
  assert.match(player, /minGapSeconds/);
  assert.match(player, /customBreaksSeconds/);
});

test("paid long videos display the requested advertising disclosure", () => {
  assert.match(page, /इस Paid Video में JEMBEE PLAY के विज्ञापन दिख सकते हैं। विज्ञापन उपलब्धता नेटवर्क पर निर्भर करेगी।/);
  assert.match(paidGate, /इस Paid Video में JEMBEE PLAY के विज्ञापन दिख सकते हैं। विज्ञापन उपलब्धता नेटवर्क पर निर्भर करेगी।/);
  assert.match(page, /videoAccess=\{video\.videoAccess === "paid" \? "paid" : "free"\}/);
});

test("global master advertisement switch is off by default", () => {
  assert.match(rules, /masterEnabled: false/);
  assert.match(rules, /value\.masterEnabled !== "boolean"/);
});

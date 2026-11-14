import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../exoclick.ts", import.meta.url),
  "utf8"
);

test("ExoClick configuration contains the three approved zone identifiers", () => {
  assert.match(source, /6089786/);
  assert.match(source, /6089790/);
  assert.match(source, /6089796/);
});

test("ExoClick video ads require explicit environment opt-in", () => {
  assert.match(
    source,
    /NEXT_PUBLIC_EXOCLICK_VIDEO_ADS_ENABLED === "true"/
  );
  assert.match(source, /if \(!isExoClickVideoAdsEnabled\(\)\) return null/);
});

test("ExoClick VAST endpoints use HTTPS", () => {
  assert.match(source, /https:\/\/s\.magsrv\.com\/v1\/vast\.php\?id=6089786/);
  assert.match(source, /https:\/\/s\.magsrv\.com\/v1\/vast\.php\?idzone=6089790/);
});


test("ExoClick stays disabled by default in the deployment environment template", async () => {
  const env = await readFile(new URL("../../../../.env.example", import.meta.url), "utf8");
  assert.match(env, /^NEXT_PUBLIC_EXOCLICK_VIDEO_ADS_ENABLED=false$/m);
});

test("long-video IMA requests have a bounded timeout and release loader resources", async () => {
  const player = await readFile(
    new URL("../../../app/videos/components/ExoClickVideoPlayer.tsx", import.meta.url),
    "utf8"
  );
  assert.match(player, /adTimeoutRef/);
  assert.match(player, /}, 10000\)/);
  assert.match(player, /loaderRef\.current\?\.destroy\(\)/);
});

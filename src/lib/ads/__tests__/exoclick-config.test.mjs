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

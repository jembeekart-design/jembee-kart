import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../../", import.meta.url);
const main = readFileSync(new URL("mobile/src/main/java/in/jembeeplay/mobile/MainActivity.kt", root), "utf8");
const client = readFileSync(new URL("mobile/src/main/java/in/jembeeplay/mobile/MobileVideoCatalogClient.kt", root), "utf8");
const api = readFileSync(new URL("../../../src/app/api/app/video-catalog/route.ts", root), "utf8");

test("mobile Shorts loads the real approved catalog and opens native playback", () => {
  assert.match(main, /MobileVideoCatalogClient\.fetch/);
  assert.match(main, /MobileVideoPlayer\(video = activeVideo/);
  assert.match(main, /ExoPlayer\.Builder\(context\)/);
  assert.match(main, /PlayerView\(ctx\)/);
  assert.doesNotMatch(main, /Real video feed will appear after API integration/);
  assert.doesNotMatch(main, /Demo layout · Not a live playable video/);
});

test("mobile catalog client only accepts free catalog stream and thumbnail paths", () => {
  assert.match(client, /\/api\/app\/video-catalog\?limit=20/);
  assert.match(client, /item\.optString\("videoAccess"\) != "free"/);
  assert.match(client, /\/api\/shorts\/video-thumbnail\//);
  assert.match(client, /\/api\/shorts\/video-stream\//);
  assert.match(api, /\.where\("status", "==", "approved"\)/);
  assert.match(api, /\.where\("active", "==", true\)/);
  assert.match(api, /\.where\("moderation", "==", "safe"\)/);
  assert.match(api, /\.where\("videoAccess", "==", "free"\)/);
});

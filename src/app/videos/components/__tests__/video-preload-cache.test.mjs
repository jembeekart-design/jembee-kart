import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const feed = await readFile(new URL("../VerticalVideoFeed.tsx", import.meta.url), "utf8");
const player = await readFile(new URL("../VideoPlayer.tsx", import.meta.url), "utf8");
test("feed preloads thumbnails for the active and next four videos only", () => {
  assert.ok(feed.includes("filteredVideos.slice(activeVideoIndex, activeVideoIndex + 5)"));
  assert.ok(feed.includes("new window.Image()"));
  assert.ok(feed.includes("video-thumbnail"));
});
test("feed limits video metadata preload to the same five-card window", () => {
  assert.ok(feed.includes("preloadMetadata={index >= activeVideoIndex && index < activeVideoIndex + 5"));
  assert.ok(player.includes('preload={active || preloadMetadata ? "metadata" : "none"}'));
  assert.ok(!player.includes('preload={active ? "auto" : "none"}'));
});

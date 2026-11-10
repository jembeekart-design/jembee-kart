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
  assert.ok(!player.includes("fetchPriority="), "Unsupported video fetchPriority must not be used");
});

test("active video state is initialized before it is read for the preload window", () => {
  const stateDeclaration = feed.indexOf('const [activeVideoId, setActiveVideoId] = useState<string>(paidVideoId ?? libraryVideoId ?? "");');
  const effectiveActiveId = feed.indexOf('const effectiveActiveVideoId = activeVideoId || filteredVideos[0]?.id || "";');
  const activeIndexCalculation = feed.indexOf("const activeVideoIndex = Math.max(0, filteredVideos.findIndex((video) => video.id === effectiveActiveVideoId));");
  assert.ok(stateDeclaration >= 0, "activeVideoId state declaration must exist");
  assert.ok(effectiveActiveId >= 0, "effective active video id must exist");
  assert.ok(activeIndexCalculation >= 0, "activeVideoIndex calculation must exist");
  assert.ok(stateDeclaration < effectiveActiveId && effectiveActiveId < activeIndexCalculation, "activeVideoId must be initialized before activeVideoIndex reads it");
});

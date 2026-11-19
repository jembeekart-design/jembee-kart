import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const mainActivity = await readFile(new URL("../tv/src/main/java/in/jembeeplay/tv/MainActivity.kt", import.meta.url), "utf8");
const liveShelf = await readFile(new URL("../tv/src/main/java/in/jembeeplay/tv/TvLiveVideoShelf.kt", import.meta.url), "utf8");
const manifest = await readFile(new URL("../tv/src/main/AndroidManifest.xml", import.meta.url), "utf8");

test("TV home uses the approved live catalog rather than placeholder shelves", () => {
  assert.match(mainActivity, /TvLiveVideoShelf\(\)/);
  assert.doesNotMatch(mainActivity, /TvShelf\(/);
  assert.doesNotMatch(mainActivity, /Class 6|Class 7|Featured video|New this week/);
  assert.match(liveShelf, /TvVideoCatalogClient\.fetch/);
  assert.match(liveShelf, /No approved videos are available yet/);
});

test("TV navigation has remote Back handling and honest pending destination states", () => {
  assert.match(mainActivity, /BackHandler\(enabled = selected != "Home"\)/);
  assert.match(mainActivity, /TvDestinationState\("Shorts"/);
  assert.match(mainActivity, /TvDestinationState\("Learning Library"/);
  assert.match(mainActivity, /Press Back to return to Home/);
});

test("TV manifest is Leanback-first and does not require a touchscreen", () => {
  assert.match(manifest, /android\.software\.leanback/);
  assert.match(manifest, /android\.hardware\.touchscreen" android:required="false"/);
  assert.match(manifest, /android\.intent\.category\.LEANBACK_LAUNCHER/);
});

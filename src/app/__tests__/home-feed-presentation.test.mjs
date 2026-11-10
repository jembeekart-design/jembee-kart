import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (relative) => readFile(path.join(root, relative), "utf8");

test("Home feed has separate Shorts grid, Long Video cards and manual ad slots between sections", async () => {
  const home = await read("src/app/page.tsx");
  assert.match(home, /ShortsGrid/);
  assert.match(home, /videoFormat !== "long"/);
  assert.match(home, /videoFormat === "long"/);
  assert.match(home, /home-after-learning-banner/);
  assert.match(home, /home-after-shorts/);
  assert.match(home, /home-after-video-grid/);
  assert.match(home, /View all Shorts/);
  assert.match(home, /View all videos/);
  assert.match(home, /videos\.slice\(0, 4\)/);
  assert.match(home, /grid grid-cols-2 gap-3/);
});

test("Public creator labels never fall back to a private email address", async () => {
  const helper = await read("src/lib/videos/publicVideoPresentation.ts");
  assert.match(helper, /!displayName\.includes\("@"\)/);
  assert.match(helper, /!username\.includes\("@"\)/);
  assert.match(helper, /JEMBEE PLAY Creator/);
});

test("Short or long video format is saved at upload and copied after admin approval", async () => {
  const form = await read("src/app/videos/upload/page.tsx");
  const start = await read("src/app/api/creator/start-drive-upload/route.ts");
  const approve = await read("src/app/api/admin/moderate-video/route.ts");
  const fetcher = await read("src/lib/videos/watch-earn/fetchWatchVideos.ts");
  const shortsPlayer = await read("src/app/videos/components/VerticalVideoFeed.tsx");
  assert.match(form, /setVideoFormat\("short"\)/);
  assert.match(form, /setVideoFormat\("long"\)/);
  assert.match(form, /videoFormat,/);
  assert.match(start, /const videoFormat = body\.videoFormat === "long" \? "long" : "short"/);
  assert.match(start, /videoFormat,/);
  assert.match(approve, /videoFormat: submission\.videoFormat === "long" \? "long" : "short"/);
  assert.match(fetcher, /videoFormat: data\.videoFormat === "long" \? "long" : "short"/);
  assert.match(shortsPlayer, /result\.videos\.filter\(\(video\) => video\.videoFormat !== "long"\)/);
});

test("Long video cards use a landscape poster and native controls without eager video downloads", async () => {
  const videos = await read("src/app/videos/page.tsx");
  assert.match(videos, /aspect-video/);
  assert.match(videos, /controls playsInline preload="metadata"/);
  assert.match(videos, /video\.videoFormat === "long"/);
});

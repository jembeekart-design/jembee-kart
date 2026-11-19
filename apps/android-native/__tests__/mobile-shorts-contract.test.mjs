import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../../../", import.meta.url);
const main = readFileSync(new URL("apps/android-native/mobile/src/main/java/in/jembeeplay/mobile/MainActivity.kt", root), "utf8");
const client = readFileSync(new URL("apps/android-native/mobile/src/main/java/in/jembeeplay/mobile/MobileVideoCatalogClient.kt", root), "utf8");
const api = readFileSync(new URL("src/app/api/app/video-catalog/route.ts", root), "utf8");

test("mobile Home uses live catalog instead of fabricated preview cards", () => {\n  assert.match(main, /NativeCatalogSection\(\)/);\n  assert.doesNotMatch(main, /Your next lesson|Science explained|Maths revision|Quick science facts|Daily knowledge/);\n});\n\ntest("mobile Shorts loads the real approved catalog and opens native playback", () => {
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

test("mobile Home catalog client validates media paths and returns callbacks on main thread", () => {
  const homeClient = readFileSync(new URL("apps/android-native/mobile/src/main/java/in/jembeeplay/mobile/VideoCatalogClient.kt", root), "utf8");
  assert.match(homeClient, /Handler\(Looper\.getMainLooper\(\)\)/);
  assert.match(homeClient, /mainHandler\.post \{ onResult\(result\) \}/);
  assert.match(homeClient, /MAX_RESPONSE_CHARS/);
  assert.match(homeClient, /thumbnailPath\.startsWith\("\/api\/shorts\/video-thumbnail\/"\)/);
  assert.match(homeClient, /playbackPath\.startsWith\("\/api\/shorts\/video-stream\/"\)/);
  assert.match(homeClient, /connection\.disconnect\(\)/);
});

test("native Learning Library uses live Subject Book Chapter Question and answer APIs", () => {
  const learningClient = readFileSync(new URL("apps/android-native/mobile/src/main/java/in/jembeeplay/mobile/LearningLibraryClient.kt", root), "utf8");
  assert.match(main, /LearningLibraryClient\.loadNodes\("subject"\)/);
  assert.match(main, /LearningLibraryClient\.loadNodes\("book", subject\?\.id\)/);
  assert.match(main, /LearningLibraryClient\.loadNodes\("chapter", book\?\.id\)/);
  assert.match(main, /LearningLibraryClient\.loadQuestions\(chapter\?\.id/);
  assert.match(main, /LearningLibraryClient\.loadAnswers\(chapter\?\.id/);
  assert.match(learningClient, /\/api\/content-categories\?type=/);
  assert.match(learningClient, /\/api\/learning\/school-video-answers\?chapterId=/);
  assert.match(learningClient, /item\.optString\("videoAccess"\) != "free"/);
  assert.match(main, /MobileVideoPlayer\(video = video/);
  assert.doesNotMatch(main, /listOf\("CBSE", "ICSE", "JAC", "Other boards"\)/);
});

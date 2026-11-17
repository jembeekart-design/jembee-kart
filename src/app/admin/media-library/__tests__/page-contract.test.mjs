import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pageUrl = new URL("../page.tsx", import.meta.url);

test("Admin Media Library derives video inventory from Firestore instead of demo counts", async () => {
  const page = await readFile(pageUrl, "utf8");
  assert.match(page, /collection\(db, "watchEarnVideos"\)/);
  assert.match(page, /getDocs\(/);
  assert.doesNotMatch(page, /value="1\.2K"|value="320"|value="840"|value="42GB"/);
  assert.match(page, /Images.*Not connected/s);
  assert.match(page, /Storage usage/);
});

test("Media Library does not advertise unsupported upload or download actions", async () => {
  const page = await readFile(pageUrl, "utf8");
  assert.match(page, /Upload \/ image \/ document manager अभी उपलब्ध नहीं है/);
  assert.doesNotMatch(page, /<button[^>]*>\s*<Upload/);
  assert.doesNotMatch(page, /<Download/);
});

test("Media Library preview is restricted to approved active safe videos", async () => {
  const page = await readFile(pageUrl, "utf8");
  assert.match(page, /video\.status === "approved" && video\.active && video\.moderation === "safe"/);
  assert.match(page, /\/api\/shorts\/video-stream\//);
});

test("Media Library deletion calls the protected admin deletion endpoint", async () => {
  const page = await readFile(pageUrl, "utf8");
  assert.match(page, /\/api\/admin\/delete-video/);
  assert.match(page, /Authorization: `Bearer \$\{token\}`/);
});

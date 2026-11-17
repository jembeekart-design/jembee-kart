import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync(new URL("../route.ts", import.meta.url), "utf8");

test("native catalog only queries approved, active, safe, free videos", () => {
  assert.match(route, /where\("status", "==", "approved"\)/);
  assert.match(route, /where\("active", "==", true\)/);
  assert.match(route, /where\("moderation", "==", "safe"\)/);
  assert.match(route, /where\("videoAccess", "==", "free"\)/);
});

test("native catalog paginates with bounded page sizes and a document cursor", () => {
  assert.match(route, /MAX_PAGE_SIZE = 40/);
  assert.match(route, /startAfter\(cursorSnapshot\)/);
  assert.match(route, /nextCursor:/);
  assert.match(route, /hasMore/);
});

test("native catalog never returns raw Drive file identifiers or source URLs", () => {
  assert.match(route, /thumbnailUrl:/);
  assert.match(route, /playbackUrl:/);
  assert.doesNotMatch(route, /driveFileId:/);
  assert.doesNotMatch(route, /data\.video[,}]/);
});

test("native catalog returns bounded public metadata and no-store responses", () => {
  assert.match(route, /safeString\(/);
  assert.match(route, /safeCount\(/);
  assert.match(route, /safeTags\(/);
  assert.match(route, /Cache-Control.*private, no-store/);
});

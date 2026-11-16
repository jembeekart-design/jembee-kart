import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../route.ts", import.meta.url), "utf8");

test("school learning entries are revalidated when moderation approves a video", () => {
  assert.match(source, /Re-check the live Learning catalog at approval time/);
  assert.match(source, /data\?\.status !== "published"/);
  assert.match(source, /data\?\.type !== expectedTypes\[item\.key\]/);
  assert.match(source, /Learning catalog entry is missing or no longer published; approval blocked/);
});

test("approval verifies the complete selected learning hierarchy", () => {
  assert.match(source, /nodeData\.get\("school"\)\?\.parentId !== schoolIds\.board/);
  assert.match(source, /nodeData\.get\("class"\)\?\.parentId !== schoolIds\.school/);
  assert.match(source, /nodeData\.get\(subjectOrBookKey\)\?\.parentId !== schoolIds\.class/);
  assert.match(source, /nodeData\.get\("chapter"\)\?\.parentId !== subjectOrBookId/);
  assert.match(source, /nodeData\.get\("question"\)\?\.parentId !== schoolIds\.chapter/);
});

test("non-school submissions with stale school metadata cannot bypass catalog validation", () => {
  assert.match(source, /submission\.categoryId === "school" \|\| hasSchoolPath/);
  assert.match(source, /submission\.categoryId !== "school"/);
});

test("catalog rejection is surfaced as a conflict instead of a generic Drive error", () => {
  assert.match(source, /message\.includes\("Learning catalog"\)/);
  assert.match(source, /code: "LEARNING_CATALOG_UNAVAILABLE"/);
  assert.match(source, /status: 409/);
});

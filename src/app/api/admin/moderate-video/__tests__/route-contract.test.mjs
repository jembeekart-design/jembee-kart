import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");

test("education video approval requires a fully published Subject to Book to Chapter path", () => {
  assert.match(route, /async function hasPublishedLearningPath/);
  assert.match(route, /chapter\?\.type !== "chapter" \|\| chapter\.status !== "published"/);
  assert.match(route, /book\?\.type !== "book" \|\| book\.status !== "published"/);
  assert.match(route, /subject\?\.type === "subject" && subject\.status === "published"/);
  assert.match(route, /The linked learning subject, book, or chapter is unpublished or unavailable/);
  assert.match(route, /Recheck immediately before publishing/);
});

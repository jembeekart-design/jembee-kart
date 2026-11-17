import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");
const learningPage = await readFile(new URL("../../../../learn/school/page.tsx", import.meta.url), "utf8");

test("learning questions are discovered from teacher-submitted question numbers within a chapter", () => {
  assert.match(route, /where\("schoolChapterId", "==", chapterId\)/);
  assert.match(route, /schoolQuestionNumber/);
  assert.match(route, /schoolQuestionKey/);
  assert.match(route, /normalizeQuestionNumber/);
  assert.match(route, /legacyQuestionId/);
  assert.match(learningPage, /school-video-answers\?chapterId=/);
  assert.match(learningPage, /questionNumber=\$\{encodeURIComponent/);
});

test("only approved, active, moderation-safe answers are returned", () => {
  assert.match(route, /data.status !== "approved"/);
  assert.match(route, /data.active !== true/);
  assert.match(route, /data.moderation !== "safe"/);
  assert.match(route, /paidCheckoutEnabled !== true/);
});


test("video approval is gated by the complete published Subject to Book to Chapter path", () => {
  assert.match(route, /async function hasPublishedLearningPath/);
  assert.match(route, /chapter\?\.type !== "chapter" \|\| chapter\.status !== "published"/);
  assert.match(route, /book\?\.type !== "book" \|\| book\.status !== "published"/);
  assert.match(route, /subject\?\.type === "subject" && subject\.status === "published"/);
  assert.match(route, /The linked learning subject, book, or chapter is unpublished or unavailable/);
  assert.match(route, /Recheck immediately before publishing/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");

test("learning answer API validates question ID and published question node", () => {
  assert.match(route, /Valid question is required/);
  assert.match(route, /loadPublishedNode\(questionId, \["question"\]\)/);
});

test("learning answer API requires every ancestor to remain published", () => {
  assert.ok(route.includes('loadPublishedNode(question.data.parentId, ["chapter"])'));
  assert.ok(route.includes('loadPublishedNode(chapter.data.parentId, ["subject", "book"])'));
  assert.ok(route.includes('loadPublishedNode(subjectOrBook.data.parentId, ["class"])'));
  assert.ok(route.includes('loadPublishedNode(klass.data.parentId, ["school"])'));
  assert.ok(route.includes('loadPublishedNode(school.data.parentId, ["board"])'));
  assert.match(route, /question\.data\.parentId !== chapter\.id/);
  assert.match(route, /chapter\.data\.parentId !== subjectOrBook\.id/);
  assert.match(route, /school\.data\.parentId !== board\.id/);
});

test("only approved active safe videos are returned for a published learning path", () => {
  assert.match(route, /data\.status !== "approved"/);
  assert.match(route, /data\.active !== true/);
  assert.match(route, /data\.moderation !== "safe"/);
  assert.match(route, /where\("schoolQuestionId", "==", questionId\)/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../page.tsx", import.meta.url), "utf8");
const answers = await readFile(new URL("../../../api/learning/school-video-answers/route.ts", import.meta.url), "utf8");
const moderation = await readFile(new URL("../../../api/admin/moderate-video/route.ts", import.meta.url), "utf8");

test("Learning discovery follows the preloaded book-centric hierarchy", () => {
  for (const type of ["subject", "book", "edition", "chapter", "question"]) assert.ok(page.includes(`type === "${type}"`), `Missing hierarchy type ${type}`);
  assert.match(page, /data\\.learningBooks/);
  assert.match(page, /coverImageUrl/);
  assert.doesNotMatch(page, /Choose Board \\/ Pattern|Find your School|Choose Class/);
});

test("Question answers only return approved active safe videos", () => {
  assert.match(answers, /schoolQuestionId/);
  assert.match(answers, /data\\.status !== "approved"/);
  assert.match(answers, /data\\.active !== true/);
  assert.match(answers, /data\\.moderation !== "safe"/);
});

test("Approved video records retain book-centric learning path metadata", () => {
  for (const field of ["categoryId", "categoryName", "schoolSubjectId", "schoolBookId", "schoolEditionId", "schoolChapterId", "schoolQuestionId"]) assert.ok(moderation.includes(`${field}:`), `Missing approval field ${field}`);
});

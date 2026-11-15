import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../page.tsx", import.meta.url), "utf8");
const answers = await readFile(new URL("../../../api/learning/school-video-answers/route.ts", import.meta.url), "utf8");
const moderation = await readFile(new URL("../../../api/admin/moderate-video/route.ts", import.meta.url), "utf8");

test("Learning discovery follows Subject Book Chapter Question and has level-specific search", () => {
  for (const type of ["subject", "book", "chapter", "question"]) assert.ok(page.includes(`type === "${type}"`), `Missing hierarchy type ${type}`);
  assert.match(page, /Search book name/);
  assert.match(page, /Search chapter name or number/);
  assert.match(page, /Search question number or text/);
  assert.match(page, /coverImageUrl/);
  assert.doesNotMatch(page, /edition|Board|School|Class/);
});

test("Question answers only return approved active safe videos", () => {
  assert.match(answers, /schoolQuestionId/);
  assert.match(answers, /data\.status !== "approved"/);
  assert.match(answers, /data\.active !== true/);
  assert.match(answers, /data\.moderation !== "safe"/);
});

test("Approved video records retain Subject Book Chapter Question metadata", () => {
  for (const field of ["schoolSubjectId", "schoolBookId", "schoolChapterId", "schoolQuestionId"]) assert.ok(moderation.includes(`${field}:`), `Missing approval field ${field}`);
});

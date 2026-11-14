import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../page.tsx", import.meta.url), "utf8");
const answers = await readFile(new URL("../../../api/learning/school-video-answers/route.ts", import.meta.url), "utf8");
const moderation = await readFile(new URL("../../../api/admin/moderate-video/route.ts", import.meta.url), "utf8");

test("School learning follows the teacher-published hierarchy", () => {
  for (const type of ["board", "school", "class", "subject", "book", "chapter", "question"]) assert.ok(page.includes(`type === "${type}"`), `Missing hierarchy type ${type}`);
  assert.match(page, /api\/content-categories/);
});

test("School question answers only return approved active safe videos", () => {
  assert.match(answers, /schoolQuestionId/);
  assert.match(answers, /data\.status !== "approved"/);
  assert.match(answers, /data\.active !== true/);
  assert.match(answers, /data\.moderation !== "safe"/);
});

test("Approved video records retain category and school path metadata", () => {
  for (const field of ["categoryId", "categoryName", "schoolBoardId", "schoolId", "schoolClassId", "schoolSubjectId", "schoolBookId", "schoolChapterId", "schoolQuestionId"]) assert.ok(moderation.includes(`${field}:`), `Missing approval field ${field}`);
});

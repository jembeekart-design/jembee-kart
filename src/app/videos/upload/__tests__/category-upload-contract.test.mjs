import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../page.tsx", import.meta.url), "utf8");
const helper = await readFile(new URL("../../../../lib/videos/watch-earn/uploadWatchVideo.ts", import.meta.url), "utf8");
const startRoute = await readFile(new URL("../../../api/creator/start-drive-upload/route.ts", import.meta.url), "utf8");

test("video upload requires a category and offers book-centric learning fields", () => {
  assert.match(page, /Category & Learning Details/);
  assert.match(page, /categoryId/);
  for (const field of ["schoolSubjectId", "schoolBookId", "schoolEditionId", "schoolChapterId", "schoolQuestionId"]) {
    assert.ok(page.includes(field), `Missing upload field ${field}`);
    assert.ok(helper.includes(field), `Missing upload metadata field ${field}`);
  }
});

test("upload API validates and stores category and school metadata with moderation submission", () => {
  assert.match(startRoute, /कृपया मान्य Category चुनें/);
  assert.match(startRoute, /Learning video के लिए Subject, Book, Chapter और Question/);
  assert.match(startRoute, /schoolEditionId/);
  assert.match(startRoute, /schoolSubjectId/);
  assert.match(startRoute, /schoolLearningNodes/);
  assert.match(startRoute, /categoryId,/);
  assert.match(startRoute, /schoolQuestionId/);
});

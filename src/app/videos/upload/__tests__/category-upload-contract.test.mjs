import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../page.tsx", import.meta.url), "utf8");
const helper = await readFile(new URL("../../../../lib/videos/watch-earn/uploadWatchVideo.ts", import.meta.url), "utf8");
const startRoute = await readFile(new URL("../../../api/creator/start-drive-upload/route.ts", import.meta.url), "utf8");

test("video upload offers Subject Book Chapter Question without Board, Class or Edition", () => {
  assert.match(page, /Category & Learning Details/);
  assert.match(page, /schoolSubjectId/);
  assert.match(page, /schoolBookId/);
  assert.match(page, /schoolChapterId/);
  assert.match(page, /schoolQuestionId/);
  assert.doesNotMatch(page, /schoolEditionId|editionOptions|schoolBoardId|schoolClassId/);
  assert.doesNotMatch(helper, /schoolEditionId/);
});

test("upload API validates Subject to Book to Chapter and a teacher-entered question number", () => {
  assert.match(startRoute, /कृपया मान्य Category चुनें/);
  assert.match(startRoute, /Learning video के लिए Subject, Book, Chapter और Question Number लिखना आवश्यक है/);
  assert.match(startRoute, /schoolSubjectId/);
  assert.match(startRoute, /schoolLearningNodes/);
  assert.match(startRoute, /Book चुने गए Subject से संबंधित नहीं है/);
  assert.match(startRoute, /const chapterParentId = schoolIds\.schoolBookId/);
  assert.match(startRoute, /कृपया सही Question Number लिखें/);
  assert.match(startRoute, /schoolQuestionNumber/);
  assert.match(startRoute, /schoolQuestionKey/);
  assert.doesNotMatch(startRoute, /schoolQuestionId/);
  assert.doesNotMatch(startRoute, /schoolEditionId/);
});


test("teacher enters a textbook question number instead of selecting an Admin-created question node", () => {
  assert.match(page, /किताब का Question Number लिखें/);
  assert.match(page, /questionNumber: schoolQuestionNumber/);
  assert.doesNotMatch(page, /schoolQuestionId|questionOptions|Question चुनें<select/);
  assert.match(startRoute, /schoolQuestionNumber: schoolIds\.questionNumber/);
  assert.match(startRoute, /schoolChapterId: schoolIds\.schoolChapterId/);
  assert.match(startRoute, /schoolQuestionKey/);
  assert.doesNotMatch(startRoute, /schoolQuestionId/);
});

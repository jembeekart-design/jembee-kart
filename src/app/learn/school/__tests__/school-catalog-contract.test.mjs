import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../page.tsx", import.meta.url), "utf8");
const answers = await readFile(new URL("../../../api/learning/school-video-answers/route.ts", import.meta.url), "utf8");
const moderation = await readFile(new URL("../../../api/admin/moderate-video/route.ts", import.meta.url), "utf8");

test("Learning discovery follows Subject Book Chapter then dynamic Question Number", () => {
  assert.match(page, /Choose Subject/);
  assert.match(page, /Choose Book/);
  assert.match(page, /Choose Chapter/);
  assert.match(page, /Choose Question Number/);
  assert.ok(page.includes("school-video-answers?chapterId="));
  assert.ok(page.includes("questionNumber: item.questionNumber"));
  assert.match(page, /coverImageUrl/);
  assert.doesNotMatch(page, /edition|Board →|Choose School|Choose Class/);
});

test("question numbers are discovered from approved videos without requiring Admin Question nodes", () => {
  assert.ok(answers.includes('params.get("chapterId")'));
  assert.match(answers, /schoolQuestionNumber/);
  assert.match(answers, /schoolQuestionKey/);
  assert.ok(answers.includes("if (!questionNumber)"));
  assert.match(answers, /Published chapter not found/);
  assert.equal(answers.includes('questionSnapshot = await db.collection("schoolLearningNodes").doc(questionId)'), false);
});

test("legacy Admin Question records and videos remain readable", () => {
  assert.ok(answers.includes('params.get("questionId")'));
  assert.match(answers, /schoolQuestionId/);
  assert.match(answers, /legacySnapshot/);
  assert.match(answers, /legacyDocs/);
});

test("Question answers only return approved active safe videos and keep paid checkout gated", () => {
  assert.match(answers, /data.status === "approved" && data.active === true && data.moderation === "safe"/);
  assert.match(answers, /data.videoAccess === "paid"/);
  assert.ok(answers.includes('process.env.SHORTS_PAID_VIDEO_CHECKOUT_ENABLED !== "true"'));
  assert.ok(answers.includes("data.paidCheckoutEnabled !== true"));
  assert.ok(answers.includes('data.paidVideoStatus !== "enabled"'));
});

test("Approved video records retain Subject Book Chapter and normalized Question Number metadata", () => {
  for (const field of ["schoolSubjectId", "schoolBookId", "schoolChapterId", "schoolQuestionNumber", "schoolQuestionKey"]) {
    assert.ok(moderation.includes(`${field}:`), `Missing approval field ${field}`);
  }
  assert.equal(moderation.includes("schoolQuestionId:"), false);
});

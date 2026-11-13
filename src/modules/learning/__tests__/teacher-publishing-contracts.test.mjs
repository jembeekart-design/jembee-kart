import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateTeacherCourseDraft, canSubmitCourseForReview, canTransitionCourseWorkflow,
  canPublishApprovedRevision, nextCourseRevision, isCourseOwner,
} from "../teacher-publishing-contracts.ts";

const draft = { courseId: "c1", ownerTeacherId: "t1", title: "Physics", description: "Learn physics basics", categoryId: "science", status: "draft", revision: 1, lessonIds: ["l1", "l2"], tags: ["Science", "Class 10"] };
const submission = { teacherVerified: true, courseStatus: "draft", titleValid: true, descriptionValid: true, categoryValid: true, curriculumValid: true, publishedLessonCount: 2, totalLessonCount: 2 };

test("validates teacher course draft and normalizes bounded text", () => {
  const result = validateTeacherCourseDraft(draft);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.title, "Physics");
});
test("rejects unsafe IDs, duplicate lesson IDs, duplicate tags and invalid revisions", () => {
  assert.equal(validateTeacherCourseDraft({ ...draft, courseId: "../c" }).ok, false);
  assert.equal(validateTeacherCourseDraft({ ...draft, lessonIds: ["l1", "l1"] }).ok, false);
  assert.equal(validateTeacherCourseDraft({ ...draft, tags: ["Science", " science "] }).ok, false);
  assert.equal(validateTeacherCourseDraft({ ...draft, revision: 0 }).ok, false);
});
test("course review submission requires verified teacher and complete published lessons", () => {
  assert.equal(canSubmitCourseForReview(submission), true);
  assert.equal(canSubmitCourseForReview({ ...submission, teacherVerified: false }), false);
  assert.equal(canSubmitCourseForReview({ ...submission, publishedLessonCount: 1 }), false);
  assert.equal(canSubmitCourseForReview({ ...submission, totalLessonCount: 0 }), false);
  assert.equal(canSubmitCourseForReview({ ...submission, courseStatus: "published" }), false);
});
test("teacher and reviewer workflow transitions are separately constrained", () => {
  assert.equal(canTransitionCourseWorkflow("draft", "submitted", "teacher"), true);
  assert.equal(canTransitionCourseWorkflow("submitted", "approved", "teacher"), false);
  assert.equal(canTransitionCourseWorkflow("submitted", "approved", "reviewer"), true);
  assert.equal(canTransitionCourseWorkflow("approved", "published", "reviewer"), true);
  assert.equal(canTransitionCourseWorkflow("archived", "published", "reviewer"), false);
});
test("publishing requires approval of the exact current revision and verified teacher", () => {
  const valid = { courseStatus: "approved", approvedRevision: 3, currentRevision: 3, curriculumStillValid: true, teacherStillVerified: true };
  assert.equal(canPublishApprovedRevision(valid), true);
  assert.equal(canPublishApprovedRevision({ ...valid, approvedRevision: 2 }), false);
  assert.equal(canPublishApprovedRevision({ ...valid, teacherStillVerified: false }), false);
  assert.equal(canPublishApprovedRevision({ ...valid, curriculumStillValid: false }), false);
});
test("course edits advance revision and invalid revisions fail closed", () => {
  assert.deepEqual(nextCourseRevision(4), { ok: true, value: 5 });
  assert.equal(nextCourseRevision(0).ok, false);
  assert.equal(nextCourseRevision(10000).ok, false);
});
test("ownership comparison requires exact safe authenticated IDs", () => {
  assert.equal(isCourseOwner("teacher_1", "teacher_1"), true);
  assert.equal(isCourseOwner("teacher_1", "teacher_2"), false);
  assert.equal(isCourseOwner("../teacher", "../teacher"), false);
});

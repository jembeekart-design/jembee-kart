import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateCourseSummary, validateLessonCompletion, calculateCourseProgress,
  canEnroll, canAccessLesson, isLessonInCourse,
} from "../contracts.ts";

test("accepts a published bounded course summary", () => {
  const result = validateCourseSummary({ courseId: "course_1", title: "  Algebra ", teacherId: "teacher_1", status: "published", lessonCount: 12 });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.title, "Algebra");
});
test("rejects draft, archived, invalid and oversized course metadata", () => {
  assert.equal(validateCourseSummary({ courseId: "c1", title: "Draft", teacherId: "t1", status: "draft", lessonCount: 1 }).ok, false);
  assert.equal(validateCourseSummary({ courseId: "c1", title: "x".repeat(161), teacherId: "t1", status: "published", lessonCount: 1 }).ok, false);
  assert.equal(validateCourseSummary({ courseId: "../c", title: "Course", teacherId: "t1", status: "published", lessonCount: 1 }).ok, false);
  assert.equal(validateCourseSummary({ courseId: "c1", title: "Course", teacherId: "t1", status: "published", lessonCount: 501 }).ok, false);
});
test("validates lesson completion identifiers and boolean state", () => {
  assert.equal(validateLessonCompletion({ courseId: "c1", lessonId: "l1", completed: true }).ok, true);
  assert.equal(validateLessonCompletion({ courseId: "c1", lessonId: "../l1", completed: true }).ok, false);
  assert.equal(validateLessonCompletion({ courseId: "c1", lessonId: "l1", completed: "yes" }).ok, false);
});
test("calculates progress from unique server-confirmed lesson IDs only", () => {
  assert.equal(calculateCourseProgress(["l1", "l1", "l2", "unknown"], ["l1", "l2", "l3"]), 67);
  assert.equal(calculateCourseProgress(["l1"], []), 0);
  assert.equal(calculateCourseProgress(["../bad"], ["l1"]), 0);
});
test("enrollment is allowed only for published courses without active enrollment", () => {
  assert.equal(canEnroll("published", null), true);
  assert.equal(canEnroll("published", "cancelled"), true);
  assert.equal(canEnroll("published", "active"), false);
  assert.equal(canEnroll("draft", null), false);
  assert.equal(canEnroll("archived", null), false);
});
test("lesson access requires published course and enrollment except free preview", () => {
  assert.equal(canAccessLesson("published", null, true), true);
  assert.equal(canAccessLesson("published", null, false), false);
  assert.equal(canAccessLesson("published", "active", false), true);
  assert.equal(canAccessLesson("draft", "active", true), false);
});
test("completion can only reference lesson IDs in the authoritative course list", () => {
  assert.equal(isLessonInCourse("lesson_1", ["lesson_1", "lesson_2"]), true);
  assert.equal(isLessonInCourse("lesson_3", ["lesson_1", "lesson_2"]), false);
  assert.equal(isLessonInCourse("../lesson_1", ["../lesson_1"]), false);
});

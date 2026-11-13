import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateAssessmentDefinition, canStartAssessment, gradeAssessment,
  hasPassedAssessment, canIssueCourseCertificate,
} from "../assessment-contracts.ts";

const assessment = {
  assessmentId: "quiz_1", courseId: "course_1", title: "Algebra quiz", status: "published",
  passPercent: 50, maxAttempts: 3,
  questions: [
    { questionId: "q1", prompt: "2 + 2?", options: [{ optionId: "a", text: "4" }, { optionId: "b", text: "5" }], correctOptionId: "a" },
    { questionId: "q2", prompt: "3 + 3?", options: [{ optionId: "a", text: "6" }, { optionId: "b", text: "7" }], correctOptionId: "a" },
  ],
};

test("accepts a bounded assessment with unique questions and valid answer keys", () => {
  const result = validateAssessmentDefinition(assessment);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.questions.length, 2);
});
test("rejects malformed assessment metadata, duplicate IDs and answer keys outside options", () => {
  assert.equal(validateAssessmentDefinition({ ...assessment, maxAttempts: 11 }).ok, false);
  assert.equal(validateAssessmentDefinition({ ...assessment, passPercent: 0 }).ok, false);
  assert.equal(validateAssessmentDefinition({ ...assessment, questions: [{ ...assessment.questions[0], correctOptionId: "missing" }] }).ok, false);
  assert.equal(validateAssessmentDefinition({ ...assessment, questions: [assessment.questions[0], assessment.questions[0]] }).ok, false);
  assert.equal(validateAssessmentDefinition({ ...assessment, questions: [] }).ok, false);
});
test("assessment attempts require published status, eligible enrollment and remaining server-counted attempts", () => {
  assert.equal(canStartAssessment("published", "active", 0, 3), true);
  assert.equal(canStartAssessment("published", "completed", 2, 3), true);
  assert.equal(canStartAssessment("published", "active", 3, 3), false);
  assert.equal(canStartAssessment("draft", "active", 0, 3), false);
  assert.equal(canStartAssessment("published", null, 0, 3), false);
  assert.equal(canStartAssessment("published", "active", -1, 3), false);
});
test("grades answers from trusted answer keys and derives pass state", () => {
  const valid = validateAssessmentDefinition(assessment);
  assert.equal(valid.ok, true);
  if (!valid.ok) return;
  const result = gradeAssessment(valid.value.questions, { q1: "a", q2: "b" }, valid.value.passPercent);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.scorePercent, 50);
    assert.equal(result.value.passed, true);
  }
  assert.equal(gradeAssessment(valid.value.questions, { q1: "wrong" }, 50).ok, false);
  assert.equal(gradeAssessment(valid.value.questions, { q1: "a", unknown: "a" }, 50).ok, false);
  assert.equal(gradeAssessment(valid.value.questions, { q1: "a" }, 101).ok, false);
});
test("pass threshold is bounded and inclusive", () => {
  assert.equal(hasPassedAssessment(70, 70), true);
  assert.equal(hasPassedAssessment(69, 70), false);
  assert.equal(hasPassedAssessment(101, 70), false);
});
test("certificate eligibility requires completion, all lessons, passing, verified identity and no prior issue", () => {
  const eligible = { coursePublished: true, enrollmentStatus: "completed", allLessonsComplete: true, assessmentPassed: true, learnerIdVerified: true, certificateAlreadyIssued: false };
  assert.equal(canIssueCourseCertificate(eligible), true);
  for (const patch of [
    { coursePublished: false }, { enrollmentStatus: "active" }, { allLessonsComplete: false },
    { assessmentPassed: false }, { learnerIdVerified: false }, { certificateAlreadyIssued: true },
  ]) assert.equal(canIssueCourseCertificate({ ...eligible, ...patch }), false);
});

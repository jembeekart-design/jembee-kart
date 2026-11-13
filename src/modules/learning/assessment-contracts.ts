/** Pure assessment and certificate eligibility contracts.
 * Callers must load published assessment records and answer keys from trusted storage.
 * Never accept a client-supplied score, pass flag, or certificate status.
 */
export const ASSESSMENT_LIMITS = Object.freeze({
  title: 160,
  questionText: 2000,
  optionText: 500,
  questions: 100,
  optionsPerQuestion: 6,
  attempts: 10,
});

export type AssessmentQuestion = {
  questionId: string;
  prompt: string;
  options: Array<{ optionId: string; text: string }>;
  correctOptionId: string;
};

export type AssessmentDefinition = {
  assessmentId: string;
  courseId: string;
  title: string;
  status: "draft" | "published" | "archived";
  passPercent: number;
  maxAttempts: number;
  questions: AssessmentQuestion[];
};

export type AssessmentResult<T> = { ok: true; value: T } | { ok: false; reason: string };
const SAFE_ASSESSMENT_ID = /^[A-Za-z0-9_-]{1,128}$/;
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const boundedText = (v: unknown, max: number): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max && !CONTROL.test(v);

export function validateAssessmentDefinition(input: unknown): AssessmentResult<AssessmentDefinition> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, reason: "INVALID_ASSESSMENT" };
  const v = input as Record<string, unknown>;
  if (![v.assessmentId, v.courseId].every((id) => typeof id === "string" && SAFE_ASSESSMENT_ID.test(id)))
    return { ok: false, reason: "INVALID_ID" };
  if (!boundedText(v.title, ASSESSMENT_LIMITS.title)) return { ok: false, reason: "INVALID_TITLE" };
  if (v.status !== "published" && v.status !== "draft" && v.status !== "archived") return { ok: false, reason: "INVALID_STATUS" };
  if (!Number.isInteger(v.passPercent) || (v.passPercent as number) < 1 || (v.passPercent as number) > 100)
    return { ok: false, reason: "INVALID_PASS_PERCENT" };
  if (!Number.isInteger(v.maxAttempts) || (v.maxAttempts as number) < 1 || (v.maxAttempts as number) > ASSESSMENT_LIMITS.attempts)
    return { ok: false, reason: "INVALID_ATTEMPT_LIMIT" };
  if (!Array.isArray(v.questions) || v.questions.length < 1 || v.questions.length > ASSESSMENT_LIMITS.questions)
    return { ok: false, reason: "INVALID_QUESTIONS" };
  const questionIds = new Set<string>();
  const questions: AssessmentQuestion[] = [];
  for (const raw of v.questions) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, reason: "INVALID_QUESTION" };
    const q = raw as Record<string, unknown>;
    if (typeof q.questionId !== "string" || !SAFE_ASSESSMENT_ID.test(q.questionId) || questionIds.has(q.questionId))
      return { ok: false, reason: "INVALID_QUESTION_ID" };
    if (!boundedText(q.prompt, ASSESSMENT_LIMITS.questionText)) return { ok: false, reason: "INVALID_PROMPT" };
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > ASSESSMENT_LIMITS.optionsPerQuestion)
      return { ok: false, reason: "INVALID_OPTIONS" };
    const optionIds = new Set<string>();
    const options: AssessmentQuestion["options"] = [];
    for (const rawOption of q.options) {
      if (!rawOption || typeof rawOption !== "object" || Array.isArray(rawOption)) return { ok: false, reason: "INVALID_OPTION" };
      const option = rawOption as Record<string, unknown>;
      if (typeof option.optionId !== "string" || !SAFE_ASSESSMENT_ID.test(option.optionId) || optionIds.has(option.optionId))
        return { ok: false, reason: "INVALID_OPTION_ID" };
      if (!boundedText(option.text, ASSESSMENT_LIMITS.optionText)) return { ok: false, reason: "INVALID_OPTION_TEXT" };
      optionIds.add(option.optionId);
      options.push({ optionId: option.optionId, text: option.text.trim() });
    }
    if (typeof q.correctOptionId !== "string" || !optionIds.has(q.correctOptionId))
      return { ok: false, reason: "INVALID_ANSWER_KEY" };
    questionIds.add(q.questionId);
    questions.push({ questionId: q.questionId, prompt: q.prompt.trim(), options, correctOptionId: q.correctOptionId });
  }
  return { ok: true, value: {
    assessmentId: v.assessmentId as string, courseId: v.courseId as string, title: v.title.trim(),
    status: v.status, passPercent: v.passPercent as number, maxAttempts: v.maxAttempts as number, questions,
  } };
}

/** A published assessment can be attempted only by an eligible enrolled learner under the server-counted limit. */
export function canStartAssessment(status: AssessmentDefinition["status"], enrollment: "active" | "completed" | "cancelled" | null, attemptsUsed: number, maxAttempts: number): boolean {
  return status === "published" && (enrollment === "active" || enrollment === "completed") &&
    Number.isInteger(attemptsUsed) && Number.isInteger(maxAttempts) && attemptsUsed >= 0 &&
    maxAttempts >= 1 && maxAttempts <= ASSESSMENT_LIMITS.attempts && attemptsUsed < maxAttempts;
}

/** Score is computed against trusted question keys; unknown question IDs/options are rejected. */
export function gradeAssessment(questions: readonly AssessmentQuestion[], submitted: Readonly<Record<string, string>>, passPercent: number): AssessmentResult<{ scorePercent: number; correctCount: number; totalQuestions: number; passed: boolean }> {
  if (!Array.isArray(questions) || questions.length < 1 || questions.length > ASSESSMENT_LIMITS.questions ||
      !submitted || typeof submitted !== "object" || Array.isArray(submitted) || !Number.isInteger(passPercent) || passPercent < 1 || passPercent > 100) return { ok: false, reason: "INVALID_SUBMISSION" };
  const validIds = new Set(questions.map((q) => q.questionId));
  if (Object.keys(submitted).some((id) => !validIds.has(id))) return { ok: false, reason: "UNKNOWN_QUESTION" };
  let correctCount = 0;
  for (const q of questions) {
    const answer = submitted[q.questionId];
    if (answer !== undefined && (typeof answer !== "string" || !q.options.some((o: AssessmentQuestion['options'][number]) => o.optionId === answer)))
      return { ok: false, reason: "INVALID_ANSWER" };
    if (answer === q.correctOptionId) correctCount++;
  }
  const scorePercent = Math.round((correctCount / questions.length) * 100);
  return { ok: true, value: { scorePercent, correctCount, totalQuestions: questions.length, passed: scorePercent >= passPercent } };
}

export function hasPassedAssessment(scorePercent: number, passPercent: number): boolean {
  return Number.isInteger(scorePercent) && Number.isInteger(passPercent) &&
    scorePercent >= 0 && scorePercent <= 100 && passPercent >= 1 && passPercent <= 100 && scorePercent >= passPercent;
}

/** Certificate eligibility only; actual issuance requires a separately authorized, idempotent server workflow. */
export function canIssueCourseCertificate(input: {
  coursePublished: boolean; enrollmentStatus: "active" | "completed" | "cancelled" | null;
  allLessonsComplete: boolean; assessmentPassed: boolean; learnerIdVerified: boolean; certificateAlreadyIssued: boolean;
}): boolean {
  return input.coursePublished && input.enrollmentStatus === "completed" && input.allLessonsComplete &&
    input.assessmentPassed && input.learnerIdVerified && !input.certificateAlreadyIssued;
}

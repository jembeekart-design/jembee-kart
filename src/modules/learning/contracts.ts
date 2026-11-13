/** Pure course enrollment and learning-progress contracts.
 * Server handlers must load authoritative course/lesson records and verify auth.
 */
export const LEARNING_LIMITS = Object.freeze({
  courseTitle: 160,
  lessonTitle: 160,
  description: 4000,
  lessonsPerCourse: 500,
  progressBatch: 50,
});

export const COURSE_STATUSES = Object.freeze(["draft", "published", "archived"] as const);
export const ENROLLMENT_STATUSES = Object.freeze(["active", "completed", "cancelled"] as const);

export type CourseStatus = typeof COURSE_STATUSES[number];
export type EnrollmentStatus = typeof ENROLLMENT_STATUSES[number];

export interface CourseSummary {
  courseId: string;
  title: string;
  teacherId: string;
  status: CourseStatus;
  lessonCount: number;
}

export interface LessonCompletionInput {
  courseId: string;
  lessonId: string;
  completed: boolean;
}

export type ContractResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string };

const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function validText(value: unknown, max: number): value is string {
  return typeof value === "string" && value.trim().length > 0 &&
    value.length <= max && !CONTROL_CHARS.test(value);
}

export function validateCourseSummary(input: unknown): ContractResult<CourseSummary> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, reason: "INVALID_COURSE" };
  }
  const value = input as Record<string, unknown>;
  if (typeof value.courseId !== "string" || !SAFE_ID.test(value.courseId) ||
      typeof value.teacherId !== "string" || !SAFE_ID.test(value.teacherId)) {
    return { ok: false, reason: "INVALID_ID" };
  }
  if (!validText(value.title, LEARNING_LIMITS.courseTitle)) {
    return { ok: false, reason: "INVALID_TITLE" };
  }
  if (!COURSE_STATUSES.includes(value.status as CourseStatus) || value.status === "draft") {
    return { ok: false, reason: "COURSE_NOT_AVAILABLE" };
  }
  if (!Number.isInteger(value.lessonCount) || (value.lessonCount as number) < 0 ||
      (value.lessonCount as number) > LEARNING_LIMITS.lessonsPerCourse) {
    return { ok: false, reason: "INVALID_LESSON_COUNT" };
  }
  return {
    ok: true,
    value: {
      courseId: value.courseId,
      title: value.title.trim(),
      teacherId: value.teacherId,
      status: value.status as CourseStatus,
      lessonCount: value.lessonCount as number,
    },
  };
}

export function validateLessonCompletion(input: unknown): ContractResult<LessonCompletionInput> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, reason: "INVALID_PROGRESS" };
  }
  const value = input as Record<string, unknown>;
  if (typeof value.courseId !== "string" || !SAFE_ID.test(value.courseId) ||
      typeof value.lessonId !== "string" || !SAFE_ID.test(value.lessonId)) {
    return { ok: false, reason: "INVALID_ID" };
  }
  if (typeof value.completed !== "boolean") {
    return { ok: false, reason: "INVALID_COMPLETION_STATE" };
  }
  return { ok: true, value: { courseId: value.courseId, lessonId: value.lessonId, completed: value.completed } };
}

/** Progress is derived only from server-confirmed lesson IDs, never client counters. */
export function calculateCourseProgress(
  completedLessonIds: readonly string[],
  publishedLessonIds: readonly string[],
): number {
  const published = new Set(publishedLessonIds.filter((id) => SAFE_ID.test(id)));
  if (published.size === 0) return 0;
  const completed = new Set(completedLessonIds.filter((id) => published.has(id)));
  return Math.min(100, Math.round((completed.size / published.size) * 100));
}

export function canEnroll(
  courseStatus: CourseStatus,
  enrollmentStatus: EnrollmentStatus | null,
): boolean {
  return courseStatus === "published" &&
    (enrollmentStatus === null || enrollmentStatus === "cancelled");
}

export function canAccessLesson(
  courseStatus: CourseStatus,
  enrollmentStatus: EnrollmentStatus | null,
  isFreePreview: boolean,
): boolean {
  if (courseStatus !== "published") return false;
  return isFreePreview || enrollmentStatus === "active" || enrollmentStatus === "completed";
}

/** A completion update may only target a lesson already loaded from its course. */
export function isLessonInCourse(lessonId: string, authoritativeLessonIds: readonly string[]): boolean {
  return SAFE_ID.test(lessonId) && authoritativeLessonIds.includes(lessonId);
}

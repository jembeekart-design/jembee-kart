/** Teacher-owned course authoring and publishing workflow contracts. */
const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;
export const TEACHER_PUBLISHING_LIMITS = Object.freeze({ title: 160, description: 4000, tags: 20, lessons: 500, revision: 10000 });
export type CourseWorkflowStatus = "draft" | "submitted" | "changes_requested" | "approved" | "published" | "archived";
export type TeacherCourseDraft = {
  courseId: string; ownerTeacherId: string; title: string; description: string;
  categoryId: string; status: CourseWorkflowStatus; revision: number;
  lessonIds: readonly string[]; tags: readonly string[];
};
export type WorkflowResult<T> = { ok: true; value: T } | { ok: false; reason: string };
const text = (v: unknown, max: number): v is string => typeof v === "string" && !!v.trim() && v.length <= max;

/** Validate a teacher-owned course draft. Ownership must still be checked against authenticated server identity. */
export function validateTeacherCourseDraft(input: unknown): WorkflowResult<TeacherCourseDraft> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, reason: "INVALID_DRAFT" };
  const v = input as Record<string, unknown>;
  if (typeof v.courseId !== "string" || !SAFE_ID.test(v.courseId) || typeof v.ownerTeacherId !== "string" || !SAFE_ID.test(v.ownerTeacherId) || typeof v.categoryId !== "string" || !SAFE_ID.test(v.categoryId)) return { ok: false, reason: "INVALID_IDS" };
  if (!text(v.title, TEACHER_PUBLISHING_LIMITS.title) || !text(v.description, TEACHER_PUBLISHING_LIMITS.description)) return { ok: false, reason: "INVALID_COURSE_TEXT" };
  if (!["draft", "submitted", "changes_requested", "approved", "published", "archived"].includes(String(v.status))) return { ok: false, reason: "INVALID_STATUS" };
  if (!Number.isInteger(v.revision) || (v.revision as number) < 1 || (v.revision as number) > TEACHER_PUBLISHING_LIMITS.revision) return { ok: false, reason: "INVALID_REVISION" };
  if (!Array.isArray(v.lessonIds) || v.lessonIds.length > TEACHER_PUBLISHING_LIMITS.lessons || v.lessonIds.some(id => typeof id !== "string" || !SAFE_ID.test(id)) || new Set(v.lessonIds).size !== v.lessonIds.length) return { ok: false, reason: "INVALID_LESSONS" };
  if (!Array.isArray(v.tags) || v.tags.length > TEACHER_PUBLISHING_LIMITS.tags || v.tags.some(tag => !text(tag, 40)) || new Set((v.tags as string[]).map(t => t.trim().toLowerCase())).size !== v.tags.length) return { ok: false, reason: "INVALID_TAGS" };
  return { ok: true, value: { courseId: v.courseId, ownerTeacherId: v.ownerTeacherId, title: v.title.trim(), description: v.description.trim(), categoryId: v.categoryId, status: v.status as CourseWorkflowStatus, revision: v.revision as number, lessonIds: [...v.lessonIds] as string[], tags: (v.tags as string[]).map(t => t.trim()) } };
}

/** Submission requires a verified teacher, a complete curriculum and a non-empty learning description. */
export function canSubmitCourseForReview(input: {
  teacherVerified: boolean; courseStatus: CourseWorkflowStatus; titleValid: boolean;
  descriptionValid: boolean; categoryValid: boolean; curriculumValid: boolean;
  publishedLessonCount: number; totalLessonCount: number;
}): boolean {
  return input.teacherVerified && ["draft", "changes_requested"].includes(input.courseStatus)
    && input.titleValid && input.descriptionValid && input.categoryValid && input.curriculumValid
    && Number.isInteger(input.totalLessonCount) && input.totalLessonCount > 0
    && input.totalLessonCount <= TEACHER_PUBLISHING_LIMITS.lessons
    && Number.isInteger(input.publishedLessonCount) && input.publishedLessonCount === input.totalLessonCount;
}

/** Explicit workflow transitions; only authorized reviewers can perform review decisions. */
export function canTransitionCourseWorkflow(current: CourseWorkflowStatus, next: CourseWorkflowStatus, actor: "teacher" | "reviewer"): boolean {
  const teacher: Partial<Record<CourseWorkflowStatus, readonly CourseWorkflowStatus[]>> = {
    draft: ["submitted", "archived"], changes_requested: ["submitted", "archived"],
    submitted: ["archived"], approved: ["archived"], published: ["archived"], archived: [],
  };
  const reviewer: Partial<Record<CourseWorkflowStatus, readonly CourseWorkflowStatus[]>> = {
    submitted: ["changes_requested", "approved"], approved: ["published", "changes_requested"],
    published: ["changes_requested", "archived"],
  };
  return (actor === "teacher" ? teacher[current] : reviewer[current])?.includes(next) ?? false;
}

/** Publish only the exact approved revision; stale review approvals must not publish edited content. */
export function canPublishApprovedRevision(input: {
  courseStatus: CourseWorkflowStatus; approvedRevision: number | null;
  currentRevision: number; curriculumStillValid: boolean; teacherStillVerified: boolean;
}): boolean {
  return input.courseStatus === "approved" && input.approvedRevision !== null
    && Number.isInteger(input.approvedRevision) && input.approvedRevision === input.currentRevision
    && Number.isInteger(input.currentRevision) && input.currentRevision > 0
    && input.curriculumStillValid && input.teacherStillVerified;
}

/** An edit invalidates prior review approval and advances revision monotonically. */
export function nextCourseRevision(currentRevision: number): WorkflowResult<number> {
  if (!Number.isInteger(currentRevision) || currentRevision < 1 || currentRevision >= TEACHER_PUBLISHING_LIMITS.revision) return { ok: false, reason: "INVALID_REVISION" };
  return { ok: true, value: currentRevision + 1 };
}

/** Prevent a teacher from acting on another teacher's course; caller supplies verified auth UID. */
export function isCourseOwner(authenticatedTeacherId: string, courseOwnerTeacherId: string): boolean {
  return SAFE_ID.test(authenticatedTeacherId) && SAFE_ID.test(courseOwnerTeacherId) && authenticatedTeacherId === courseOwnerTeacherId;
}

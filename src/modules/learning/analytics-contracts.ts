/** Pure analytics aggregations. Inputs must be server-authoritative, scoped to the learner/course. */
export const LEARNING_ANALYTICS_LIMITS = Object.freeze({ events: 5000, eventId: 128, durationSeconds: 86400 });
const SAFE = /^[A-Za-z0-9_-]{1,128}$/;
export type LearningEvent = { eventId: string; learnerId: string; courseId: string; lessonId: string; type: "lesson_started" | "lesson_completed"; durationSeconds: number; occurredAt: number };
export type AnalyticsResult<T> = { ok: true; value: T } | { ok: false; reason: string };

/** Validate a bounded server-record candidate; callers must still authorize ownership and lesson membership. */
export function validateLearningEvent(input: unknown): AnalyticsResult<LearningEvent> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, reason: "INVALID_EVENT" };
  const v = input as Record<string, unknown>;
  for (const key of ["eventId", "learnerId", "courseId", "lessonId"] as const) {
    if (typeof v[key] !== "string" || !SAFE.test(v[key] as string)) return { ok: false, reason: "INVALID_ID" };
  }
  if (v.type !== "lesson_started" && v.type !== "lesson_completed") return { ok: false, reason: "INVALID_EVENT_TYPE" };
  if (!Number.isInteger(v.durationSeconds) || (v.durationSeconds as number) < 0 || (v.durationSeconds as number) > LEARNING_ANALYTICS_LIMITS.durationSeconds) return { ok: false, reason: "INVALID_DURATION" };
  if (!Number.isSafeInteger(v.occurredAt) || (v.occurredAt as number) < 0) return { ok: false, reason: "INVALID_TIMESTAMP" };
  return { ok: true, value: { eventId: v.eventId as string, learnerId: v.learnerId as string, courseId: v.courseId as string, lessonId: v.lessonId as string, type: v.type, durationSeconds: v.durationSeconds as number, occurredAt: v.occurredAt as number } };
}

/** Deduplicates event IDs and counts only events matching the requested learner/course scope. */
export function summarizeLearnerProgress(events: readonly LearningEvent[], learnerId: string, courseId: string, authoritativeLessonIds: readonly string[]) {
  if (!SAFE.test(learnerId) || !SAFE.test(courseId) || events.length > LEARNING_ANALYTICS_LIMITS.events) return { ok: false as const, reason: "INVALID_SCOPE_OR_VOLUME" };
  const lessons = new Set(authoritativeLessonIds.filter((id) => SAFE.test(id)));
  const seen = new Set<string>();
  const completed = new Set<string>();
  let watchSeconds = 0;
  let starts = 0;
  for (const event of events) {
    if (event.learnerId !== learnerId || event.courseId !== courseId || !lessons.has(event.lessonId) || seen.has(event.eventId)) continue;
    seen.add(event.eventId);
    if (event.type === "lesson_started") starts++;
    if (event.type === "lesson_completed") completed.add(event.lessonId);
    watchSeconds += event.durationSeconds;
  }
  return { ok: true as const, value: { startedLessons: starts, completedLessons: completed.size, totalLessons: lessons.size, progressPercent: lessons.size ? Math.round(completed.size / lessons.size * 100) : 0, watchSeconds } };
}

/** Aggregate course-level metrics from already-authorized learner summaries. */
export function summarizeCoursePerformance(rows: readonly { learnerId: string; progressPercent: number; watchSeconds: number }[]) {
  if (rows.length > LEARNING_ANALYTICS_LIMITS.events || rows.some((r) => !SAFE.test(r.learnerId) || !Number.isInteger(r.progressPercent) || r.progressPercent < 0 || r.progressPercent > 100 || !Number.isInteger(r.watchSeconds) || r.watchSeconds < 0)) return { ok: false as const, reason: "INVALID_METRICS" };
  const unique = new Map(rows.map((r) => [r.learnerId, r]));
  const values = [...unique.values()];
  return { ok: true as const, value: { learners: values.length, averageProgressPercent: values.length ? Math.round(values.reduce((n, r) => n + r.progressPercent, 0) / values.length) : 0, totalWatchSeconds: values.reduce((n, r) => n + r.watchSeconds, 0) } };
}

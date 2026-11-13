/** Deterministic, privacy-conscious recommendation primitives. Inputs must be authorized server-side. */
export const LEARNING_RECOMMENDATION_LIMITS = Object.freeze({ candidates: 500, signals: 100, id: 128 });
const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;
export type LearningCandidate = {
  courseId: string;
  title: string;
  status: "published" | "draft" | "archived";
  categoryIds: readonly string[];
  level: "beginner" | "intermediate" | "advanced";
  lessonCount: number;
};
export type LearningSignal = { categoryId: string; weight: number };
export type RecommendationResult<T> = { ok: true; value: T } | { ok: false; reason: string };

/** Reject malformed candidate records instead of trusting client-supplied course metadata. */
export function validateLearningCandidate(input: unknown): RecommendationResult<LearningCandidate> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, reason: "INVALID_CANDIDATE" };
  const v = input as Record<string, unknown>;
  if (typeof v.courseId !== "string" || !SAFE_ID.test(v.courseId)) return { ok: false, reason: "INVALID_COURSE_ID" };
  if (typeof v.title !== "string" || !v.title.trim() || v.title.length > 160) return { ok: false, reason: "INVALID_TITLE" };
  if (v.status !== "published" && v.status !== "draft" && v.status !== "archived") return { ok: false, reason: "INVALID_STATUS" };
  if (!Array.isArray(v.categoryIds) || v.categoryIds.length > 20 || v.categoryIds.some((id) => typeof id !== "string" || !SAFE_ID.test(id))) return { ok: false, reason: "INVALID_CATEGORIES" };
  if (!["beginner", "intermediate", "advanced"].includes(String(v.level))) return { ok: false, reason: "INVALID_LEVEL" };
  if (!Number.isInteger(v.lessonCount) || (v.lessonCount as number) < 1 || (v.lessonCount as number) > 500) return { ok: false, reason: "INVALID_LESSON_COUNT" };
  return { ok: true, value: { courseId: v.courseId, title: v.title.trim(), status: v.status, categoryIds: [...new Set(v.categoryIds as string[])], level: v.level as LearningCandidate["level"], lessonCount: v.lessonCount as number } };
}

/** Build ranked published courses; completed/enrolled courses and duplicate IDs are excluded. */
export function rankLearningRecommendations(
  candidates: readonly LearningCandidate[],
  signals: readonly LearningSignal[],
  options: { excludedCourseIds?: readonly string[]; preferredLevel?: LearningCandidate["level"]; limit?: number } = {},
) {
  const limit = options.limit ?? 10;
  if (candidates.length > LEARNING_RECOMMENDATION_LIMITS.candidates || signals.length > LEARNING_RECOMMENDATION_LIMITS.signals || !Number.isInteger(limit) || limit < 1 || limit > 50) return { ok: false as const, reason: "INVALID_VOLUME_OR_LIMIT" };
  if (signals.some((s) => !SAFE_ID.test(s.categoryId) || !Number.isFinite(s.weight) || s.weight < 0 || s.weight > 10)) return { ok: false as const, reason: "INVALID_SIGNAL" };
  const weights = new Map<string, number>();
  for (const signal of signals) weights.set(signal.categoryId, Math.min(10, (weights.get(signal.categoryId) ?? 0) + signal.weight));
  const excluded = new Set(options.excludedCourseIds ?? []);
  const seen = new Set<string>();
  const ranked = candidates.flatMap((course) => {
    if (course.status !== "published" || excluded.has(course.courseId) || seen.has(course.courseId)) return [];
    seen.add(course.courseId);
    const relevance = course.categoryIds.reduce((sum, id) => sum + (weights.get(id) ?? 0), 0);
    const levelBonus = options.preferredLevel && course.level === options.preferredLevel ? 0.25 : 0;
    return [{ courseId: course.courseId, score: Math.round((relevance + levelBonus) * 100) / 100 }];
  }).sort((a, b) => b.score - a.score || a.courseId.localeCompare(b.courseId));
  return { ok: true as const, value: ranked.slice(0, limit) };
}

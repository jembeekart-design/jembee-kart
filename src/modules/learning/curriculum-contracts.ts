/** Safe, framework-independent curriculum administration contracts. */
export const CURRICULUM_LIMITS = Object.freeze({ categories: 100, courses: 500, modules: 100, lessonsPerModule: 100, title: 160, description: 4000 });
const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;
export type CurriculumResult<T> = { ok: true; value: T } | { ok: false; reason: string };
export type CurriculumLesson = { lessonId: string; title: string; status: "draft" | "published" | "archived"; position: number; contentType: "video" | "text" | "quiz"; durationSeconds?: number };
export type CurriculumModule = { moduleId: string; title: string; position: number; lessons: CurriculumLesson[] };
export type Curriculum = { curriculumId: string; courseId: string; title: string; status: "draft" | "published" | "archived"; modules: CurriculumModule[] };

const objectRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const validText = (v: unknown, max: number) => typeof v === "string" && !!v.trim() && v.length <= max;
const unique = <T,>(items: readonly T[]) => new Set(items).size === items.length;

/** Validate bounded curriculum trees and reject duplicate IDs or positions within each level. */
export function validateCurriculum(input: unknown): CurriculumResult<Curriculum> {
  if (!objectRecord(input)) return { ok: false, reason: "INVALID_CURRICULUM" };
  const v = input;
  if (typeof v.curriculumId !== "string" || !SAFE_ID.test(v.curriculumId) || typeof v.courseId !== "string" || !SAFE_ID.test(v.courseId)) return { ok: false, reason: "INVALID_IDS" };
  if (!validText(v.title, CURRICULUM_LIMITS.title)) return { ok: false, reason: "INVALID_TITLE" };
  if (!["draft", "published", "archived"].includes(String(v.status))) return { ok: false, reason: "INVALID_STATUS" };
  if (!Array.isArray(v.modules) || v.modules.length < 1 || v.modules.length > CURRICULUM_LIMITS.modules) return { ok: false, reason: "INVALID_MODULES" };
  const moduleIds: string[] = [], modulePositions: number[] = [];
  const modules: CurriculumModule[] = [];
  for (const raw of v.modules) {
    if (!objectRecord(raw) || typeof raw.moduleId !== "string" || !SAFE_ID.test(raw.moduleId) || !validText(raw.title, CURRICULUM_LIMITS.title) || !Number.isInteger(raw.position) || (raw.position as number) < 0 || !Array.isArray(raw.lessons) || raw.lessons.length < 1 || raw.lessons.length > CURRICULUM_LIMITS.lessonsPerModule) return { ok: false, reason: "INVALID_MODULE" };
    const moduleId = raw.moduleId as string;
    const moduleTitle = raw.title as string;
    moduleIds.push(moduleId); modulePositions.push(raw.position as number);
    const lessonIds: string[] = [], lessonPositions: number[] = [], lessons: CurriculumLesson[] = [];
    for (const item of raw.lessons) {
      if (!objectRecord(item) || typeof item.lessonId !== "string" || !SAFE_ID.test(item.lessonId) || !validText(item.title, CURRICULUM_LIMITS.title) || !["draft", "published", "archived"].includes(String(item.status)) || !Number.isInteger(item.position) || (item.position as number) < 0 || !["video", "text", "quiz"].includes(String(item.contentType))) return { ok: false, reason: "INVALID_LESSON" };
      if (item.durationSeconds !== undefined && (!Number.isInteger(item.durationSeconds) || (item.durationSeconds as number) < 0 || (item.durationSeconds as number) > 86400)) return { ok: false, reason: "INVALID_DURATION" };
      const lessonId = item.lessonId as string;
      const lessonTitle = item.title as string;
      lessonIds.push(lessonId); lessonPositions.push(item.position as number);
      lessons.push({ lessonId, title: lessonTitle.trim(), status: item.status as CurriculumLesson["status"], position: item.position as number, contentType: item.contentType as CurriculumLesson["contentType"], ...(item.durationSeconds === undefined ? {} : { durationSeconds: item.durationSeconds as number }) });
    }
    if (!unique(lessonIds) || !unique(lessonPositions)) return { ok: false, reason: "DUPLICATE_LESSON_ID_OR_POSITION" };
    modules.push({ moduleId, title: moduleTitle.trim(), position: raw.position as number, lessons: lessons.sort((a,b) => a.position-b.position) });
  }
  if (!unique(moduleIds) || !unique(modulePositions)) return { ok: false, reason: "DUPLICATE_MODULE_ID_OR_POSITION" };
  return { ok: true, value: { curriculumId: v.curriculumId as string, courseId: v.courseId as string, title: (v.title as string).trim(), status: v.status as Curriculum["status"], modules: modules.sort((a,b) => a.position-b.position) } };
}

/** Publishing requires a valid curriculum and at least one published lesson in every module. */
export function canPublishCurriculum(curriculum: Curriculum): boolean {
  return curriculum.status !== "archived" && curriculum.modules.length > 0 && curriculum.modules.every(m => m.lessons.some(l => l.status === "published"));
}

/** Restrict editorial transitions; archived content is terminal and must be restored via a new revision. */
export function canTransitionCurriculumStatus(current: Curriculum["status"], next: Curriculum["status"]): boolean {
  const allowed: Record<Curriculum["status"], readonly Curriculum["status"][]> = {
    draft: ["draft", "published", "archived"],
    published: ["published", "draft", "archived"],
    archived: ["archived"],
  };
  return allowed[current].includes(next);
}

/** Reorder only when the submitted order is a complete, duplicate-free permutation of known IDs. */
export function validateCurriculumOrder(existingIds: readonly string[], proposedIds: readonly string[]): CurriculumResult<string[]> {
  if (existingIds.length > CURRICULUM_LIMITS.modules || proposedIds.length !== existingIds.length || existingIds.some(id => !SAFE_ID.test(id)) || proposedIds.some(id => !SAFE_ID.test(id)) || !unique([...existingIds]) || !unique([...proposedIds])) return { ok: false, reason: "INVALID_ORDER" };
  const known = new Set(existingIds);
  if (proposedIds.some(id => !known.has(id))) return { ok: false, reason: "UNKNOWN_OR_MISSING_ID" };
  return { ok: true, value: [...proposedIds] };
}

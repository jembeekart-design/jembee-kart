import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store, max-age=0" };
const safeId = /^[a-z0-9][a-z0-9_-]{1,63}$/;
const questionNumberPattern = /^[a-z]{0,3}\.?\s*\d+(?:\s*\([a-z0-9]+\))?(?:[.-]\d+)?$/i;

type VideoDocument = { id: string; data: () => Record<string, unknown> };

const normalizeQuestionNumber = (value: string) => value.toLowerCase().replace(/\s+/g, "");

function isVisibleVideo(data: Record<string, unknown>) {
  const isApprovedAndSafe =
    data.status === "approved" && data.active === true && data.moderation === "safe";
  const paidAccessIsDisabled =
    data.videoAccess === "paid" &&
    (process.env.SHORTS_PAID_VIDEO_CHECKOUT_ENABLED !== "true" ||
      data.paidCheckoutEnabled !== true ||
      data.paidVideoStatus !== "enabled");

  return isApprovedAndSafe && !paidAccessIsDisabled;
}

function toVideo(doc: VideoDocument) {
  const data = doc.data();
  const stringValue = (value: unknown, fallback: string, maxLength: number) =>
    typeof value === "string" ? value.slice(0, maxLength) : fallback;

  return {
    id: doc.id,
    caption: stringValue(data.caption, "", 200),
    username: stringValue(data.username, "JEMBEE PLAY Creator", 80),
    videoAccess: data.videoAccess === "paid" ? "paid" as const : "free" as const,
    videoFormat: data.videoFormat === "long" ? "long" as const : "short" as const,
    thumbnail: typeof data.thumbnail === "string" ? data.thumbnail : null,
    createdAt: typeof data.createdAt === "number" ? data.createdAt : null,
  };
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status, headers: noStore });
}

async function getLegacyQuestionVideos(db: ReturnType<typeof getAdminDb>, questionId: string) {
  const questionSnapshot = await db.collection("schoolLearningNodes").doc(questionId).get();
  const question = questionSnapshot.data();
  if (!questionSnapshot.exists || question?.type !== "question" || question.status !== "published") {
    return { response: jsonError("Published learning question not found", 404) };
  }

  const snapshot = await db.collection("watchEarnVideos")
    .where("schoolQuestionId", "==", questionId)
    .limit(100)
    .get();
  const videos = snapshot.docs.filter((doc) => isVisibleVideo(doc.data())).map(toVideo);
  return { response: NextResponse.json({ success: true, videos }, { headers: noStore }) };
}

async function getPublishedChapter(db: ReturnType<typeof getAdminDb>, chapterId: string) {
  const snapshot = await db.collection("schoolLearningNodes").doc(chapterId).get();
  const chapter = snapshot.data();
  return snapshot.exists && chapter?.type === "chapter" && chapter.status === "published";
}

async function listChapterQuestions(db: ReturnType<typeof getAdminDb>, chapterId: string, visibleDocs: VideoDocument[]) {
  const byNumber = new Map<string, {
    questionNumber: string;
    questionKey: string;
    videoCount: number;
    legacyQuestionId?: string;
  }>();

  for (const doc of visibleDocs) {
    const data = doc.data();
    const label = typeof data.schoolQuestionNumber === "string" ? data.schoolQuestionNumber.trim() : "";
    const key = typeof data.schoolQuestionKey === "string" && data.schoolQuestionKey
      ? data.schoolQuestionKey
      : normalizeQuestionNumber(label);
    if (!label || !key) continue;

    const current = byNumber.get(key);
    byNumber.set(key, {
      questionNumber: current?.questionNumber || label,
      questionKey: key,
      videoCount: (current?.videoCount || 0) + 1,
    });
  }

  const legacySnapshot = await db.collection("schoolLearningNodes")
    .where("parentId", "==", chapterId)
    .limit(100)
    .get();

  for (const doc of legacySnapshot.docs) {
    const data = doc.data();
    const isPublishedQuestion = data.type === "question" &&
      data.status === "published" && typeof data.name === "string";
    if (!isPublishedQuestion) continue;

    const key = normalizeQuestionNumber(data.name as string);
    if (!key || byNumber.has(key)) continue;
    const legacyVideos = visibleDocs.filter((videoDoc) =>
      videoDoc.data().schoolQuestionId === doc.id
    );
    byNumber.set(key, {
      questionNumber: data.name as string,
      questionKey: key,
      videoCount: legacyVideos.length,
      legacyQuestionId: doc.id,
    });
  }

  return [...byNumber.values()].sort((a, b) =>
    a.questionNumber.localeCompare(b.questionNumber, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );
}

async function getChapterQuestionVideos(
  db: ReturnType<typeof getAdminDb>,
  chapterId: string,
  questionNumber: string,
  visibleDocs: VideoDocument[],
) {
  const key = normalizeQuestionNumber(questionNumber);
  const matchingDocs = visibleDocs.filter((doc) => {
    const data = doc.data();
    const savedKey = typeof data.schoolQuestionKey === "string"
      ? data.schoolQuestionKey
      : normalizeQuestionNumber(
        typeof data.schoolQuestionNumber === "string" ? data.schoolQuestionNumber : ""
      );
    return savedKey === key;
  });

  const legacySnapshot = await db.collection("schoolLearningNodes")
    .where("parentId", "==", chapterId)
    .limit(100)
    .get();
  const legacyIds = legacySnapshot.docs
    .filter((doc) => {
      const data = doc.data();
      return data.type === "question" &&
        data.status === "published" &&
        typeof data.name === "string" &&
        normalizeQuestionNumber(data.name) === key;
    })
    .map((doc) => doc.id);

  const legacyDocs = visibleDocs.filter((doc) =>
    legacyIds.includes(String(doc.data().schoolQuestionId || ""))
  );
  const uniqueDocs = new Map([...matchingDocs, ...legacyDocs].map((doc) => [doc.id, doc]));
  return [...uniqueDocs.values()].map(toVideo);
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const chapterId = params.get("chapterId")?.trim() || "";
  const questionNumber = params.get("questionNumber")?.trim() || "";
  const legacyQuestionId = params.get("questionId")?.trim() || "";

  if (!safeId.test(chapterId) && !safeId.test(legacyQuestionId)) {
    return jsonError("Valid chapter is required", 400);
  }
  if (questionNumber && !questionNumberPattern.test(questionNumber)) {
    return jsonError("Valid question number is required", 400);
  }

  try {
    const db = getAdminDb();
    if (legacyQuestionId) {
      const result = await getLegacyQuestionVideos(db, legacyQuestionId);
      return result.response;
    }

    if (!(await getPublishedChapter(db, chapterId))) {
      return jsonError("Published chapter not found", 404);
    }

    const snapshot = await db.collection("watchEarnVideos")
      .where("schoolChapterId", "==", chapterId)
      .limit(500)
      .get();
    const visibleDocs = snapshot.docs.filter((doc) => isVisibleVideo(doc.data()));

    if (!questionNumber) {
      const questions = await listChapterQuestions(db, chapterId, visibleDocs);
      return NextResponse.json({ success: true, questions }, { headers: noStore });
    }

    const videos = await getChapterQuestionVideos(db, chapterId, questionNumber, visibleDocs);
    return NextResponse.json({ success: true, videos }, { headers: noStore });
  } catch {
    return jsonError("Video answers could not be loaded", 500);
  }
}

import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store, max-age=0" };
const normalizeQuestionNumber = (value: string) => value.toLowerCase().replace(/\s+/g, "");

function isVisibleVideo(data: Record<string, unknown>) {
  if (data.status !== "approved" || data.active !== true || data.moderation !== "safe") return false;
  if (data.videoAccess === "paid" && (process.env.SHORTS_PAID_VIDEO_CHECKOUT_ENABLED !== "true" || data.paidCheckoutEnabled !== true || data.paidVideoStatus !== "enabled")) return false;
  return true;
}

function toVideo(doc: { id: string; data: () => Record<string, unknown> }) {
  const data = doc.data();
  return {
    id: doc.id,
    caption: typeof data.caption === "string" ? data.caption.slice(0, 200) : "",
    username: typeof data.username === "string" ? data.username.slice(0, 80) : "JEMBEE PLAY Creator",
    videoAccess: data.videoAccess === "paid" ? "paid" as const : "free" as const,
    videoFormat: data.videoFormat === "long" ? "long" as const : "short" as const,
    thumbnail: typeof data.thumbnail === "string" ? data.thumbnail : null,
    createdAt: typeof data.createdAt === "number" ? data.createdAt : null,
  };
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const chapterId = params.get("chapterId")?.trim() || "";
  const questionNumber = params.get("questionNumber")?.trim() || "";
  const legacyQuestionId = params.get("questionId")?.trim() || "";
  const safeId = /^[a-z0-9][a-z0-9_-]{1,63}$/;
  if (!safeId.test(chapterId) && !safeId.test(legacyQuestionId)) {
    return NextResponse.json({ success: false, message: "Valid chapter is required" }, { status: 400, headers: noStore });
  }
  if (questionNumber && !/^[a-z]{0,3}\.?\s*\d+(?:\s*\([a-z0-9]+\))?(?:[.-]\d+)?$/i.test(questionNumber)) {
    return NextResponse.json({ success: false, message: "Valid question number is required" }, { status: 400, headers: noStore });
  }
  try {
    const db = getAdminDb();
    if (legacyQuestionId) {
      const questionSnapshot = await db.collection("schoolLearningNodes").doc(legacyQuestionId).get();
      const question = questionSnapshot.data();
      if (!questionSnapshot.exists || question?.type !== "question" || question.status !== "published") {
        return NextResponse.json({ success: false, message: "Published learning question not found" }, { status: 404, headers: noStore });
      }
      const snapshot = await db.collection("watchEarnVideos").where("schoolQuestionId", "==", legacyQuestionId).limit(100).get();
      const videos = snapshot.docs.filter((doc) => isVisibleVideo(doc.data())).map(toVideo);
      return NextResponse.json({ success: true, videos }, { headers: noStore });
    }

    const chapterSnapshot = await db.collection("schoolLearningNodes").doc(chapterId).get();
    const chapter = chapterSnapshot.data();
    if (!chapterSnapshot.exists || chapter?.type !== "chapter" || chapter.status !== "published") {
      return NextResponse.json({ success: false, message: "Published chapter not found" }, { status: 404, headers: noStore });
    }

    const snapshot = await db.collection("watchEarnVideos").where("schoolChapterId", "==", chapterId).limit(500).get();
    const visibleDocs = snapshot.docs.filter((doc) => isVisibleVideo(doc.data()));
    if (!questionNumber) {
      const byNumber = new Map<string, { questionNumber: string; questionKey: string; videoCount: number; legacyQuestionId?: string }>();
      for (const doc of visibleDocs) {
        const data = doc.data();
        const label = typeof data.schoolQuestionNumber === "string" ? data.schoolQuestionNumber.trim() : "";
        const key = typeof data.schoolQuestionKey === "string" && data.schoolQuestionKey ? data.schoolQuestionKey : normalizeQuestionNumber(label);
        if (!label || !key) continue;
        const current = byNumber.get(key);
        byNumber.set(key, { questionNumber: current?.questionNumber || label, questionKey: key, videoCount: (current?.videoCount || 0) + 1 });
      }
      const legacySnapshot = await db.collection("schoolLearningNodes").where("parentId", "==", chapterId).limit(100).get();
      for (const doc of legacySnapshot.docs) {
        const data = doc.data();
        if (data.type !== "question" || data.status !== "published" || typeof data.name !== "string") continue;
        const key = normalizeQuestionNumber(data.name);
        if (!key || byNumber.has(key)) continue;
        const legacyVideos = visibleDocs.filter((videoDoc) => videoDoc.data().schoolQuestionId === doc.id);
        byNumber.set(key, { questionNumber: data.name, questionKey: key, videoCount: legacyVideos.length, legacyQuestionId: doc.id });
      }
      const questions = [...byNumber.values()].sort((a, b) => a.questionNumber.localeCompare(b.questionNumber, undefined, { numeric: true, sensitivity: "base" }));
      return NextResponse.json({ success: true, questions }, { headers: noStore });
    }

    const key = normalizeQuestionNumber(questionNumber);
    const videos = visibleDocs.filter((doc) => {
      const data = doc.data();
      const savedKey = typeof data.schoolQuestionKey === "string" ? data.schoolQuestionKey : normalizeQuestionNumber(typeof data.schoolQuestionNumber === "string" ? data.schoolQuestionNumber : "");
      return savedKey === key;
    }).map(toVideo);
    return NextResponse.json({ success: true, videos }, { headers: noStore });
  } catch {
    return NextResponse.json({ success: false, message: "Video answers could not be loaded" }, { status: 500, headers: noStore });
  }
}

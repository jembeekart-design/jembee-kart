import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const questionId = new URL(req.url).searchParams.get("questionId")?.trim() || "";
  if (!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(questionId)) {
    return NextResponse.json({ success: false, message: "Valid question is required" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const db = getAdminDb();
    // A previously approved answer must stop appearing when its question or
    // any ancestor in the learning path is unpublished or removed.
    const loadPublishedNode = async (id: unknown, allowedTypes: string[]) => {
      if (typeof id !== "string" || !/^[a-z0-9][a-z0-9_-]{1,63}$/.test(id)) return null;
      const snapshot = await db.collection("schoolLearningNodes").doc(id).get();
      const data = snapshot.data();
      if (!snapshot.exists || data?.status !== "published" || !allowedTypes.includes(String(data.type))) return null;
      return { id: snapshot.id, data };
    };
    const question = await loadPublishedNode(questionId, ["question"]);
    if (!question) return NextResponse.json({ success: true, videos: [] }, { headers: { "Cache-Control": "no-store, max-age=0" } });
    const chapter = await loadPublishedNode(question.data.parentId, ["chapter"]);
    if (!chapter) return NextResponse.json({ success: true, videos: [] }, { headers: { "Cache-Control": "no-store, max-age=0" } });
    const subjectOrBook = await loadPublishedNode(chapter.data.parentId, ["subject", "book"]);
    if (!subjectOrBook) return NextResponse.json({ success: true, videos: [] }, { headers: { "Cache-Control": "no-store, max-age=0" } });
    const klass = await loadPublishedNode(subjectOrBook.data.parentId, ["class"]);
    if (!klass) return NextResponse.json({ success: true, videos: [] }, { headers: { "Cache-Control": "no-store, max-age=0" } });
    const school = await loadPublishedNode(klass.data.parentId, ["school"]);
    if (!school) return NextResponse.json({ success: true, videos: [] }, { headers: { "Cache-Control": "no-store, max-age=0" } });
    const board = await loadPublishedNode(school.data.parentId, ["board"]);
    if (!board || school.data.parentId !== board.id || klass.data.parentId !== school.id ||
        subjectOrBook.data.parentId !== klass.id || chapter.data.parentId !== subjectOrBook.id ||
        question.data.parentId !== chapter.id) {
      return NextResponse.json({ success: true, videos: [] }, { headers: { "Cache-Control": "no-store, max-age=0" } });
    }
    const snapshot = await db.collection("watchEarnVideos").where("schoolQuestionId", "==", questionId).limit(100).get();
    const videos = snapshot.docs.flatMap((doc) => {
      const data = doc.data();
      if (data.status !== "approved" || data.active !== true || data.moderation !== "safe") return [];
      return [{
        id: doc.id,
        caption: typeof data.caption === "string" ? data.caption.slice(0, 200) : "",
        username: typeof data.username === "string" ? data.username.slice(0, 80) : "JEMBEE PLAY Creator",
        videoAccess: data.videoAccess === "paid" ? "paid" as const : "free" as const,
        videoFormat: data.videoFormat === "long" ? "long" as const : "short" as const,
        thumbnail: typeof data.thumbnail === "string" ? data.thumbnail : null,
        createdAt: typeof data.createdAt === "number" ? data.createdAt : null,
      }];
    });
    return NextResponse.json({ success: true, videos }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch {
    return NextResponse.json({ success: false, message: "Video answers could not be loaded" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

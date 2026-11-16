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
    const expectedParents = [
      { type: "question", parent: "chapter" },
      { type: "chapter", parent: "subjectOrBook" },
      { type: "subject", parent: "class" },
      { type: "book", parent: "class" },
      { type: "class", parent: "school" },
      { type: "school", parent: "board" },
      { type: "board", parent: null },
    ] as const;
    const chain: Record<string, Record<string, unknown>> = {};
    let currentId = questionId;
    let expectedType: string = "question";
    for (let depth = 0; depth < 7; depth += 1) {
      const nodeSnapshot = await db.collection("schoolLearningNodes").doc(currentId).get();
      const node = nodeSnapshot.data();
      if (!nodeSnapshot.exists || node?.status !== "published" || node?.type !== expectedType) {
        return NextResponse.json({ success: true, videos: [] }, { headers: { "Cache-Control": "no-store, max-age=0" } });
      }
      chain[expectedType] = node as Record<string, unknown>;
      const parentId = typeof node.parentId === "string" ? node.parentId : "";
      if (expectedType === "board") {
        if (parentId) return NextResponse.json({ success: true, videos: [] }, { headers: { "Cache-Control": "no-store, max-age=0" } });
        break;
      }
      if (!parentId) return NextResponse.json({ success: true, videos: [] }, { headers: { "Cache-Control": "no-store, max-age=0" } });
      currentId = parentId;
      expectedType = expectedType === "question" ? "chapter"
        : expectedType === "chapter" ? (chain.chapter?.parentType === "book" ? "book" : "subject")
        : expectedType === "subject" || expectedType === "book" ? "class"
        : expectedType === "class" ? "school" : "board";
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

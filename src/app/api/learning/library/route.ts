import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE_MAX = 40;
const SCAN_BATCH = 100;
const MAX_SCAN_PER_REQUEST = 500;
const CURSOR_ID_PATTERN = /^[A-Za-z0-9_-]{1,150}$/;
const TYPES = new Set(["subject", "book", "chapter", "question"]);
const noStore = { "Cache-Control": "no-store, max-age=0" };

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const type = params.get("type") || "";
    const parentId = (params.get("parentId") || "").trim();
    const search = (params.get("q") || "").trim().toLocaleLowerCase().slice(0, 120);
    const cursor = (params.get("cursor") || "").trim();
    const limit = Math.min(PAGE_SIZE_MAX, Math.max(1, Number(params.get("limit")) || 12));
    if (!TYPES.has(type)) {
      return NextResponse.json({ success: false, message: "Invalid learning entry type" }, { status: 400, headers: noStore });
    }
    if (type === "subject" && parentId) {
      return NextResponse.json({ success: false, message: "Subject entries do not have a parent" }, { status: 400, headers: noStore });
    }
    if (type !== "subject" && !parentId) {
      return NextResponse.json({ success: false, message: "Parent entry is required" }, { status: 400, headers: noStore });
    }

    const db = getAdminDb();
    const collection = db.collection("schoolLearningNodes");
    let query = collection.where("status", "==", "published").where("type", "==", type);
    if (parentId) query = query.where("parentId", "==", parentId);
    query = query.orderBy("__name__");
    if (cursor && !CURSOR_ID_PATTERN.test(cursor)) {
      return NextResponse.json({ success: false, message: "Invalid pagination cursor" }, { status: 400, headers: noStore });
    }
    let lastDoc = cursor ? await collection.doc(cursor).get() : null;
    if (lastDoc) {
      const cursorData = lastDoc.data();
      if (!lastDoc.exists || cursorData?.status !== "published" || cursorData?.type !== type
        || (parentId && cursorData?.parentId !== parentId)
        || (!parentId && cursorData?.parentId != null)) {
        return NextResponse.json({ success: false, message: "Invalid pagination cursor" }, { status: 400, headers: noStore });
      }
    }

    const items: Record<string, unknown>[] = [];
    let nextCursor: string | null = null;
    let exhausted = false;
    let scanned = 0;
    while (items.length <= limit && !exhausted && scanned < MAX_SCAN_PER_REQUEST) {
      const pageQuery = lastDoc ? query.startAfter(lastDoc).limit(SCAN_BATCH) : query.limit(SCAN_BATCH);
      const snap = await pageQuery.get();
      if (snap.empty) { exhausted = true; break; }
      for (const doc of snap.docs) {
        lastDoc = doc;
        scanned += 1;
        const data = doc.data();
        const name = typeof data.name === "string" ? data.name : "";
        if (!search || name.toLocaleLowerCase().includes(search)) {
          if (items.length === limit) {
            nextCursor = items[items.length - 1]?.id as string;
            exhausted = true;
            break;
          }
          const { ownerUid: _ownerUid, updatedBy: _updatedBy, createdByUid: _createdByUid, ...safe } = data;
          items.push({ id: doc.id, ...safe });
        }
        if (scanned >= MAX_SCAN_PER_REQUEST) break;
      }
      if (!exhausted) {
        if (snap.size < SCAN_BATCH) exhausted = true;
        else if (scanned < MAX_SCAN_PER_REQUEST) continue;
      }
    }
    if (!exhausted && !nextCursor) nextCursor = lastDoc?.id || null;
    if (exhausted && items.length <= limit) nextCursor = null;
    return NextResponse.json({ success: true, items, nextCursor }, { headers: noStore });
  } catch (error) {
    console.error("[learning-library] GET failed:", error);
    return NextResponse.json({ success: false, message: "Learning Library page could not be loaded" }, { status: 500, headers: noStore });
  }
}

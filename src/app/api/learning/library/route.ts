import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE_MAX = 40;
const SCAN_BATCH = 100;
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
    let query: FirebaseFirestore.Query = collection.where("status", "==", "published").where("type", "==", type);
    if (parentId) query = query.where("parentId", "==", parentId);
    query = query.orderBy("__name__");
    if (cursor) {
      const cursorDoc = await collection.doc(cursor).get();
      if (!cursorDoc.exists) {
        return NextResponse.json({ success: false, message: "Invalid pagination cursor" }, { status: 400, headers: noStore });
      }
      query = query.startAfter(cursorDoc);
    }

    const items: Record<string, unknown>[] = [];
    let scanCursor = cursor;
    let nextCursor: string | null = null;
    let exhausted = false;
    while (items.length <= limit && !exhausted) {
      let pageQuery = query.limit(SCAN_BATCH);
      if (scanCursor && !cursor) {
        const scanDoc = await collection.doc(scanCursor).get();
        if (scanDoc.exists) pageQuery = query.startAfter(scanDoc).limit(SCAN_BATCH);
      } else if (scanCursor && cursor && scanCursor !== cursor) {
        const scanDoc = await collection.doc(scanCursor).get();
        if (scanDoc.exists) pageQuery = query.startAfter(scanDoc).limit(SCAN_BATCH);
      }
      const snap = await pageQuery.get();
      if (snap.empty) { exhausted = true; break; }
      for (const doc of snap.docs) {
        scanCursor = doc.id;
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
      }
      if (!exhausted) {
        if (snap.size < SCAN_BATCH) exhausted = true;
        else nextCursor = scanCursor;
      }
    }
    if (exhausted && items.length <= limit && nextCursor === scanCursor) nextCursor = null;
    return NextResponse.json({ success: true, items, nextCursor }, { headers: noStore });
  } catch {
    return NextResponse.json({ success: false, message: "Learning Library page could not be loaded" }, { status: 500, headers: noStore });
  }
}

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store, max-age=0" };
const ID_PATTERN = /^[a-z0-9][a-z0-9_-]{1,63}$/;
const NODE_TYPES = ["board", "school", "class", "subject", "book", "chapter", "question"] as const;
type NodeType = typeof NODE_TYPES[number];
const PARENT_TYPE: Record<NodeType, NodeType | null> = {
  board: null,
  school: "board",
  class: "school",
  subject: "class",
  book: "class",
  chapter: "subject",
  question: "chapter",
};
const cleanText = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().replace(/[\\u0000-\\u001f\\u007f]/g, "").slice(0, max) : "";
const cleanList = (value: unknown, maxItems = 80) => Array.isArray(value)
  ? value.map((item) => cleanText(item, 120)).filter(Boolean).slice(0, maxItems)
  : [];

async function verifyUploader(req: Request): Promise<string> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const token = header.slice(7).trim();
  if (!token) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(token, true);
  return decoded.uid;
}

function authError(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  return NextResponse.json(
    { success: false, message: code === "UNAUTHORIZED" ? "कृपया पहले लॉगिन करें।" : "आपका login सत्यापित नहीं हो सका।" },
    { status: 401, headers: noStore },
  );
}

export async function GET() {
  try {
    const db = getAdminDb();
    const [categorySnap, nodeSnap] = await Promise.all([
      db.collection("contentCategories").where("status", "==", "published").limit(200).get(),
      db.collection("schoolLearningNodes").where("status", "==", "published").limit(1000).get(),
    ]);
    const categories: Record<string, unknown>[] = categorySnap.docs.map((doc): Record<string, unknown> => {
      const { ownerUid: _ownerUid, updatedBy: _updatedBy, createdByUid: _createdByUid, ...data } = doc.data();
      return { id: doc.id, ...data };
    });
    const schoolNodes: Record<string, unknown>[] = nodeSnap.docs.map((doc): Record<string, unknown> => {
      const { ownerUid: _ownerUid, updatedBy: _updatedBy, createdByUid: _createdByUid, ...data } = doc.data();
      return { id: doc.id, ...data };
    });
    return NextResponse.json({ success: true, categories, schoolNodes }, { headers: noStore });
  } catch {
    return NextResponse.json({ success: false, message: "Category catalog could not be loaded" }, { status: 500, headers: noStore });
  }
}

export async function POST(req: Request) {
  let uploaderUid = "";
  try {
    uploaderUid = await verifyUploader(req);
  } catch (error) {
    return authError(error);
  }

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 24 * 1024) {
      return NextResponse.json({ success: false, message: "Request too large" }, { status: 413, headers: noStore });
    }
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400, headers: noStore });
  }

  const db = getAdminDb();
  const action = cleanText(body.action, 40);
  try {
    if (action === "save-category") {
      const name = cleanText(body.name, 80);
      const description = cleanText(body.description, 240);
      const generatedId = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const requestedId = cleanText(body.id, 64);
      const id = requestedId || generatedId || `creator-category-${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
      const topics = cleanList(body.topics, 60);
      if (!ID_PATTERN.test(id) || !name || !topics.length) {
        return NextResponse.json({ success: false, message: "Category name और कम-से-कम एक topic आवश्यक है।" }, { status: 400, headers: noStore });
      }
      const ref = db.collection("contentCategories").doc(id);
      const current = await ref.get();
      if (current.exists && current.data()?.ownerUid !== uploaderUid) {
        return NextResponse.json({ success: false, message: "यह Category किसी दूसरे creator की है या system category है। नई Category का नाम चुनें।" }, { status: 409, headers: noStore });
      }
      if (!current.exists) {
        const owned = await db.collection("contentCategories").where("ownerUid", "==", uploaderUid).limit(30).get();
        if (owned.size >= 30) return NextResponse.json({ success: false, message: "आप अधिकतम 30 custom categories बना सकते हैं।" }, { status: 429, headers: noStore });
      }
      await ref.set({
        id, name, description, topics,
        iconKey: cleanText(body.iconKey, 32) || "book-open",
        schoolSpecial: body.schoolSpecial === true,
        status: "published",
        ownerUid: uploaderUid,
        createdByUid: uploaderUid,
        updatedAt: new Date(),
        ...(current.exists ? {} : { createdAt: new Date() }),
      }, { merge: true });
      return NextResponse.json({ success: true, id }, { headers: noStore });
    }

    if (action === "save-school-node") {
      const type = cleanText(body.type, 20) as NodeType;
      const name = cleanText(body.name, 120);
      const parentId = cleanText(body.parentId, 64);
      const existingId = cleanText(body.id, 64);
      if (!NODE_TYPES.includes(type) || !name || (existingId && !ID_PATTERN.test(existingId))) {
        return NextResponse.json({ success: false, message: "School entry की जानकारी सही नहीं है।" }, { status: 400, headers: noStore });
      }
      const requiredParent = PARENT_TYPE[type];
      if (requiredParent === null && parentId) {
        return NextResponse.json({ success: false, message: "Board top-level entry है।" }, { status: 400, headers: noStore });
      }
      if (requiredParent !== null) {
        if (!ID_PATTERN.test(parentId)) return NextResponse.json({ success: false, message: "पहले सही parent entry चुनें।" }, { status: 400, headers: noStore });
        const parent = await db.collection("schoolLearningNodes").doc(parentId).get();
        const allowedParentTypes = type === "chapter" ? ["subject", "book"] : [requiredParent];
        if (!parent.exists || !allowedParentTypes.includes(String(parent.data()?.type)) || parent.data()?.status !== "published") {
          return NextResponse.json({ success: false, message: "चुनी गई parent entry उपलब्ध नहीं है।" }, { status: 400, headers: noStore });
        }
      }
      const id = existingId || `${type}-${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
      const ref = db.collection("schoolLearningNodes").doc(id);
      const current = existingId ? await ref.get() : null;
      if (existingId && (!current?.exists || current.data()?.ownerUid !== uploaderUid || current.data()?.type !== type)) {
        return NextResponse.json({ success: false, message: "आप केवल अपनी बनाई हुई entry edit कर सकते हैं।" }, { status: 403, headers: noStore });
      }
      if (!current?.exists) {
        const owned = await db.collection("schoolLearningNodes").where("ownerUid", "==", uploaderUid).limit(150).get();
        if (owned.size >= 150) return NextResponse.json({ success: false, message: "आप अधिकतम 150 School catalog entries बना सकते हैं।" }, { status: 429, headers: noStore });
      }
      await ref.set({
        id, type, name, parentId: parentId || null, status: "published",
        ownerUid: uploaderUid, createdByUid: uploaderUid, updatedBy: uploaderUid,
        updatedAt: new Date(), ...(current?.exists ? {} : { createdAt: new Date() }),
      }, { merge: true });
      return NextResponse.json({ success: true, id }, { headers: noStore });
    }

    if (action === "delete-school-node") {
      const id = cleanText(body.id, 64);
      if (!ID_PATTERN.test(id)) return NextResponse.json({ success: false, message: "Invalid catalog entry" }, { status: 400, headers: noStore });
      const ref = db.collection("schoolLearningNodes").doc(id);
      const snap = await ref.get();
      if (!snap.exists || snap.data()?.ownerUid !== uploaderUid) {
        return NextResponse.json({ success: false, message: "आप केवल अपनी बनाई हुई entry हटा सकते हैं।" }, { status: 403, headers: noStore });
      }
      const children = await db.collection("schoolLearningNodes").where("parentId", "==", id).limit(1).get();
      if (!children.empty) return NextResponse.json({ success: false, message: "पहले इसके अंदर की entries हटाएँ या move करें।" }, { status: 409, headers: noStore });
      await ref.delete();
      return NextResponse.json({ success: true, id }, { headers: noStore });
    }

    return NextResponse.json({ success: false, message: "Unknown action" }, { status: 400, headers: noStore });
  } catch {
    return NextResponse.json({ success: false, message: "Catalog update failed" }, { status: 500, headers: noStore });
  }
}

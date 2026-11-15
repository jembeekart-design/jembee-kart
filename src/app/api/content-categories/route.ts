import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import NCERT_GRADE_6_SEED from "@/data/learning-library/ncert-grade-6-seed.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store, max-age=0" };
const ID_PATTERN = /^[a-z0-9][a-z0-9_-]{1,63}$/;
const NODE_TYPES = ["subject", "book", "chapter", "question"] as const;
type NodeType = typeof NODE_TYPES[number];
const PARENT_TYPES: Record<NodeType, NodeType[]> = {
  subject: [],
  book: ["subject"],
  chapter: ["book"],
  question: ["chapter"],
};
const cleanText = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max) : "";
const cleanList = (value: unknown, maxItems = 80) => Array.isArray(value)
  ? value.map((item) => cleanText(item, 120)).filter(Boolean).slice(0, maxItems)
  : [];
const isAllowedBookCover = (value: string) =>
  /^\/learning-covers\/[a-z0-9-]+\.svg$/.test(value) || (() => {
    try { return new URL(value).protocol === "https:"; } catch { return false; }
  })();

async function verifyUploader(req: Request): Promise<string> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const token = header.slice(7).trim();
  if (!token) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(token, true);
  return decoded.uid;
}

async function verifyAdmin(req: Request): Promise<string> {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(header.slice(7).trim(), true);
  const db = getAdminDb();
  const direct = await db.collection("users").doc(decoded.uid).get();
  let role = direct.data()?.role;
  if (role !== "admin" && role !== "super_admin") {
    const fallback = await db.collection("users").where("uid", "==", decoded.uid).limit(1).get();
    role = fallback.docs[0]?.data()?.role;
  }
  if (role !== "admin" && role !== "super_admin") throw new Error("FORBIDDEN");
  return decoded.uid;
}

function authError(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  return NextResponse.json(
    { success: false, message: code === "UNAUTHORIZED" ? "कृपया पहले लॉगिन करें।" : code === "FORBIDDEN" ? "इस Learning Library को केवल Admin बदल सकता है।" : "आपका login सत्यापित नहीं हो सका।" },
    { status: code === "FORBIDDEN" ? 403 : 401, headers: noStore },
  );
}

export async function GET(req: Request) {
  try {
    const db = getAdminDb();
    const params = new URL(req.url).searchParams;
    const requestedType = cleanText(params.get("type"), 20);
    const parentId = cleanText(params.get("parentId"), 64);
    const cursor = cleanText(params.get("cursor"), 64);
    const pageSizeValue = Number(params.get("pageSize") || 25);
    const pageSize = Number.isInteger(pageSizeValue) ? Math.min(50, Math.max(1, pageSizeValue)) : 25;
    const nodeId = cleanText(params.get("nodeId"), 64);

    const categorySnap = await db.collection("contentCategories").where("status", "==", "published").limit(200).get();
    const categories = categorySnap.docs.map((doc) => {
      const { ownerUid: _ownerUid, updatedBy: _updatedBy, createdByUid: _createdByUid, ...data } = doc.data();
      return { id: doc.id, ...data };
    });

    // Exact published-node lookup supports deep links without loading the full catalog.
    if (nodeId) {
      if (!ID_PATTERN.test(nodeId)) return NextResponse.json({ success: false, message: "Invalid learning node ID" }, { status: 400, headers: noStore });
      const doc = await db.collection("schoolLearningNodes").doc(nodeId).get();
      if (!doc.exists || doc.data()?.status !== "published" || !NODE_TYPES.includes(doc.data()?.type)) {
        return NextResponse.json({ success: false, message: "Published learning entry not found" }, { status: 404, headers: noStore });
      }
      const { ownerUid: _ownerUid, updatedBy: _updatedBy, createdByUid: _createdByUid, ...data } = doc.data()!;
      return NextResponse.json({ success: true, categories, learningNode: { id: doc.id, ...data } }, { headers: noStore });
    }

    // Cursor pagination is scoped to one hierarchy level so large catalogs never
    // require downloading the entire Subject → Book → Chapter → Question tree.
    if (requestedType) {
      if (!NODE_TYPES.includes(requestedType as NodeType)) {
        return NextResponse.json({ success: false, message: "Invalid learning node type" }, { status: 400, headers: noStore });
      }
      const type = requestedType as NodeType;
      if (PARENT_TYPES[type].length > 0 && !ID_PATTERN.test(parentId)) {
        return NextResponse.json({ success: false, message: "A valid parentId is required for this learning level" }, { status: 400, headers: noStore });
      }
      if (PARENT_TYPES[type].length === 0 && parentId) {
        return NextResponse.json({ success: false, message: "Subject entries cannot have a parent" }, { status: 400, headers: noStore });
      }
      let query = db.collection("schoolLearningNodes")
        .where("status", "==", "published")
        .where("type", "==", type);
      if (PARENT_TYPES[type].length > 0) query = query.where("parentId", "==", parentId);
      query = query.orderBy("__name__");
      if (cursor) {
        if (!ID_PATTERN.test(cursor)) return NextResponse.json({ success: false, message: "Invalid pagination cursor" }, { status: 400, headers: noStore });
        const cursorDoc = await db.collection("schoolLearningNodes").doc(cursor).get();
        if (!cursorDoc.exists || cursorDoc.data()?.type !== type || cursorDoc.data()?.status !== "published" ||
          (PARENT_TYPES[type].length > 0 && cursorDoc.data()?.parentId !== parentId)) {
          return NextResponse.json({ success: false, message: "Pagination cursor is no longer valid" }, { status: 400, headers: noStore });
        }
        query = query.startAfter(cursorDoc);
      }
      const nodeSnap = await query.limit(pageSize + 1).get();
      const hasMore = nodeSnap.docs.length > pageSize;
      const pageDocs = nodeSnap.docs.slice(0, pageSize);
      const learningNodes = pageDocs.map((doc) => {
        const { ownerUid: _ownerUid, updatedBy: _updatedBy, createdByUid: _createdByUid, ...data } = doc.data();
        return { id: doc.id, ...data, type: data.type as NodeType };
      });
      return NextResponse.json({
        success: true, categories, learningNodes,
        pagination: { pageSize, hasMore, nextCursor: hasMore ? pageDocs[pageDocs.length - 1]?.id || null : null },
      }, { headers: noStore });
    }

    // Legacy response retained while non-learning consumers migrate to scoped queries.
    const nodeSnap = await db.collection("schoolLearningNodes").where("status", "==", "published").limit(1000).get();
    const learningNodes = nodeSnap.docs.map((doc) => {
      const { ownerUid: _ownerUid, updatedBy: _updatedBy, createdByUid: _createdByUid, ...data } = doc.data();
      return { id: doc.id, ...data, type: data.type as NodeType };
    }).filter((item) => NODE_TYPES.includes(item.type));
    return NextResponse.json({ success: true, categories, learningNodes }, { headers: noStore });
  } catch {
    return NextResponse.json({ success: false, message: "Learning Library could not be loaded" }, { status: 500, headers: noStore });
  }
}

export async function POST(req: Request) {
  let uploaderUid = "";
  try { uploaderUid = await verifyUploader(req); } catch (error) { return authError(error); }

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 256 * 1024) {
      return NextResponse.json({ success: false, message: "Request too large" }, { status: 413, headers: noStore });
    }
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400, headers: noStore });
  }

  const db = getAdminDb();
  const action = cleanText(body.action, 40);
  try {
    if (action === "bulk-import-learning-library" || action === "seed-ncert-grade-6") {
      try { uploaderUid = await verifyAdmin(req); } catch (error) { return authError(error); }
      const entries = action === "seed-ncert-grade-6"
        ? NCERT_GRADE_6_SEED.entries
        : Array.isArray(body.entries) ? body.entries : [];
      const maxEntries = action === "seed-ncert-grade-6" ? 500 : 100;
      if (!entries.length || entries.length > maxEntries) {
        return NextResponse.json({ success: false, message: `एक import में 1 से ${maxEntries} entries भेजें।` }, { status: 400, headers: noStore });
      }
      const normalized = entries.map((rawEntry) => {
        const entry = rawEntry && typeof rawEntry === "object" ? rawEntry as Record<string, unknown> : {};
        return {
          id: cleanText(entry.id, 64),
          type: cleanText(entry.type, 20) as NodeType,
          name: cleanText(entry.name, cleanText(entry.type, 20) === "question" ? 3000 : 180),
          parentId: cleanText(entry.parentId, 64),
          coverImageUrl: cleanText(entry.coverImageUrl, 2048),
          questionNumber: cleanText(entry.questionNumber, 40),
          sourceType: cleanText(entry.sourceType, 32),
          sourceReference: cleanText(entry.sourceReference, 2048),
          licenseName: cleanText(entry.licenseName, 120),
          rightsVerified: entry.rightsVerified === true,
        };
      });
      const ids = new Set<string>();
      for (const entry of normalized) {
        if (!ID_PATTERN.test(entry.id) || ids.has(entry.id) || !NODE_TYPES.includes(entry.type) || !entry.name) {
          return NextResponse.json({ success: false, message: "Import file में duplicate ID या invalid entry मिली।" }, { status: 400, headers: noStore });
        }
        ids.add(entry.id);
        if (entry.type === "question" && entry.sourceType && !["jembee-practice", "user-authored", "open-license", "permissioned-textbook"].includes(entry.sourceType)) {
          return NextResponse.json({ success: false, message: "Question sourceType मान्य नहीं है।" }, { status: 400, headers: noStore });
        }
        if (entry.type === "question" && entry.sourceType === "permissioned-textbook" && (!entry.rightsVerified || !entry.sourceReference.startsWith("https://"))) {
          return NextResponse.json({ success: false, message: "Textbook question publish करने के लिए Admin-verified permission और HTTPS source reference आवश्यक है।" }, { status: 400, headers: noStore });
        }
        if (entry.type === "question" && entry.sourceType === "open-license" && (!entry.licenseName || !entry.sourceReference.startsWith("https://"))) {
          return NextResponse.json({ success: false, message: "Open-license question के लिए license name और HTTPS source reference आवश्यक है।" }, { status: 400, headers: noStore });
        }
        if (entry.type !== "question" && (entry.questionNumber || entry.sourceType || entry.sourceReference || entry.licenseName || entry.rightsVerified)) {
          return NextResponse.json({ success: false, message: "Question source metadata केवल Question entry पर लागू है।" }, { status: 400, headers: noStore });
        }
        if (entry.type === "book") {
          if (!entry.coverImageUrl) return NextResponse.json({ success: false, message: "हर Book entry के साथ cover image आवश्यक है।" }, { status: 400, headers: noStore });
          if (!isAllowedBookCover(entry.coverImageUrl)) {
            return NextResponse.json({ success: false, message: "हर Book cover के लिए valid HTTPS URL या approved local cover path दें।" }, { status: 400, headers: noStore });
          }
        }
      }
      const entryById = new Map(normalized.map((entry) => [entry.id, entry]));
      const parentIds = [...new Set(normalized.map((entry) => entry.parentId).filter(Boolean))];
      const parentDocs = await Promise.all(parentIds.map(async (id) => {
        const local = entryById.get(id);
        if (local) return { id, type: local.type, status: "published" };
        const snap = await db.collection("schoolLearningNodes").doc(id).get();
        return { id, type: snap.data()?.type, status: snap.data()?.status };
      }));
      const parentTypes = new Map(parentDocs.map((item) => [item.id, item]));
      for (const entry of normalized) {
        const allowed = PARENT_TYPES[entry.type];
        if (!allowed.length && entry.parentId) return NextResponse.json({ success: false, message: "Subject top-level entry होना चाहिए।" }, { status: 400, headers: noStore });
        if (allowed.length) {
          const parent = parentTypes.get(entry.parentId);
          if (!parent || parent.status !== "published" || !allowed.includes(parent.type as NodeType)) {
            return NextResponse.json({ success: false, message: "Import file में parent-child hierarchy गलत है।" }, { status: 400, headers: noStore });
          }
        }
        if (entry.type !== "book" && entry.coverImageUrl) {
          return NextResponse.json({ success: false, message: "Cover image केवल Book entry पर रखें।" }, { status: 400, headers: noStore });
        }
      }
      const existingNodeSnapshots = await Promise.all(normalized.map((entry) => db.collection("schoolLearningNodes").doc(entry.id).get()));
      const batch = db.batch();
      for (const [index, entry] of normalized.entries()) {
        const existingNode = existingNodeSnapshots[index];
        const existingStatus = existingNode.data()?.status;
        batch.set(db.collection("schoolLearningNodes").doc(entry.id), {
          id: entry.id, type: entry.type, name: entry.name, parentId: entry.parentId || null,
          // Re-seeding must never silently re-publish an entry that an Admin unpublished.
          status: existingNode.exists && typeof existingStatus === "string" ? existingStatus : "published",
          ...(entry.type === "book" ? { coverImageUrl: entry.coverImageUrl } : {}),
          ...(entry.type === "question" ? {
            questionNumber: entry.questionNumber,
            sourceType: entry.sourceType,
            sourceReference: entry.sourceReference,
            licenseName: entry.licenseName,
            rightsVerified: entry.rightsVerified,
          } : {}),
          managedBy: "admin", updatedBy: uploaderUid, updatedAt: new Date(),
          importedAt: new Date(),
        }, { merge: true });
      }
      await batch.commit();
      return NextResponse.json({ success: true, imported: normalized.length }, { headers: noStore });
    }

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
        status: "published", ownerUid: uploaderUid, createdByUid: uploaderUid,
        updatedAt: new Date(), ...(current.exists ? {} : { createdAt: new Date() }),
      }, { merge: true });
      return NextResponse.json({ success: true, id }, { headers: noStore });
    }

    if (action === "save-school-node" || action === "delete-school-node") {
      try { uploaderUid = await verifyAdmin(req); } catch (error) { return authError(error); }
    }

    if (action === "save-school-node") {
      const type = cleanText(body.type, 20) as NodeType;
      const name = cleanText(body.name, type === "question" ? 3000 : 180);
      const parentId = cleanText(body.parentId, 64);
      const existingId = cleanText(body.id, 64);
      const coverImageUrl = cleanText(body.coverImageUrl, 2048);
      const questionNumber = cleanText(body.questionNumber, 40);
      const sourceType = cleanText(body.sourceType, 32);
      const sourceReference = cleanText(body.sourceReference, 2048);
      const licenseName = cleanText(body.licenseName, 120);
      const rightsVerified = body.rightsVerified === true;
      if (!NODE_TYPES.includes(type) || !name || (existingId && !ID_PATTERN.test(existingId))) {
        return NextResponse.json({ success: false, message: "Learning entry की जानकारी सही नहीं है।" }, { status: 400, headers: noStore });
      }
      if (type === "question" && sourceType && !["jembee-practice", "user-authored", "open-license", "permissioned-textbook"].includes(sourceType)) {
        return NextResponse.json({ success: false, message: "Question sourceType मान्य नहीं है।" }, { status: 400, headers: noStore });
      }
      if (type === "question" && sourceType === "permissioned-textbook" && (!rightsVerified || !sourceReference.startsWith("https://"))) {
        return NextResponse.json({ success: false, message: "Textbook question publish करने के लिए Admin-verified permission और HTTPS source reference आवश्यक है।" }, { status: 400, headers: noStore });
      }
      if (type === "question" && sourceType === "open-license" && (!licenseName || !sourceReference.startsWith("https://"))) {
        return NextResponse.json({ success: false, message: "Open-license question के लिए license name और HTTPS source reference आवश्यक है।" }, { status: 400, headers: noStore });
      }
      if (type !== "question" && (questionNumber || sourceType || sourceReference || licenseName || rightsVerified)) {
        return NextResponse.json({ success: false, message: "Question source metadata केवल Question entry पर लागू है।" }, { status: 400, headers: noStore });
      }
      if (type === "book" && !coverImageUrl) return NextResponse.json({ success: false, message: "Book cover image आवश्यक है।" }, { status: 400, headers: noStore });
      if (type === "book" && coverImageUrl) {
        if (!isAllowedBookCover(coverImageUrl)) {
          return NextResponse.json({ success: false, message: "Book cover के लिए valid HTTPS URL या approved local cover path दें।" }, { status: 400, headers: noStore });
        }
      }
      if (type !== "book" && coverImageUrl) {
        return NextResponse.json({ success: false, message: "Cover image केवल Book पर लागू है।" }, { status: 400, headers: noStore });
      }
      const allowedParents = PARENT_TYPES[type];
      if (allowedParents.length === 0 && parentId) {
        return NextResponse.json({ success: false, message: "Subject top-level entry है।" }, { status: 400, headers: noStore });
      }
      if (allowedParents.length > 0) {
        if (!ID_PATTERN.test(parentId)) return NextResponse.json({ success: false, message: "पहले सही parent entry चुनें।" }, { status: 400, headers: noStore });
        const parent = await db.collection("schoolLearningNodes").doc(parentId).get();
        if (!parent.exists || !allowedParents.includes(String(parent.data()?.type) as NodeType) || parent.data()?.status !== "published") {
          return NextResponse.json({ success: false, message: "चुनी गई parent entry उपलब्ध नहीं है।" }, { status: 400, headers: noStore });
        }
      }
      const id = existingId || `${type}-${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
      const ref = db.collection("schoolLearningNodes").doc(id);
      const current = existingId ? await ref.get() : null;
      if (existingId && (!current?.exists || current.data()?.type !== type)) {
        return NextResponse.json({ success: false, message: "Catalog entry उपलब्ध नहीं है या उसका type बदल गया है।" }, { status: 404, headers: noStore });
      }
      await ref.set({
        id, type, name, parentId: parentId || null, status: "published",
        ...(type === "book" ? { coverImageUrl } : {}),
        ...(type === "question" ? { questionNumber, sourceType, sourceReference, licenseName, rightsVerified } : {}),
        managedBy: "admin", updatedBy: uploaderUid, updatedAt: new Date(),
        ...(current?.exists ? {} : { createdByUid: uploaderUid, createdAt: new Date() }),
      }, { merge: true });
      return NextResponse.json({ success: true, id }, { headers: noStore });
    }

    if (action === "delete-school-node") {
      const id = cleanText(body.id, 64);
      if (!ID_PATTERN.test(id)) return NextResponse.json({ success: false, message: "Invalid catalog entry" }, { status: 400, headers: noStore });
      const ref = db.collection("schoolLearningNodes").doc(id);
      const snap = await ref.get();
      if (!snap.exists) return NextResponse.json({ success: false, message: "Catalog entry नहीं मिली।" }, { status: 404, headers: noStore });
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

import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import { isAdminIdentity, requireAdmin } from "@/lib/server/requireAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ID_PATTERN = /^[a-z0-9][a-z0-9_-]{1,63}$/;

export async function GET(req: Request) {
  const identity = await requireAdmin(req);
  if (!isAdminIdentity(identity)) return identity;
  try {
    const snapshot = await getAdminDb()
      .collection("schoolLearningNodes")
      .orderBy("type", "asc")
      .limit(1000)
      .get();
    const categorySnapshot = await getAdminDb().collection("contentCategories").limit(200).get();
    const categories = categorySnapshot.docs.map((item) => {
      const data = item.data();
      return { id: item.id, name: typeof data.name === "string" ? data.name : "", description: typeof data.description === "string" ? data.description : "", topics: Array.isArray(data.topics) ? data.topics.filter((topic) => typeof topic === "string").slice(0, 60) : [], status: typeof data.status === "string" ? data.status : "unknown", ownerUid: typeof data.ownerUid === "string" ? data.ownerUid : null };
    });
    const nodes = snapshot.docs.map((item) => {
      const data = item.data();
      return {
        id: item.id,
        type: typeof data.type === "string" ? data.type : "",
        name: typeof data.name === "string" ? data.name : "",
        parentId: typeof data.parentId === "string" ? data.parentId : null,
        status: typeof data.status === "string" ? data.status : "unknown",
      };
    });
    return NextResponse.json({ success: true, nodes, categories }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Admin Learning catalog load failed:", error);
    return NextResponse.json({ success: false, message: "Catalog could not be loaded" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const identity = await requireAdmin(req);
  if (!isAdminIdentity(identity)) return identity;

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 4 * 1024) {
      return NextResponse.json({ success: false, message: "Request too large" }, { status: 413 });
    }
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  const status = body.status;
  const kind = body.kind === "explore-category" ? "explore-category" : "school-node";
  if (!ID_PATTERN.test(id) || (status !== "published" && status !== "unpublished")) {
    return NextResponse.json({ success: false, message: "Valid entry and status are required" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const collectionName = kind === "explore-category" ? "contentCategories" : "schoolLearningNodes";
    const ref = db.collection(collectionName).doc(id);
    const auditRef = db.collection("learningCatalogAuditLogs").doc();
    const result = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) return { missing: true as const };
      const current = snapshot.data() || {};
      const previousStatus = current.status;
      if (previousStatus !== "pending" && previousStatus !== "published" && previousStatus !== "unpublished") {
        return { invalid: true as const };
      }
      if (previousStatus === status) return { unchanged: true as const };
      transaction.update(ref, {
        status,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: identity.uid,
        ...(status === "unpublished" ? { unpublishedAt: FieldValue.serverTimestamp(), unpublishedBy: identity.uid } : {
          publishedAt: FieldValue.serverTimestamp(),
          publishedBy: identity.uid,
        }),
      });
      transaction.create(auditRef, {
        action: status === "published" ? "publish" : "unpublish",
        nodeId: id,
        nodeType: kind === "explore-category" ? "explore-category" : (typeof current.type === "string" ? current.type : "unknown"),
        nodeName: typeof current.name === "string" ? current.name : "",
        previousStatus,
        newStatus: status,
        adminUid: identity.uid,
        createdAt: FieldValue.serverTimestamp(),
      });
      return { updated: true as const };
    });

    if ("missing" in result) return NextResponse.json({ success: false, message: "Catalog entry not found" }, { status: 404 });
    if ("invalid" in result) return NextResponse.json({ success: false, message: "Catalog entry has an unsupported status" }, { status: 409 });
    return NextResponse.json({ success: true, status, unchanged: "unchanged" in result });
  } catch (error) {
    console.error("Admin Learning catalog status update failed:", error);
    return NextResponse.json({ success: false, message: "Catalog status could not be updated" }, { status: 500 });
  }
}

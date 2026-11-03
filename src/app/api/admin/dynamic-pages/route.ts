import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { FieldPath, FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import { requireAdmin, isAdminIdentity } from "@/lib/server/requireAdmin";
import { isPlainRecord } from "./validation.mjs";
import { verifyAuditChain } from "./audit-verification.mjs";

export const dynamic = "force-dynamic";

const RESERVED_SLUGS = new Set(["refund-policy"]);
const SLUG_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
const MAX_TITLE_LENGTH = 120;
function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") { const record = value as Record<string, unknown>; return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(",")}}`; }
  return JSON.stringify(value) ?? "null";
}

type AuditPayload = { pageId: string; auditRevision: number; previousHash: string | null; actorUid: string; action: string; details: Record<string, unknown>; schemaVersion: 1 };
function auditHash(payload: AuditPayload): string { return createHash("sha256").update(stableJson(payload)).digest("hex"); }
function makeAuditRecord(payload: AuditPayload) { return { ...payload, hash: auditHash(payload), createdAt: FieldValue.serverTimestamp() }; }


function validSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= 80 && SLUG_PATTERN.test(value) && !RESERVED_SLUGS.has(value);
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminIdentity(admin)) return admin;

  try {
    const requestedAudit = new URL(request.url).searchParams.get("audit");
    if (requestedAudit !== null) {
      if (!validSlug(requestedAudit)) {
        return NextResponse.json({ success: false, message: "Valid page ID is required" }, { status: 400 });
      }
      const verifyRequested = new URL(request.url).searchParams.get("verify") === "true";
      if (verifyRequested) {
        const snapshot = await getAdminDb().collection("dynamic_page_audit").where("pageId", "==", requestedAudit).orderBy("auditRevision", "asc").limit(5001).get();
        const chain = verifyAuditChain(
          snapshot.docs.map((item) => item.data()),
          { pageId: requestedAudit },
        );
        const db = getAdminDb();
        const allCount = await db.collection("dynamic_page_audit").where("pageId", "==", requestedAudit).count().get();
        const legacyEvents = allCount.data().count - snapshot.size;
        const pageSnapshot = await db.collection("dynamic_pages").doc(requestedAudit).get();
        const pageData = pageSnapshot.data() ?? {};
        const pageRevision = Number.isSafeInteger(pageData?.auditRevision) ? pageData.auditRevision : 0;
        const pageHash = typeof pageData?.lastAuditHash === "string" ? pageData.lastAuditHash : null;
        const pageHeadMatches = pageRevision === snapshot.size && pageHash === chain.lastHash;
        const valid = chain.valid && pageHeadMatches;
        return NextResponse.json({ success: true, verified: valid && snapshot.size > 0 && snapshot.size <= 5000 && legacyEvents === 0, checkedEvents: snapshot.size, legacyEvents, truncated: snapshot.size > 5000, message: snapshot.size > 5000 ? "Audit chain exceeds the 5,000-event verification limit" : legacyEvents > 0 ? "Legacy events predate hash chaining and are not covered" : !pageHeadMatches ? "Audit chain does not match the page's stored revision and hash" : valid ? "Audit hash chain is valid" : "Audit hash chain verification failed" });
      }
      const audit = await getAdminDb().collection("dynamic_page_audit")
        .where("pageId", "==", requestedAudit)
        .orderBy("createdAt", "desc").limit(50).get();
      return NextResponse.json({
        success: true,
        events: audit.docs.map((item) => {
          const data = item.data();
          return {
            id: item.id,
            action: typeof data.action === "string" ? data.action : "unknown",
            auditRevision: Number.isSafeInteger(data.auditRevision) ? data.auditRevision : null,
            hash: typeof data.hash === "string" ? data.hash : null,
            previousHash: typeof data.previousHash === "string" ? data.previousHash : null,
            actorUid: typeof data.actorUid === "string" ? data.actorUid : "",
            createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
            details: data.details && typeof data.details === "object" ? data.details : {},
          };
        }),
      });
    }
    const requestedHistory = new URL(request.url).searchParams.get("history");
    if (requestedHistory !== null) {
      if (!validSlug(requestedHistory)) {
        return NextResponse.json({ success: false, message: "Valid page ID is required" }, { status: 400 });
      }
      const history = await getAdminDb()
        .collection("dynamic_pages").doc(requestedHistory)
        .collection("versions").orderBy("createdAt", "desc").limit(20).get();
      return NextResponse.json({
        success: true,
        versions: history.docs.map((item) => {
          const data = item.data();
          return {
            id: item.id,
            title: typeof data.title === "string" ? data.title : "",
            content: typeof data.content === "string" ? data.content : "",
            createdBy: typeof data.createdBy === "string" ? data.createdBy : "",
            createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
          };
        }),
      });
    }
    const url = new URL(request.url);
    const includeArchived = url.searchParams.get("archived") === "true";
    const rawLimit = Number(url.searchParams.get("limit") || "50");
    const pageSize = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 50;
    const cursor = url.searchParams.get("cursor");
    let query = getAdminDb().collection("dynamic_pages")
      .orderBy(FieldPath.documentId(), "asc")
      .limit(pageSize + 1);
    if (cursor) {
      const cursorDoc = await getAdminDb().collection("dynamic_pages").doc(cursor).get();
      if (!cursorDoc.exists) {
        return NextResponse.json({ success: false, message: "Invalid page cursor" }, { status: 400 });
      }
      query = query.startAfter(cursorDoc);
    }
    const snapshot = await query.get();
    const scannedDocs = snapshot.docs.slice(0, pageSize);
    const hasMore = snapshot.docs.length > pageSize;
    const pageDocs = scannedDocs
      .filter((item) => !RESERVED_SLUGS.has(item.id))
      .filter((item) => (item.data().isDeleted === true) === includeArchived);
    const pages = pageDocs.map((item) => {
      const data = item.data();
      return {
        id: item.id,
        title: typeof data.title === "string" ? data.title : "",
        slug: typeof data.slug === "string" ? data.slug : item.id,
        visible: data.visible === true,
        archived: data.isDeleted === true,
        content: typeof data.content === "string" ? data.content : "",
        auditRevision: Number.isSafeInteger(data.auditRevision) ? data.auditRevision : 0,
      };
    });
    const nextCursor = hasMore ? scannedDocs[scannedDocs.length - 1]?.id ?? null : null;
    return NextResponse.json({ success: true, pages, nextCursor, hasMore, pageSize });
  } catch {
    return NextResponse.json({ success: false, message: "Could not load pages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminIdentity(admin)) return admin;

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }
  if (!isPlainRecord(body)) {
    return NextResponse.json({ success: false, message: "JSON object required" }, { status: 400 });
  }
  const input = body as { title?: unknown; slug?: unknown };
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const slug = input.slug;
  if (Object.keys(input).some((key) => !["title", "slug"].includes(key)) ||
      !title || title.length > MAX_TITLE_LENGTH || !validSlug(slug)) {
    return NextResponse.json({ success: false, message: "Valid title and URL slug are required; unsupported fields are not accepted" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const ref = db.collection("dynamic_pages").doc(slug);
    const auditRef = db.collection("dynamic_page_audit").doc();
    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(ref);
      if (existing.exists) throw new Error("PAGE_EXISTS");
      const auditPayload: AuditPayload = { pageId: slug, auditRevision: 1, previousHash: null, actorUid: admin.uid, action: "page_created", details: { title, visible: false }, schemaVersion: 1 };
      transaction.create(ref, { title, slug, visible: false, content: "", auditRevision: 1, lastAuditHash: auditHash(auditPayload), createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy: admin.uid });
      transaction.create(auditRef, makeAuditRecord(auditPayload));
    });
    return NextResponse.json({ success: true, page: { id: slug, title, slug, visible: false, content: "", auditRevision: 1 } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "PAGE_EXISTS") {
      return NextResponse.json({ success: false, message: "Page with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Could not create page" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminIdentity(admin)) return admin;

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }
  if (!isPlainRecord(body)) {
    return NextResponse.json({ success: false, message: "JSON object required" }, { status: 400 });
  }
  const input = body as { id?: unknown; visible?: unknown; content?: unknown; expectedAuditRevision?: unknown };
  const hasVisibility = Object.prototype.hasOwnProperty.call(input, "visible");
  if (hasVisibility && input.visible === true && admin.role !== "super_admin") {
    return NextResponse.json({ success: false, message: "Only a super admin can approve and publish a page" }, { status: 403 });
  }
  const hasContent = Object.prototype.hasOwnProperty.call(input, "content");
  if (Object.keys(input).some((key) => !["id", "visible", "content", "expectedAuditRevision"].includes(key)) ||
      !validSlug(input.id) || !Number.isSafeInteger(input.expectedAuditRevision) || (input.expectedAuditRevision as number) < 0 || (!hasVisibility && !hasContent) ||
      (hasVisibility && typeof input.visible !== "boolean") ||
      (hasContent && (typeof input.content !== "string" || input.content.length > 20000))) {
    return NextResponse.json({ success: false, message: "Valid page ID and content or visibility are required (content limit: 20,000 characters)" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const ref = db.collection("dynamic_pages").doc(input.id);
    const auditRef = db.collection("dynamic_page_audit").doc();
    let resultingRevision = 0;
    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(ref);
      if (!existing.exists) throw new Error("PAGE_NOT_FOUND");
      const page = existing.data() ?? {};
      const currentRevision = Number.isSafeInteger(page.auditRevision) ? page.auditRevision : 0;
      if (currentRevision !== input.expectedAuditRevision) throw new Error("STALE_PAGE_REVISION");
      resultingRevision = currentRevision;
      if (page?.isDeleted === true) throw new Error("PAGE_ARCHIVED");
      if (hasVisibility && input.visible === true &&
          (typeof page?.content !== "string" || !page.content.trim())) {
        throw new Error("PAGE_CONTENT_REQUIRED");
      }
      if (hasVisibility && input.visible === true && page?.contentUpdatedBy === admin.uid) {
        throw new Error("SAME_ADMIN_APPROVAL");
      }
      const update: Record<string, unknown> = {
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: admin.uid,
      };
      let contentChanged = false;
      let visibilityChanged = false;
      if (hasContent) {
        const previousContent = typeof page?.content === "string" ? page.content : "";
        const nextContent = (input.content as string).replace(/\r\n?/g, "\n");
        contentChanged = previousContent !== nextContent;
        if (contentChanged) {
          const versionRef = ref.collection("versions").doc();
          transaction.create(versionRef, {
            title: typeof page?.title === "string" ? page.title : "",
            content: previousContent,
            createdBy: typeof page?.contentUpdatedBy === "string"
              ? page.contentUpdatedBy
              : (typeof page?.createdBy === "string" ? page.createdBy : admin.uid),
            createdAt: FieldValue.serverTimestamp(),
            reason: "content_edit_snapshot",
          });
          update.content = nextContent;
          update.contentUpdatedAt = FieldValue.serverTimestamp();
          update.contentUpdatedBy = admin.uid;
        }
      }
      if (hasVisibility) {
        visibilityChanged = page?.visible !== input.visible;
        if (visibilityChanged) {
          update.visible = input.visible;
          if (input.visible === true) {
            update.publishedAt = FieldValue.serverTimestamp();
            update.publishedBy = admin.uid;
            update.approvalStatus = "approved";
          } else {
            update.approvalStatus = "unpublished";
          }
        }
      }
      // A no-op save must not create a misleading audit event or revision.
      if (!contentChanged && !visibilityChanged) return;
      const action = contentChanged && visibilityChanged
        ? (input.visible ? "page_content_updated_and_published" : "page_content_updated_and_hidden")
        : visibilityChanged
          ? (input.visible ? "page_published" : "page_hidden")
          : "page_content_updated";
      const auditRevision = currentRevision + 1;
      const previousHash = typeof page?.lastAuditHash === "string" ? page.lastAuditHash : null;
      const auditPayload: AuditPayload = { pageId: input.id as string, auditRevision, previousHash, actorUid: admin.uid, action, details: { contentChanged, visibilityChanged }, schemaVersion: 1 };
      update.auditRevision = auditRevision; update.lastAuditHash = auditHash(auditPayload);
      resultingRevision = auditRevision;
      transaction.update(ref, update); transaction.create(auditRef, makeAuditRecord(auditPayload));
    });
    return NextResponse.json({ success: true, auditRevision: resultingRevision, ...(hasContent ? { contentSaved: true } : {}) });
  } catch (error) {
    if (error instanceof Error && error.message === "PAGE_NOT_FOUND") {
      return NextResponse.json({ success: false, message: "Page not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "STALE_PAGE_REVISION") {
      return NextResponse.json({ success: false, message: "This page changed since it was loaded. Refresh and review the latest version before saving." }, { status: 409 });
    }
    if (error instanceof Error && error.message === "PAGE_ARCHIVED") {
      return NextResponse.json({ success: false, message: "Archived pages cannot be edited or published" }, { status: 410 });
    }
    if (error instanceof Error && error.message === "PAGE_CONTENT_REQUIRED") {
      return NextResponse.json({ success: false, message: "Add and review page content before making it public" }, { status: 409 });
    }
    if (error instanceof Error && error.message === "SAME_ADMIN_APPROVAL") {
      return NextResponse.json({ success: false, message: "A different super admin must approve content before publication" }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Could not update page" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminIdentity(admin)) return admin;
  if (admin.role !== "super_admin") {
    return NextResponse.json({ success: false, message: "Only a super admin can restore a page" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }
  if (!isPlainRecord(body)) {
    return NextResponse.json({ success: false, message: "JSON object required" }, { status: 400 });
  }
  const input = body as { id?: unknown; expectedAuditRevision?: unknown };
  if (Object.keys(input).some((key) => !["id", "expectedAuditRevision"].includes(key)) ||
      !validSlug(input.id) || !Number.isSafeInteger(input.expectedAuditRevision) || (input.expectedAuditRevision as number) < 0) {
    return NextResponse.json({ success: false, message: "Valid page ID is required" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const ref = db.collection("dynamic_pages").doc(input.id);
    const auditRef = db.collection("dynamic_page_audit").doc();
    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(ref);
      if (!existing.exists) throw new Error("PAGE_NOT_FOUND");
      const page = existing.data() ?? {};
      const currentRevision = Number.isSafeInteger(page?.auditRevision) ? page.auditRevision : 0;
      if (currentRevision !== input.expectedAuditRevision) throw new Error("STALE_PAGE_REVISION");
      if (page?.isDeleted !== true) throw new Error("PAGE_NOT_ARCHIVED");
      const auditRevision = currentRevision + 1;
      const previousHash = typeof page?.lastAuditHash === "string" ? page.lastAuditHash : null;
      const auditPayload: AuditPayload = { pageId: input.id as string, auditRevision, previousHash, actorUid: admin.uid, action: "page_restored", details: { visible: false }, schemaVersion: 1 };
      transaction.update(ref, { isDeleted: false, visible: false, approvalStatus: "restored_hidden", restoredAt: FieldValue.serverTimestamp(), restoredBy: admin.uid, updatedAt: FieldValue.serverTimestamp(), updatedBy: admin.uid, auditRevision, lastAuditHash: auditHash(auditPayload) });
      transaction.create(auditRef, makeAuditRecord(auditPayload));
    });
    return NextResponse.json({ success: true, restored: true, visible: false });
  } catch (error) {
    if (error instanceof Error && error.message === "PAGE_NOT_FOUND") {
      return NextResponse.json({ success: false, message: "Page not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "STALE_PAGE_REVISION") {
      return NextResponse.json({ success: false, message: "This page changed since it was loaded. Refresh before restoring." }, { status: 409 });
    }
    if (error instanceof Error && error.message === "PAGE_NOT_ARCHIVED") {
      return NextResponse.json({ success: false, message: "Page is not archived" }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Could not restore page" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin(request);
  if (!isAdminIdentity(admin)) return admin;
  if (admin.role !== "super_admin") {
    return NextResponse.json({ success: false, message: "Only a super admin can archive a page" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }
  if (!isPlainRecord(body)) {
    return NextResponse.json({ success: false, message: "JSON object required" }, { status: 400 });
  }
  const input = body as { id?: unknown; expectedAuditRevision?: unknown };
  if (Object.keys(input).some((key) => !["id", "expectedAuditRevision"].includes(key)) ||
      !validSlug(input.id) || !Number.isSafeInteger(input.expectedAuditRevision) || (input.expectedAuditRevision as number) < 0) {
    return NextResponse.json({ success: false, message: "Valid page ID is required" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const ref = db.collection("dynamic_pages").doc(input.id);
    const auditRef = db.collection("dynamic_page_audit").doc();
    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(ref);
      if (!existing.exists) throw new Error("PAGE_NOT_FOUND");
      const page = existing.data() ?? {};
      const currentRevision = Number.isSafeInteger(page?.auditRevision) ? page.auditRevision : 0;
      if (currentRevision !== input.expectedAuditRevision) throw new Error("STALE_PAGE_REVISION");
      if (page?.isDeleted === true) throw new Error("PAGE_ALREADY_ARCHIVED");
      if (page?.visible === true) throw new Error("PAGE_MUST_BE_HIDDEN");
      const auditRevision = currentRevision + 1;
      const previousHash = typeof page?.lastAuditHash === "string" ? page.lastAuditHash : null;
      const auditPayload: AuditPayload = { pageId: input.id as string, auditRevision, previousHash, actorUid: admin.uid, action: "page_archived", details: { visible: false }, schemaVersion: 1 };
      transaction.update(ref, { visible: false, isDeleted: true, archivedAt: FieldValue.serverTimestamp(), archivedBy: admin.uid, approvalStatus: "archived", updatedAt: FieldValue.serverTimestamp(), updatedBy: admin.uid, auditRevision, lastAuditHash: auditHash(auditPayload) });
      transaction.create(auditRef, makeAuditRecord(auditPayload));
    });
    return NextResponse.json({ success: true, archived: true });
  } catch (error) {
    if (error instanceof Error && error.message === "PAGE_NOT_FOUND") {
      return NextResponse.json({ success: false, message: "Page not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "STALE_PAGE_REVISION") {
      return NextResponse.json({ success: false, message: "This page changed since it was loaded. Refresh before archiving." }, { status: 409 });
    }
    if (error instanceof Error && error.message === "PAGE_ALREADY_ARCHIVED") {
      return NextResponse.json({ success: false, message: "Page is already archived" }, { status: 409 });
    }
    if (error instanceof Error && error.message === "PAGE_MUST_BE_HIDDEN") {
      return NextResponse.json({ success: false, message: "Hide the page before archiving it" }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Could not archive page" }, { status: 500 });
  }
}

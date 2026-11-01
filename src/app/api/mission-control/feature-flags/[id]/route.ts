import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdmin, isAdminIdentity } from "@/lib/server/requireAdmin";
import { getAdminDb } from "@/firebase/admin";
import { DEFAULT_BUSINESS_RULES } from "@/firestore/businessRules/defaults";

const ALLOWED_FLAGS = new Set(Object.keys(DEFAULT_BUSINESS_RULES.featureFlags));

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const identity = await requireAdmin(req);
  if (!isAdminIdentity(identity)) return identity;
  try {
    const { id } = await context.params;
    if (!ALLOWED_FLAGS.has(id)) return NextResponse.json({ success: false, message: "Unknown feature flag" }, { status: 404 });
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 2048) return NextResponse.json({ success: false, message: "Request body too large" }, { status: 413 });
    const body = JSON.parse(raw);
    if (typeof body?.enabled !== "boolean") return NextResponse.json({ success: false, message: "enabled must be a boolean" }, { status: 400 });
    const db = getAdminDb();
    const flagsRef = db.collection("business_rules").doc("featureFlags");
    const auditRef = db.collection("businessRulesAuditLogs").doc();
    await db.runTransaction(async (tx) => {
      const current = await tx.get(flagsRef);
      const oldFlags = { ...DEFAULT_BUSINESS_RULES.featureFlags, ...(current.data() || {}) };
      tx.set(flagsRef, { [id]: body.enabled, updatedAt: FieldValue.serverTimestamp(), updatedBy: identity.uid }, { merge: true });
      tx.create(auditRef, { type: "feature_flag_update", flag: id, oldValue: oldFlags[id as keyof typeof oldFlags], newValue: body.enabled, adminId: identity.uid, createdAt: FieldValue.serverTimestamp() });
    });
    return NextResponse.json({ success: true, id, enabled: body.enabled });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to update feature flag" }, { status: 500 });
  }
}

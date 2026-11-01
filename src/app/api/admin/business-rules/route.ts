import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import {
  validateProfitabilityRules, validateReferralRules, validateWatchEarnRules,
  validateWalletRules, validateCreatorEconomyRules, validateFeatureFlags,
} from "@/firestore/businessRules/validator";
import { DEFAULT_BUSINESS_RULES } from "@/firestore/businessRules/defaults";

export const runtime = "nodejs";
type Section = keyof typeof DEFAULT_BUSINESS_RULES;
const VALIDATORS: Record<string, (value: any) => any> = {
  profitability: validateProfitabilityRules,
  referral: validateReferralRules,
  watchEarn: validateWatchEarnRules,
  wallet: validateWalletRules,
  creatorEconomy: validateCreatorEconomyRules,
  featureFlags: validateFeatureFlags,
};

async function verifyAdmin(req: Request) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
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

export async function POST(req: Request) {
  try {
    const adminId = await verifyAdmin(req);
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 16384) return NextResponse.json({ success: false, message: "Request body too large" }, { status: 413 });
    const body = JSON.parse(raw);
    const section = body?.section as Section;
    const input = body?.rules;
    const validator = VALIDATORS[section];
    if (!validator || !input || typeof input !== "object" || Array.isArray(input)) return NextResponse.json({ success: false, message: "Invalid business rules section or payload" }, { status: 400 });
    const allowedFields = new Set(Object.keys((DEFAULT_BUSINESS_RULES as any)[section] || {}));
    if (Object.keys(input).some((key) => !allowedFields.has(key))) return NextResponse.json({ success: false, message: "Unsupported business rule field" }, { status: 400 });
    let validated: any;
    try {
      validated = validator({ ...((DEFAULT_BUSINESS_RULES as any)[section] || {}), ...input });
    } catch (error) {
      return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Invalid business rules" }, { status: 400 });
    }

    const db = getAdminDb();
    const rulesRef = db.collection("business_rules").doc(section);
    const metadataRef = db.collection("business_rules").doc("metadata");
    const auditRef = db.collection("businessRulesAuditLogs").doc();
    await db.runTransaction(async (tx) => {
      const [currentSnap, metadataSnap] = await Promise.all([tx.get(rulesRef), tx.get(metadataRef)]);
      const oldValue = currentSnap.data() || {};
      const oldMetadata = metadataSnap.data() || {};
      tx.set(rulesRef, { ...validated, updatedAt: FieldValue.serverTimestamp(), updatedBy: adminId }, { merge: true });
      tx.set(metadataRef, { version: String(oldMetadata.version || "1.0.0"), updatedAt: FieldValue.serverTimestamp(), updatedBy: adminId }, { merge: true });
      tx.create(auditRef, { section, oldValue, newValue: validated, adminId, action: "business_rules_updated", createdAt: FieldValue.serverTimestamp() });
    });
    return NextResponse.json({ success: true, section });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? "Authentication required" : status === 403 ? "Admin access required" : "Business rules could not be saved" }, { status });
  }
}

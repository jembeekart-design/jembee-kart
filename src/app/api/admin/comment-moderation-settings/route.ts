import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
const BOOLEAN_FIELDS = new Set(["enabled", "commentsEnabled", "requireLoginToComment", "caseInsensitive", "blockPartialMatch", "enableProfanityFilter", "allowLinks", "allowPhoneNumbers", "allowEmailAddresses", "allowEmojis", "allowMentions", "allowHashtags", "enableSpamDetection", "enableToxicScoring", "autoApproveComments", "enableVideoModeration"]);
const NUMBER_FIELDS = new Set(["minCommentLength", "maxCommentLength", "maxHashtags", "maxEmojis", "maxCommentsPerMinute", "maxCommentsPerHour", "maxCommentsPerDay", "duplicateCommentWindowSeconds", "toxicThresholdReview", "toxicThresholdHide", "toxicThresholdReject", "videoToxicThreshold"]);
const ARRAY_FIELDS = new Set(["blockedWords", "allowedWords", "allowedDomains", "blockedDomains", "blockedHashtags", "allowedEmojiCategories", "blockedEmojiCategories", "allowedLanguages", "blockedLanguages"]);
const ALLOWED = new Set([
  "enabled", "commentsEnabled", "requireLoginToComment", "blockedWords", "allowedWords",
  "caseInsensitive", "blockPartialMatch", "enableProfanityFilter", "minCommentLength", "maxCommentLength",
  "allowLinks", "allowPhoneNumbers", "allowEmailAddresses", "allowEmojis", "allowedDomains", "blockedDomains",
  "allowMentions", "mentionRule", "allowHashtags", "maxHashtags", "blockedHashtags", "maxEmojis",
  "allowedEmojiCategories", "blockedEmojiCategories", "maxCommentsPerMinute", "maxCommentsPerHour",
  "maxCommentsPerDay", "duplicateCommentWindowSeconds", "enableSpamDetection", "enableToxicScoring",
  "toxicThresholdReview", "toxicThresholdHide", "toxicThresholdReject", "allowedLanguages", "blockedLanguages",
  "autoApproveComments", "approvalMode", "moderationAction", "customMessage", "enableVideoModeration", "videoToxicThreshold",
]);

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
    const input = body?.settings;
    const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 500) : "";
    if (!input || typeof input !== "object" || Array.isArray(input)) return NextResponse.json({ success: false, message: "Invalid settings" }, { status: 400 });
    const settings: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (!ALLOWED.has(key)) return NextResponse.json({ success: false, message: `Unsupported setting: ${key}` }, { status: 400 });
      if (BOOLEAN_FIELDS.has(key) && typeof value !== "boolean") return NextResponse.json({ success: false, message: `Invalid boolean setting: ${key}` }, { status: 400 });
      if (NUMBER_FIELDS.has(key) && (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100000)) return NextResponse.json({ success: false, message: `Invalid numeric setting: ${key}` }, { status: 400 });
      if (ARRAY_FIELDS.has(key) && (!Array.isArray(value) || value.length > 500 || value.some((v) => typeof v !== "string" || v.length > 120))) return NextResponse.json({ success: false, message: `Invalid list setting: ${key}` }, { status: 400 });
      if (!BOOLEAN_FIELDS.has(key) && !NUMBER_FIELDS.has(key) && !ARRAY_FIELDS.has(key) && (typeof value !== "string" || value.length > 1000)) return NextResponse.json({ success: false, message: `Invalid text setting: ${key}` }, { status: 400 });
      settings[key] = value;
    }
    const db = getAdminDb();
    const settingsRef = db.collection("commentModeration").doc("settings");
    const auditRef = db.collection("commentAuditLogs").doc();
    const changedFields = await db.runTransaction(async (tx) => {
      const current = await tx.get(settingsRef);
      const oldValue = current.data() || {};
      const changed = Object.keys(settings).filter((key) => JSON.stringify(oldValue[key]) !== JSON.stringify(settings[key]));
      tx.set(settingsRef, { ...settings, updatedAt: FieldValue.serverTimestamp(), updatedBy: adminId }, { merge: true });
      tx.create(auditRef, { timestamp: FieldValue.serverTimestamp(), adminId, oldValue, newValue: settings, changedFields: changed, reason });
      return changed;
    });
    return NextResponse.json({ success: true, changedFields });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? "Authentication required" : status === 403 ? "Admin access required" : "Moderation settings could not be saved" }, { status });
  }
}

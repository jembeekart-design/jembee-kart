import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import type { TeacherApplicationInput } from "@/schemas/teachers/application";
import { buildTeacherVerificationReview, canSubmitTeacherVerification } from "@/modules/teachers/verification";

const COLLECTION = "teacherVerifications";

export async function getTeacherApplication(uid: string) {
  const snap = await getAdminDb().collection(COLLECTION).doc(uid).get();
  if (!snap.exists) return null;
  const data = snap.data() || {};
  return { uid, status: data.status || "not_submitted", displayName: data.displayName || "", qualification: data.qualification || "", subjects: Array.isArray(data.subjects) ? data.subjects : [], experienceYears: data.experienceYears ?? 0, bio: data.bio || "", submittedAt: data.submittedAt?.toDate?.()?.toISOString?.() || null, reviewedAt: data.reviewedAt?.toDate?.()?.toISOString?.() || null, rejectionReason: data.rejectionReason || null };
}

export async function submitTeacherApplication(uid: string, input: TeacherApplicationInput) {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(uid);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const previous = snap.exists ? snap.data() || {} : { status: "not_submitted" };
    if (!canSubmitTeacherVerification(previous)) throw new Error("APPLICATION_NOT_ALLOWED");
    tx.set(ref, { ...input, uid, status: "pending", submittedAt: FieldValue.serverTimestamp(), reviewedAt: FieldValue.delete(), reviewedBy: FieldValue.delete(), rejectionReason: FieldValue.delete(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    tx.create(db.collection("teacherVerificationAuditLogs").doc(), { uid, action: "submitted", actorUid: uid, createdAt: FieldValue.serverTimestamp() });
    return { status: "pending" as const };
  });
}

export async function listPendingTeacherApplications(limit = 100) {
  const snap = await getAdminDb().collection(COLLECTION).where("status", "==", "pending").orderBy("submittedAt", "asc").limit(limit).get();
  return snap.docs.map((doc) => { const d = doc.data(); return { uid: doc.id, displayName: d.displayName || "", qualification: d.qualification || "", subjects: Array.isArray(d.subjects) ? d.subjects : [], experienceYears: d.experienceYears ?? 0, bio: d.bio || "", submittedAt: d.submittedAt?.toDate?.()?.toISOString?.() || null }; });
}

export async function reviewTeacherApplication(input: { uid: string; decision: "verified" | "rejected" | "suspended"; reason?: string }, reviewerUid: string) {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(input.uid);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("NOT_FOUND");
    if (snap.data()?.status !== "pending" && input.decision !== "suspended") throw new Error("NOT_PENDING");
    const review = buildTeacherVerificationReview({ decision: input.decision, reviewerUid, rejectionReason: input.reason });
    tx.update(ref, { ...review, reviewedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    tx.create(db.collection("teacherVerificationAuditLogs").doc(), { uid: input.uid, action: input.decision, actorUid: reviewerUid, reason: input.reason || null, createdAt: FieldValue.serverTimestamp() });
    return { status: input.decision };
  });
}

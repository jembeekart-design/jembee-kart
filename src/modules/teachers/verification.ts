/**
 * Teacher verification domain rules.
 * A creator account/profile is not automatically a verified teacher.
 * Keep this module free of Firebase and request/runtime dependencies.
 */

export type TeacherVerificationStatus =
  | "not_submitted"
  | "pending"
  | "verified"
  | "rejected"
  | "suspended";

export interface TeacherVerificationRecord {
  status: TeacherVerificationStatus;
  submittedAt?: unknown;
  reviewedAt?: unknown;
  reviewedBy?: string;
  rejectionReason?: string;
  subjects?: string[];
}

const ALLOWED_STATUSES = new Set<TeacherVerificationStatus>([
  "not_submitted",
  "pending",
  "verified",
  "rejected",
  "suspended",
]);

export function normalizeTeacherVerificationStatus(value: unknown): TeacherVerificationStatus {
  return typeof value === "string" && ALLOWED_STATUSES.has(value as TeacherVerificationStatus)
    ? (value as TeacherVerificationStatus)
    : "not_submitted";
}

/** Only an explicitly verified, non-suspended teacher is eligible. */
export function isVerifiedTeacher(record: unknown): boolean {
  if (!record || typeof record !== "object" || Array.isArray(record)) return false;
  const candidate = record as Record<string, unknown>;
  return normalizeTeacherVerificationStatus(candidate.status) === "verified"
    && typeof candidate.reviewedBy === "string"
    && candidate.reviewedBy.trim().length > 0;
}

export function canSubmitTeacherVerification(record: unknown): boolean {
  const status = normalizeTeacherVerificationStatus(
    record && typeof record === "object" ? (record as Record<string, unknown>).status : undefined,
  );
  return status === "not_submitted" || status === "rejected";
}

export function buildTeacherVerificationReview(input: {
  decision: "verified" | "rejected" | "suspended";
  reviewerUid: string;
  rejectionReason?: string;
}): { status: TeacherVerificationStatus; reviewedBy: string; rejectionReason?: string } {
  const reviewerUid = input.reviewerUid.trim();
  if (!reviewerUid || reviewerUid.length > 128) throw new Error("Invalid reviewer identity");
  if (input.decision === "rejected") {
    const reason = (input.rejectionReason || "").trim();
    if (!reason || reason.length > 500) throw new Error("A rejection reason is required");
    return { status: "rejected", reviewedBy: reviewerUid, rejectionReason: reason };
  }
  return { status: input.decision, reviewedBy: reviewerUid };
}

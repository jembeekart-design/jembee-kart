import { createHash } from "node:crypto";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createModerationAuditDocumentId(submissionId, action) {
  if (
    typeof submissionId !== "string" ||
    !UUID_PATTERN.test(submissionId) ||
    (action !== "approve" && action !== "reject")
  ) {
    throw new TypeError("Invalid moderation audit identity");
  }

  const digest = createHash("sha256")
    .update(submissionId)
    .digest("hex");

  return `moderation_${action}_${digest}`;
}

export function getApprovalFailureStatus(rollbackSucceeded) {
  return rollbackSucceeded
    ? "pending"
    : "approval_recovery_failed";
}

export function resolveApprovalRecovery({
  status,
  auditExists,
  videoExists,
}) {
  if (auditExists) return "finalize_approved";

  if (status !== "approval_recovery_failed") {
    return "not_recoverable";
  }

  return videoExists
    ? "rollback_orphan_video"
    : "retry_approval";
}

export function resolveRejectionRecovery({
  status,
  auditExists,
  driveFileDeleted,
}) {
  if (auditExists) return "finalize_rejected";

  if (
    !["pending", "reject_failed", "reject_audit_failed", "rejecting"].includes(
      status,
    )
  ) {
    return "not_recoverable";
  }

  return driveFileDeleted
    ? "write_rejection_audit"
    : "delete_drive_then_audit";
}

export function isModerationLeaseExpired(startedAtMs, nowMs, leaseMs) {
  if (
    typeof startedAtMs !== "number" ||
    !Number.isFinite(startedAtMs) ||
    typeof nowMs !== "number" ||
    !Number.isFinite(nowMs) ||
    typeof leaseMs !== "number" ||
    !Number.isFinite(leaseMs) ||
    leaseMs <= 0
  ) {
    return false;
  }

  return nowMs - startedAtMs >= leaseMs;
}

export function isMatchingModerationAuditRecord(
  record,
  submissionId,
  action,
) {
  return Boolean(
    record &&
      typeof record === "object" &&
      record.submissionId === submissionId &&
      record.action === action &&
      record.actorType === "admin" &&
      record.targetType === "video_moderation_submission",
  );
}

export function toModerationTimestampMillis(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (value instanceof Date) {
    const millis = value.getTime();
    return Number.isFinite(millis) ? millis : null;
  }

  if (value && typeof value.toMillis === "function") {
    try {
      const millis = value.toMillis();
      return typeof millis === "number" && Number.isFinite(millis)
        ? millis
        : null;
    } catch {
      return null;
    }
  }

  return null;
}

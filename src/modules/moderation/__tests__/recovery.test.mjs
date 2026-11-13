import test from "node:test";
import assert from "node:assert/strict";

import {
  createModerationAuditDocumentId,
  getApprovalFailureStatus,
  resolveApprovalRecovery,
  resolveRejectionRecovery,
} from "../recovery.mjs";

const submissionId = "123e4567-e89b-42d3-a456-426614174000";

test("audit IDs are deterministic and unique per moderation action", () => {
  const approveId = createModerationAuditDocumentId(submissionId, "approve");
  const rejectId = createModerationAuditDocumentId(submissionId, "reject");

  assert.equal(
    approveId,
    createModerationAuditDocumentId(submissionId, "approve"),
  );
  assert.notEqual(approveId, rejectId);
  assert.match(approveId, /^moderation_approve_[a-f0-9]{64}$/);
});

test("audit ID rejects malformed submission IDs and actions", () => {
  assert.throws(
    () => createModerationAuditDocumentId("../unsafe", "approve"),
    TypeError,
  );
  assert.throws(
    () => createModerationAuditDocumentId(submissionId, "delete"),
    TypeError,
  );
});

test("approval rollback failure never resets submission to pending", () => {
  assert.equal(getApprovalFailureStatus(true), "pending");
  assert.equal(
    getApprovalFailureStatus(false),
    "approval_recovery_failed",
  );
});

test("approval recovery finalizes an existing audit before cleanup", () => {
  assert.equal(
    resolveApprovalRecovery({
      status: "approval_recovery_failed",
      auditExists: true,
      videoExists: true,
    }),
    "finalize_approved",
  );
});

test("approval recovery identifies orphan video cleanup", () => {
  assert.equal(
    resolveApprovalRecovery({
      status: "approval_recovery_failed",
      auditExists: false,
      videoExists: true,
    }),
    "rollback_orphan_video",
  );
});

test("approval recovery can retry when no audit or video exists", () => {
  assert.equal(
    resolveApprovalRecovery({
      status: "approval_recovery_failed",
      auditExists: false,
      videoExists: false,
    }),
    "retry_approval",
  );
});

test("approval recovery refuses unrelated states", () => {
  assert.equal(
    resolveApprovalRecovery({
      status: "pending",
      auditExists: false,
      videoExists: false,
    }),
    "not_recoverable",
  );
});

test("rejection recovery finalizes an existing audit", () => {
  assert.equal(
    resolveRejectionRecovery({
      status: "rejecting",
      auditExists: true,
      driveFileDeleted: true,
    }),
    "finalize_rejected",
  );
});

test("rejection recovery skips Drive deletion after confirmed deletion", () => {
  assert.equal(
    resolveRejectionRecovery({
      status: "reject_audit_failed",
      auditExists: false,
      driveFileDeleted: true,
    }),
    "write_rejection_audit",
  );
});

test("rejection recovery requests idempotent Drive deletion when needed", () => {
  assert.equal(
    resolveRejectionRecovery({
      status: "reject_failed",
      auditExists: false,
      driveFileDeleted: false,
    }),
    "delete_drive_then_audit",
  );
});

test("rejection recovery refuses unrelated terminal states", () => {
  assert.equal(
    resolveRejectionRecovery({
      status: "approved",
      auditExists: false,
      driveFileDeleted: false,
    }),
    "not_recoverable",
  );
});

test("moderation lease expires only after the configured duration", async () => {
  const { isModerationLeaseExpired } = await import("../recovery.mjs");

  assert.equal(isModerationLeaseExpired(1000, 5999, 5000), false);
  assert.equal(isModerationLeaseExpired(1000, 6000, 5000), true);
  assert.equal(isModerationLeaseExpired(1000, 500, 5000), false);
});

test("invalid moderation lease timestamps never expire a lock", async () => {
  const { isModerationLeaseExpired } = await import("../recovery.mjs");

  assert.equal(isModerationLeaseExpired(Number.NaN, 10000, 5000), false);
  assert.equal(isModerationLeaseExpired(1000, Number.NaN, 5000), false);
  assert.equal(isModerationLeaseExpired(1000, 10000, 0), false);
});

test("audit recovery accepts only matching submission and action records", async () => {
  const { isMatchingModerationAuditRecord } = await import("../recovery.mjs");

  const record = {
    submissionId,
    action: "reject",
    actorType: "admin",
    targetType: "video_moderation_submission",
  };

  assert.equal(
    isMatchingModerationAuditRecord(record, submissionId, "reject"),
    true,
  );
  assert.equal(
    isMatchingModerationAuditRecord(record, submissionId, "approve"),
    false,
  );
  assert.equal(
    isMatchingModerationAuditRecord({ ...record, submissionId: "other" }, submissionId, "reject"),
    false,
  );
  assert.equal(isMatchingModerationAuditRecord(null, submissionId, "reject"), false);
});

test("moderation timestamp conversion supports dates, numbers and Firestore timestamps", async () => {
  const { toModerationTimestampMillis } = await import("../recovery.mjs");

  assert.equal(toModerationTimestampMillis(1234), 1234);
  assert.equal(toModerationTimestampMillis(new Date(1234)), 1234);
  assert.equal(toModerationTimestampMillis({ toMillis: () => 1234 }), 1234);
  assert.equal(toModerationTimestampMillis({ toMillis: () => Number.NaN }), null);
  assert.equal(toModerationTimestampMillis("1234"), null);
  assert.equal(toModerationTimestampMillis(null), null);
});

export type ModerationAction = "approve" | "reject";

export function createModerationAuditDocumentId(
  submissionId: string,
  action: ModerationAction,
): string;

export function getApprovalFailureStatus(
  rollbackSucceeded: boolean,
): "pending" | "approval_recovery_failed";

export function resolveApprovalRecovery(input: {
  status: string;
  auditExists: boolean;
  videoExists: boolean;
}):
  | "finalize_approved"
  | "rollback_orphan_video"
  | "retry_approval"
  | "not_recoverable";

export function resolveRejectionRecovery(input: {
  status: string;
  auditExists: boolean;
  driveFileDeleted: boolean;
}):
  | "finalize_rejected"
  | "write_rejection_audit"
  | "delete_drive_then_audit"
  | "not_recoverable";

export function isModerationLeaseExpired(
  startedAtMs: number,
  nowMs: number,
  leaseMs: number,
): boolean;

export function isMatchingModerationAuditRecord(
  record: unknown,
  submissionId: string,
  action: ModerationAction,
): boolean;

export function toModerationTimestampMillis(value: unknown): number | null;

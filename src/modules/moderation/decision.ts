/** Pure moderation decision contract shared by admin moderation handlers. */
export type VideoModerationAction = "approve" | "reject";

export type VideoModerationDecision = {
  action: VideoModerationAction;
  reason: string | null;
};

export function parseVideoModerationDecision(input: unknown): VideoModerationDecision | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = input as Record<string, unknown>;
  if (value.action !== "approve" && value.action !== "reject") return null;
  if (value.reason !== undefined && value.reason !== null && typeof value.reason !== "string") return null;
  const reason = typeof value.reason === "string" ? value.reason.trim() : "";
  if (reason.length > 500) return null;
  if (value.action === "approve" && reason) return null;
  if (value.action === "reject" && !reason) return null;
  return { action: value.action, reason: reason || null };
}

export function createVideoModerationAuditRecord(input: {
  submissionId: string;
  adminId: string;
  action: VideoModerationAction;
  reason?: string | null;
}) {
  return {
    submissionId: input.submissionId,
    adminId: input.adminId,
    action: input.action,
    reason: input.reason ?? null,
    actorType: "admin" as const,
    targetType: "video_moderation_submission" as const,
  };
}

/** Pure support and teacher-student communication contracts.
 * Persistence, authorization, and delivery must be enforced by server handlers.
 */
export const SUPPORT_LIMITS = Object.freeze({
  subject: 120,
  message: 4000,
  attachmentCount: 3,
  attachmentUrl: 2048,
  messagesPerRequest: 1,
});

export const SUPPORT_CATEGORIES = Object.freeze([
  "account", "video", "creator", "teacher", "payment", "copyright", "safety", "other",
] as const);

export const SUPPORT_STATUSES = Object.freeze([
  "open", "in_progress", "waiting_for_user", "resolved", "closed",
] as const);

export type SupportCategory = typeof SUPPORT_CATEGORIES[number];
export type SupportStatus = typeof SUPPORT_STATUSES[number];

export type ContractResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string };

export interface SupportTicketInput {
  subject: string;
  message: string;
  category: SupportCategory;
  relatedVideoId?: string;
}

export interface TeacherContactInput {
  teacherId: string;
  subject: string;
  message: string;
}

const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function boundedText(value: unknown, max: number): value is string {
  return typeof value === "string" && value.trim().length > 0 &&
    value.length <= max && !CONTROL_CHARS.test(value);
}

export function validateSupportTicket(input: unknown): ContractResult<SupportTicketInput> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, reason: "INVALID_REQUEST" };
  }
  const value = input as Record<string, unknown>;
  if (!boundedText(value.subject, SUPPORT_LIMITS.subject)) {
    return { ok: false, reason: "INVALID_SUBJECT" };
  }
  if (!boundedText(value.message, SUPPORT_LIMITS.message)) {
    return { ok: false, reason: "INVALID_MESSAGE" };
  }
  if (!SUPPORT_CATEGORIES.includes(value.category as SupportCategory)) {
    return { ok: false, reason: "INVALID_CATEGORY" };
  }
  if (value.relatedVideoId !== undefined &&
      (typeof value.relatedVideoId !== "string" || !SAFE_ID.test(value.relatedVideoId))) {
    return { ok: false, reason: "INVALID_RELATED_VIDEO" };
  }
  return {
    ok: true,
    value: {
      subject: value.subject.trim(),
      message: value.message.trim(),
      category: value.category as SupportCategory,
      ...(value.relatedVideoId ? { relatedVideoId: value.relatedVideoId as string } : {}),
    },
  };
}

export function validateTeacherContact(input: unknown): ContractResult<TeacherContactInput> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, reason: "INVALID_REQUEST" };
  }
  const value = input as Record<string, unknown>;
  if (typeof value.teacherId !== "string" || !SAFE_ID.test(value.teacherId)) {
    return { ok: false, reason: "INVALID_TEACHER" };
  }
  if (!boundedText(value.subject, SUPPORT_LIMITS.subject)) {
    return { ok: false, reason: "INVALID_SUBJECT" };
  }
  if (!boundedText(value.message, SUPPORT_LIMITS.message)) {
    return { ok: false, reason: "INVALID_MESSAGE" };
  }
  return {
    ok: true,
    value: {
      teacherId: value.teacherId,
      subject: value.subject.trim(),
      message: value.message.trim(),
    },
  };
}

/** Caller must derive requesterId from a verified server-side auth token. */
export function supportTicketIdempotencyKey(requesterId: string, requestId: string): string | null {
  if (!SAFE_ID.test(requesterId) || !SAFE_ID.test(requestId)) return null;
  return `support_${requesterId}_${requestId}`;
}

/** Never trust a client-supplied participant list for conversation authorization. */
export function canReadConversation(
  authenticatedUid: string,
  participantUids: readonly string[],
): boolean {
  return SAFE_ID.test(authenticatedUid) &&
    participantUids.some((participant) => participant === authenticatedUid);
}

/** Only staff can move a ticket between workflow states. */
export function isValidSupportTransition(
  current: SupportStatus,
  next: SupportStatus,
  actor: "requester" | "staff",
): boolean {
  if (!SUPPORT_STATUSES.includes(current) || !SUPPORT_STATUSES.includes(next)) return false;
  if (actor === "requester") {
    return current === "waiting_for_user" && next === "open";
  }
  const allowed: Record<SupportStatus, readonly SupportStatus[]> = {
    open: ["in_progress", "resolved", "closed"],
    in_progress: ["waiting_for_user", "resolved", "closed"],
    waiting_for_user: ["in_progress", "resolved", "closed"],
    resolved: ["open", "closed"],
    closed: [],
  };
  return allowed[current].includes(next);
}

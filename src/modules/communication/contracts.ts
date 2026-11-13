/** Pure communication contracts. Delivery providers must consume these validated payloads. */
export const COMMUNICATION_LIMITS = Object.freeze({
  subject: 160,
  message: 4000,
  recipientEmail: 254,
  phoneE164: 16,
  templateVariables: 20,
});

export type Channel = "in_app" | "email" | "whatsapp";
export type MessagePriority = "transactional" | "account" | "marketing";

export interface CommunicationRequest {
  channel: Channel;
  recipientId: string;
  recipientEmail?: string;
  phoneE164?: string;
  subject?: string;
  message: string;
  priority: MessagePriority;
  whatsappConsent?: boolean;
}

export type ValidationResult =
  | { ok: true; value: CommunicationRequest }
  | { ok: false; reason: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const E164 = /^\+[1-9]\d{7,14}$/;

export function validateCommunicationRequest(input: unknown): ValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, reason: "INVALID_REQUEST" };
  }
  const value = input as Record<string, unknown>;
  const channels: Channel[] = ["in_app", "email", "whatsapp"];
  const priorities: MessagePriority[] = ["transactional", "account", "marketing"];
  if (!channels.includes(value.channel as Channel)) return { ok: false, reason: "INVALID_CHANNEL" };
  if (!priorities.includes(value.priority as MessagePriority)) return { ok: false, reason: "INVALID_PRIORITY" };
  if (typeof value.recipientId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(value.recipientId)) {
    return { ok: false, reason: "INVALID_RECIPIENT" };
  }
  if (typeof value.message !== "string" || !value.message.trim() || value.message.length > COMMUNICATION_LIMITS.message) {
    return { ok: false, reason: "INVALID_MESSAGE" };
  }
  if (value.subject !== undefined && (typeof value.subject !== "string" || value.subject.length > COMMUNICATION_LIMITS.subject)) {
    return { ok: false, reason: "INVALID_SUBJECT" };
  }
  if (value.channel === "email") {
    if (typeof value.recipientEmail !== "string" || value.recipientEmail.length > COMMUNICATION_LIMITS.recipientEmail || !EMAIL.test(value.recipientEmail)) {
      return { ok: false, reason: "INVALID_EMAIL" };
    }
  }
  if (value.channel === "whatsapp") {
    if (typeof value.phoneE164 !== "string" || value.phoneE164.length > COMMUNICATION_LIMITS.phoneE164 || !E164.test(value.phoneE164)) {
      return { ok: false, reason: "INVALID_PHONE" };
    }
    if (value.whatsappConsent !== true) return { ok: false, reason: "WHATSAPP_CONSENT_REQUIRED" };
    if (value.priority === "marketing" && value.whatsappConsent !== true) return { ok: false, reason: "MARKETING_OPT_IN_REQUIRED" };
  }
  return { ok: true, value: value as unknown as CommunicationRequest };
}

/** Idempotency key is scoped to recipient and channel; caller persists it server-side. */
export function communicationIdempotencyKey(recipientId: string, channel: Channel, eventId: string): string | null {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(recipientId) || !/^[A-Za-z0-9_-]{1,128}$/.test(eventId)) return null;
  return `${channel}_${recipientId}_${eventId}`;
}

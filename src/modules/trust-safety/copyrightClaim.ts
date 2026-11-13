export type CopyrightClaimInput = {
  videoId: string;
  claimantName: string;
  claimantEmail: string;
  originalWorkUrl: string;
  description: string;
  goodFaithStatement: boolean;
  accuracyStatement: boolean;
  electronicSignature: string;
};

const MAX = {
  videoId: 160,
  name: 120,
  email: 254,
  url: 2048,
  description: 3000,
  signature: 120,
} as const;

function boundedString(value: unknown, max: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= MAX.email;
}

function validHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function parseCopyrightClaim(input: unknown): CopyrightClaimInput | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = input as Record<string, unknown>;
  if (!boundedString(value.videoId, MAX.videoId) || value.videoId.includes("/")) return null;
  if (!boundedString(value.claimantName, MAX.name)) return null;
  if (!boundedString(value.claimantEmail, MAX.email) || !validEmail(value.claimantEmail.trim())) return null;
  if (!boundedString(value.originalWorkUrl, MAX.url) || !validHttpUrl(value.originalWorkUrl.trim())) return null;
  if (!boundedString(value.description, MAX.description)) return null;
  if (value.goodFaithStatement !== true || value.accuracyStatement !== true) return null;
  if (!boundedString(value.electronicSignature, MAX.signature)) return null;
  return {
    videoId: value.videoId.trim(),
    claimantName: value.claimantName.trim(),
    claimantEmail: value.claimantEmail.trim().toLowerCase(),
    originalWorkUrl: value.originalWorkUrl.trim(),
    description: value.description.trim(),
    goodFaithStatement: true,
    accuracyStatement: true,
    electronicSignature: value.electronicSignature.trim(),
  };
}

export type ClaimReviewAction = "under_review" | "dismissed" | "takedown_requested" | "restored";
export function parseClaimReview(input: unknown): { claimId: string; action: ClaimReviewAction; reason: string | null } | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = input as Record<string, unknown>;
  const actions: ClaimReviewAction[] = ["under_review", "dismissed", "takedown_requested", "restored"];
  if (typeof value.claimId !== "string" || !value.claimId.trim() || value.claimId.length > 180 || value.claimId.includes("/")) return null;
  if (typeof value.action !== "string" || !actions.includes(value.action as ClaimReviewAction)) return null;
  if (value.reason !== undefined && value.reason !== null && typeof value.reason !== "string") return null;
  const reason = typeof value.reason === "string" ? value.reason.trim() : "";
  if (reason.length > 500) return null;
  if (["dismissed", "takedown_requested", "restored"].includes(value.action) && !reason) return null;
  return { claimId: value.claimId.trim(), action: value.action as ClaimReviewAction, reason: reason || null };
}

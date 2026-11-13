/** Authentication and access primitives for earnings endpoints. */
const SAFE_UID = /^[A-Za-z0-9_-]{1,128}$/;
export type EarningsPrincipal = { uid: string; role: "creator" | "sharer" | "teacher" };
export type EarningsAccessResult = { ok: true; principal: EarningsPrincipal } | { ok: false; status: 400 | 401 | 403; reason: string };

/** Extracts only a bounded Bearer token; token verification must happen server-side. */
export function extractEarningsBearerToken(header: string | null): string | null {
  if (typeof header !== "string" || header.length > 8300 || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token || token.length > 8192 || /\s/.test(token)) return null;
  return token;
}

/** Maps trusted server-loaded role data to the narrow earnings view permission. */
export function authorizeEarningsPrincipal(input: {
  authenticatedUid: string;
  accountRole: unknown;
  creatorEnabled?: boolean;
  sharerEnabled?: boolean;
  teacherVerified?: boolean;
}): EarningsAccessResult {
  if (!SAFE_UID.test(input.authenticatedUid)) return { ok: false, status: 401, reason: "UNAUTHENTICATED" };
  if (input.accountRole === "creator" && input.creatorEnabled === true)
    return { ok: true, principal: { uid: input.authenticatedUid, role: "creator" } };
  if (input.accountRole === "sharer" && input.sharerEnabled === true)
    return { ok: true, principal: { uid: input.authenticatedUid, role: "sharer" } };
  if (input.accountRole === "teacher" && input.teacherVerified === true)
    return { ok: true, principal: { uid: input.authenticatedUid, role: "teacher" } };
  return { ok: false, status: 403, reason: "EARNINGS_ACCESS_DENIED" };
}

/** Ensures a requested identity cannot override the verified token subject. */
export function isSelfEarningsRequest(authenticatedUid: string, requestedUid?: unknown): boolean {
  return SAFE_UID.test(authenticatedUid) && (requestedUid === undefined || requestedUid === authenticatedUid);
}

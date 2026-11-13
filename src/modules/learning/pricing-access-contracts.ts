/** Course pricing, entitlement and enrollment policy contracts. Payment confirmation must come from trusted server records. */
const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;
export const COURSE_ACCESS_LIMITS = Object.freeze({ maxPriceMinor: 100_000_000, minPriceMinor: 1, currencyLength: 3 });
export type CoursePricing = { accessType: "free" | "paid"; priceMinor: number; currency: string };
export type AccessResult<T> = { ok: true; value: T } | { ok: false; reason: string };

export function validateCoursePricing(input: unknown): AccessResult<CoursePricing> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, reason: "INVALID_PRICING" };
  const v = input as Record<string, unknown>;
  if (v.accessType !== "free" && v.accessType !== "paid") return { ok: false, reason: "INVALID_ACCESS_TYPE" };
  if (typeof v.currency !== "string" || !/^[A-Z]{3}$/.test(v.currency)) return { ok: false, reason: "INVALID_CURRENCY" };
  if (!Number.isSafeInteger(v.priceMinor) || (v.priceMinor as number) < 0 || (v.priceMinor as number) > COURSE_ACCESS_LIMITS.maxPriceMinor) return { ok: false, reason: "INVALID_PRICE" };
  if (v.accessType === "free" && v.priceMinor !== 0) return { ok: false, reason: "FREE_COURSE_MUST_BE_ZERO" };
  if (v.accessType === "paid" && (v.priceMinor as number) < COURSE_ACCESS_LIMITS.minPriceMinor) return { ok: false, reason: "PAID_COURSE_REQUIRES_PRICE" };
  return { ok: true, value: { accessType: v.accessType, priceMinor: v.priceMinor as number, currency: v.currency } };
}

/** Validate a published course and its pricing before enrollment is offered. */
export function canOfferEnrollment(input: { courseStatus: string; pricingValid: boolean; teacherVerified: boolean; enrollmentOpen: boolean }): boolean {
  return input.courseStatus === "published" && input.pricingValid && input.teacherVerified && input.enrollmentOpen;
}

/** Free access never requires payment; paid access requires a matching, server-verified active entitlement. */
export function canAccessCourse(input: {
  courseStatus: string; accessType: "free" | "paid"; enrollmentStatus: string | null;
  entitlementStatus: string | null; entitlementCourseId: string | null; courseId: string;
}): boolean {
  if (input.courseStatus !== "published" || !SAFE_ID.test(input.courseId)) return false;
  if (input.accessType === "free") return input.enrollmentStatus === "active" || input.enrollmentStatus === "completed";
  return input.accessType === "paid" && (input.enrollmentStatus === "active" || input.enrollmentStatus === "completed")
    && input.entitlementStatus === "active" && input.entitlementCourseId === input.courseId;
}

/** Payment callbacks are not trusted here: callers must load a verified, reconciled server-side order. */
export function canActivatePaidEnrollment(input: {
  orderStatus: string; paymentVerified: boolean; orderCourseId: string; courseId: string;
  orderUserId: string; authenticatedUserId: string; refundStatus: string;
}): boolean {
  return input.orderStatus === "paid" && input.paymentVerified === true
    && input.orderCourseId === input.courseId && SAFE_ID.test(input.courseId)
    && input.orderUserId === input.authenticatedUserId && SAFE_ID.test(input.authenticatedUserId)
    && input.refundStatus === "none";
}

/** Refund, chargeback, expiry or revocation must remove paid access; completion alone cannot override revocation. */
export function isPaidEntitlementActive(input: {
  status: string; paymentReconciled: boolean; refundStatus: string; expiresAt: number | null; now: number;
}): boolean {
  return input.status === "active" && input.paymentReconciled && input.refundStatus === "none"
    && (input.expiresAt === null || (Number.isFinite(input.expiresAt) && Number.isFinite(input.now) && input.expiresAt > input.now));
}

/** Enrollment uniqueness key is scoped to the authenticated learner and course. */
export function makeEnrollmentKey(authenticatedUserId: string, courseId: string): AccessResult<string> {
  if (!SAFE_ID.test(authenticatedUserId) || !SAFE_ID.test(courseId)) return { ok: false, reason: "INVALID_ENROLLMENT_ID" };
  return { ok: true, value: `${authenticatedUserId}:${courseId}` };
}

/** Existing enrollment may be reused; duplicate active/completed enrollment must not create a second record. */
export function canCreateEnrollment(existingStatus: string | null, courseStatus: string, accessType: "free" | "paid"): boolean {
  return courseStatus === "published" && (accessType === "free" || accessType === "paid")
    && (existingStatus === null || existingStatus === "cancelled" || existingStatus === "expired");
}

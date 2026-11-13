import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateCoursePricing, canOfferEnrollment, canAccessCourse, canActivatePaidEnrollment,
  isPaidEntitlementActive, makeEnrollmentKey, canCreateEnrollment,
} from "../pricing-access-contracts.ts";

test("validates free and paid pricing using integer minor units and ISO currency", () => {
  assert.deepEqual(validateCoursePricing({ accessType: "free", priceMinor: 0, currency: "INR" }), { ok: true, value: { accessType: "free", priceMinor: 0, currency: "INR" } });
  assert.equal(validateCoursePricing({ accessType: "paid", priceMinor: 19900, currency: "INR" }).ok, true);
  assert.equal(validateCoursePricing({ accessType: "free", priceMinor: 10, currency: "INR" }).ok, false);
  assert.equal(validateCoursePricing({ accessType: "paid", priceMinor: 0, currency: "INR" }).ok, false);
  assert.equal(validateCoursePricing({ accessType: "paid", priceMinor: 1.5, currency: "INR" }).ok, false);
  assert.equal(validateCoursePricing({ accessType: "paid", priceMinor: 10, currency: "rupee" }).ok, false);
});
test("enrollment offer requires published course, verified teacher, valid pricing and open enrollment", () => {
  const valid = { courseStatus: "published", pricingValid: true, teacherVerified: true, enrollmentOpen: true };
  assert.equal(canOfferEnrollment(valid), true);
  for (const patch of [{ courseStatus: "draft" }, { pricingValid: false }, { teacherVerified: false }, { enrollmentOpen: false }])
    assert.equal(canOfferEnrollment({ ...valid, ...patch }), false);
});
test("free course access does not require payment but still requires publication and enrollment", () => {
  const base = { courseStatus: "published", accessType: "free", enrollmentStatus: "active", entitlementStatus: null, entitlementCourseId: null, courseId: "c1" };
  assert.equal(canAccessCourse(base), true);
  assert.equal(canAccessCourse({ ...base, enrollmentStatus: null }), false);
  assert.equal(canAccessCourse({ ...base, courseStatus: "draft" }), false);
});
test("paid course access requires active matching entitlement and enrollment", () => {
  const base = { courseStatus: "published", accessType: "paid", enrollmentStatus: "active", entitlementStatus: "active", entitlementCourseId: "c1", courseId: "c1" };
  assert.equal(canAccessCourse(base), true);
  assert.equal(canAccessCourse({ ...base, entitlementCourseId: "c2" }), false);
  assert.equal(canAccessCourse({ ...base, entitlementStatus: "revoked" }), false);
  assert.equal(canAccessCourse({ ...base, enrollmentStatus: null }), false);
});
test("paid enrollment activation requires reconciled paid order scoped to user and course", () => {
  const base = { orderStatus: "paid", paymentVerified: true, orderCourseId: "c1", courseId: "c1", orderUserId: "u1", authenticatedUserId: "u1", refundStatus: "none" };
  assert.equal(canActivatePaidEnrollment(base), true);
  for (const patch of [{ paymentVerified: false }, { orderStatus: "pending" }, { orderCourseId: "c2" }, { orderUserId: "u2" }, { refundStatus: "refunded" }])
    assert.equal(canActivatePaidEnrollment({ ...base, ...patch }), false);
});
test("paid entitlement expires and refund or unreconciled payment revokes access", () => {
  const base = { status: "active", paymentReconciled: true, refundStatus: "none", expiresAt: 200, now: 100 };
  assert.equal(isPaidEntitlementActive(base), true);
  assert.equal(isPaidEntitlementActive({ ...base, expiresAt: 100 }), false);
  assert.equal(isPaidEntitlementActive({ ...base, refundStatus: "refunded" }), false);
  assert.equal(isPaidEntitlementActive({ ...base, paymentReconciled: false }), false);
});
test("enrollment keys are safe and duplicate active records are not created", () => {
  assert.deepEqual(makeEnrollmentKey("u1", "c1"), { ok: true, value: "u1:c1" });
  assert.equal(makeEnrollmentKey("../u", "c1").ok, false);
  assert.equal(canCreateEnrollment(null, "published", "free"), true);
  assert.equal(canCreateEnrollment("active", "published", "paid"), false);
  assert.equal(canCreateEnrollment("cancelled", "published", "paid"), true);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCopyrightClaim, parseClaimReview } from "../copyrightClaim.ts";

const valid = {
  videoId: "video-123",
  claimantName: "A Copyright Owner",
  claimantEmail: "owner@example.com",
  originalWorkUrl: "https://example.com/original-work",
  description: "I own the original work and identified it in this video.",
  goodFaithStatement: true,
  accuracyStatement: true,
  electronicSignature: "A Copyright Owner",
};

test("accepts a complete bounded copyright claim", () => {
  assert.equal(parseCopyrightClaim(valid)?.claimantEmail, "owner@example.com");
});
test("rejects unconfirmed legal attestations", () => {
  assert.equal(parseCopyrightClaim({ ...valid, goodFaithStatement: false }), null);
});
test("rejects unsafe URLs and malformed email", () => {
  assert.equal(parseCopyrightClaim({ ...valid, originalWorkUrl: "javascript:alert(1)" }), null);
  assert.equal(parseCopyrightClaim({ ...valid, claimantEmail: "bad" }), null);
});
test("rejects oversized and path-like video identifiers", () => {
  assert.equal(parseCopyrightClaim({ ...valid, videoId: "../other" }), null);
  assert.equal(parseCopyrightClaim({ ...valid, description: "x".repeat(3001) }), null);
});
test("requires a reason for destructive or dismissive review decisions", () => {
  assert.equal(parseClaimReview({ claimId: "c1", action: "takedown_requested" }), null);
  assert.equal(parseClaimReview({ claimId: "c1", action: "takedown_requested", reason: "Verified claim" })?.action, "takedown_requested");
});
test("rejects invalid claim review actions", () => {
  assert.equal(parseClaimReview({ claimId: "c1", action: "delete" }), null);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateSupportTicket, validateTeacherContact, supportTicketIdempotencyKey,
  canReadConversation, isValidSupportTransition,
} from "../contracts.ts";

test("accepts a bounded support ticket and normalizes whitespace", () => {
  const result = validateSupportTicket({ subject: "  Login issue ", message: "  I cannot sign in  ", category: "account" });
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.value, { subject: "Login issue", message: "I cannot sign in", category: "account" });
});
test("rejects malformed, oversized, empty and control-character ticket fields", () => {
  assert.equal(validateSupportTicket(null).ok, false);
  assert.equal(validateSupportTicket({ subject: " ", message: "x", category: "other" }).ok, false);
  assert.equal(validateSupportTicket({ subject: "x".repeat(121), message: "x", category: "other" }).ok, false);
  assert.equal(validateSupportTicket({ subject: "x", message: "x".repeat(4001), category: "other" }).ok, false);
  assert.equal(validateSupportTicket({ subject: "x", message: "bad\u0000text", category: "other" }).ok, false);
});
test("allows only known categories and safe related video ids", () => {
  assert.equal(validateSupportTicket({ subject: "s", message: "m", category: "payments" }).ok, false);
  assert.equal(validateSupportTicket({ subject: "s", message: "m", category: "video", relatedVideoId: "../x" }).ok, false);
  assert.equal(validateSupportTicket({ subject: "s", message: "m", category: "video", relatedVideoId: "video_123" }).ok, true);
});
test("validates teacher contact without accepting client identity as requester", () => {
  assert.equal(validateTeacherContact({ teacherId: "teacher_1", subject: "Question", message: "Hello" }).ok, true);
  assert.equal(validateTeacherContact({ teacherId: "../admin", subject: "Question", message: "Hello" }).ok, false);
  assert.equal(validateTeacherContact({ teacherId: "t1", subject: "", message: "Hello" }).ok, false);
});
test("creates requester-scoped idempotency keys", () => {
  assert.equal(supportTicketIdempotencyKey("user_1", "req_1"), "support_user_1_req_1");
  assert.equal(supportTicketIdempotencyKey("../user", "req_1"), null);
});
test("conversation access requires authenticated uid to be a participant", () => {
  assert.equal(canReadConversation("user_1", ["user_1", "teacher_1"]), true);
  assert.equal(canReadConversation("user_2", ["user_1", "teacher_1"]), false);
  assert.equal(canReadConversation("../admin", ["../admin"]), false);
});
test("requester can reopen only waiting tickets; staff transitions are bounded", () => {
  assert.equal(isValidSupportTransition("waiting_for_user", "open", "requester"), true);
  assert.equal(isValidSupportTransition("open", "resolved", "requester"), false);
  assert.equal(isValidSupportTransition("open", "in_progress", "staff"), true);
  assert.equal(isValidSupportTransition("closed", "open", "staff"), false);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const decision = readFileSync(resolve(here, "../decision.ts"), "utf8");
const handler = readFileSync(resolve(here, "../../../app/api/admin/moderate-video/route.ts"), "utf8");

test("moderation decision contract restricts actions and reason size", () => {
  assert.match(decision, /value\.action !== "approve" && value\.action !== "reject"/);
  assert.match(decision, /reason\.length > 500/);
  assert.match(decision, /reason\.length > 500/);
});

test("moderation audit records identify actor, action and submission", () => {
  assert.match(decision, /submissionId: input\.submissionId/);
  assert.match(decision, /adminId: input\.adminId/);
  assert.match(decision, /actorType: "admin"/);
});

test("admin moderation handler uses the shared decision contract", () => {
  assert.match(handler, /parseVideoModerationDecision/);
  assert.match(handler, /createVideoModerationAuditRecord/);
  assert.match(handler, /videoModerationAuditLogs/);
});

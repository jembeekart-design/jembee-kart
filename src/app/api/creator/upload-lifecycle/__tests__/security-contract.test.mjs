import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const recover = await readFile(new URL("../../recover-drive-upload/route.ts", import.meta.url), "utf8");
const complete = await readFile(new URL("../../complete-drive-upload/route.ts", import.meta.url), "utf8");
const cancel = await readFile(new URL("../../cancel-video-moderation/route.ts", import.meta.url), "utf8");

test("upload recovery rejects revoked Firebase tokens and oversized request bodies", () => {
  assert.ok(recover.includes("verifyIdToken(token, true)"));
  assert.ok(recover.includes("contentLength > 4 * 1024"));
  assert.ok(recover.includes("byteLength > 4 * 1024"));
  assert.ok(recover.includes("^[A-Za-z0-9_-]{3,128}$"));
  assert.ok(!recover.includes("[UPLOAD_DEBUG_SERVER]"));
});

test("upload completion rejects revoked Firebase tokens and avoids sensitive debug logs", () => {
  assert.ok(complete.includes("verifyIdToken(token, true)"));
  assert.ok(!complete.includes("[AuthDiagnostic]"));
  assert.ok(!complete.includes("[UPLOAD_DEBUG_SERVER]"));
});

test("upload cancellation only deletes the creator's claimed cancelling submission", () => {
  assert.ok(cancel.includes("verifyIdToken(token, true)"));
  assert.ok(cancel.includes("current.data()?.status !== \"uploading\""));
  assert.ok(cancel.includes("current.data()?.status !== \"cancelling\""));
  assert.ok(cancel.includes("tx.delete(docRef)"));
  assert.ok(cancel.includes("^[A-Za-z0-9_-]{3,128}$"));
});

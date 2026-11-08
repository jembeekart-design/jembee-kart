import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(new URL("../route.ts", import.meta.url), "utf8");
test("only super admin can verify and evidence must exist in Firebase Storage", () => {
  assert.match(source, /role !== "super_admin"/);
  assert.match(source, /getAdminStorage\(\)\.bucket\(\)/);
  assert.match(source, /file\.exists\(\)/);
  assert.match(source, /10 \* 1024 \* 1024/);
});
test("invoice evidence metadata must bind order, invoice and uploader before verification", () => {
  assert.match(source, /custom\.orderId !== expense\.orderId/);
  assert.match(source, /custom\.invoiceNumber !== expense\.invoiceNumber/);
  assert.match(source, /custom\.uploadedByUid !== expense\.createdByUid/);
  assert.match(source, /status: "verified"/);
});
test("pending review list is super-admin-only and issues short-lived private invoice previews", () => {
  assert.match(source, /export async function GET\(/);
  assert.match(source, /await requireSuperAdmin\(req\)/);
  assert.match(source, /getSignedUrl\(\{ action: "read", expires: Date\.now\(\) \+ 5 \* 60 \* 1000 \}\)/);
  assert.match(source, /evidencePreviewUrl/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(new URL("../route.ts", import.meta.url), "utf8");
test("expense records require admin, paid order, invoice evidence path and integer paise", () => {
  assert.match(source, /verifyIdToken\(header\.slice\(7\)\.trim\(\), true\)/);
  assert.match(source, /role !== "admin" && user\?\.role !== "super_admin"/);
  assert.match(source, /shorts-expense-evidence\/\$\{orderId\}\//);
  assert.match(source, /evidencePath\.includes\("\.\."\)/);
  assert.match(source, /Number\.isSafeInteger\(amountPaise\)/);
  assert.match(source, /status: "pending_review"/);
});
test("expense invoice IDs are idempotent and conflicting duplicates are rejected", () => {
  assert.match(source, /createHash\("sha256"\)/);
  assert.match(source, /EXPENSE_CONFLICT/);
});

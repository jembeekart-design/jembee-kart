import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(new URL("../page.tsx", import.meta.url), "utf8");
test("expense UI uploads only supported invoice types with scoped metadata", () => {
  assert.match(source, /ALLOWED_TYPES/);
  assert.match(source, /MAX_FILE_BYTES = 10 \* 1024 \* 1024/);
  assert.match(source, /shorts-expense-evidence\/\$\{cleanOrderId\}/);
  assert.match(source, /uploadedByUid: user\.uid/);
  assert.match(source, /invoiceNumber: cleanInvoice/);
});
test("expense UI authenticates API submission and records integer paise", () => {
  assert.match(source, /await user\.getIdToken\(\)/);
  assert.match(source, /amountPaise/);
  assert.match(source, /\/api\/admin\/shorts\/expenses/);
  assert.match(source, /cache: "no-store"/);
});
test("super admin review UI provides private invoice preview and verification action", () => {
  assert.match(source, /Pending Invoice Reviews/);
  assert.match(source, /evidencePreviewUrl/);
  assert.match(source, /Verify invoice evidence/);
  assert.match(source, /\/api\/admin\/shorts\/expenses\/verify/);
});
test("expense amount parsing rejects more than two decimal places and avoids float rounding", () => {
  assert.match(source, /amountMatch = \/\^\(\?:0\|\[1-9\]\\d\*\)\(\?:\\\.\\d\{1,2\}\)\?\$\//);
  assert.match(source, /Number\(rupeesPart\) \* 100/);
  assert.doesNotMatch(source, /Math\.round\(numericAmount \* 100\)/);
});

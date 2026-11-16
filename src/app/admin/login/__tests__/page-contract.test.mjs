import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../page.tsx", import.meta.url), "utf8");

test("admin login verifies the server-side role before navigating to admin", () => {
  assert.match(source, /getIdToken\(true\)/);
  assert.match(source, /fetch\("\/api\/auth\/admin-check"/);
  assert.match(source, /adminResult\?\.isAdmin !== true/);
  assert.ok(source.indexOf('fetch("/api/auth/admin-check"') < source.indexOf('router.replace("/admin")'));
});

test("non-admin accounts are signed out and shown an authorization error", () => {
  assert.match(source, /await auth\.signOut\(\)/);
  assert.match(source, /यह account Admin के रूप में अधिकृत नहीं है/);
});

test("login loading state is cleared on success, errors and early returns", () => {
  assert.match(source, /finally \{\s*setLoading\(false\);\s*\}/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../route.ts", import.meta.url), "utf8");

test("admin check rejects missing and oversized bearer tokens", () => {
  assert.match(source, /authorization\?\.startsWith\("Bearer "\)/);
  assert.match(source, /!token \|\| token\.length > 8192/);
  assert.match(source, /status: 401/);
});

test("admin check verifies token revocation and uses the shared admin role set", () => {
  assert.match(source, /verifyIdToken\(token, true\)/);
  assert.match(source, /role === "admin" \|\| role === "super_admin"/);
});

test("a non-admin direct profile does not mask a uid-matched admin profile", () => {
  assert.match(source, /if \(role !== "admin" && role !== "super_admin"\)/);
  assert.match(source, /where\("uid", "==", decoded\.uid\)/);
  assert.match(source, /fallback\.docs\.find\(\(item\)/);\n  assert.match(source, /candidateRole === "admin" \|\| candidateRole === "super_admin"/);
});

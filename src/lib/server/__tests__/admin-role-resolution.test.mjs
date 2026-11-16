import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const requireAdmin = await readFile(new URL("../requireAdmin.ts", import.meta.url), "utf8");
const monetagAdmin = await readFile(new URL("../monetagAdminAuth.ts", import.meta.url), "utf8");
const moderation = await readFile(new URL("../../../app/api/admin/moderate-video/route.ts", import.meta.url), "utf8");

test("shared admin authorization checks revoked Firebase sessions", () => {
  assert.match(requireAdmin, /verifyIdToken\(token, true\)/);
  assert.match(monetagAdmin, /verifyIdToken\(token, true\)/);
  assert.match(moderation, /verifyIdToken\(token, true\)/);
});

test("all admin role lookups search matching UID records for an actual admin role", () => {
  for (const source of [requireAdmin, monetagAdmin, moderation]) {
    assert.match(source, /\.where\("uid", "==", decoded(?:Token)?\.uid\)/);
    assert.match(source, /\.limit\(20\)/);
    assert.match(source, /candidateRole === "admin" \|\| candidateRole === "super_admin"/);
  }
});

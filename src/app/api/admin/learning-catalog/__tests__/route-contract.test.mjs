import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");
const page = await readFile(new URL("../../../../admin/categories/page.tsx", import.meta.url), "utf8");

test("Learning catalog moderation requires server-side admin RBAC", () => {
  assert.match(route, /requireAdmin\(req\)/);
  assert.match(route, /isAdminIdentity\(identity\)/);
  assert.match(route, /export async function PATCH/);
});

test("catalog moderation accepts only valid IDs and publish states", () => {
  assert.match(route, /ID_PATTERN\.test\(id\)/);
  assert.match(route, /status !== "published" && status !== "unpublished"/);
  assert.match(route, /transaction\.get\(ref\)/);
});

test("every actual catalog status change creates an audit record", () => {
  assert.match(route, /learningCatalogAuditLogs/);
  assert.match(route, /transaction\.create\(auditRef/);
  assert.match(route, /previousStatus/);
  assert.match(route, /adminUid: identity\.uid/);
});

test("admin UI requires confirmation and calls the protected catalog API", () => {
  assert.match(page, /window\.confirm/);
  assert.match(page, /\/api\/admin\/learning-catalog/);
  assert.match(page, /Authorization: `Bearer \$\{token\}`/);
  assert.match(page, /Unpublish/);
  assert.match(page, /Publish/);
});

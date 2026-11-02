import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync(new URL("../route.ts", import.meta.url), "utf8");
const manager = readFileSync(new URL("../../../../admin/pages/page.tsx", import.meta.url), "utf8");

test("audit hash uses canonical sorted object keys and SHA-256", () => {
  const verifier = readFileSync(new URL("../audit-verification.mjs", import.meta.url), "utf8");
  assert.match(verifier, /function stableJson/);
  assert.match(verifier, /Object\.keys\(value\)\.sort\(\)/);
  assert.match(verifier, /createHash\("sha256"\)/);
});

test("runtime verifier checks revision sequence, previous hash and recomputed hash", () => {
  const verifier = readFileSync(new URL("../audit-verification.mjs", import.meta.url), "utf8");
  assert.match(verifier, /expectedRevision = 1/);
  assert.match(verifier, /event\.auditRevision !== expectedRevision/);
  assert.match(verifier, /event\.previousHash \?\? null/);
  assert.match(verifier, /expectedHash !== event\.hash/);
});

test("verification compares the audit chain head with the page document", () => {
  assert.match(route, /pageRevision === snapshot\.size && pageHash === chain\.lastHash/);
});

test("verification is bounded and reports legacy records", () => {
  assert.match(route, /limit\(5001\)/);
  assert.match(route, /legacyEvents/);
  assert.match(route, /truncated: snapshot\.size > 5000/);
});

test("all mutating API methods enforce optimistic revision", () => {
  for (const method of ["PATCH", "PUT", "DELETE"]) {
    const start = route.indexOf(`export async function ${method}`);
    const end = route.indexOf("export async function", start + 25);
    const block = route.slice(start, end < 0 ? undefined : end);
    assert.match(block, /expectedAuditRevision/);
    assert.match(block, /STALE_PAGE_REVISION/);
  }
});

test("admin manager sends expected revisions for edit, visibility, restore and archive", () => {
  assert.match(manager, /expectedAuditRevision: pages\.find/);
  assert.match(manager, /expectedAuditRevision: page\.auditRevision/);
  assert.match(manager, /expectedAuditRevision: archivedPages\.find/);
});

test("admin manager exposes the audit integrity verification action", () => {
  assert.match(manager, /Verify audit integrity/);
  assert.match(manager, /verify=true/);
  assert.match(manager, /checkedEvents/);
  assert.match(manager, /legacyEvents/);
});


test("POST rejects null, arrays and non-object JSON before reading properties", () => {
  const start = route.indexOf("export async function POST");
  const end = route.indexOf("export async function PATCH", start);
  const block = route.slice(start, end);
  assert.match(block, /!isPlainRecord\(body\)/);
  assert.match(block, /unsupported fields are not accepted/);
});

test("mutation endpoints reject unsupported request fields", () => {
  for (const [method, nextMethod] of [["PATCH", "PUT"], ["PUT", "DELETE"], ["DELETE", null]]) {
    const start = route.indexOf(`export async function ${method}`);
    const end = nextMethod ? route.indexOf(`export async function ${nextMethod}`, start + 25) : -1;
    const block = route.slice(start, end < 0 ? undefined : end);
    assert.match(block, /Object\.keys\(input\)\.some/);
  }
});

test("super-admin restrictions remain on publish, restore and archive", () => {
  assert.match(route, /input\.visible === true && admin\.role !== "super_admin"/);
  assert.match(route, /Only a super admin can restore a page/);
  assert.match(route, /Only a super admin can archive a page/);
});

test("content length, slug and revision validation remain enforced", () => {
  assert.match(route, /MAX_TITLE_LENGTH = 120/);
  assert.match(route, /content\.length > 20000/);
  assert.match(route, /SLUG_PATTERN/);
  assert.match(route, /expectedAuditRevision/);
});


import { isPlainRecord } from "../validation.mjs";

test("runtime JSON guard accepts ordinary JSON objects", () => {
  assert.equal(isPlainRecord({ title: "About", slug: "about" }), true);
  assert.equal(isPlainRecord(Object.create(null)), true);
});

test("runtime JSON guard rejects malformed and non-JSON object shapes", () => {
  assert.equal(isPlainRecord(null), false);
  assert.equal(isPlainRecord([]), false);
  assert.equal(isPlainRecord("not an object"), false);
  assert.equal(isPlainRecord(42), false);
  assert.equal(isPlainRecord(undefined), false);
  assert.equal(isPlainRecord(new Date()), false);
});


test("content version snapshots preserve the prior editor as creator", () => {
  assert.match(route, /createdBy: typeof page\?\.contentUpdatedBy === "string"/);
  assert.match(route, /reason: "content_edit_snapshot"/);
});

test("unchanged content and visibility do not create false audit revisions", () => {
  assert.match(route, /contentChanged = previousContent !== nextContent/);
  assert.match(route, /visibilityChanged = page\?\.visible !== input\.visible/);
  assert.match(route, /if \(!contentChanged && !visibilityChanged\) return/);
  assert.match(route, /auditRevision: resultingRevision/);
});

test("combined content and visibility changes have an explicit audit action", () => {
  assert.match(route, /page_content_updated_and_published/);
  assert.match(route, /page_content_updated_and_hidden/);
});

test("every API method performs admin authentication before accessing data", () => {
  for (const method of ["GET", "POST", "PATCH", "PUT", "DELETE"]) {
    const start = route.indexOf(`export async function ${method}`);
    const end = route.indexOf("export async function", start + 25);
    const block = route.slice(start, end < 0 ? undefined : end);
    assert.ok(block.indexOf("requireAdmin(request)") >= 0, `${method} must authenticate`);
    assert.ok(block.indexOf("isAdminIdentity(admin)") >= 0, `${method} must check admin identity`);
  }
});

import { createAuditHash, verifyAuditChain } from "../audit-verification.mjs";

function makeEvent(revision, previousHash, overrides = {}) {
  const payload = {
    pageId: "about",
    auditRevision: revision,
    previousHash,
    actorUid: "admin-1",
    action: revision === 1 ? "page_created" : "page_content_updated",
    details: { contentChanged: revision > 1 },
    schemaVersion: 1,
    ...overrides,
  };
  return { ...payload, hash: createAuditHash(payload) };
}

test("runtime verifier accepts a complete correctly chained audit history", () => {
  const first = makeEvent(1, null);
  const second = makeEvent(2, first.hash);
  assert.deepEqual(verifyAuditChain([first, second], { pageId: "about" }), {
    valid: true, lastHash: second.hash, failedRevision: null,
  });
});

test("runtime verifier rejects a missing or out-of-order revision", () => {
  const first = makeEvent(1, null);
  const third = makeEvent(3, first.hash);
  assert.equal(verifyAuditChain([first, third], { pageId: "about" }).valid, false);
  assert.equal(verifyAuditChain([third, first], { pageId: "about" }).valid, false);
});

test("runtime verifier rejects modified payloads and broken previous hashes", () => {
  const first = makeEvent(1, null);
  const second = makeEvent(2, "f".repeat(64));
  assert.equal(verifyAuditChain([first, second], { pageId: "about" }).valid, false);
  const tampered = { ...first, action: "page_hidden" };
  assert.equal(verifyAuditChain([tampered], { pageId: "about" }).valid, false);
});

test("runtime verifier rejects malformed records and unsupported schema versions", () => {
  const first = makeEvent(1, null);
  for (const bad of [
    { ...first, schemaVersion: 2 },
    { ...first, actorUid: "" },
    { ...first, details: [] },
    { ...first, hash: "not-a-sha256" },
    { ...first, pageId: "another-page" },
  ]) {
    assert.equal(verifyAuditChain([bad], { pageId: "about" }).valid, false);
  }
});

test("runtime verifier handles an empty chain as structurally valid but leaves completeness to caller", () => {
  assert.deepEqual(verifyAuditChain([], { pageId: "about" }), {
    valid: true, lastHash: null, failedRevision: null,
  });
});

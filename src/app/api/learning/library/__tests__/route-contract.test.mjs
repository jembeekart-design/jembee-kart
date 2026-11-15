import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");
const page = await readFile(new URL("../../../../learn/school/page.tsx", import.meta.url), "utf8");

test("Learning Library API scopes published entries by type and parent", () => {
  assert.match(route, /where\("status", "==", "published"\)/);
  assert.match(route, /where\("type", "==", type\)/);
  assert.match(route, /where\("parentId", "==", parentId\)/);
});

test("Learning Library API supports bounded cursor pagination and server-side search", () => {
  assert.match(route, /PAGE_SIZE_MAX = 40/);
  assert.match(route, /SCAN_BATCH = 100/);
  assert.match(route, /MAX_SCAN_PER_REQUEST = 500/);
  assert.match(route, /CURSOR_ID_PATTERN/);
  assert.match(route, /cursorData\\?\\.type !== type/);
  assert.match(route, /startAfter\(lastDoc\)/);
  assert.match(route, /name\.toLocaleLowerCase\(\)\.includes\(search\)/);
  assert.match(route, /nextCursor/);
});

test("Learning Library UI requests each hierarchy level from the paginated endpoint", () => {
  assert.match(page, /api\/learning\/library/);
  assert.match(page, /params\.set\("q", query\.trim\(\)\)/);
  assert.match(page, /params\.set\("cursor", cursor\)/);
  assert.match(page, /setCursorStack/);
  assert.match(page, /disabled=\{!nextCursor\}/);
});

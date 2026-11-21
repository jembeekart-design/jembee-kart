import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const rules = fs.readFileSync(path.join(process.cwd(), "storage.rules"), "utf8");

test("APK release uploads are limited to authenticated admins and known platforms", () => {
  assert.match(rules, /match \/app-releases\/\{platform\}\/\{versionCode\}\/\{fileName\}/);
  assert.match(rules, /function isAdmin\(\)/);
  assert.match(rules, /platform in \['mobile', 'tv'\]/);
  assert.match(rules, /in\.jembeeplay\.mobile/);
  assert.match(rules, /in\.jembeeplay\.tv/);
});

test("APK release upload enforces filename, size, content type and SHA-256 metadata", () => {
  assert.match(rules, /versionCode\.matches/);
  assert.match(rules, /request\.resource\.size <= 250 \* 1024 \* 1024/);
  assert.match(rules, /application\/vnd\.android\.package-archive/);
  assert.match(rules, /request\.resource\.metadata\.sha256\.matches/);
});

test("APK files cannot be read, overwritten or deleted directly by clients", () => {
  assert.match(rules, /match \/app-releases[\s\S]*?allow read, update, delete: if false;/);
});

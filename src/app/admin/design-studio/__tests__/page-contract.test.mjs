import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../page.tsx", import.meta.url), "utf8");
const adminHome = await readFile(new URL("../../page.tsx", import.meta.url), "utf8");

test("Interactive Design Studio is linked from Admin navigation", () => {
  assert.match(adminHome, /Interactive Design Studio/);
  assert.match(adminHome, /\/admin\/design-studio/);
});

test("Design Studio exposes the platform screens and device previews", () => {
  for (const label of ["Home", "Shorts", "Explore", "School Learning", "Creator Studio", "Admin Dashboard"]) {
    assert.match(page, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(page, /setDevice\("mobile"\)/);
  assert.match(page, /setDevice\("desktop"\)/);
  assert.match(page, /setDevice\("tv"\)/);
});

test("all demo interactions are local and never call production services", () => {
  assert.match(page, /SAFE DEMO MODE/);
  assert.match(page, /All demo changes reset when this page is refreshed/);
  assert.doesNotMatch(page, /fetch\s*\(/);
  assert.doesNotMatch(page, /firebase\/(?:auth|firestore)/);
  assert.doesNotMatch(page, /getIdToken|onAuthStateChanged|getAdminDb|https:\/\//);
  assert.match(page, /No database, payment, upload, ad, payout or production API is connected/);
  assert.match(page, /Upload is disabled/);
  assert.match(page, /live admin actions are disabled|destructive admin actions are disabled/);
});

test("sample buttons demonstrate outcomes without saving real user actions", () => {
  assert.match(page, /setLiked\(!liked\)/);
  assert.match(page, /setFollowing\(!following\)/);
  assert.match(page, /simulate\(/);
  assert.match(page, /Sample videos/);
});

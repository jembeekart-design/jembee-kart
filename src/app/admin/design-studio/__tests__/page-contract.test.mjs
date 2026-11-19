import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../page.tsx", import.meta.url), "utf8");
const adminHome = await readFile(new URL("../../page.tsx", import.meta.url), "utf8");

test("Design Studio is linked from Admin navigation", () => {
  assert.match(adminHome, /Interactive Design Studio/);
  assert.match(adminHome, /\/admin\/design-studio/);
});

test("reference screen set and device previews are available", () => {
  for (const label of ["Home", "Shorts", "Learning Library", "Long Video Player", "Creator Studio", "Admin Dashboard"]) {
    assert.ok(page.includes(label), `Missing screen: ${label}`);
  }
  assert.match(page, /setDevice\("mobile"\)/);
  assert.match(page, /setDevice\("desktop"\)/);
  assert.match(page, /setDevice\("tv"\)/);
});

test("visual screens use photo-led artwork instead of emoji-only poster placeholders", () => {
  assert.match(page, /images\.unsplash\.com/);
  assert.match(page, /alt="Students learning together"/);
  assert.match(page, /alt="Colorful craft materials"/);
  assert.match(page, /alt="Green plant leaves"/);
  assert.match(page, /video\.image/);
  assert.match(page, /s\.image/);
});

test("all interactions remain isolated demo actions", () => {
  assert.match(page, /SAFE DEMO MODE/);
  assert.match(page, /No database, payment, upload, ad, payout or production API is connected/);
  assert.match(page, /Prototype only/);
  assert.doesNotMatch(page, /\bfetch\s*\(/);
  assert.doesNotMatch(page, /firebase\/(?:auth|firestore)/);
  assert.match(page, /setLiked\(!liked\)/);
  assert.match(page, /setFollowing\(!following\)/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../page.tsx", import.meta.url), "utf8");
const actions = readFileSync(new URL("../../../components/download/AppInstallActions.tsx", import.meta.url), "utf8");
const blueprint = readFileSync(new URL("../../../../docs/jembee-play-audit/ENTERPRISE_MULTI_PLATFORM_RELEASE_BLUEPRINT_2026-11-15.md", import.meta.url), "utf8");

test("download centre keeps mobile and TV artifacts independently environment-gated", () => {
  assert.match(page, /NEXT_PUBLIC_JEMBEE_ANDROID_MOBILE_APK_URL/);
  assert.match(page, /NEXT_PUBLIC_JEMBEE_ANDROID_TV_APK_URL/);
  assert.match(actions, /if \(!downloadUrl\)/);
  assert.match(actions, /Direct download is not published yet/);
});

test("download centre distinguishes native APK downloads from browser PWA installation", () => {
  assert.match(actions, /beforeinstallprompt/);
  assert.match(actions, /Add to Home Screen/);
  assert.match(page, /Install the JEMBEE PLAY website/);
  assert.match(blueprint, /Do not imply PWA is a native APK/);
});

test("store publication is deferred and unverified artifacts are not exposed", () => {
  assert.match(blueprint, /Play Store publication is deferred/);
  assert.match(blueprint, /No download URL is enabled until a signed artifact/);
  assert.match(page, /No placeholder or unverified APK is offered/);
});

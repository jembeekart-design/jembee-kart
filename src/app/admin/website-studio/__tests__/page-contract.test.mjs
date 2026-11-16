import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const studio = await readFile(new URL("../page.tsx", import.meta.url), "utf8");
const home = await readFile(new URL("../../../page.tsx", import.meta.url), "utf8");
const rules = await readFile(new URL("../../../../../firestore.rules", import.meta.url), "utf8");
const adminHome = await readFile(new URL("../../page.tsx", import.meta.url), "utf8");

test("Admin Website Studio saves the dedicated settings document and exposes safe controls", () => {
  assert.match(studio, /admin_settings", "site_experience/);
  assert.match(studio, /setDoc/);
  assert.match(studio, /showLearningBanner/);
  assert.match(studio, /showShorts/);
  assert.match(studio, /showLongVideos/);
  assert.match(studio, /announcementEnabled/);
  assert.match(studio, /primaryColor/);
  assert.match(studio, /sectionOrder/);
  assert.match(studio, /moveSection/);
  assert.match(studio, /Category & Navigation Manager/);
  assert.match(studio, /addCategory/);
  assert.match(studio, /moveCategory/);
  assert.match(studio, /updateNavigationLabel/);
});

test("public Home consumes only the public settings endpoint for supported controls", () => {
  assert.match(home, /\/api\/public\/site-experience/);
  assert.match(home, /siteExperience\.showLearningBanner/);
  assert.match(home, /siteExperience\.showShorts/);
  assert.match(home, /siteExperience\.showLongVideos/);
  assert.match(home, /siteExperience\.showHomeAds/);
});

test("Firestore grants site experience writes only to admins and exposes the studio link", () => {
  assert.match(rules, /isAdmin\(\) && settingId in \['customize', 'mobile_app', 'site_experience'\]/);
  assert.match(adminHome, /\/admin\/website-studio/);
});

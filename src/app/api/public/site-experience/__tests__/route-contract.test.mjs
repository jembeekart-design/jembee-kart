import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../route.ts", import.meta.url), "utf8");

test("public site experience reads only the dedicated admin settings document", () => {
  assert.match(route, /collection\("admin_settings"\)\.doc\("site_experience"\)/);
  assert.match(route, /DEFAULT_SITE_EXPERIENCE/);
  assert.match(route, /safeText/);
  assert.match(route, /safeColor/);
  assert.match(route, /safeBoolean/);
  assert.match(route, /safeSectionOrder/);
  assert.match(route, /safeHomeCategories/);
  assert.match(route, /safeNavigationLabels/);
  assert.match(route, /safeFeaturedCreators/);
  assert.match(route, /safeFeaturedPlaylists/);
  assert.match(route, /safeFeaturedVideos/);
  assert.match(route, /Date\.parse\(endsAt\) <= Date\.parse\(startsAt\)/);
});

test("public site experience allowlists fields and validates input types", () => {
  for (const field of [
    "siteName", "tagline", "heroTitle", "heroSubtitle",
    "primaryColor", "accentColor", "pageColor", "surfaceColor",
    "announcementEnabled", "announcementText", "showLearningBanner",
    "showShorts", "showLongVideos", "showHomeAds", "compactCards", "sectionOrder", "homeCategories", "navigationLabels", "featuredCreators", "featuredPlaylists", "featuredVideos",
  ]) {
    assert.match(route, new RegExp("\\b" + field + ":"));
  }
  assert.match(route, /max-age=30/);
  assert.doesNotMatch(route, /process\.env|private_key|refresh_token|apiKey/i);
});

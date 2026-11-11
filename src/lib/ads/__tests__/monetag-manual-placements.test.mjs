import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const read = (relative) => readFile(path.join(root, relative), "utf8");

test("Monetag manual placement allowlist is limited to named page positions", async () => {
  const placements = await read("src/lib/ads/monetagPlacements.ts");
  assert.match(placements, /home-after-learning-banner/);
  assert.match(placements, /home-after-shorts/);
  assert.match(placements, /home-after-video-grid/);
  assert.match(placements, /explore-bottom/);
  assert.match(placements, /videos-after-feed/);
  assert.doesNotMatch(placements, /route: "\/shorts"|route: "\/learn\/school"/);
});

test("public ad endpoint returns only enabled Monetag Direct Link slots for exact environment and position", async () => {
  const route = await read("src/app/api/ads/placements/route.ts");
  assert.match(route, /isMonetagPlacementId\(placement\)/);
  assert.match(route, /item\.enabled === true/);
  assert.match(route, /item\.networkId === "monetag-direct-link"/);
  assert.match(route, /item\.format === "monetag-direct-link"/);
  assert.match(route, /item\.placement === placement/);
  assert.match(route, /item\.environment === environment/);
  assert.match(route, /normalizeMonetagDirectLink\(item\.adUnitId\)/);
  assert.match(route, /normalizeMonetagCreativeUrl\(item\.creativeImageUrl\)/);
  assert.match(route, /normalizeMonetagCreativeUrl\(item\.logoImageUrl\)/);
});

test("global Monetag tags, AdSense auto script and timed Shorts ads are fail-closed", async () => {
  const layout = await read("src/app/layout.tsx");
  const gate = await read("src/components/MonetagScriptGate.tsx");
  const providers = await read("src/lib/ads/providers/index.ts");
  const videoAds = await read("src/app/api/videos/video-ads/route.ts");
  const feed = await read("src/app/videos/components/VerticalVideoFeed.tsx");
  assert.doesNotMatch(layout, /adsbygoogle|tag\.min\.js|MonetagScriptGate/);
  assert.match(layout, /name="monetag"/); // verification meta only
  assert.match(gate, /return null/);
  assert.match(providers, /return null/);
  assert.match(videoAds, /enabled: false/);
  assert.doesNotMatch(feed, /FloatingAdComponent|currentVideoAd|videoAdsData/);
});

test("Monetag card opens only through a user click with sponsored link attributes", async () => {
  const component = await read("src/components/ads/MonetagPlacement.tsx");
  assert.match(component, /href=\{slot\.url\}/);
  assert.match(component, /target="_blank"/);
  assert.match(component, /nofollow sponsored noopener noreferrer/);
  assert.match(component, /creativeImageUrl/);
  assert.match(component, /logoImageUrl/);
  assert.match(component, /advertiserName/);
  assert.doesNotMatch(component, /window\.open|setTimeout|location\.href/);
  assert.match(component, /data-ad-slot-placeholder="true"/);
  assert.match(component, /विज्ञापन स्थान Admin द्वारा नियंत्रित/);
  assert.match(component, /Sponsored space/);
});

test("Home, Explore and Video Library mount only their allowlisted placements", async () => {
  const home = await read("src/app/page.tsx");
  const explore = await read("src/app/explore/page.tsx");
  const videos = await read("src/app/videos/page.tsx");
  const school = await read("src/app/learn/school/page.tsx");
  assert.match(home, /home-after-learning-banner/);
  assert.match(home, /home-after-shorts/);
  assert.match(home, /home-after-video-grid/);
  assert.match(explore, /explore-bottom/);
  assert.match(videos, /videos-after-feed/);
  assert.doesNotMatch(school, /MonetagPlacement/);
});

test("video-only Terms no longer contain legacy merchant or MLM clauses", async () => {
  const terms = await read("src/app/terms_conditions/page.tsx");
  assert.match(terms, /JEMBEE PLAY Terms/);
  assert.doesNotMatch(terms, /JembeeKart|Shipping|Products and Orders|Referral and Network/);
  assert.match(terms, /Monetag/);
});

test("Google Drive error handlers classify without logging provider error objects", async () => {
  const helper = await read("src/lib/googleDriveErrors.ts");
  const thumbnail = await read("src/app/api/shorts/video-thumbnail/[videoId]/route.ts");
  const stream = await read("src/app/api/shorts/video-stream/[videoId]/route.ts");
  const upload = await read("src/app/api/creator/start-drive-upload/route.ts");
  assert.match(helper, /invalid_grant/);
  assert.match(helper, /GOOGLE_DRIVE_AUTH_EXPIRED/);
  assert.match(thumbnail, /classifyGoogleDriveError\(error\)/);
  assert.match(stream, /classifyGoogleDriveError\(error\)/);
  assert.match(upload, /classifyGoogleDriveError\(error\)/);
  assert.doesNotMatch(thumbnail, /console\.error\([^\n]*error\)/);
  assert.doesNotMatch(stream, /console\.error\([^\n]*error\)/);
  assert.doesNotMatch(upload, /stack: error/);
});

test("Explore retains all 20 requested learning categories", async () => {
  const explore = await read("src/app/explore/page.tsx");
  const ids = [...explore.matchAll(/\{id:"([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, 20);
  assert.ok(ids.includes("general-knowledge"));
  assert.ok(ids.includes("cooking"));
  assert.ok(ids.includes("home-diy"));
  assert.ok(ids.includes("career"));
  assert.ok(ids.includes("legal-civic"));
  assert.ok(ids.includes("kids-learning"));
});

test("Videos library is separate from Shorts and supports selected video deep links", async () => {
  const videos = await read("src/app/videos/page.tsx");
  const feed = await read("src/app/videos/components/VerticalVideoFeed.tsx");
  assert.match(videos, /requestedVideoId/);
  assert.match(videos, /FullscreenVideoFeed activeTab="foryou"/);
  assert.doesNotMatch(videos, /redirect\("\/shorts"\)/);
  assert.match(feed, /searchParams\.get\("v"\)/);
  assert.match(feed, /paidVideoId \?\? libraryVideoId/);
});

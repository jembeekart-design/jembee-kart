import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const projectRoot = new URL("../../../../../../", import.meta.url);
const source = (path) => readFileSync(new URL(path, projectRoot), "utf8");

test("new user profiles do not initialise legacy shopping or MLM fields", () => {
  const route = source("src/app/api/auth/create-profile/route.ts");
  for (const legacyField of [
    "parentChain",
    "teamSize",
    "teamBusiness",
    "totalTeamBusiness",
    "directBusiness",
    "level1Count",
    "level2Count",
    "level3Count",
    "level4Count",
    "level5Count",
    "levelIncome",
    "rankIncome",
    "joinedPackage",
    "packageAmount",
    "totalProductsPurchased",
    "totalOrders",
    "sponsorId",
    "sponsorReferralCode",
    "shareCode",
  ]) {
    assert.doesNotMatch(route, new RegExp(`\\b${legacyField}\\b`), `${legacyField} must not be initialised`);
  }
  assert.match(route, /walletBalance: 0/);
});

test("signup and login no longer capture old JBK MLM sponsor codes", () => {
  const signup = source("src/app/signup/page.tsx");
  const login = source("src/app/login/page.tsx");
  const profile = source("src/app/api/auth/create-profile/route.ts");
  for (const text of [signup, login, profile]) {
    assert.doesNotMatch(text, /jbk_pending_ref|sponsorCode|sponsorUid|sponsorReferralCode/);
  }
});

test("video share attribution and paid-video order flows remain present", () => {
  const paidGate = source("src/app/videos/components/PaidVideoGate.tsx");
  const shareClaim = source("src/app/api/monetag/share-attribution/claim/route.ts");
  const paidOrder = source("src/app/api/shorts/paid-video/create-order/route.ts");
  assert.ok(paidGate.includes("/api/monetag/share-attribution/claim"));
  assert.match(shareClaim, /monetagShareClaims/);
  assert.match(paidOrder, /watchVideoPaymentOrders/);
  assert.match(paidOrder, /monetagShareClaims/);
});

test("unused multi-level referral helper modules are removed from the source surface", () => {
  for (const legacyPath of [
    "src/lib/security/selfReferralProtection.ts",
    "src/lib/security/referralValidation.ts",
    "src/lib/security/sponsorUpdater.ts",
    "src/lib/security/updateUplineTree.ts",
    "src/lib/security/userRegistrationHelper.ts",
    "src/lib/security/marketingCode.ts",
  ]) {
    assert.equal(existsSync(new URL(legacyPath, projectRoot)), false, `${legacyPath} should be removed`);
  }
  const securityIndex = source("src/lib/security/index.ts");
  assert.doesNotMatch(securityIndex, /selfReferralProtection|referralValidation|sponsorUpdater|updateUplineTree|userRegistrationHelper/);
});

test("admin theme and notifications are video-first, not commerce/MLM themed", () => {
  const theme = source("src/components/admin/theme-builder/ThemePreview.tsx");
  const notifications = source("src/app/admin/push-notifications/page.tsx");
  const sponsored = source("src/app/videos/components/SponsoredCard.tsx");
  const promotion = source("src/app/videos/components/PromotionBar.tsx");
  assert.match(theme, /Featured Videos & Shorts/);
  assert.doesNotMatch(theme, /Featured Products|Add To Cart|Fashion|Electronics/);
  assert.doesNotMatch(notifications, /Sellers|Affiliates|Premium Members/);
  assert.match(notifications, /Creators/);
  assert.equal(sponsored.includes("jembeekart.com"), false);
  assert.equal(sponsored.includes("window.open"), false);
  assert.equal(sponsored.includes("Shop"), false);
  assert.ok(promotion.includes("/learn/school"));
});

test("admin support, roles, and settings no longer expose shopping operations", () => {
  const support = source("src/app/admin/customer-support/page.tsx");
  const roles = source("src/app/admin/roles/page.tsx");
  const settings = source("src/app/admin/settings/page.tsx");
  assert.match(support, /Viewer & Creator Support/);
  assert.doesNotMatch(support, /Order not delivered|Return request|Order kab deliver/i);
  assert.match(support, /Paid video refund review/);
  assert.doesNotMatch(roles, /Order Manager|Seller Manager|Affiliate Manager/i);
  assert.doesNotMatch(settings, /deliveryCharge|Delivery Charge/);
  assert.match(settings, /Read only video-platform settings/);
});

test("Shorts metadata preload is limited to current and next four visible videos", () => {
  const feed = source("src/app/videos/components/VerticalVideoFeed.tsx");
  assert.match(feed, /preloadMetadata=\{index >= activeVideoIndex && index < activeVideoIndex \+ 5/);
});

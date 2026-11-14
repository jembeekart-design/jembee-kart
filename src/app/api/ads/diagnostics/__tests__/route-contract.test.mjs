import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../../../../../../${path}`, import.meta.url), "utf8");

test("public ad diagnostics accept only bounded allowlisted operational events", async () => {
  const route = await read("src/app/api/ads/diagnostics/route.ts");
  assert.match(route, /readBoundedJson\(request, 1024\)/);
  assert.match(route, /EVENTS\.has\(body\.event\)/);
  assert.match(route, /PROVIDERS\.has\(body\.provider\)/);
  assert.match(route, /PLACEMENTS\.has\(body\.placement\)/);
  assert.match(route, /RATE_LIMITED/);
  assert.match(route, /billable: false/);
  assert.doesNotMatch(route, /impressionRevenue|clickRevenue|creatorShare|sharerShare|payout/);
  assert.doesNotMatch(route, /console\.error\([^\n]*error\)/);
});

test("admin diagnostics require admin auth and report events as non-billable", async () => {
  const route = await read("src/app/api/admin/ad-diagnostics/route.ts");
  assert.match(route, /verifyMonetagAdmin\(request\)/);
  assert.match(route, /collection\("ad_diagnostics"\)/);
  assert.match(route, /billable: false/);
  assert.match(route, /masterEnabled/);
  assert.match(route, /exoclickEnvironmentEnabled/);
  assert.match(route, /activeMonetagSlots/);
});

test("player and Monetag cards emit operational diagnostics without controlling billing", async () => {
  const player = await read("src/app/videos/components/ExoClickVideoPlayer.tsx");
  const monetag = await read("src/components/ads/MonetagPlacement.tsx");
  const helper = await read("src/lib/ads/diagnostics.ts");
  assert.match(player, /sendAdDiagnostic\("vast_request"/);
  assert.match(player, /sendAdDiagnostic\("ad_started"/);
  assert.match(player, /sendAdDiagnostic\("ad_timeout"/);
  assert.match(monetag, /sendAdDiagnostic\("placement_click"/);
  assert.match(helper, /Non-billable operational diagnostics only/);
  assert.match(monetag, /<a[\s\S]*?href=\{slot\.url\}/);
  assert.doesNotMatch(monetag, /<a\s[\s\S]*?<a\s/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../ExoClickShortsAd.tsx', import.meta.url), 'utf8');

test('Shorts ExoClick ad starts automatically when active and IMA is ready', () => {
  assert.match(source, /if \(!active \|\| !sdkReady \|\| !vastUrl/);
  assert.match(source, /startAd\(\);/);
  assert.match(source, /loader\.requestAds\(request\)/);
});

test('Shorts ExoClick ad has no manual Play Ad control', () => {
  assert.doesNotMatch(source, /▶ Play Ad|onClick=\{startAd\}/);
});

test('Shorts ExoClick ad continues after errors and destroys playback when inactive', () => {
  assert.match(source, /onContinueRef\.current\(\)/);
  assert.match(source, /videoRef\.current\?\.pause\(\)/);
  assert.match(source, /ima\.AdErrorEvent\.Type\.AD_ERROR/);
});

test('Shorts ExoClick emits non-billable diagnostics for VAST lifecycle failures and playback', () => {
  assert.match(source, /sendAdDiagnostic\("vast_request", "exoclick", "shorts"\)/);
  assert.match(source, /sendAdDiagnostic\("ad_no_fill", "exoclick", "shorts"\)/);
  assert.match(source, /sendAdDiagnostic\("ad_timeout", "exoclick", "shorts"\)/);
  assert.match(source, /sendAdDiagnostic\("ad_started", "exoclick", "shorts"\)/);
  assert.match(source, /sendAdDiagnostic\("ad_error", "exoclick", "shorts"\)/);
});

test('Shorts ad slots obey the global admin master and deployment provider flag', () => {
  const feed = readFileSync(new URL('../VerticalVideoFeed.tsx', import.meta.url), 'utf8');
  assert.match(feed, /fetch\("\/api\/videos\/video-ads"/);
  assert.match(feed, /config\?\.masterEnabled && config\?\.providerReady/);
});

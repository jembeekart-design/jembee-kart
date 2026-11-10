import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../page.tsx', import.meta.url), 'utf8');
const worker = readFileSync(new URL('../../../../public/sw.js', import.meta.url), 'utf8');
const errorBoundary = readFileSync(new URL('../error.tsx', import.meta.url), 'utf8');

test('Shorts page statically imports its visible header and feed', () => {
  assert.match(page, /import ProductionHeader from/);
  assert.match(page, /import FullscreenVideoFeed from/);
  assert.doesNotMatch(page, /dynamic\s*\(/);
  assert.doesNotMatch(page, /ssr:\s*false/);
});

test('legacy third-party service worker import is removed', () => {
  assert.doesNotMatch(worker, /importScripts\s*\(/);
  assert.doesNotMatch(worker, /3nbf4\.com/);
  assert.match(worker, /skipWaiting/);
  assert.match(worker, /clients\.claim/);
});

test('Shorts route has a user-visible recovery boundary', () => {
  assert.match(errorBoundary, /Shorts अभी लोड नहीं हो पाया/);
  assert.match(errorBoundary, /reset\(\)/);
});

test('Shorts feed query hook is inside a Suspense boundary for production prerendering', () => {
  assert.match(page, /<Suspense\b[\s\S]*<FullscreenVideoFeed[\s\S]*<\/Suspense>/);
});

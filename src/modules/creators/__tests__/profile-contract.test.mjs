import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const moduleSource = await readFile(new URL('../profile.ts', import.meta.url), 'utf8');
const routeSource = await readFile(new URL('../../../app/api/creator/public-profile/route.ts', import.meta.url), 'utf8');

test('creator module exports bounded profile projection', () => {
  assert.match(moduleSource, /export function safeProfileString/);
  assert.match(moduleSource, /slice\(0, maxLength\)/);
  assert.match(moduleSource, /export function projectPublicCreatorProfile/);
});

test('public creator visibility requires approved, active, safe, free video', () => {
  assert.match(moduleSource, /video\.status === "approved"/);
  assert.match(moduleSource, /video\.active === true/);
  assert.match(moduleSource, /video\.moderation === "safe"/);
  assert.match(moduleSource, /video\.videoAccess === "free"/);
});

test('public profile route delegates to creator domain module', () => {
  assert.match(routeSource, /@\/modules\/creators\/profile/);
  assert.match(routeSource, /isPublicCreatorVideo/);
  assert.match(routeSource, /projectPublicCreatorProfile/);
});

test('public profile projection does not expose payout or private account fields', () => {
  const start = moduleSource.indexOf('return {', moduleSource.indexOf('projectPublicCreatorProfile'));
  const projection = moduleSource.slice(start);
  assert.match(projection, /documentId:/);
  assert.match(projection, /displayName,/);
  assert.match(projection, /username:/);
  assert.match(projection, /photoURL:/);
  assert.doesNotMatch(projection, /bank|payout|email|phone|wallet/i);
});

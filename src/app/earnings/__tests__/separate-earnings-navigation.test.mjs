import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('home navigation exposes only direct video sharer and creator earnings', async () => {
  const source = await read('../../page.tsx');
  assert.match(source, /Sharer की कमाई/);
  assert.match(source, /Creator की कमाई/);
  assert.doesNotMatch(source, /Teacher Referral Commission|earnings\/teacher/);
  assert.match(source, /mobile-navigation-drawer/);
  assert.match(source, /setMobileMenuOpen\(\(value\) => !value\)/);
});

test('sharer and creator earnings routes use role-filtered video earnings', async () => {
  const sharer = await read('../sharer/page.tsx');
  const creator = await read('../creator/page.tsx');
  const component = await read('../../../components/earnings/MonetagEarningsPage.tsx');
  assert.match(sharer, /role="sharer"/);
  assert.match(creator, /role="uploader"/);
  assert.match(component, /item\.role === role/);
  assert.match(component, /row\.status === "confirmed"/);
  assert.match(component, /api\/earnings\/paid-video/);
  assert.match(component, /Paid-video share \(INR\)/);
});

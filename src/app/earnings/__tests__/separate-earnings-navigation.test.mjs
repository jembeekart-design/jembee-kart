import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('home navigation exposes three separate earnings destinations in the mobile drawer', async () => {
  const source = await read('../../page.tsx');
  assert.match(source, /Sharer की कमाई/);
  assert.match(source, /Creator की कमाई/);
  assert.match(source, /Teacher Referral Commission/);
  assert.match(source, /mobile-navigation-drawer/);
  assert.match(source, /setMobileMenuOpen\(\(value\) => !value\)/);
});

test('sharer and creator earnings routes use role-filtered Monetag earnings pages', async () => {
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

test('teacher earnings are read only for the authenticated teacher and use the existing commission ledger', async () => {
  const route = await read('../../api/teacher/earnings/route.ts');
  const page = await read('../teacher/page.tsx');
  const component = await read('../../../components/earnings/TeacherEarningsPage.tsx');
  assert.match(route, /verifyIdToken\(token, true\)/);
  assert.match(route, /where\("beneficiaryUid", "==", uid\)/);
  assert.match(route, /teacher_referral_commission/);
  assert.match(route, /teacher_referral_commission_adjustment/);
  assert.match(component, /refund-adjusted Admin Net Profit/);
  assert.match(component, /verified Sharer\/referrer/);
  assert.match(component, /pending settlement/);
  assert.match(page, /TeacherEarningsPage/);
});

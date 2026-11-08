import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../route.ts', import.meta.url), 'utf8');

test('verification requires an approved, active, safe paid video', () => {
  for (const condition of [
    'video?.status !== "approved"',
    'video?.active !== true',
    'video?.moderation !== "safe"',
    'video?.videoAccess !== "paid"',
  ]) assert.ok(source.includes(condition), `missing gate: ${condition}`);
});

test('verification requires explicit paid checkout enablement', () => {
  assert.ok(source.includes('video?.paidVideoStatus !== "enabled"'));
  assert.ok(source.includes('video?.paidCheckoutEnabled !== true'));
  assert.ok(source.includes('typeof video?.creatorId !== \"string\"'));
  assert.ok(source.includes('typeof order.creatorId !== \"string\"'));
});

test('order amount must match the server video price in paise', () => {
  assert.ok(source.includes('expectedVideoPaise !== orderVideoPaise'));
  assert.ok(source.includes('validInrAmount(freshVideoData?.videoPrice) !== validInrAmount(freshOrderData?.amount)'));
});

test('eligibility and amount are rechecked inside the Firestore transaction', () => {
  assert.ok(source.includes('tx.get(videoRef)'));
  assert.ok(source.includes('freshVideoData?.paidCheckoutEnabled !== true'));
});

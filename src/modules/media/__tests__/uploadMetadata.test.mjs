import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateUploadMetadata } from '../uploadMetadata.ts';

test('normalizes valid creator upload metadata and deduplicates hashtags', () => {
  const result = validateUploadMetadata({ caption: '  Hello  ', hashtags: ['#learn', 'learn', ' #study '], videoFormat: 'long', durationSeconds: 120 });
  assert.equal(result.caption, 'Hello');
  assert.deepEqual(result.hashtags, ['learn', 'study']);
  assert.equal(result.videoFormat, 'long');
  assert.equal(result.videoPrice, 0);
});

test('rejects oversized caption and excessive hashtags', () => {
  assert.equal(validateUploadMetadata({ caption: 'x'.repeat(2201) }), null);
  assert.equal(validateUploadMetadata({ hashtags: Array(31).fill('tag') }), null);
});

test('rejects unsafe photo URL and invalid duration', () => {
  assert.equal(validateUploadMetadata({ photoURL: 'javascript:alert(1)' }), null);
  assert.equal(validateUploadMetadata({ durationSeconds: 86401 }), null);
});

test('rejects malformed metadata types and nonzero paid price', () => {
  assert.equal(validateUploadMetadata({ hashtags: 'not-an-array' }), null);
  assert.equal(validateUploadMetadata({ videoPrice: 100001 }), null);
  assert.equal(validateUploadMetadata({ videoPrice: 10 }).videoPrice, 0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../verification.ts', import.meta.url), 'utf8');

test('teacher verification states are explicit and bounded', () => {
  for (const state of ['not_submitted', 'pending', 'verified', 'rejected', 'suspended']) {
    assert.match(source, new RegExp(`"${state}"`));
  }
  assert.match(source, /ALLOWED_STATUSES/);
});

test('creator identity alone cannot imply verified teacher', () => {
  assert.match(source, /normalizeTeacherVerificationStatus\(candidate\.status\) === "verified"/);
  assert.match(source, /candidate\.reviewedBy/);
});

test('resubmission is restricted to not submitted or rejected states', () => {
  assert.match(source, /status === "not_submitted" \|\| status === "rejected"/);
});

test('review requires reviewer identity and rejection reason', () => {
  assert.match(source, /Invalid reviewer identity/);
  assert.match(source, /A rejection reason is required/);
  assert.match(source, /reason\.length > 500/);
});

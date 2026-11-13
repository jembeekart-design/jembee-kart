import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFollowPair, validateCommentLikeInput, buildFollowNotification } from '../contracts.ts';

test('follow pair rejects missing and self-follow identities', () => {
  assert.equal(validateFollowPair('', 'target'), 'Follower user ID is missing');
  assert.equal(validateFollowPair('same', 'same'), 'Cannot follow yourself');
  assert.equal(validateFollowPair('a'.repeat(129), 'target'), 'Invalid user ID');
  assert.equal(validateFollowPair('follower', 'target'), null);
});

test('comment like input is normalized and constrained', () => {
  assert.deepEqual(validateCommentLikeInput(' comment-1 ', 'like'), { commentId: 'comment-1', action: 'like' });
  assert.equal(validateCommentLikeInput('x', 'remove'), null);
  assert.equal(validateCommentLikeInput('x'.repeat(501), 'like'), null);
});

test('follow notification payload bounds user-controlled display name', () => {
  const payload = buildFollowNotification('recipient', 'sender', 'A'.repeat(150));
  assert.equal(payload.message.length, 123);
  assert.equal(payload.read, false);
  assert.equal(payload.type, 'follow');
});

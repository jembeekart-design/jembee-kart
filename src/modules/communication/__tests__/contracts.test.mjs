import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateCommunicationRequest, communicationIdempotencyKey } from '../contracts.ts';

const base = { channel: 'in_app', recipientId: 'user_123', message: 'Your video was approved', priority: 'account' };

test('accepts bounded in-app notification contract', () => {
  assert.equal(validateCommunicationRequest(base).ok, true);
});
test('rejects unknown channel and malformed recipient', () => {
  assert.equal(validateCommunicationRequest({ ...base, channel: 'sms' }).ok, false);
  assert.equal(validateCommunicationRequest({ ...base, recipientId: '../admin' }).ok, false);
});
test('rejects empty and oversized message', () => {
  assert.equal(validateCommunicationRequest({ ...base, message: '  ' }).ok, false);
  assert.equal(validateCommunicationRequest({ ...base, message: 'x'.repeat(4001) }).ok, false);
});
test('validates email recipient for email channel', () => {
  assert.equal(validateCommunicationRequest({ ...base, channel: 'email', recipientEmail: 'user@example.com' }).ok, true);
  assert.equal(validateCommunicationRequest({ ...base, channel: 'email', recipientEmail: 'bad' }).ok, false);
});
test('requires E.164 number and explicit WhatsApp consent', () => {
  const request = { ...base, channel: 'whatsapp', phoneE164: '+919876543210', whatsappConsent: true };
  assert.equal(validateCommunicationRequest(request).ok, true);
  assert.equal(validateCommunicationRequest({ ...request, whatsappConsent: false }).ok, false);
  assert.equal(validateCommunicationRequest({ ...request, phoneE164: '9876543210' }).ok, false);
});
test('rejects invalid priority and subject overflow', () => {
  assert.equal(validateCommunicationRequest({ ...base, priority: 'urgent' }).ok, false);
  assert.equal(validateCommunicationRequest({ ...base, subject: 'x'.repeat(161) }).ok, false);
});
test('builds deterministic recipient-scoped idempotency key', () => {
  assert.equal(communicationIdempotencyKey('u1', 'email', 'event1'), 'email_u1_event1');
  assert.equal(communicationIdempotencyKey('../u', 'email', 'event1'), null);
});

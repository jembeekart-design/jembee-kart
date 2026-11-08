import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rules = fs.readFileSync(path.join(root, 'storage.rules'), 'utf8');
const firebase = JSON.parse(fs.readFileSync(path.join(root, 'firebase.json'), 'utf8'));

test('Firebase deploy config includes Storage rules and Storage Emulator', () => {
  assert.equal(firebase.storage?.rules, 'storage.rules');
  assert.equal(firebase.emulators?.storage?.port, 9199);
});

test('invoice evidence is restricted to the paid-video evidence path', () => {
  assert.match(rules, /match \/shorts-expense-evidence\/\{orderId\}\/\{fileName\}/);
  assert.match(rules, /isPaidVideoOrder\(orderId\)/);
  assert.match(rules, /watchVideoPaymentOrders\/\$\(orderId\)/);
});

test('only authenticated admins can create invoice evidence', () => {
  assert.match(rules, /function isAdmin\(\)/);
  assert.match(rules, /allow create: if isAdmin\(\)/);
  assert.match(rules, /\['admin', 'super_admin'\]/);
});

test('invoice upload enforces type, size and uploader metadata', () => {
  assert.match(rules, /request\.resource\.size <= 10 \* 1024 \* 1024/);
  assert.match(rules, /application\/pdf/);
  assert.match(rules, /image\/jpeg/);
  assert.match(rules, /image\/png/);
  assert.match(rules, /image\/webp/);
  assert.match(rules, /request\.resource\.metadata\.uploadedByUid == request\.auth\.uid/);
});

test('clients cannot read, overwrite or delete invoice evidence', () => {
  assert.match(rules, /allow read, update, delete: if false/);
});

test('unmatched Storage paths are denied by default', () => {
  assert.match(rules, /match \/\{allPaths=\*\*\} \{\s*allow read, write: if false/s);
});

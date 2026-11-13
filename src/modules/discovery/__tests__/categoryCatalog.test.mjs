import test from 'node:test';
import assert from 'node:assert/strict';
import { filterDiscoveryCategories, normalizeDiscoveryQuery } from '../categoryCatalog.ts';

const categories = [
  { id: 'school', name: 'School', description: 'Nursery to Class 12', topics: ['Teachers', 'Maths'] },
  { id: 'agri', name: 'कृषि', description: 'खेती और किसान शिक्षा', topics: ['बीज', 'सिंचाई'] },
];

test('empty query returns a new array with every category', () => {
  const result = filterDiscoveryCategories(categories, '  ');
  assert.deepEqual(result, categories);
  assert.notEqual(result, categories);
});

test('search matches category names, descriptions and topics case-insensitively', () => {
  assert.equal(filterDiscoveryCategories(categories, 'SCHOOL')[0].id, 'school');
  assert.equal(filterDiscoveryCategories(categories, 'teacher')[0].id, 'school');
  assert.equal(filterDiscoveryCategories(categories, 'किसान')[0].id, 'agri');
});

test('search normalization trims and applies unicode compatibility normalization', () => {
  assert.equal(normalizeDiscoveryQuery('  SCHOOL  '), 'school');
});

test('non-matching query returns an empty list', () => {
  assert.deepEqual(filterDiscoveryCategories(categories, 'astronomy'), []);
});

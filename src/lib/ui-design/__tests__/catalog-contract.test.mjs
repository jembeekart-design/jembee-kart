import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const source = readFileSync(new URL('../catalog.ts', import.meta.url), 'utf8');
const slugs = [...source.matchAll(/\{slug:'([^']+)'/g)].map((match) => match[1]);
const tvSlugs = [...source.matchAll(/\{slug:'([^']+)'[^}]*tv:true/g)].map((match) => match[1]);

test('UI design catalog contains 58 unique page concepts', () => {
  assert.equal(slugs.length, 58);
  assert.equal(new Set(slugs).size, 58);
});

test('core video, learning and TV app screens have TV layouts', () => {
  for (const slug of [
    'home', 'shorts', 'video-watch', 'board-selection', 'school-selection',
    'class-selection', 'subject-selection', 'book-selection', 'chapter-details',
    'notes-pdf', 'practice-questions', 'quiz', 'learning-progress',
    'tv-login', 'tv-home', 'tv-search', 'tv-player', 'tv-shorts',
    'tv-learning', 'tv-my-list', 'tv-settings',
  ]) assert.ok(tvSlugs.includes(slug), `${slug} should support TV`);
});

test('creator monetization and admin screens are not exposed as Android TV screens', () => {
  for (const slug of ['creator-dashboard', 'teacher-dashboard', 'sharer-dashboard', 'earnings', 'payment-history', 'upload-video']) {
    assert.ok(!tvSlugs.includes(slug), `${slug} must remain off the TV app`);
  }
});

test('page-specific layouts exist for core list, learning and TV screens', () => {
  const component = readFileSync(new URL('../../../components/ui-design/DesignPreview.tsx', import.meta.url), 'utf8');
  for (const marker of [
    'jp-comment-list', 'jp-history-group', 'jp-channel-list', 'jp-playlist-grid',
    'jp-library-list', 'jp-notification-list', 'jp-help-grid', 'jp-referral-card',
    'jp-course-banner', 'jp-chapter-list', 'jp-tv-keyboard', 'jp-tv-settings-list',
    'jp-tv-pair-card', 'jp-tv-mylist', 'jp-upload-drop', 'jp-delete-warning',
  ]) assert.ok(component.includes(marker), `missing dedicated UI component marker: ${marker}`);
});

test('all catalog entries have unique preview route slugs and required content fields', () => {
  const entries = [...source.matchAll(/\{slug:'([^']+)',title:'([^']+)',category:'([^']+)',description:'([^']+)',sections:\[([^\]]*)\],actions:\[([^\]]*)\]/g)];
  assert.equal(entries.length, 58);
  for (const entry of entries) {
    assert.ok(entry[2].trim().length > 2, `missing title for ${entry[1]}`);
    assert.ok(entry[4].trim().length > 10, `missing description for ${entry[1]}`);
    assert.ok(entry[5].trim().length > 0, `missing sections for ${entry[1]}`);
  }
});

test('design thumbnails are bundled locally for offline preview', () => {
  for (const name of ['art-01.svg','art-02.svg','art-03.svg','art-04.svg']) {
    assert.ok(existsSync(new URL(`../../../../public/ui-design/${name}`, import.meta.url)), `${name} should exist`);
  }
});

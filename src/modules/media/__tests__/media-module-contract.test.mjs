import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../../../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('byte-range parser is owned by the media module and imported by streaming route', async () => {
  const module = await read('modules/media/byteRange.ts');
  const route = await read('app/api/shorts/video-stream/[videoId]/route.ts');
  assert.match(module, /export function parseByteRange/);
  assert.match(module, /export function boundedByteRange/);
  assert.match(route, /@\/modules\/media\/byteRange/);
  assert.match(route, /parseByteRange\(rangeHeader, metadata\.size\)/);
});

test('stream route preserves bounded 4 MiB responses and partial-content status', async () => {
  const route = await read('app/api/shorts/video-stream/[videoId]/route.ts');
  assert.match(route, /MAX_STREAM_CHUNK_BYTES = 4 \* 1024 \* 1024/);
  assert.match(route, /status: 206/);
  assert.match(route, /Accept-Ranges/);
  assert.match(route, /Content-Range/);
});

test('upload validation is centralized and enforces video MIME and 500 MiB cap', async () => {
  const schema = await read('schemas/media/videoUpload.ts');
  const route = await read('app/api/creator/start-drive-upload/route.ts');
  assert.match(schema, /MAX_VIDEO_UPLOAD_BYTES = 500 \* 1024 \* 1024/);
  assert.match(schema, /video\\\//);
  assert.match(schema, /Number\.isSafeInteger/);
  assert.match(route, /validateVideoUpload\(body\)/);
});

test('paid video publishing remains disabled at upload initiation', async () => {
  const route = await read('app/api/creator/start-drive-upload/route.ts');
  assert.match(route, /videoAccess === "paid"/);
  assert.match(route, /Paid video publishing is temporarily disabled/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
const read = (relative) => readFile(path.join(root, relative), "utf8");

test("active Shorts use protected bounded-range streaming with type-safe preload", async () => {
  const feed = await read("src/app/videos/components/VerticalVideoFeed.tsx");
  const player = await read("src/app/videos/components/VideoPlayer.tsx");
  const stream = await read("src/app/api/shorts/video-stream/[videoId]/route.ts");

  assert.match(feed, /videoUrl=\{`\/api\/shorts\/video-stream\/\$\{encodeURIComponent\(video\.id\)\}`\}/);
  assert.match(player, /preload=\{active \|\| preloadMetadata \? "metadata" : "none"\}/);
  assert.doesNotMatch(player, /fetchPriority=/);
  assert.match(stream, /MAX_STREAM_CHUNK_BYTES = 4 \* 1024 \* 1024/);
  assert.match(stream, /bytes=\$\{start\}-\$\{end\}/);
  assert.match(stream, /private, max-age=30/);
  assert.match(stream, /private, no-store/); // paid playback stays uncached
});

test("upload progress pause and cancel controls are connected to the resumable Drive uploader", async () => {
  const page = await read("src/app/videos/upload/page.tsx");
  const upload = await read("src/lib/videos/watch-earn/uploadVideoToDrive.ts");
  const submit = await read("src/lib/videos/watch-earn/submitVideoForModeration.ts");

  assert.match(page, /waitWhilePaused/);
  assert.match(page, /pauseUpload/);
  assert.match(page, /resumeUpload/);
  assert.match(page, /cancelUpload/);
  assert.match(page, /aria-label="Upload progress"/);
  assert.match(upload, /waitWhilePaused\?\.\(\)/);
  assert.match(upload, /AbortError/);
  assert.match(submit, /Upload cancelled by you/);
  assert.match(page, /500 MB/);
  assert.match(upload, /CHUNK_SIZE = 2 \* 1024 \* 1024/);
});

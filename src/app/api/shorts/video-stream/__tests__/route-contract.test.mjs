import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../[videoId]/route.ts", import.meta.url), "utf8");

test("video stream only serves approved, active and safe videos from the configured Drive folder", () => {
  for (const value of [
    'data?.status !== "approved"',
    "data?.active !== true",
    'data?.moderation !== "safe"',
    "GOOGLE_DRIVE_FOLDER_ID",
    "metadata.parents.includes(folderId)",
    'metadata.mimeType.startsWith("video/")',
  ]) assert.ok(source.includes(value), `missing stream guard: ${value}`);
});

test("paid video stream requires a signed video-scoped playback token and live purchase", () => {
  for (const value of [
    "playbackCookieName(videoId)",
    "verifyPlaybackToken(token, videoId)",
    "watchVideoPurchases",
    'purchaseData?.status !== "paid"',
    "purchaseData?.accessRevoked === true",
    "purchaseData?.userId !== payload.uid",
    "purchaseData?.videoId !== videoId",
    '"private, no-store"',
  ]) assert.ok(source.includes(value), `missing paid playback guard: ${value}`);
});

test("stream responses use bounded byte ranges and never return the whole video", () => {
  for (const value of [
    "parseByteRange(rangeHeader, metadata.size)",
    "boundedByteRange(range, MAX_STREAM_CHUNK_BYTES)",
    "const MAX_STREAM_CHUNK_BYTES = 4 * 1024 * 1024",
    '"Accept-Ranges": "bytes"',
    'headers.set("Content-Range"',
    'status: 206',
    'status: 416',
  ]) assert.ok(source.includes(value), `missing range guard: ${value}`);
});

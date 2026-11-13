import { test } from "node:test";
import assert from "node:assert/strict";
import { isAllowedThumbnailContentType, isAllowedThumbnailUrl, isThumbnailLengthAllowed, MAX_THUMBNAIL_BYTES } from "../thumbnailPolicy.ts";

test("accepts HTTPS Google thumbnail hosts only", () => {
  assert.equal(isAllowedThumbnailUrl("https://lh3.googleusercontent.com/abc"), true);
  assert.equal(isAllowedThumbnailUrl("https://drive.google.com/thumbnail?id=x"), true);
  assert.equal(isAllowedThumbnailUrl("http://lh3.googleusercontent.com/abc"), false);
  assert.equal(isAllowedThumbnailUrl("https://evil.example/thumbnail"), false);
  assert.equal(isAllowedThumbnailUrl("not a url"), false);
});

test("allows only supported image response types", () => {
  assert.equal(isAllowedThumbnailContentType("image/jpeg; charset=binary"), true);
  assert.equal(isAllowedThumbnailContentType("image/webp"), true);
  assert.equal(isAllowedThumbnailContentType("text/html"), false);
});

test("enforces a strict bounded content length", () => {
  assert.equal(isThumbnailLengthAllowed(null), true);
  assert.equal(isThumbnailLengthAllowed(String(MAX_THUMBNAIL_BYTES)), true);
  assert.equal(isThumbnailLengthAllowed(String(MAX_THUMBNAIL_BYTES + 1)), false);
  assert.equal(isThumbnailLengthAllowed("-1"), false);
  assert.equal(isThumbnailLengthAllowed("unknown"), false);
});

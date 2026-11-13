import test from "node:test";
import assert from "node:assert/strict";
import { readBoundedRawBody } from "../readBoundedRawBody.ts";

function requestFromChunks(chunks, headers = {}, onCancel = () => {}) {
  const body = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
    cancel(reason) { onCancel(reason); },
  });
  return new Request("https://example.test/webhook", {
    method: "POST",
    headers,
    body,
    duplex: "half",
  });
}

const bytes = (value) => new TextEncoder().encode(value);

test("bounded raw reader accepts body within limit and preserves exact UTF-8 text", async () => {
  const raw = '{"message":"hello"}';
  const result = await readBoundedRawBody(requestFromChunks([bytes(raw)]), 64);
  assert.deepEqual(result, { ok: true, rawBody: raw, byteLength: bytes(raw).byteLength });
});

test("bounded raw reader accepts a body exactly at the byte limit", async () => {
  const raw = "12345678";
  const result = await readBoundedRawBody(requestFromChunks([bytes(raw)]), 8);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.byteLength, 8);
});

test("bounded raw reader rejects streamed overflow and cancels the reader", async () => {
  let cancelled = false;
  let emitted = 0;
  const body = new ReadableStream({
    pull(controller) {
      emitted += 1;
      controller.enqueue(bytes(emitted === 1 ? "1234" : "5678"));
    },
    cancel() { cancelled = true; },
  });
  const request = new Request("https://example.test/webhook", { method: "POST", body, duplex: "half" });
  const result = await readBoundedRawBody(request, 7);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 413);
  assert.equal(cancelled, true);
});

test("bounded raw reader accepts absent Content-Length", async () => {
  const result = await readBoundedRawBody(requestFromChunks([bytes("ok")]), 2);
  assert.equal(result.ok, true);
});

test("bounded raw reader rejects invalid Content-Length", async () => {
  const result = await readBoundedRawBody(requestFromChunks([bytes("ok")], { "content-length": "2x" }), 8);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 400);
});

test("bounded raw reader rejects oversized declared Content-Length before reading", async () => {
  let cancelled = false;
  const request = new Request("https://example.test/webhook", { method: "POST", headers: { "content-length": "9" } });
  const result = await readBoundedRawBody(request, 8);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 413);
  assert.equal(cancelled, false);
});

test("bounded raw reader preserves multibyte UTF-8 split across chunks", async () => {
  const encoded = bytes('{"city":"जमशेदपुर"}');
  const split = 11;
  const result = await readBoundedRawBody(requestFromChunks([encoded.slice(0, split), encoded.slice(split)]), 64);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.rawBody, '{"city":"जमशेदपुर"}');
});

test("bounded raw reader rejects empty body as an empty raw string", async () => {
  const result = await readBoundedRawBody(requestFromChunks([]), 8);
  assert.deepEqual(result, { ok: true, rawBody: "", byteLength: 0 });
});

test("bounded raw reader rejects malformed UTF-8 instead of normalizing signed bytes", async () => {
  const result = await readBoundedRawBody(requestFromChunks([new Uint8Array([0xc3, 0x28])]), 8);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 400);
});

test("bounded raw reader rejects invalid limit configuration", async () => {
  await assert.rejects(() => readBoundedRawBody(requestFromChunks([bytes("x")]), 0), /Invalid raw body limit/);
});

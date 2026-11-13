/** Read a raw UTF-8 request body incrementally with a hard byte limit. */
export type BoundedRawBodyResult =
  | { ok: true; rawBody: string; byteLength: number }
  | { ok: false; status: 400 | 413; message: string };

export async function readBoundedRawBody(request: Request, maxBytes: number): Promise<BoundedRawBodyResult> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) {
    throw new Error("Invalid raw body limit configuration");
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null) {
    // Content-Length is advisory for streaming requests, but malformed values
    // are rejected and oversized declarations are rejected before reading.
    if (!/^\d+$/.test(declaredLength)) {
      return { ok: false, status: 400, message: "Invalid Content-Length" };
    }
    const parsedLength = Number(declaredLength);
    if (!Number.isSafeInteger(parsedLength)) {
      return { ok: false, status: 400, message: "Invalid Content-Length" };
    }
    if (parsedLength > maxBytes) {
      return { ok: false, status: 413, message: "Request body is too large" };
    }
  }

  if (!request.body) {
    return { ok: false, status: 400, message: "Request body is required" };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!(value instanceof Uint8Array)) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, status: 400, message: "Invalid request body stream" };
      }
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, status: 413, message: "Request body is too large" };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, message: "Could not read request body" };
  } finally {
    try { reader.releaseLock(); } catch { /* reader may already be released */ }
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    // Fatal decoding prevents invalid UTF-8 from being silently normalized
    // before signature verification.
    const rawBody = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { ok: true, rawBody, byteLength: total };
  } catch {
    return { ok: false, status: 400, message: "Request body is not valid UTF-8" };
  }
}

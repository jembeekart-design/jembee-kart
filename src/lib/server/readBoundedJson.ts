/** Read and parse a JSON request body with a hard byte limit before JSON.parse. */
export type BoundedJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; status: 400 | 413 | 415; message: string };

export async function readBoundedJson(request: Request, maxBytes: number): Promise<BoundedJsonResult> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType.split(";")[0].trim() !== "application/json") {
    return { ok: false, status: 415, message: "Content-Type must be application/json" };
  }
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) throw new Error("Invalid JSON body limit configuration");
  if (!request.body) return { ok: false, status: 400, message: "Request body is required" };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, status: 413, message: "Request body is too large" };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, message: "Could not read request body" };
  }
  try {
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const value: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return { ok: true, value };
  } catch {
    return { ok: false, status: 400, message: "Malformed JSON body" };
  }
}

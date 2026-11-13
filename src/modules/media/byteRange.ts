/** Parse a single RFC 7233 byte range. Returns null for malformed/unsatisfiable input. */
export interface ByteRange { start: number; end: number }

export function parseByteRange(value: string, size: number): ByteRange | null {
  if (!Number.isSafeInteger(size) || size <= 0) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
  if (!match || (!match[1] && !match[2])) return null;

  let start: number;
  let end: number;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
  }

  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) return null;
  return { start, end: Math.min(end, size - 1) };
}

export function boundedByteRange(range: ByteRange, maxBytes: number): ByteRange {
  const limit = Number.isSafeInteger(maxBytes) && maxBytes > 0 ? maxBytes : 1;
  return { start: range.start, end: Math.min(range.end, range.start + limit - 1) };
}

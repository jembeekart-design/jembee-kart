import { createHash } from "node:crypto";

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hashPayload(payload) {
  return createHash("sha256").update(stableJson(payload)).digest("hex");
}

/** Verify ordered, stored audit records and return the final chain hash. */
export function verifyAuditChain(events, { pageId }) {
  let previousHash = null;
  let expectedRevision = 1;
  for (const event of events) {
    if (!isPlainRecord(event) ||
        event.pageId !== pageId ||
        !Number.isSafeInteger(event.auditRevision) || event.auditRevision !== expectedRevision ||
        (event.previousHash ?? null) !== previousHash ||
        typeof event.actorUid !== "string" || !event.actorUid ||
        typeof event.action !== "string" || !event.action ||
        event.schemaVersion !== 1 ||
        !isPlainRecord(event.details) ||
        typeof event.hash !== "string" || !/^[a-f0-9]{64}$/.test(event.hash)) {
      return { valid: false, lastHash: previousHash, failedRevision: expectedRevision };
    }
    const payload = {
      pageId,
      auditRevision: event.auditRevision,
      previousHash: event.previousHash ?? null,
      actorUid: event.actorUid,
      action: event.action,
      details: event.details,
      schemaVersion: 1,
    };
    const expectedHash = hashPayload(payload);
    if (expectedHash !== event.hash) {
      return { valid: false, lastHash: previousHash, failedRevision: expectedRevision };
    }
    previousHash = event.hash;
    expectedRevision += 1;
  }
  return { valid: true, lastHash: previousHash, failedRevision: null };
}

export function createAuditHash(payload) {
  return hashPayload(payload);
}

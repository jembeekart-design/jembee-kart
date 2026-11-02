export type AuditChainEvent = {
  pageId: string;
  auditRevision: number;
  previousHash: string | null;
  actorUid: string;
  action: string;
  details: Record<string, unknown>;
  schemaVersion: 1;
  hash: string;
};
export function verifyAuditChain(
  events: unknown[],
  page: { pageId: string },
): { valid: boolean; lastHash: string | null; failedRevision: number | null };
export function createAuditHash(payload: AuditChainEvent | Omit<AuditChainEvent, "hash">): string;

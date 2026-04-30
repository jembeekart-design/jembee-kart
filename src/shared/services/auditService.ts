// src/shared/services/auditService.ts

type AuditAction =
  | "login"
  | "logout"
  | "create_order"
  | "payment"
  | "refund"
  | "admin_change";

type AuditEntry = {
  userId?: string;
  action: AuditAction;
  entityId?: string;
  meta?: Record<string, any>;
  ts: number;
};

let auditTrail: AuditEntry[] = [];

// 🔹 Record audit
export const recordAudit = (entry: Omit<AuditEntry, "ts">) => {
  auditTrail.push({
    ...entry,
    ts: Date.now(),
  });
};

// 🔹 Query
export const getAuditByUser = (userId: string) => {
  return auditTrail.filter((a) => a.userId === userId);
};

export const getAuditByAction = (action: AuditAction) => {
  return auditTrail.filter((a) => a.action === action);
};

// 🔹 Full trail (admin)
export const getAuditTrail = () => auditTrail;

// 🔹 Clear (admin)
export const clearAudit = () => {
  auditTrail = [];
};
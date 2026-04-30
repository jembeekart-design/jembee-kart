// src/shared/services/fraudService.ts

type FraudSignal = {
  userId?: string;
  ip?: string;
  deviceId?: string;
  amount?: number;
  velocity?: number; // actions per minute
};

type FraudResult = {
  score: number; // 0-100
  risk: "low" | "medium" | "high";
  reasons: string[];
};

let blockedIPs = new Set<string>();
let blockedUsers = new Set<string>();

// 🔹 Admin controls
export const blockIP = (ip: string) => blockedIPs.add(ip);
export const unblockIP = (ip: string) => blockedIPs.delete(ip);
export const blockUser = (uid: string) => blockedUsers.add(uid);
export const unblockUser = (uid: string) => blockedUsers.delete(uid);

// 🔹 Evaluate risk
export const evaluateFraud = (s: FraudSignal): FraudResult => {
  let score = 0;
  const reasons: string[] = [];

  if (s.ip && blockedIPs.has(s.ip)) {
    score += 80;
    reasons.push("IP blocked");
  }

  if (s.userId && blockedUsers.has(s.userId)) {
    score += 80;
    reasons.push("User blocked");
  }

  if (s.amount && s.amount > 10000) {
    score += 20;
    reasons.push("High amount");
  }

  if (s.velocity && s.velocity > 10) {
    score += 30;
    reasons.push("High activity velocity");
  }

  if (score > 100) score = 100;

  let risk: FraudResult["risk"] = "low";
  if (score >= 60) risk = "high";
  else if (score >= 30) risk = "medium";

  return { score, risk, reasons };
};

// 🔹 Decision helper
export const shouldBlock = (result: FraudResult) => {
  return result.risk === "high";
};
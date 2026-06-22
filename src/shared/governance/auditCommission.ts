// src/shared/governance/auditCommission.ts

import {
  collection,
  getDocs,
  query,
  where,
  limit
} from "firebase/firestore";

import { db } from "@/firebase/config";

export type AuditStatus = "PASS" | "WARNING" | "CRITICAL";

export interface CommissionAuditResult {
  status: AuditStatus;
  orderId: string;
  profit: number;
  commissionPaid: number;
  expectedCommission: number;
  difference: number;
  issues: string[];
}

export async function auditCommission(
  orderId: string,
  orderProfit: number,
  expectedCommission: number
): Promise<CommissionAuditResult> {

  const issues: string[] = [];

  const logsRef = collection(db, "commissionLogs");

  const logsQuery = query(
    logsRef,
    where("orderId", "==", orderId)
  );

  const logsSnapshot = await getDocs(logsQuery);

  let totalCommissionPaid = 0;

  const transactionIds = new Set<string>();

  logsSnapshot.forEach((doc) => {
    const data = doc.data();

    totalCommissionPaid += Number(data.amount || 0);

    if (transactionIds.has(data.transactionId)) {
      issues.push(
        `Duplicate transaction detected: ${data.transactionId}`
      );
    }

    transactionIds.add(data.transactionId);
  });

  if (logsSnapshot.empty) {
    issues.push("No commission logs found");
  }

  if (totalCommissionPaid > orderProfit) {
    issues.push(
      "Commission exceeds order profit"
    );
  }

  const difference =
    expectedCommission - totalCommissionPaid;

  if (Math.abs(difference) > 0.01) {
    issues.push(
      `Commission mismatch. Expected ₹${expectedCommission}, Found ₹${totalCommissionPaid}`
    );
  }

  let status: AuditStatus = "PASS";

  if (issues.length > 0) {
    status = "WARNING";
  }

  if (
    issues.includes("Commission exceeds order profit") ||
    issues.includes("No commission logs found")
  ) {
    status = "CRITICAL";
  }

  return {
    status,
    orderId,
    profit: orderProfit,
    commissionPaid: totalCommissionPaid,
    expectedCommission,
    difference,
    issues
  };
}

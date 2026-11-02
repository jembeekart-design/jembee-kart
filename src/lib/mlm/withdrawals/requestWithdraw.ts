import { auth } from "@/firebase/config";

interface WithdrawData {
  userId: string;
  amount: number;
  upi: string;
}

/**
 * Client adapter for the server-authoritative withdrawal transaction.
 * Wallet debits, pending holds, daily limits and ledger writes are performed
 * atomically by /api/wallet/withdrawals; no client Firestore writes occur here.
 */
export async function requestWithdraw(data: WithdrawData) {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== data.userId) return { success: false, message: "Please sign in again." };
    const token = await user.getIdToken();
    const response = await fetch("/api/wallet/withdrawals", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: data.amount, upi: data.upi, requestId: crypto.randomUUID() }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success !== true) return { success: false, message: typeof result.message === "string" ? result.message : "Withdrawal request failed." };
    return { success: true, withdrawId: result.withdrawId, message: result.message || "Request Submitted" };
  } catch (error) {
    console.error("WITHDRAW_ERROR:", error instanceof Error ? error.message : "unknown");
    return { success: false, message: "Withdrawal service is temporarily unavailable." };
  }
}

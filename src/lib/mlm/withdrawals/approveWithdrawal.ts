import { auth } from "@/firebase/config";

/** Client adapter. The server verifies admin role and atomically updates wallet, ledger and audit records. */
export async function approveWithdrawTransaction(
  withdrawId: string,
  _adminId: string,
  payoutReference: string = ""
) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Admin login required");
    const token = await user.getIdToken();
    const response = await fetch("/api/admin/withdrawal-requests", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ withdrawId, action: "approve", payoutReference }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success !== true) throw new Error(result.message || "Withdrawal approval failed");
    return { success: true, message: "Withdrawal marked paid successfully" };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Withdrawal approval failed" };
  }
}

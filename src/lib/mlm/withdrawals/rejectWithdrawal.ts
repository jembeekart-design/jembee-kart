import { auth } from "@/firebase/config";

/** Client adapter. The server performs the rejection/refund as one transaction. */
export async function rejectWithdraw(data: { withdrawId: string; adminId: string; reason: string }) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Admin login required");
    const token = await user.getIdToken();
    const response = await fetch("/api/admin/withdrawal-requests", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ withdrawId: data.withdrawId, action: "reject", reason: data.reason }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success !== true) throw new Error(result.message || "Withdrawal rejection failed");
    return { success: true, message: "Withdrawal rejected and refunded" };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Withdrawal rejection failed" };
  }
}

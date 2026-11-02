import { auth } from "@/firebase/config";

interface DailyRewardData { userId: string; }

/** Claims the daily reward through the authenticated server ledger API. */
export async function claimDailyReward(data: DailyRewardData) {
  const user = auth.currentUser;
  if (!user) return { success: false, message: "Please sign in to claim your daily reward." };
  if (data.userId?.trim() !== user.uid) return { success: false, message: "You can only claim your own daily reward." };

  try {
    const token = await user.getIdToken();
    const response = await fetch("/api/rewards/claim", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "daily" }),
    });
    const result = await response.json().catch(() => ({}));
    return response.ok ? result : { success: false, message: result.message || "Daily reward could not be claimed." };
  } catch {
    return { success: false, message: "Daily reward service is temporarily unavailable." };
  }
}

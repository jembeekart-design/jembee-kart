import { auth } from "@/firebase/config";

interface TaskRewardData {
  userId: string;
  taskId: string;
  taskTitle?: string;
  /** Ignored by the server; reward amount is read from the verified task record. */
  rewardAmount?: number;
}

/** Claims a completed task reward through the authenticated server ledger API. */
export async function createTaskReward(data: TaskRewardData) {
  const user = auth.currentUser;
  if (!user) return { success: false, message: "Please sign in to claim this reward." };
  if (data.userId?.trim() !== user.uid) return { success: false, message: "You can only claim your own task reward." };
  const taskId = data.taskId?.trim();
  if (!taskId) return { success: false, message: "A valid task ID is required." };

  try {
    const token = await user.getIdToken();
    const response = await fetch("/api/rewards/claim", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "task", taskId }),
    });
    const result = await response.json().catch(() => ({}));
    return response.ok ? result : { success: false, message: result.message || "Task reward could not be claimed." };
  } catch {
    return { success: false, message: "Task reward service is temporarily unavailable." };
  }
}

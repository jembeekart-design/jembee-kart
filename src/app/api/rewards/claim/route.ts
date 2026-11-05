import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

function response(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization") || "";
    if (!authorization.startsWith("Bearer ")) return response("Authentication required", 401);
    const token = authorization.slice(7).trim();
    if (!token || token.length > 8192) return response("Authentication required", 401);
    const decoded = await getAdminAuth().verifyIdToken(token, true);

    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 4096) return response("Request body too large", 413);
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return response("Invalid JSON", 400); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return response("Invalid request", 400);
    const input = body as Record<string, unknown>;
    const action = input.action;
    if (action !== "task" && action !== "daily") return response("Unsupported reward action", 400);

    const db = getAdminDb();
    const uid = decoded.uid;
    const userRef = db.collection("users").doc(uid);
    const userSnapshot = await userRef.get();
    if (!userSnapshot.exists) return response("User account not found", 404);
    const user = userSnapshot.data() || {};
    if (user.isBlocked === true || user.walletLocked === true) return response("Wallet is locked", 403);
    if (!user.joinedPackage || user.isActive !== true) return response("Active package required", 403);

    const now = new Date();
    const dateId = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
    let amount = 0;
    let referenceId = "";
    let title = "";
    let historyRef;

    if (action === "task") {
      const taskId = typeof input.taskId === "string" ? input.taskId.trim() : "";
      if (!taskId || taskId.length > 150 || /[/.]/.test(taskId)) return response("Invalid task ID", 400);
      const taskRef = userRef.collection("userTasks").doc(taskId);
      const taskSnapshot = await taskRef.get();
      if (!taskSnapshot.exists) return response("Completed task record not found", 404);
      const task = taskSnapshot.data() || {};
      const status = String(task.status || "").trim().toLowerCase();
      if (status !== "completed" && task.completed !== true) return response("Task is not completed", 409);
      if (task.rewardClaimed === true) return response("Task reward already claimed", 409);
      amount = Number(task.rewardAmount);
      if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) return response("Task reward is not configured safely", 409);
      amount = Math.round(amount * 100) / 100;
      title = typeof task.title === "string" ? task.title.slice(0, 160) : `Task ${taskId}`;
      referenceId = `${uid}_${taskId}`;
      historyRef = db.collection("task_rewards").doc(referenceId);
    } else {
      const settingsSnapshot = await db.collection("admin_settings").doc("rewards").get();
      const settings = settingsSnapshot.data() || {};
      if (settings.rewardsEnabled === false || settings.dailyRewards === false) return response("Daily rewards are currently disabled", 403);
      const configured = Number(settings.dailyRewardPoints ?? 10);
      if (!Number.isFinite(configured) || configured <= 0 || configured > 100000) return response("Daily reward configuration is invalid", 503);
      // Preserve the existing random daily reward policy, but use a cryptographically
      // secure integer draw in paise/cents to avoid Math.random() for financial credits.
      const maximumCents = Math.floor(Math.min(configured, 100) * 100);
      if (!Number.isSafeInteger(maximumCents) || maximumCents < 1) {
        return response("Daily reward configuration is invalid", 503);
      }
      amount = randomInt(1, maximumCents + 1) / 100;
      referenceId = `${uid}_${dateId}`;
      historyRef = db.collection("daily_rewards").doc(referenceId);
      title = "Daily check-in reward";
    }

    const ledgerRef = userRef.collection("transactions").doc(`${referenceId}_TX`);
    const result = await db.runTransaction(async (tx) => {
      const [freshUser, history, ledger] = await Promise.all([
        tx.get(userRef), tx.get(historyRef!), tx.get(ledgerRef),
      ]);
      if (!freshUser.exists) throw new Error("USER_NOT_FOUND");
      if (history.exists || ledger.exists) throw new Error("ALREADY_CLAIMED");
      const fresh = freshUser.data() || {};
      if (fresh.isBlocked === true || fresh.walletLocked === true || fresh.isActive !== true || !fresh.joinedPackage) throw new Error("NOT_ELIGIBLE");

      if (action === "task") {
        const taskRef = userRef.collection("userTasks").doc(String(input.taskId).trim());
        const taskSnap = await tx.get(taskRef);
        if (!taskSnap.exists) throw new Error("TASK_NOT_FOUND");
        const task = taskSnap.data() || {};
        const status = String(task.status || "").trim().toLowerCase();
        if ((status !== "completed" && task.completed !== true) || task.rewardClaimed === true || Number(task.rewardAmount) !== amount) throw new Error("TASK_NOT_CLAIMABLE");
        tx.update(taskRef, { rewardClaimed: true, rewardClaimedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
      }

      tx.update(userRef, {
        walletBalance: FieldValue.increment(amount),
        rewardWallet: FieldValue.increment(amount),
        totalIncome: FieldValue.increment(amount),
        todayIncome: FieldValue.increment(amount),
        ...(action === "daily" ? { dailyRewardClaimed: true, lastRewardClaimAt: FieldValue.serverTimestamp() } : {}),
        updatedAt: FieldValue.serverTimestamp(),
      });
      tx.create(historyRef!, {
        userId: uid, ...(action === "task" ? { taskId: String(input.taskId).trim(), taskTitle: title, rewardSource: "task_milestone" } : { rewardDate: dateId, rewardSource: "daily_checkin" }),
        rewardAmount: amount, amount, status: "success", createdAt: FieldValue.serverTimestamp(), creditedAt: FieldValue.serverTimestamp(),
      });
      tx.create(ledgerRef, {
        transactionId: ledgerRef.id, referenceId, amount, entryDirection: "credit", incomeCategory: "reward",
        allocatedWalletSlot: "rewardWallet", narrativeDescription: title, rewardSource: action === "task" ? "task_milestone" : "daily_checkin",
        timestamp: FieldValue.serverTimestamp(),
      });
      return { amount };
    });

    return NextResponse.json({ success: true, rewardAmount: result.amount, message: "Reward credited" });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "ALREADY_CLAIMED") return response("Reward already claimed", 409);
    if (code === "NOT_ELIGIBLE") return response("User is not eligible for this reward", 403);
    if (code === "TASK_NOT_FOUND") return response("Task record not found", 404);
    if (code === "TASK_NOT_CLAIMABLE") return response("Task is not eligible for reward", 409);
    console.error("Reward claim API failed", error);
    return response("Reward could not be processed", 500);
  }
}

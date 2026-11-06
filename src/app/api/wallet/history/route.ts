import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

type RawDoc = { id: string; data: Record<string, unknown> };

function asDate(value: unknown): string | null {
  if (value && typeof value === "object" && "toDate" in value &&
      typeof (value as { toDate?: unknown }).toDate === "function") {
    const date = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
}

function normalize(doc: RawDoc, uid: string, legacy = false) {
  const d = doc.data;
  const rawType = String(d.incomeCategory ?? d.type ?? d.category ?? "").trim();
  const typeMap: Record<string, string> = {
    reward: "watchReward",
    cashback: "cashback",
    directIncome: "directIncome",
    levelIncome: "levelIncome",
    rankIncome: "rankIncome",
    adRevenue: "creatorIncome",
    withdraw_request: "withdrawal",
    withdrawal: "withdrawal",
    cashback_transfer: "cashback_transfer",
  };
  const type = typeMap[rawType] || "unknown";
  const direction = String(d.entryDirection || "").toLowerCase();
  const statusRaw = String(d.status || "").toLowerCase();
  const status = statusRaw === "pending" || statusRaw === "failed"
    ? statusRaw
    : direction === "credit" || statusRaw === "success" || statusRaw === "completed"
      ? "success"
      : "unknown";
  const amountValue = Number(d.amount ?? d.rewardAmount ?? 0);
  const amount = Number.isFinite(amountValue) && amountValue >= 0 ? amountValue : 0;
  return {
    id: doc.id,
    transactionId: String(d.transactionId || doc.id),
    userId: uid,
    title: String(d.narrativeDescription || d.title || d.taskTitle || (type === "withdrawal" ? "Wallet withdrawal" : "Wallet transaction")).slice(0, 160),
    amount,
    type,
    status,
    walletType: String(d.allocatedWalletSlot || d.walletType || (direction === "debit" ? "Debit Wallet" : "Credit Wallet")),
    destinationWallet: typeof d.destinationWallet === "string" ? d.destinationWallet : undefined,
    beforeWalletBalance: typeof d.beforeWalletBalance === "number" ? d.beforeWalletBalance : undefined,
    afterWalletBalance: typeof d.afterWalletBalance === "number" ? d.afterWalletBalance : undefined,
    createdAt: asDate(d.timestamp ?? d.createdAt ?? d.creditedAt),
    source: legacy ? "legacy" : "canonical",
    direction: direction === "debit" || type === "withdrawal" ? "debit" : direction === "credit" ? "credit" : "unknown",
  };
}

export async function GET(req: Request) {
  try {
    const header = req.headers.get("authorization") || "";
    if (!header.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }
    const token = header.slice(7).trim();
    if (!token || token.length > 8192) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }
    const decoded = await getAdminAuth().verifyIdToken(token, true);
    const uid = decoded.uid;
    const db = getAdminDb();
    const userRef = db.collection("users").doc(uid);

    const [canonical, withdrawals, legacy] = await Promise.all([
      userRef.collection("transactions").orderBy("timestamp", "desc").limit(100).get(),
      db.collection("user_transactions").where("userId", "==", uid).orderBy("createdAt", "desc").limit(100).get(),
      userRef.collection("walletTransactions").orderBy("createdAt", "desc").limit(100).get(),
    ]);

    const canonicalIds = new Set(canonical.docs.map((doc) => doc.id));
    const rows = [
      ...canonical.docs.map((doc) => normalize({ id: doc.id, data: doc.data() }, uid)),
      ...withdrawals.docs.map((doc) => normalize({ id: doc.id, data: doc.data() }, uid)),
      ...legacy.docs
        .filter((doc) => !canonicalIds.has(doc.id))
        .map((doc) => normalize({ id: doc.id, data: doc.data() }, uid, true)),
    ];

    const unique = new Map<string, typeof rows[number]>();
    for (const row of rows) {
      const key = `${row.source === "legacy" ? "legacy:" : ""}${row.id}`;
      if (!unique.has(key)) unique.set(key, row);
    }
    const history = [...unique.values()]
      .sort((a, b) => (b.createdAt ? Date.parse(b.createdAt) : 0) - (a.createdAt ? Date.parse(a.createdAt) : 0))
      .slice(0, 200);

    return NextResponse.json(
      { success: true, history, truncated: canonical.size >= 100 || withdrawals.size >= 100 || legacy.size >= 100 },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("auth") || message.includes("token")) {
      return NextResponse.json({ success: false, message: "Please sign in again." }, { status: 401 });
    }
    console.error("Wallet history API failed:", message);
    return NextResponse.json({ success: false, message: "Wallet history is temporarily unavailable." }, { status: 500 });
  }
}

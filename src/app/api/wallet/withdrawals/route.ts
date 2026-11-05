import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
const UPI_REGEX = /^[A-Za-z0-9._-]{1,100}@[A-Za-z0-9.-]{2,100}$/;

async function authenticatedUid(req: Request) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHENTICATED");
  const decoded = await getAdminAuth().verifyIdToken(header.slice(7).trim(), true);
  return decoded.uid;
}

function authError(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  const status = code === "UNAUTHENTICATED" ? 401 : 500;
  return NextResponse.json({ success: false, message: status === 401 ? "Please sign in again." : "Withdrawal service is temporarily unavailable." }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const uid = await authenticatedUid(req);
    const db = getAdminDb();
    const [userSnap, rulesSnap, flagsSnap, historySnap] = await Promise.all([
      db.collection("users").doc(uid).get(),
      db.collection("business_rules").doc("wallet").get(),
      db.collection("business_rules").doc("featureFlags").get(),
      db.collection("withdraws").where("userId", "==", uid).orderBy("createdAt", "desc").limit(20).get(),
    ]);
    if (!userSnap.exists) return NextResponse.json({ success: false, message: "User profile not found" }, { status: 404 });
    const user = userSnap.data() || {};
    const rules = rulesSnap.data() || {};
    const flags = flagsSnap.data() || {};
    const history = historySnap.docs.map((doc) => {
      const data = doc.data();
      return { id: doc.id, amount: Number(data.amount || 0), fee: Number(data.fee || 0), payoutAmount: Number(data.payoutAmount ?? data.amount ?? 0), status: String(data.status || "pending"), createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null, adminRemark: typeof data.adminRemark === "string" ? data.adminRemark : "" };
    });
    return NextResponse.json({
      success: true,
      walletBalance: Number.isFinite(Number(user.walletBalance)) ? Number(user.walletBalance) : 0,
      pendingWithdrawal: Number.isFinite(Number(user.pendingWithdrawal)) ? Number(user.pendingWithdrawal) : 0,
      kycVerified: user.kycVerified === true,
      isBlocked: user.isBlocked === true,
      walletEnabled: flags.walletEnabled !== false,
      minimumWithdrawal: Number.isFinite(Number(rules.minimumWithdrawal)) ? Number(rules.minimumWithdrawal) : 200,
      withdrawalCharge: Number.isFinite(Number(rules.withdrawalCharge)) ? Number(rules.withdrawalCharge) : 0,
      withdrawalChargeType: rules.withdrawalChargeType === "PERCENTAGE" ? "PERCENTAGE" : "FIXED",
      maxDailyWithdrawal: Number.isSafeInteger(rules.maxDailyWithdrawal) && rules.maxDailyWithdrawal > 0 ? Math.min(rules.maxDailyWithdrawal, 20) : 3,
      kycRequired: rules.kycRequired !== false,
      history,
    });
  } catch (error) { return authError(error); }
}

export async function POST(req: NextRequest) {
  try {
    const uid = await authenticatedUid(req);
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 4096) return NextResponse.json({ success: false, message: "Request body too large" }, { status: 413 });
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 4096) return NextResponse.json({ success: false, message: "Request body too large" }, { status: 413 });
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("INVALID_BODY");
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON request" }, { status: 400 });
    }
    const amount = Number(body.amount);
    const upi = typeof body.upi === "string" ? body.upi.trim() : "";
    const requestId = typeof body.requestId === "string" ? body.requestId.trim() : "";
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(Math.round(amount * 100)) || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001 || !UPI_REGEX.test(upi) || !/^[A-Za-z0-9_-]{16,100}$/.test(requestId)) {
      return NextResponse.json({ success: false, message: "Enter a valid amount, UPI ID and request key." }, { status: 400 });
    }
    const db = getAdminDb();
    const userRef = db.collection("users").doc(uid);
    const rulesRef = db.collection("business_rules").doc("wallet");
    const flagsRef = db.collection("business_rules").doc("featureFlags");
    const day = new Date().toISOString().slice(0, 10);
    const dailyRef = db.collection("withdrawalDailyLimits").doc(`${uid}_${day}`);
    const requestRef = db.collection("withdrawalRequests").doc(`${uid}_${requestId}`);
    const withdrawRef = db.collection("withdraws").doc();
    const ledgerRef = db.collection("user_transactions").doc();

    const result = await db.runTransaction(async (tx) => {
      const [requestSnap, userSnap, rulesSnap, flagsSnap, dailySnap] = await Promise.all([
        tx.get(requestRef), tx.get(userRef), tx.get(rulesRef), tx.get(flagsRef), tx.get(dailyRef),
      ]);
      if (requestSnap.exists) {
        const previous = requestSnap.data() || {};
        if (previous.userId !== uid || Math.round(Number(previous.amount) * 100) !== Math.round(amount * 100)) {
          throw new Error("IDEMPOTENCY_CONFLICT");
        }
        return { duplicate: true, withdrawId: String(previous.withdrawId || "") };
      }
      if (!userSnap.exists) throw new Error("USER_NOT_FOUND");
      const user = userSnap.data() || {};
      const rules = rulesSnap.data() || {};
      const flags = flagsSnap.data() || {};
      const minimum = Number.isFinite(Number(rules.minimumWithdrawal)) && Number(rules.minimumWithdrawal) > 0 ? Number(rules.minimumWithdrawal) : 200;
      const maxDaily = Number.isSafeInteger(rules.maxDailyWithdrawal) && rules.maxDailyWithdrawal > 0 ? Math.min(rules.maxDailyWithdrawal, 20) : 3;
      if (flags.walletEnabled === false) throw new Error("WALLET_DISABLED");
      if (user.isBlocked === true) throw new Error("ACCOUNT_BLOCKED");
      if (rules.kycRequired !== false && user.kycVerified !== true) throw new Error("KYC_REQUIRED");
      if (amount < minimum) throw new Error("MINIMUM_WITHDRAWAL");
      const configuredCharge = Number.isFinite(Number(rules.withdrawalCharge)) ? Math.max(0, Number(rules.withdrawalCharge)) : 0;
      const chargeType = rules.withdrawalChargeType === "PERCENTAGE" ? "PERCENTAGE" : "FIXED";
      if (chargeType === "PERCENTAGE" && configuredCharge > 100) throw new Error("INVALID_WITHDRAWAL_CHARGE");
      const fee = Math.round((chargeType === "PERCENTAGE" ? amount * configuredCharge / 100 : configuredCharge) * 100) / 100;
      const payoutAmount = Math.round((amount - fee) * 100) / 100;
      if (payoutAmount <= 0) throw new Error("INVALID_WITHDRAWAL_CHARGE");
      const balance = Number(user.walletBalance || 0);
      const pending = Number(user.pendingWithdrawal || 0);
      if (!Number.isFinite(balance) || balance < amount) throw new Error("INSUFFICIENT_BALANCE");
      if (!Number.isFinite(pending) || pending < 0) throw new Error("INVALID_PENDING_BALANCE");
      if (pending > 0) throw new Error("PENDING_WITHDRAWAL_EXISTS");
      const dailyCount = Number(dailySnap.data()?.count || 0);
      if (dailyCount >= maxDaily) throw new Error("DAILY_LIMIT_REACHED");

      tx.create(withdrawRef, {
        userId: uid, amount, fee, payoutAmount, withdrawalChargeType: chargeType, upi, type: "upi", status: "pending",
        userName: typeof user.displayName === "string" ? user.displayName : typeof user.name === "string" ? user.name : "N/A",
        mobile: typeof user.phoneNumber === "string" ? user.phoneNumber : typeof user.phone === "string" ? user.phone : "N/A",
        createdAt: FieldValue.serverTimestamp(), requestId,
      });
      tx.create(ledgerRef, {
        userId: uid, referenceId: withdrawRef.id, withdrawId: withdrawRef.id,
        type: "withdraw_request", amount, status: "pending", createdAt: FieldValue.serverTimestamp(),
      });
      tx.create(requestRef, { userId: uid, withdrawId: withdrawRef.id, amount, createdAt: FieldValue.serverTimestamp() });
      tx.set(dailyRef, { userId: uid, day, count: dailyCount + 1, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      tx.update(userRef, { walletBalance: balance - amount, pendingWithdrawal: pending + amount, updatedAt: FieldValue.serverTimestamp() });
      return { duplicate: false, withdrawId: withdrawRef.id };
    });
    return NextResponse.json({ success: true, ...result, message: result.duplicate ? "This withdrawal request was already submitted." : "Withdrawal request submitted." });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const messages: Record<string, string> = {
      USER_NOT_FOUND: "User profile not found", WALLET_DISABLED: "Wallet withdrawals are temporarily disabled",
      ACCOUNT_BLOCKED: "Account is blocked", KYC_REQUIRED: "Complete KYC before withdrawing",
      MINIMUM_WITHDRAWAL: "Amount is below the minimum withdrawal limit", INSUFFICIENT_BALANCE: "Insufficient wallet balance",
      PENDING_WITHDRAWAL_EXISTS: "You already have a pending withdrawal", INVALID_PENDING_BALANCE: "Wallet pending balance needs administrator reconciliation", DAILY_LIMIT_REACHED: "Daily withdrawal request limit reached",
    };
    if (messages[code]) return NextResponse.json({ success: false, message: messages[code] }, { status: 409 });
    return authError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

const MAX_LEDGER_ENTRIES = 500;
const MAX_UID_LENGTH = 128;

async function verifyAdmin(req: Request): Promise<void> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const token = header.slice(7).trim();
  if (!token) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(token, true);
  const db = getAdminDb();
  const userSnap = await db.collection("users").doc(decoded.uid).get();
  let role = userSnap.data()?.role;
  if (role !== "admin" && role !== "super_admin") {
    const fallback = await db.collection("users").where("uid", "==", decoded.uid).limit(1).get();
    role = fallback.docs[0]?.data()?.role;
  }
  if (role !== "admin" && role !== "super_admin") throw new Error("FORBIDDEN");
}

function money(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function authError(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
  if (status === 500) console.error("Wallet reconciliation API error:", error);
  return NextResponse.json(
    { success: false, message: status === 401 ? "Authentication required" : status === 403 ? "Admin access required" : "Wallet reconciliation failed" },
    { status },
  );
}

/** Read-only diagnostic. It never changes wallet balances or ledger records. */
export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);
    const uid = (req.nextUrl.searchParams.get("uid") || "").trim();
    if (!uid || uid.length > MAX_UID_LENGTH || uid.includes("/")) {
      return NextResponse.json({ success: false, message: "A valid user ID is required" }, { status: 400 });
    }

    const db = getAdminDb();
    const userRef = db.collection("users").doc(uid);
    const [userSnap, ledgerSnap] = await Promise.all([
      userRef.get(),
      userRef.collection("transactions").limit(MAX_LEDGER_ENTRIES + 1).get(),
    ]);
    if (!userSnap.exists) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const user = userSnap.data() || {};
    const docs = ledgerSnap.docs.slice(0, MAX_LEDGER_ENTRIES);
    const truncated = ledgerSnap.size > MAX_LEDGER_ENTRIES;
    let credits = 0;
    let debits = 0;
    let recognizedEntries = 0;
    let unclassifiedEntries = 0;
    const byWallet: Record<string, { credits: number; debits: number }> = {
      commissionWallet: { credits: 0, debits: 0 },
      rewardWallet: { credits: 0, debits: 0 },
      cashbackWallet: { credits: 0, debits: 0 },
      unallocated: { credits: 0, debits: 0 },
    };

    for (const snapshot of docs) {
      const entry = snapshot.data();
      const amount = money(entry.amount);
      const direction = String(entry.entryDirection || "").toLowerCase();
      if (!(amount > 0) || (direction !== "credit" && direction !== "debit")) {
        unclassifiedEntries += 1;
        continue;
      }
      recognizedEntries += 1;
      if (direction === "credit") credits += amount;
      else debits += amount;

      const explicitSlot = String(entry.allocatedWalletSlot || entry.primaryWallet || "");
      const category = String(entry.incomeCategory || "").toLowerCase();
      const slot = explicitSlot === "commissionWallet" || explicitSlot === "rewardWallet" || explicitSlot === "cashbackWallet"
        ? explicitSlot
        : category === "reward" ? "rewardWallet" : category === "cashback" ? "cashbackWallet"
        : category ? "commissionWallet" : "unallocated";
      if (direction === "credit") byWallet[slot].credits += amount;
      else byWallet[slot].debits += amount;
    }

    const masterBalance = money(user.walletBalance);
    const commissionBalance = money(user.commissionWallet);
    const rewardBalance = money(user.rewardWallet);
    const cashbackBalance = money(user.cashbackWallet);
    const subWalletTotal = commissionBalance + rewardBalance + cashbackBalance;
    const round = (value: number) => Number(value.toFixed(2));
    const netLedger = credits - debits;
    const balanceDifference = masterBalance - subWalletTotal;

    return NextResponse.json({
      success: true,
      readOnly: true,
      userId: uid,
      balances: {
        master: round(masterBalance),
        commission: round(commissionBalance),
        reward: round(rewardBalance),
        cashback: round(cashbackBalance),
        subWalletTotal: round(subWalletTotal),
        masterMinusSubWallets: round(balanceDifference),
      },
      ledger: {
        scannedEntries: docs.length,
        recognizedEntries,
        unclassifiedEntries,
        truncated,
        coverage: truncated ? "partial_limit_reached" : "available_entries_only_legacy_completeness_unverified",
        credits: round(credits),
        debits: round(debits),
        net: round(netLedger),
        masterMinusLedgerNet: round(masterBalance - netLedger),
        byWallet: Object.fromEntries(Object.entries(byWallet).map(([key, value]) => [key, {
          credits: round(value.credits), debits: round(value.debits), net: round(value.credits - value.debits),
        }])),
      },
      warning: "Diagnostic only: legacy ledger entries may be incomplete or use different schemas. No automatic balance correction is performed.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return authError(error);
  }
}

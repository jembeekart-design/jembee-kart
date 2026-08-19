import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminCreditWallet } from "@/lib/mlm/adminCreditWallet";

export async function POST(req: Request) {
  try {
    // 1. Authenticate request using CRON_SECRET for security
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 2. Find due earnings: status == PENDING AND payoutDueAt <= now
    const now = Timestamp.now();
    const pendingEarningsRef = adminDb
      .collection("creatorAdEarnings")
      .where("status", "==", "PENDING")
      .where("payoutDueAt", "<=", now);

    const snapshot = await pendingEarningsRef.get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, message: "No earnings to release" });
    }

    const results = { processed: 0, failed: 0 };

    // 3. Process each earning atomically
    for (const doc of snapshot.docs) {
      try {
        await adminDb.runTransaction(async (transaction) => {
          const earningSnap = await transaction.get(doc.ref);
          
          // Re-verify status inside transaction to prevent race conditions (idempotency)
          if (!earningSnap.exists || earningSnap.data()?.status !== "PENDING") {
            return;
          }

          const data = earningSnap.data();
          if (!data) return;
          
          // Create a deterministic ID for the wallet ledger entry
          // This ensures that even if the cron runs twice, the same ID is used for the wallet transaction,
          // which adminCreditWallet uses to prevent duplicate ledger entries (via .doc(eventId)).
          const walletTxDeterministicId = `payout_${data.eventId}`;

          // 4. Call corrected adminCreditWallet (Atomic & Idempotent)
          // adminCreditWallet now returns the ledger doc ID (which is the deterministic ID passed)
          const actualWalletTxId = await adminCreditWallet({
            uid: data.creatorId,
            amount: data.creatorAmount,
            type: "adRevenue",
            description: `Ad Revenue Release: ${data.adTitle || "Ad"}`,
            transaction: transaction,
            eventId: walletTxDeterministicId,
          });

          // 5. Mark available and link the ACTUAL wallet transaction ID returned
          transaction.update(doc.ref, {
            status: "AVAILABLE",
            releasedAt: FieldValue.serverTimestamp(),
            walletTransactionId: actualWalletTxId, // This is 'payout_...'
          });
        });
        results.processed++;
      } catch (error) {
        console.error(`Failed to release earning ${doc.id}:`, error);
        results.failed++;
      }
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error("Cron payout release error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}


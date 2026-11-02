import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminCreditWallet } from "@/lib/mlm/adminCreditWallet";
import { timingSafeEqual } from "node:crypto";

export async function GET(req: Request) {
  try {
    const adminDb = getAdminDb();
    // Fail closed: an absent/blank secret must never authorize a cron request.
    const authHeader = req.headers.get("authorization") || "";
    const expectedSecret = process.env.CRON_SECRET?.trim() || "";
    const providedSecret = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    const expected = Buffer.from(expectedSecret);
    const provided = Buffer.from(providedSecret);
    const authorized = expected.length > 0 && provided.length === expected.length && timingSafeEqual(provided, expected);
    if (!authorized) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 2. Find due earnings: status == PENDING AND payoutDueAt <= now
    const now = Timestamp.now();
    const pendingEarningsRef = adminDb
      .collection("creatorAdEarnings")
      .where("status", "==", "PENDING")
      .where("payoutDueAt", "<=", now)
      .orderBy("payoutDueAt", "asc")
      .limit(50);

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
          const creatorId = typeof data.creatorId === "string" ? data.creatorId.trim() : "";
          const eventId = typeof data.eventId === "string" ? data.eventId.trim() : "";
          const creatorAmount = Number(data.creatorAmount);
          if (!creatorId || !eventId || !Number.isFinite(creatorAmount) || creatorAmount <= 0) {
            throw new Error("Invalid creator earning record; refusing wallet release");
          }
          
          // Create a deterministic ID for the wallet ledger entry
          // This ensures that even if the cron runs twice, the same ID is used for the wallet transaction,
          // which adminCreditWallet uses to prevent duplicate ledger entries (via .doc(eventId)).
          const walletTxDeterministicId = `payout_${eventId}`;

          // 4. Call corrected adminCreditWallet (Atomic & Idempotent)
          // adminCreditWallet now returns the ledger doc ID (which is the deterministic ID passed)
          await adminCreditWallet({
            uid: creatorId,
            amount: creatorAmount,
            type: "adRevenue",
            description: `Ad Revenue Release: ${data.adTitle || "Ad"}`.slice(0, 300),
            transaction: transaction,
            eventId: walletTxDeterministicId,
          });

          // 5. Mark available and link the deterministic wallet transaction ID.
          transaction.update(doc.ref, {
            status: "AVAILABLE",
            releasedAt: FieldValue.serverTimestamp(),
            walletTransactionId: walletTxDeterministicId, // This is 'payout_...'
          });
        });
        results.processed++;
      } catch (error) {
        console.error(`Failed to release earning ${doc.id}:`, error);
        results.failed++;
      }
    }

    return NextResponse.json({ success: true, ...results, batchLimit: 50, hasMore: snapshot.size === 50 });
  } catch (error) {
    console.error("Cron payout release error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

